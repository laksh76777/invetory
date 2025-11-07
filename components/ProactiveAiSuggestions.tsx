import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { useTranslation } from '../hooks/useTranslation';
import { useApiKey } from '../hooks/useApiKey';
import type { Product, Sale } from '../types';
import { LightbulbIcon } from './icons/Icons';

interface ProactiveAiSuggestionsProps {
  products: Product[];
  sales: Sale[];
}

interface Suggestion {
    action: string;
    reasoning: string;
}

const getUpcomingFestivals = () => {
    const now = new Date();
    const year = now.getFullYear();
    // Approximate dates for major Indian festivals
    const festivals = [
        { name: 'Raksha Bandhan', date: new Date(year, 7, 19) },
        { name: 'Janmashtami', date: new Date(year, 7, 26) },
        { name: 'Ganesh Chaturthi', date: new Date(year, 8, 7) },
        { name: 'Navaratri', date: new Date(year, 9, 3) }, // Start date
        { name: 'Dussehra', date: new Date(year, 9, 12) },
        { name: 'Diwali', date: new Date(year, 10, 1) },
        { name: 'Christmas', date: new Date(year, 11, 25) },
        // Festivals for next year if current date is past them
        { name: 'Makar Sankranti/Pongal', date: new Date(year + 1, 0, 14) },
        { name: 'Holi', date: new Date(year + 1, 2, 14) },
        { name: 'Eid al-Fitr', date: new Date(year + 1, 3, 1) }, // Approximate, based on lunar calendar
    ];

    const upcoming = festivals.filter(f => f.date > now && f.date.getTime() - now.getTime() < 60 * 24 * 60 * 60 * 1000); // within next 60 days
    return upcoming.map(f => f.name).join(', ');
};

const aggregateSalesByMonth = (sales: Sale[]) => {
    const monthlySales: Record<string, Record<string, number>> = {}; // { productId: { 'YYYY-MM': quantity, ... } }
    
    sales.forEach(sale => {
        const saleDate = new Date(sale.date);
        const year = saleDate.getFullYear();
        const month = (saleDate.getMonth() + 1).toString().padStart(2, '0');
        const monthKey = `${year}-${month}`;

        sale.items.forEach(item => {
            if (!monthlySales[item.productId]) {
                monthlySales[item.productId] = {};
            }
            if (!monthlySales[item.productId][monthKey]) {
                monthlySales[item.productId][monthKey] = 0;
            }
            monthlySales[item.productId][monthKey] += item.quantity;
        });
    });
    return monthlySales;
};

const ProactiveAiSuggestions: React.FC<ProactiveAiSuggestionsProps> = ({ products, sales }) => {
  const { t } = useTranslation();
  const { apiKey } = useApiKey();
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start in loading state
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateSuggestions = async () => {
        setIsLoading(true);
        setError(null);
        setSuggestions(null);

        if (!apiKey) {
            setError(t('common.api_key_not_configured_link'));
            setIsLoading(false);
            return;
        }

        try {
            const ai = new GoogleGenAI({ apiKey });
            const upcomingFestivals = getUpcomingFestivals();
            const aggregatedSales = aggregateSalesByMonth(sales);
            
            const suggestionsSchema = {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        action: {
                            type: Type.STRING,
                            description: 'A specific, quantifiable recommendation. E.g., "Restock 50kg of India Gate Basmati Rice before Diwali."',
                        },
                        reasoning: {
                            type: Type.STRING,
                            description: 'A data-backed explanation for the action. E.g., "Sales for this item increased by 40% during the Diwali period last year, and current stock is only 20kg."',
                        },
                    },
                    required: ['action', 'reasoning'],
                },
            };

            const prompt = `
                You are an expert retail analyst for an Indian grocery store. Your goal is to provide proactive, data-driven advice.

                CONTEXT:
                - Today's Date: ${new Date().toISOString()}
                - Upcoming Major Indian Festivals (next 60 days): ${upcomingFestivals || 'None in the immediate future'}. Key festivals to analyze for are Raksha Bandhan, Janmashtami, Ganesh Chaturthi, Navaratri, Dussehra, and Diwali.
                - All monetary values are in Indian Rupees (₹).

                TASK:
                Analyze the provided INVENTORY DATA and the aggregated monthly SALES HISTORY. Based on this, provide 3-5 concrete, actionable suggestions for the shop owner. Return the result in JSON format matching the provided schema.

                ANALYSIS CHECKLIST:
                1.  **Festival Demand Analysis:** Specifically for the upcoming festivals, analyze sales data from the *same festival period last year*. Identify key products (e.g., sweets, special grains, ghee, oil, dry fruits for Diwali) that saw increased sales. Suggest specific stocking levels based on that historical demand and current inventory.
                2.  **Historical Trends:** Compare sales from the last 30-60 days with the same period from LAST YEAR. Identify products with significant sales growth or decline.
                3.  **Restock Alerts:** Find popular, fast-moving products that are currently low in stock. Recommend a specific quantity to order based on their sales velocity.
                4.  **Slow-Moving Stock:** Identify products with high inventory but very low sales in the past 90 days. Suggest a strategy (e.g., 'Offer a 10% discount' or 'Bundle with a popular item').
                
                ---
                INVENTORY DATA:
                ${JSON.stringify(products, null, 2)}
                ---
                SALES HISTORY (Aggregated by month, showing units sold per product for each YYYY-MM period):
                ${JSON.stringify(aggregatedSales, null, 2)}
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: suggestionsSchema,
                },
            });
            
            const parsedSuggestions: Suggestion[] = JSON.parse(response.text);
            setSuggestions(parsedSuggestions);

        } catch (err) {
            console.error(err);
            setError(t('proactive_ai_suggestions.error'));
        } finally {
            setIsLoading(false);
        }
    };

    if (products.length > 0 && sales.length > 0) {
        generateSuggestions();
    } else {
        setIsLoading(false);
    }
  }, [products, sales, t, apiKey]); // Rerun if data or API key changes

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-8">
            <div role="status" className="flex flex-col items-center justify-center">
                <svg aria-hidden="true" className="w-8 h-8 mr-2 text-slate-200 animate-spin dark:text-slate-600 fill-primary-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5424 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
                <span className="sr-only">Loading...</span>
            </div>
          <p className="mt-4 text-slate-500 dark:text-slate-400">{t('proactive_ai_suggestions.loading')}</p>
        </div>
      );
    }
    if (error) {
      return <p className="text-red-500 text-center py-8">{error}</p>;
    }
    if (suggestions && suggestions.length > 0) {
      return (
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-4">
            {suggestions.map((item, index) => (
                <div key={index}>
                    <p className="my-0"><strong>Action:</strong> {item.action}</p>
                    <p className="my-0 text-slate-500 dark:text-slate-400"><strong>Reasoning:</strong> {item.reasoning}</p>
                </div>
            ))}
        </div>
      );
    }
    return <p className="text-slate-500 dark:text-slate-400 text-center py-8">{!apiKey ? t('common.api_key_not_configured_link') : t('proactive_ai_suggestions.description')}</p>;
  };
  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 min-h-[200px]">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 p-6 border-b border-slate-200 dark:border-slate-700 flex items-center">
        <LightbulbIcon className="mr-3 text-yellow-500" /> {t('proactive_ai_suggestions.title')}
      </h2>
      <div className="p-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default ProactiveAiSuggestions;