import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { useTranslation } from '../hooks/useTranslation';
import type { InventoryHook } from '../types';
import { AiIcon } from './icons/Icons';
import Button from './ui/Button';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const AiChatbot: React.FC<InventoryHook> = ({ products, sales }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: t('ai_chatbot.initial_message') }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<Chat | null>(null);

  useEffect(() => {
    // Scroll to the bottom of the chat on new messages
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const initializeChat = () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const systemInstruction = `You are an expert inventory management assistant for a retail shop. Analyze the provided JSON data which includes product lists and sales history. Answer the user's questions based on this data. Provide clear, concise, and actionable insights. All monetary values are in Indian Rupees (₹). Today's date is ${new Date().toLocaleDateString('en-IN')}. Keep your answers based *only* on the data provided in the prompt.`;
    
    chatRef.current = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction,
      },
    });
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const newUserMessage: Message = { role: 'user', text: userInput };
    setMessages(prev => [...prev, newUserMessage]);
    const currentInput = userInput;
    setUserInput('');
    setIsLoading(true);
    setError(null);

    try {
      if (!chatRef.current) {
        initializeChat();
      }

      const prompt = `
        Here is the current inventory and sales data:
        Products: ${JSON.stringify(products, null, 2)}
        Sales: ${JSON.stringify(sales, null, 2)}

        Based on the data above and our conversation history, please answer my new question: "${currentInput}"
      `;

      if (chatRef.current) {
        const response: GenerateContentResponse = await chatRef.current.sendMessage({ message: prompt });
        
        const newModelMessage: Message = { role: 'model', text: response.text };
        setMessages(prev => [...prev, newModelMessage]);
      }

    } catch (err) {
      console.error(err);
      setError(t('ai_chatbot.error'));
      const errorMessage: Message = { role: 'model', text: t('ai_chatbot.error') };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <AiIcon className="w-8 h-8 text-primary-500" />
          {t('ai_chatbot.title')}
        </h1>
        <p className="text-slate-500 mt-1">{t('ai_chatbot.description')}</p>
      </div>

      <div ref={chatContainerRef} className="flex-1 p-6 space-y-6 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                <AiIcon className="w-5 h-5 text-primary-600 dark:text-primary-300" />
              </div>
            )}
            <div className={`max-w-xl p-4 rounded-xl prose prose-sm dark:prose-invert break-words ${msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
              {msg.text.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                    <AiIcon className="w-5 h-5 text-primary-600 dark:text-primary-300" />
                </div>
                <div className="max-w-xl p-4 rounded-xl bg-slate-100 dark:bg-slate-800">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        )}
      </div>

      <div className="p-6 border-t border-slate-200 dark:border-slate-700">
        <form onSubmit={handleSendMessage} className="flex gap-4">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={t('ai_chatbot.placeholder')}
            className="flex-1 p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 transition"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !userInput.trim()}>
            {isLoading ? '...' : 'Send'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AiChatbot;