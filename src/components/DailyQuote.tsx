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
      className="bg-glass rounded-xl p-8 relative border border-line shadow-lg hover:border-green dark:hover:border-green transition-colors"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-glass-tint rounded-bl-[100px] -z-10"></div>
      <Quote className="w-10 h-10 text-green absolute top-6 left-6 opacity-20" />
      <div className="ml-12">
        <p className="text-xl text-ink font-display mb-6 leading-relaxed">{quote.text}</p>
        <div className="flex items-center justify-end">
          <div className="text-right">
            <p className="text-green font-display text-lg font-semibold">{quote.author}</p>
            {quote.source && (
              <p className="text-sm text-muted font-display">{quote.source}</p>
            )}
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-green rounded-b-xl"></div>
    </m.div>
  );
};