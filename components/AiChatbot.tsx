import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse, LiveServerMessage, Modality, Blob } from "@google/genai";
import { useTranslation } from '../hooks/useTranslation';
import type { InventoryHook, Product, Sale } from '../types';
import { AiIcon, MicIcon, StopCircleIcon } from './icons/Icons';
import Button from './ui/Button';

interface Message {
  role: 'user' | 'model';
  text: string;
}

// --- Audio Utility Functions from @google/genai guidelines ---
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}
// --- End Audio Utility Functions ---

// Data summarization function
const summarizeData = (products: Product[], sales: Sale[]) => {
  if (products.length === 0 && sales.length === 0) {
    return { summary: "No inventory or sales data available." };
  }
  const totalProducts = products.length;
  const lowStockProductsCount = products.filter(p => p.stock <= p.lowStockThreshold).length;
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  return {
    inventory_summary: {
      total_products: totalProducts,
      items_at_low_stock_threshold: lowStockProductsCount,
    },
    sales_summary: {
      total_transactions: sales.length,
      total_revenue: `₹${totalRevenue.toLocaleString('en-IN')}`,
    }
  };
};


const AiChatbot: React.FC<InventoryHook> = ({ products, sales }) => {
  const { t, language } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<Chat | null>(null);

  // --- Voice Chat State and Refs ---
  const [isVoiceSessionActive, setIsVoiceSessionActive] = useState(false);
  const [liveUserTranscript, setLiveUserTranscript] = useState('');
  const [liveModelTranscript, setLiveModelTranscript] = useState('');
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');
  // --- End Voice Chat State ---

  useEffect(() => {
    setMessages([{ role: 'model', text: t('ai_chatbot.initial_message') }]);
  }, [t]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, liveUserTranscript, liveModelTranscript]);
  
  // Cleanup effect for voice session
  useEffect(() => {
    return () => {
      if (isVoiceSessionActive) {
        stopVoiceSession();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVoiceSessionActive]);


  const initializeTextChat = () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const systemInstruction = `You are an expert inventory management assistant for a retail shop. Analyze the provided JSON data which is a *summary* of the shop's inventory and sales. You will not receive the full raw data. Answer the user's questions based on this summary. Provide clear, concise, and actionable insights. All monetary values are in Indian Rupees (₹). Today's date is ${new Date().toLocaleDateString('en-IN')}. Keep your answers based *only* on the data provided in the prompt.`;
    
    chatRef.current = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: { systemInstruction },
    });
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading || isVoiceSessionActive) return;

    const newUserMessage: Message = { role: 'user', text: userInput };
    setMessages(prev => [...prev, newUserMessage]);
    const currentInput = userInput;
    setUserInput('');
    setIsLoading(true);
    setError(null);

    try {
      if (!process.env.API_KEY) {
          setError(t('common.api_key_not_configured_link'));
          throw new Error('API Key not configured');
      }
      if (!chatRef.current) initializeTextChat();
      const dataSummary = summarizeData(products, sales);
      const prompt = `Data Summary: ${JSON.stringify(dataSummary, null, 2)}\n\nQuestion: "${currentInput}"`;
      if (chatRef.current) {
        const response: GenerateContentResponse = await chatRef.current.sendMessage({ message: prompt });
        const newModelMessage: Message = { role: 'model', text: response.text };
        setMessages(prev => [...prev, newModelMessage]);
      }
    } catch (err) {
      console.error(err);
      if (!error) {
        setError(t('ai_chatbot.error'));
      }
      const errorMessage: Message = { role: 'model', text: t('ai_chatbot.error') };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const stopVoiceSession = () => {
    setIsVoiceSessionActive(false);
    
    sessionPromiseRef.current?.then(session => session.close());
    sessionPromiseRef.current = null;
    
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
        inputAudioContextRef.current.close();
        inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
        outputAudioContextRef.current.close();
        outputAudioContextRef.current = null;
    }
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }
    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    currentInputTranscriptionRef.current = '';
    currentOutputTranscriptionRef.current = '';
    setLiveUserTranscript('');
    setLiveModelTranscript('');
  };

  const startVoiceSession = async () => {
    if (!process.env.API_KEY) {
        setError(t('common.api_key_not_configured_link'));
        return;
    }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        setIsVoiceSessionActive(true);
        setIsLoading(true); // Show loading until session is open

        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const languageName = { en: 'English', hi: 'Hindi', kn: 'Kannada' }[language] || 'English';
        const dataSummary = summarizeData(products, sales);

        const systemInstruction = `You are an expert inventory management assistant for a retail shop. Analyze the provided JSON data which is a *summary* of the shop's inventory and sales. You will not receive the full raw data. Answer the user's questions based on this summary. Provide clear, concise, and actionable insights. All monetary values are in Indian Rupees (₹). Today's date is ${new Date().toLocaleDateString('en-IN')}. Keep your answers based *only* on the data provided in the prompt. IMPORTANT: If the user asks about anything other than inventory, sales, products, or retail management for their grocery store, you MUST politely decline to answer and gently steer the conversation back to these core business topics. You must only discuss subjects relevant to managing their store. You MUST respond in ${languageName}.
        
        Here is the initial data summary: ${JSON.stringify(dataSummary, null, 2)}`;
        
        sessionPromiseRef.current = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: {
                systemInstruction,
                responseModalities: [Modality.AUDIO],
                inputAudioTranscription: {},
                outputAudioTranscription: {},
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
            },
            callbacks: {
                onopen: () => {
                    setIsLoading(false); // Session is ready
                    const source = inputAudioContextRef.current!.createMediaStreamSource(streamRef.current!);
                    const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                    scriptProcessorRef.current = scriptProcessor;

                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlob(inputData);
                        sessionPromiseRef.current?.then((session) => {
                          session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContextRef.current!.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    if (message.serverContent?.inputTranscription) {
                        currentInputTranscriptionRef.current = message.serverContent.inputTranscription.text;
                        setLiveUserTranscript(currentInputTranscriptionRef.current);
                    }
                    if (message.serverContent?.outputTranscription) {
                        currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
                        setLiveModelTranscript(currentOutputTranscriptionRef.current);
                    }
                    if (message.serverContent?.turnComplete) {
                        const finalUserInput = currentInputTranscriptionRef.current;
                        const finalModelOutput = currentOutputTranscriptionRef.current;
                        setMessages(prev => [
                            ...prev,
                            { role: 'user', text: finalUserInput },
                            { role: 'model', text: finalModelOutput },
                        ]);
                        currentInputTranscriptionRef.current = '';
                        currentOutputTranscriptionRef.current = '';
                        setLiveUserTranscript('');
                        setLiveModelTranscript('');
                    }

                    const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (audioData) {
                        const outputCtx = outputAudioContextRef.current!;
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                        const audioBuffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
                        const source = outputCtx.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputCtx.destination);
                        source.addEventListener('ended', () => { sourcesRef.current.delete(source); });
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        sourcesRef.current.add(source);
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error('Live session error:', e);
                    setError(t('ai_chatbot.error'));
                    stopVoiceSession();
                },
                onclose: () => {},
            },
        });
    } catch (err) {
        console.error('Failed to start voice session:', err);
        setError('Could not access microphone.');
        stopVoiceSession();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-white dark:bg-slate-900 rounded-xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-slate-200/80 dark:border-slate-800">
      <div className="p-5 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <AiIcon className="w-8 h-8 text-primary-500" />
          {t('ai_chatbot.title')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{t('ai_chatbot.description')}</p>
      </div>

      <div ref={chatContainerRef} className="flex-1 p-6 space-y-6 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 flex items-center justify-center flex-shrink-0">
                <AiIcon className="w-5 h-5 text-primary-600 dark:text-primary-300" />
              </div>
            )}
            <div className={`max-w-xl p-4 rounded-2xl prose prose-sm dark:prose-invert break-words shadow-md ${msg.role === 'user' ? 'bg-primary-600 text-white rounded-br-none shadow-primary-500/30' : 'bg-slate-100 dark:bg-slate-800 rounded-bl-none'}`}>
              {msg.text.split('\n').map((line, i) => ( <p key={i} className="last:mb-0">{line}</p> ))}
            </div>
          </div>
        ))}
        {isLoading && !isVoiceSessionActive && (
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 flex items-center justify-center flex-shrink-0">
                <AiIcon className="w-5 h-5 text-primary-600 dark:text-primary-300" />
            </div>
            <div className="max-w-xl p-4 rounded-2xl rounded-bl-none bg-slate-100 dark:bg-slate-800 shadow-md">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}
        {(liveUserTranscript || liveModelTranscript) && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                {liveUserTranscript && <p className="text-sm text-slate-700 dark:text-slate-300"><strong>You:</strong> {liveUserTranscript}</p>}
                {liveModelTranscript && <p className="text-sm text-primary-600 dark:text-primary-400"><strong>AI:</strong> {liveModelTranscript}</p>}
            </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-xl">
        <form onSubmit={handleSendMessage} className="flex gap-4">
          <input
            type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)}
            placeholder={isVoiceSessionActive ? 'Listening...' : t('ai_chatbot.placeholder')}
            className="flex-1 p-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition disabled:bg-slate-100 dark:disabled:bg-slate-800"
            disabled={isLoading || isVoiceSessionActive}
          />
          <Button type="submit" disabled={isLoading || isVoiceSessionActive || !userInput.trim()}>Send</Button>
          <Button type="button" variant="secondary" onClick={isVoiceSessionActive ? stopVoiceSession : startVoiceSession} className="!px-3.5">
              {isVoiceSessionActive ? <StopCircleIcon className="w-6 h-6 text-red-500" /> : <MicIcon className="w-6 h-6" />}
          </Button>
        </form>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default AiChatbot;