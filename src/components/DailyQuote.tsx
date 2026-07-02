import React from 'react';
import { Quote } from 'lucide-react';
import { m } from 'framer-motion';
import { DailyQuote as DailyQuoteType } from '../types';

interface DailyQuoteProps {
  quote: DailyQuoteType;
}

export const DailyQuote: React.FC<DailyQuoteProps> = ({ quote }) => {
  return (
    <m.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-8 relative border border-emerald-100 dark:border-emerald-800 shadow-lg hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/50 rounded-bl-[100px] -z-10"></div>
      <Quote className="w-10 h-10 text-emerald-600 dark:text-emerald-400 absolute top-6 left-6 opacity-20" />
      <div className="ml-12">
        <p className="text-xl text-gray-800 dark:text-gray-200 font-amiri mb-6 leading-relaxed">{quote.text}</p>
        <div className="flex items-center justify-end">
          <div className="text-right">
            <p className="text-emerald-600 dark:text-emerald-400 font-amiri text-lg font-semibold">{quote.author}</p>
            {quote.source && (
              <p className="text-sm text-gray-500 dark:text-gray-400 font-amiri">{quote.source}</p>
            )}
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-emerald-300 dark:from-emerald-600 dark:to-emerald-400 rounded-b-xl"></div>
    </m.div>
  );
};