import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { useTranslation } from '../hooks/useTranslation';
import { useApiKey } from '../hooks/useApiKey';
import type { Product, Sale } from '../types';
import { SparklesIcon } from './icons/Icons';
import Button from './ui/Button';

interface AiSuggestionBoxProps {
  products: Product[];
  sales: Sale[];
}

interface Advice {
    title: string;
    suggestion: string;
}

const AiSuggestionBox: React.FC<AiSuggestionBoxProps> = ({ products, sales }) => {
  const { t } = useTranslation();
  const { apiKey } = useApiKey();
  const [advice, setAdvice] = useState<Advice[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAdvice = async () => {
    setIsLoading(true);
    setError(null);
    setAdvice(null);

    if (!apiKey) {
        setError(t('common.api_key_not_configured_link'));
        setIsLoading(false);
        return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });

      // Only include recent sales to keep the prompt concise and relevant
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const recentSales = sales.filter(s => new Date(s.date) > oneMonthAgo);
      
      const adviceSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: 'A short, bold title for the suggestion (e.g., "Restock Alert").',
            },
            suggestion: {
              type: Type.STRING,
              description: 'The detailed suggestion text.',
            },
          },
          required: ['title', 'suggestion'],
        },
      };

      const prompt = `
        Analyze the following inventory data for a small retail shop. Provide 3-4 brief, actionable suggestions to improve sales or manage stock better.
        Focus on:
        1. Low stock items that might be popular (check sales data).
        2. Items expiring soon that have high stock levels.
        3. Potentially slow-moving items (high stock, low sales).
        Today's date is ${new Date().toLocaleDateString('en-IN')}. Return the response in JSON format.

        Products Data: ${JSON.stringify(products, null, 2)}
        Recent Sales Data (Last 30 Days): ${JSON.stringify(recentSales, null, 2)}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: adviceSchema,
        },
      });
      
      const parsedAdvice: Advice[] = JSON.parse(response.text);
      setAdvice(parsedAdvice);

    } catch (err) {
      console.error(err);
      setError(t('ai_suggestion_box.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-8">
            <div role="status" className="flex flex-col items-center justify-center">
                <svg aria-hidden="true" className="w-8 h-8 mr-2 text-slate-200 animate-spin dark:text-slate-600 fill-primary-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5424 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
                <span className="sr-only">Loading...</span>
            </div>
          <p className="mt-4 text-slate-500 dark:text-slate-400">{t('ai_suggestion_box.loading')}</p>
        </div>
      );
    }
    if (error) {
      return <p className="text-red-500 text-center py-8">{error}</p>;
    }
    if (advice) {
      return (
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-3">
            {advice.map((item, index) => (
                <div key={index}>
                    <strong className="block">{item.title}</strong>
                    <p className="my-1">{item.suggestion}</p>
                </div>
            ))}
        </div>
      );
    }
    return (
      <div className="text-center py-8">
        <p className="text-slate-500 dark:text-slate-400 mb-4">{!apiKey ? t('common.api_key_not_configured_link') : t('ai_suggestion_box.description')}</p>
        <Button onClick={generateAdvice} disabled={!apiKey}>
          <SparklesIcon className="mr-2" />
          {t('ai_suggestion_box.button')}
        </Button>
      </div>
    );
  };
  

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 p-6 border-b border-slate-200 dark:border-slate-700 flex items-center">
        <SparklesIcon className="mr-3 text-primary-500" /> {t('ai_suggestion_box.title')}
      </h2>
      <div className="p-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default AiSuggestionBox;