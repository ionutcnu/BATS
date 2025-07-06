'use client';

import React, { useState, useCallback } from 'react';
import { X, Plus } from 'lucide-react';

interface ManualKeywordInputProps {
  onKeywordsChange: (keywords: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function ManualKeywordInput({ 
  onKeywordsChange, 
  placeholder = "Type a keyword and press Enter to add...",
  className = ""
}: ManualKeywordInputProps) {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  const addKeyword = useCallback(() => {
    const trimmed = inputValue.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      const newKeywords = [...keywords, trimmed];
      setKeywords(newKeywords);
      onKeywordsChange(newKeywords);
      setInputValue('');
    }
  }, [inputValue, keywords, onKeywordsChange]);

  const removeKeyword = useCallback((index: number) => {
    const newKeywords = keywords.filter((_, i) => i !== index);
    setKeywords(newKeywords);
    onKeywordsChange(newKeywords);
  }, [keywords, onKeywordsChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  }, [addKeyword]);

  return (
    <div className={className}>
      <h3 className="font-semibold mb-4">Enter Keywords</h3>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 p-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            autoComplete="off"
          />
          <button
            onClick={addKeyword}
            className="px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {keywords.length > 0 && (
          <div className="p-3 border border-border rounded-lg bg-muted/50">
            <div className="text-sm font-medium mb-2">Added Keywords ({keywords.length}):</div>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <div
                  key={`${keyword}-${index}`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-sm font-medium"
                >
                  <span>{keyword}</span>
                  <button
                    onClick={() => removeKeyword(index)}
                    className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-primary-foreground/20 transition-colors"
                    title={`Remove ${keyword}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>• Press Enter to add a keyword</p>
          <p>• Click X to remove a keyword</p>
        </div>
      </div>
    </div>
  );
}