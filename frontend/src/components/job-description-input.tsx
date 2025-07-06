'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Trash2, 
  Eye, 
  EyeOff, 
  Lightbulb, 
  Target,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Info,
  Bot,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiService } from '@/services/api';

interface JobDescriptionInputProps {
  onJobDescriptionChange?: (description: string) => void;
  onKeywordsSuggested?: (keywords: string[]) => void;
  className?: string;
  placeholder?: string;
  maxLength?: number;
  showAnalysis?: boolean;
}

interface JobAnalysis {
  wordCount: number;
  characterCount: number;
  suggestedKeywords: string[];
  requiredSkills: string[];
  technicalSkills: string[];
  softSkills: string[];
  experienceRequirements: string[];
  industries: string[];
  jobTitles: string[];
  certifications: string[];
  jobLevel?: string;
  jobType?: string;
  relevanceScore?: number;
  keywordFrequency: Record<string, number>;
  aiGenerated: boolean;
}

export function JobDescriptionInput({
  onJobDescriptionChange,
  onKeywordsSuggested,
  className,
  placeholder = "Paste the job description here to get personalized keyword optimization...",
  maxLength = 5000,
  showAnalysis = true
}: JobDescriptionInputProps) {
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [useAI, setUseAI] = useState(true);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setJobDescription(value);
      onJobDescriptionChange?.(value);
    }
  }, [maxLength, onJobDescriptionChange]);

  const analyzeJobDescription = useCallback(async (text: string) => {
    if (!text.trim()) {
      setAnalysis(null);
      setAiError(null);
      return;
    }

    setIsAnalyzing(true);
    setAiError(null);
    
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    const characterCount = text.length;
    
    if (useAI) {
      try {
        // Use AI service for keyword extraction
        const response = await apiService.extractKeywordsFromJobDescription(text);
        
        if (response.success && response.data) {
          const aiAnalysis: JobAnalysis = {
            wordCount,
            characterCount,
            suggestedKeywords: response.data.suggestedKeywords || [],
            requiredSkills: response.data.requiredSkills || [],
            technicalSkills: response.data.technicalSkills || [],
            softSkills: response.data.softSkills || [],
            experienceRequirements: response.data.experienceRequirements || [],
            industries: response.data.industries || [],
            jobTitles: response.data.jobTitles || [],
            certifications: response.data.certifications || [],
            jobLevel: response.data.jobLevel,
            jobType: response.data.jobType,
            relevanceScore: response.data.relevanceScore,
            keywordFrequency: response.data.keywordFrequency || {},
            aiGenerated: true
          };
          
          setAnalysis(aiAnalysis);
          onKeywordsSuggested?.(aiAnalysis.suggestedKeywords);
          setIsAnalyzing(false);
          return;
        } else {
          setAiError(response.error || 'AI service failed');
          // Fall back to basic analysis
        }
      } catch (error) {
        setAiError('AI service unavailable');
        // Fall back to basic analysis
      }
    }
    
    // Basic analysis (fallback or when AI is disabled)
    const extractedKeywords = words
      .filter(word => 
        word.length > 3 && 
        !['this', 'that', 'with', 'from', 'will', 'have', 'been', 'your', 'they', 'their'].includes(word.toLowerCase())
      )
      .map(word => word.toLowerCase().replace(/[^a-z0-9]/g, ''))
      .filter(word => word.length > 2);
    
    const keywordFrequency = extractedKeywords.reduce((acc: Record<string, number>, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});
    
    const suggestedKeywords = Object.entries(keywordFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
    
    const basicAnalysis: JobAnalysis = {
      wordCount,
      characterCount,
      suggestedKeywords,
      requiredSkills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'AWS'],
      technicalSkills: ['JavaScript', 'React', 'Node.js'],
      softSkills: ['Communication', 'Problem Solving', 'Team Work'],
      experienceRequirements: ['3+ years', 'Senior level', 'Team leadership'],
      industries: ['Technology', 'Software Development', 'SaaS'],
      jobTitles: ['Software Engineer', 'Frontend Developer'],
      certifications: [],
      keywordFrequency,
      aiGenerated: false
    };
    
    setAnalysis(basicAnalysis);
    onKeywordsSuggested?.(suggestedKeywords);
    setIsAnalyzing(false);
  }, [onKeywordsSuggested, useAI]);

  useEffect(() => {
    if (jobDescription.trim() && showAnalysis) {
      const debounceTimer = setTimeout(() => {
        analyzeJobDescription(jobDescription);
      }, 1000);
      
      return () => clearTimeout(debounceTimer);
    }
  }, [jobDescription, analyzeJobDescription, showAnalysis]);

  const handleClear = () => {
    setJobDescription('');
    setAnalysis(null);
    setShowSuggestions(false);
    onJobDescriptionChange?.('');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jobDescription);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  const toggleSuggestions = () => {
    setShowSuggestions(!showSuggestions);
  };

  const characterCount = jobDescription.length;
  const wordCount = jobDescription.trim() ? jobDescription.trim().split(/\s+/).length : 0;
  const isNearLimit = characterCount > maxLength * 0.8;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              Job Description
              {useAI && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 text-purple-700 dark:text-purple-300">
                  <Bot className="h-3 w-3" />
                  AI-Powered
                </span>
              )}
            </h3>
            <p className="text-sm text-muted-foreground">
              Paste the job posting to get {useAI ? 'AI-powered' : 'basic'} keyword optimization
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setUseAI(!useAI)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              useAI 
                ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300" 
                : "hover:bg-muted text-muted-foreground"
            )}
            title={useAI ? "Disable AI analysis" : "Enable AI analysis"}
          >
            {useAI ? (
              <Zap className="h-4 w-4" />
            ) : (
              <Bot className="h-4 w-4" />
            )}
          </button>
          
          {jobDescription && (
            <>
              <button
                onClick={handleCopy}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title="Copy job description"
              >
                {isCopied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              
              <button
                onClick={togglePreview}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title={showPreview ? "Hide preview" : "Show preview"}
              >
                {showPreview ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              
              <button
                onClick={handleClear}
                className="p-2 hover:bg-muted rounded-lg transition-colors text-destructive"
                title="Clear job description"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="relative">
        <textarea
          value={jobDescription}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={cn(
            "w-full min-h-[200px] max-h-[400px] p-4 border border-border rounded-lg bg-background resize-y",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "placeholder:text-muted-foreground text-sm leading-relaxed text-foreground",
            isNearLimit && "border-orange-300 dark:border-orange-700"
          )}
          style={{ fontFamily: 'inherit', color: 'hsl(var(--foreground))' }}
        />
        
        {/* Character Count */}
        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
          <span className={cn(isNearLimit && "text-orange-600 dark:text-orange-400")}>
            {characterCount}/{maxLength}
          </span>
        </div>
      </div>

      {/* Word Count & Status */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{wordCount} words</span>
        {isAnalyzing && (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{useAI ? 'AI analyzing...' : 'Analyzing...'}</span>
          </div>
        )}
      </div>

      {/* AI Error Message */}
      {aiError && (
        <div className="flex items-start space-x-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-red-800 dark:text-red-200">
              AI Analysis Failed
            </p>
            <p className="text-red-700 dark:text-red-300 mt-1">
              {aiError}. Using basic analysis instead.
            </p>
          </div>
        </div>
      )}

      {/* Preview */}
      <AnimatePresence>
        {showPreview && jobDescription && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="font-medium mb-2">Preview:</h4>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap max-h-32 overflow-y-auto">
                {jobDescription}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Results */}
      {analysis && showAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {analysis.wordCount}
              </div>
              <div className="text-xs text-muted-foreground">Words</div>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {analysis.suggestedKeywords.length}
              </div>
              <div className="text-xs text-muted-foreground">Keywords</div>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {analysis.requiredSkills.length}
              </div>
              <div className="text-xs text-muted-foreground">Skills</div>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {analysis.experienceRequirements.length}
              </div>
              <div className="text-xs text-muted-foreground">Requirements</div>
            </div>
          </div>

          {/* AI Analysis Indicator */}
          {analysis.aiGenerated && (
            <div className="flex items-center justify-center space-x-2 p-2 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 rounded-lg">
              <Bot className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                AI-Enhanced Analysis
              </span>
              {analysis.relevanceScore && (
                <span className="text-xs text-purple-600 dark:text-purple-400">
                  ({analysis.relevanceScore}% relevance)
                </span>
              )}
            </div>
          )}

          {/* Keyword Suggestions */}
          {analysis.suggestedKeywords.length > 0 && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-primary" />
                  <h4 className="font-medium">Suggested Keywords</h4>
                </div>
                <button
                  onClick={toggleSuggestions}
                  className="text-sm text-primary hover:underline"
                >
                  {showSuggestions ? 'Hide' : 'Show'} Details
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {analysis.suggestedKeywords.slice(0, showSuggestions ? undefined : 6).map((keyword, index) => (
                  <span
                    key={keyword}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                  >
                    {keyword}
                  </span>
                ))}
                {!showSuggestions && analysis.suggestedKeywords.length > 6 && (
                  <button
                    onClick={toggleSuggestions}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground hover:bg-muted/80"
                  >
                    +{analysis.suggestedKeywords.length - 6} more
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Additional Analysis */}
          <AnimatePresence>
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2 flex items-center space-x-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      <span>Required Skills</span>
                    </h4>
                    <div className="space-y-1">
                      {analysis.requiredSkills.map((skill, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          • {skill}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2 flex items-center space-x-2">
                      <Info className="h-4 w-4 text-blue-500" />
                      <span>Experience Level</span>
                    </h4>
                    <div className="space-y-1">
                      {analysis.experienceRequirements.map((exp, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          • {exp}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Additional AI Analysis */}
                {analysis.aiGenerated && (
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    {analysis.technicalSkills.length > 0 && (
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2 flex items-center space-x-2">
                          <Target className="h-4 w-4 text-green-500" />
                          <span>Technical Skills</span>
                        </h4>
                        <div className="space-y-1">
                          {analysis.technicalSkills.map((skill, index) => (
                            <div key={index} className="text-sm text-muted-foreground">
                              • {skill}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {analysis.softSkills.length > 0 && (
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2 flex items-center space-x-2">
                          <Info className="h-4 w-4 text-blue-500" />
                          <span>Soft Skills</span>
                        </h4>
                        <div className="space-y-1">
                          {analysis.softSkills.map((skill, index) => (
                            <div key={index} className="text-sm text-muted-foreground">
                              • {skill}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Job Level and Type */}
                {analysis.aiGenerated && (analysis.jobLevel || analysis.jobType) && (
                  <div className="flex gap-4 mt-4">
                    {analysis.jobLevel && (
                      <div className="flex-1 border rounded-lg p-4">
                        <h4 className="font-medium mb-2">Job Level</h4>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          {analysis.jobLevel}
                        </span>
                      </div>
                    )}
                    {analysis.jobType && (
                      <div className="flex-1 border rounded-lg p-4">
                        <h4 className="font-medium mb-2">Job Type</h4>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                          {analysis.jobType}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Help Text */}
      {!jobDescription && (
        <div className="flex items-start space-x-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-800 dark:text-blue-200">
              {useAI ? '🤖 AI-Powered Analysis' : '📝 Basic Analysis'}
            </p>
            <p className="text-blue-700 dark:text-blue-300 mt-1">
              Paste a job description to get {useAI ? 'AI-enhanced' : 'basic'} keyword suggestions that match the role you're applying for.
              {useAI && (
                <span className="block mt-1 text-xs">
                  AI will analyze the job requirements and suggest the most relevant keywords for ATS optimization.
                </span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}