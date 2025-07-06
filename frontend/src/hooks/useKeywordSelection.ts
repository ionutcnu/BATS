import { useState, useCallback, useRef, useEffect } from 'react';
import { apiService, JobCategory, JobRoleAnalysis, AIKeywordExtractionResult } from '@/services/api';

export type KeywordOption = 'categories' | 'manual' | 'job-description';

interface KeywordState {
  selectedKeywordOption: KeywordOption | null;
  selectedCategories: string[];
  manualKeywords: string[];
  manualInputValue: string;
  jobDescription: string;
  jobKeywords: string[];
  categories: JobCategory[];
  smartCategories: JobCategory[];
  showAllCategories: boolean;
  detectedJobRole: JobRoleAnalysis | null;
  finalKeywords: string[];
  isExtractingKeywords: boolean;
  extractionError: string | null;
}

interface KeywordActions {
  setSelectedKeywordOption: (option: KeywordOption | null) => void;
  setSelectedCategories: (categories: string[]) => void;
  setManualKeywords: (keywords: string[]) => void;
  setManualInputValue: (value: string) => void;
  setJobDescription: (description: string) => void;
  setJobKeywords: (keywords: string[]) => void;
  setCategories: (categories: JobCategory[]) => void;
  setSmartCategories: (categories: JobCategory[]) => void;
  setShowAllCategories: (show: boolean) => void;
  setDetectedJobRole: (role: JobRoleAnalysis | null) => void;
  setFinalKeywords: (keywords: string[]) => void;
  handleCategoryToggle: (categoryId: string) => void;
  addManualKeyword: (keyword?: string) => void;
  removeManualKeyword: (index: number) => void;
  handleManualKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  extractKeywordsFromJobDescription: () => Promise<void>;
  clearAllKeywords: () => void;
  undoClearKeywords: () => void;
  prepareFinalKeywords: () => Promise<string[]>;
  resetKeywordSelection: () => void;
}

export function useKeywordSelection() {
  const [selectedKeywordOption, setSelectedKeywordOption] = useState<KeywordOption | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [manualKeywords, setManualKeywords] = useState<string[]>([]);
  const [manualInputValue, setManualInputValue] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobKeywords, setJobKeywords] = useState<string[]>([]);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [smartCategories, setSmartCategories] = useState<JobCategory[]>([]);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [detectedJobRole, setDetectedJobRole] = useState<JobRoleAnalysis | null>(null);
  const [finalKeywords, setFinalKeywords] = useState<string[]>([]);
  const [isExtractingKeywords, setIsExtractingKeywords] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [lastClearedKeywords, setLastClearedKeywords] = useState<string[]>([]);
  
  const manualInputRef = useRef<HTMLInputElement>(null);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await apiService.getJobCategories();
        if (response.success && response.data) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    
    loadCategories();
  }, []);

  const handleCategoryToggle = useCallback((categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  const addManualKeyword = useCallback((keyword?: string) => {
    const input = manualInputRef.current;
    const keywordToAdd = keyword || input?.value.trim();
    
    if (keywordToAdd && !manualKeywords.includes(keywordToAdd)) {
      setManualKeywords(prev => [...prev, keywordToAdd]);
      if (input) {
        input.value = '';
      }
      setManualInputValue('');
    }
  }, [manualKeywords]);

  const removeManualKeyword = useCallback((index: number) => {
    setManualKeywords(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleManualKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addManualKeyword();
    }
  }, [addManualKeyword]);

  const extractKeywordsFromJobDescription = useCallback(async () => {
    if (!jobDescription.trim()) return;
    
    setIsExtractingKeywords(true);
    setExtractionError(null);
    
    try {
      const response = await apiService.extractKeywords(jobDescription);
      if (response.success && response.data) {
        const extractionResult = response.data as AIKeywordExtractionResult;
        setJobKeywords(extractionResult.suggestedKeywords || []);
        
        if (extractionResult.detectedJobRole) {
          setDetectedJobRole(extractionResult.detectedJobRole);
        }
        
        // Set smart categories based on detected role
        if (extractionResult.detectedJobRole && categories.length > 0) {
          const roleKeywords = extractionResult.detectedJobRole.primaryRole?.toLowerCase() || '';
          const relevantCategories = categories.filter(cat => 
            cat.name.toLowerCase().includes(roleKeywords) ||
            cat.keywords.some(keyword => 
              extractionResult.suggestedKeywords?.includes(keyword)
            )
          );
          setSmartCategories(relevantCategories.slice(0, 3));
        }
      } else {
        setExtractionError(response.error || 'Failed to extract keywords');
      }
    } catch (error) {
      setExtractionError('Failed to extract keywords from job description');
      console.error('Keyword extraction error:', error);
    } finally {
      setIsExtractingKeywords(false);
    }
  }, [jobDescription, categories]);

  const clearAllKeywords = useCallback(() => {
    switch (selectedKeywordOption) {
      case 'manual':
        setLastClearedKeywords([...manualKeywords]);
        setManualKeywords([]);
        break;
      case 'job-description':
        setLastClearedKeywords([...jobKeywords]);
        setJobKeywords([]);
        break;
      case 'categories':
        setLastClearedKeywords([...selectedCategories]);
        setSelectedCategories([]);
        break;
    }
  }, [selectedKeywordOption, manualKeywords, jobKeywords, selectedCategories]);

  const undoClearKeywords = useCallback(() => {
    switch (selectedKeywordOption) {
      case 'manual':
        setManualKeywords([...lastClearedKeywords]);
        break;
      case 'job-description':
        setJobKeywords([...lastClearedKeywords]);
        break;
      case 'categories':
        setSelectedCategories([...lastClearedKeywords]);
        break;
    }
    setLastClearedKeywords([]);
  }, [selectedKeywordOption, lastClearedKeywords]);

  const prepareFinalKeywords = useCallback(async (): Promise<string[]> => {
    let keywords: string[] = [];
    
    if (selectedKeywordOption === 'categories') {
      for (const categoryId of selectedCategories) {
        try {
          const response = await fetch(`http://localhost:5000/api/categories/${categoryId}/keywords`);
          if (response.ok) {
            const data = await response.json();
            keywords.push(...data.keywords);
          }
        } catch (err) {
          console.error('Failed to fetch category keywords:', err);
        }
      }
    } else if (selectedKeywordOption === 'manual') {
      keywords = [...manualKeywords];
    } else if (selectedKeywordOption === 'job-description') {
      keywords = [...jobKeywords];
    }
    
    const uniqueKeywords = [...new Set(keywords)];
    setFinalKeywords(uniqueKeywords);
    return uniqueKeywords;
  }, [selectedKeywordOption, selectedCategories, manualKeywords, jobKeywords]);

  const resetKeywordSelection = useCallback(() => {
    setSelectedKeywordOption(null);
    setSelectedCategories([]);
    setManualKeywords([]);
    setManualInputValue('');
    setJobDescription('');
    setJobKeywords([]);
    setSmartCategories([]);
    setShowAllCategories(false);
    setDetectedJobRole(null);
    setFinalKeywords([]);
    setIsExtractingKeywords(false);
    setExtractionError(null);
    setLastClearedKeywords([]);
  }, []);

  const state: KeywordState = {
    selectedKeywordOption,
    selectedCategories,
    manualKeywords,
    manualInputValue,
    jobDescription,
    jobKeywords,
    categories,
    smartCategories,
    showAllCategories,
    detectedJobRole,
    finalKeywords,
    isExtractingKeywords,
    extractionError,
  };

  const actions: KeywordActions = {
    setSelectedKeywordOption,
    setSelectedCategories,
    setManualKeywords,
    setManualInputValue,
    setJobDescription,
    setJobKeywords,
    setCategories,
    setSmartCategories,
    setShowAllCategories,
    setDetectedJobRole,
    setFinalKeywords,
    handleCategoryToggle,
    addManualKeyword,
    removeManualKeyword,
    handleManualKeyPress,
    extractKeywordsFromJobDescription,
    clearAllKeywords,
    undoClearKeywords,
    prepareFinalKeywords,
    resetKeywordSelection,
  };

  return {
    ...state,
    ...actions,
    manualInputRef,
  };
}