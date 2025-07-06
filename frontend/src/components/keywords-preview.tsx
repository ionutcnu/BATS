'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  RefreshCw, 
  Info,
  ChevronDown,
  ChevronUp,
  Tag,
  Zap
} from 'lucide-react';
import { apiService } from '@/services/api';
import { cn } from '@/lib/utils';

interface KeywordsPreviewProps {
  jobDescription?: string;
  onKeywordsChange?: (keywords: string) => void;
  className?: string;
  showTitle?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

interface KeywordCategory {
  category: string;
  keywords: string[];
  color: string;
}

export function KeywordsPreview({
  jobDescription,
  onKeywordsChange,
  className,
  showTitle = true,
  collapsible = true,
  defaultExpanded = false
}: KeywordsPreviewProps) {
  const [keywords, setKeywords] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const keywordCategories: KeywordCategory[] = [
    {
      category: 'Quality Assurance',
      keywords: ['QA', 'Quality Assurance', 'Test Engineer', 'Testing'],
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    },
    {
      category: 'Testing Types',
      keywords: ['Manual Testing', 'Automated Testing', 'Regression Testing', 'Integration Testing'],
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    },
    {
      category: 'Tools & Frameworks',
      keywords: ['Selenium', 'Cypress', 'Playwright', 'Postman', 'Jenkins'],
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    },
    {
      category: 'Methodologies',
      keywords: ['Agile', 'Scrum', 'Kanban', 'BDD', 'TDD'],
      color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    },
    {
      category: 'Technical Skills',
      keywords: ['API Testing', 'SQL', 'CI/CD', 'Git', 'Database Testing'],
      color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
    }
  ];

  const fetchKeywords = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getKeywords();
      if (response.success && response.data) {
        setKeywords(response.data.keywords);
        onKeywordsChange?.(response.data.keywords);
      } else {
        setError(response.error || 'Failed to fetch keywords');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKeywords();
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(keywords);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const keywordCount = keywords.split(' ').filter(k => k.length > 0).length;

  const PreviewHeader = () => (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Tag className="h-5 w-5 text-primary" />
        </div>
        <div>
          {showTitle && (
            <h3 className="text-lg font-semibold">Keywords Preview</h3>
          )}
          <p className="text-sm text-muted-foreground">
            {keywordCount} keywords will be embedded invisibly
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={handleCopy}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          title="Copy keywords"
        >
          {isCopied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        
        <button
          onClick={fetchKeywords}
          disabled={isLoading}
          className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
          title="Refresh keywords"
        >
          <RefreshCw className={cn(
            "h-4 w-4 text-muted-foreground",
            isLoading && "animate-spin"
          )} />
        </button>
        
        {collapsible && (
          <button
            onClick={toggleExpanded}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        )}
      </div>
    </div>
  );

  const KeywordCategories = () => (
    <div className="space-y-4">
      {keywordCategories.map((category, index) => (
        <motion.div
          key={category.category}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="space-y-2"
        >
          <h4 className="text-sm font-medium text-muted-foreground">
            {category.category}
          </h4>
          <div className="flex flex-wrap gap-2">
            {category.keywords.map((keyword) => (
              <span
                key={keyword}
                className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                  category.color
                )}
              >
                {keyword}
              </span>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );

  const InfoBox = () => (
    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950 dark:border-blue-800">
      <div className="flex items-start space-x-2">
        <Info className="h-4 w-4 text-blue-600 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-blue-800 dark:text-blue-200">
            How it works
          </p>
          <p className="text-blue-700 dark:text-blue-300 mt-1">
            These keywords are embedded invisibly in your PDF with 1px font size and near-white color. 
            ATS systems can read them, but they won't affect your document's appearance.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn("border rounded-lg bg-card p-4", className)}>
      <PreviewHeader />
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">
                      Loading keywords...
                    </span>
                  </div>
                </div>
              ) : error ? (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                  <button
                    onClick={fetchKeywords}
                    className="mt-2 px-3 py-1 text-xs bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <>
                  <KeywordCategories />
                  
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">
                        Full Keywords String
                      </label>
                      <span className="text-xs text-muted-foreground">
                        {keywordCount} keywords
                      </span>
                    </div>
                    <div className="relative">
                      <textarea
                        value={keywords}
                        onChange={(e) => {
                          setKeywords(e.target.value);
                          onKeywordsChange?.(e.target.value);
                        }}
                        className="w-full h-24 px-3 py-2 text-sm border border-border rounded-lg bg-muted/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Keywords will appear here..."
                        readOnly
                      />
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={handleCopy}
                          className="p-1 hover:bg-background rounded"
                          title="Copy keywords"
                        >
                          {isCopied ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <InfoBox />
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function KeywordsPreviewCard({ jobDescription }: { jobDescription?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl"
    >
      <KeywordsPreview
        jobDescription={jobDescription}
        showTitle={true}
        collapsible={true}
        defaultExpanded={true}
      />
    </motion.div>
  );
}