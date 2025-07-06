'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  Target,
  Download,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Zap,
  Hash,
  FileSearch,
  Briefcase,
  Edit3,
  Clipboard,
  X,
  Plus,
  Settings,
  Shield
} from 'lucide-react';
import { apiService, AIKeywordExtractionResult, ATSAnalysis, JobCategory, JobRoleAnalysis } from '@/services/api';
import { ErrorHandler, useErrorHandler } from '@/components/error-handler';
import { Loading } from '@/components/loading';
import { AIConsentModal } from '@/components/ai-consent-modal';
import { AISettings } from '@/components/ai-settings';
import { ATSScoreHeader } from '@/components/ats-score-header';
import { ATSDetailsModal } from '@/components/ats-details-modal';
import { cn } from '@/lib/utils';

interface WorkflowStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'pending' | 'current' | 'completed';
}

type KeywordOption = 'categories' | 'manual' | 'job-description';

interface ResumeWorkflowProps {
  mode?: 'scan' | 'optimize';
}

export function ResumeWorkflow({ mode = 'optimize' }: ResumeWorkflowProps) {
  const [workflowMode, setWorkflowMode] = useState<'scan' | 'optimize'>(mode);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ATSAnalysis | null>(null);
  const [selectedKeywordOption, setSelectedKeywordOption] = useState<KeywordOption | null>(null);
  const [showOptimizeOptions, setShowOptimizeOptions] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [manualKeywords, setManualKeywords] = useState<string[]>([]);
  const [manualInputValue, setManualInputValue] = useState('');
  const manualInputRef = useRef<HTMLInputElement>(null);
  const jobDescriptionRef = useRef<HTMLTextAreaElement>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [jobKeywords, setJobKeywords] = useState<string[]>([]);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [smartCategories, setSmartCategories] = useState<JobCategory[]>([]);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [detectedJobRole, setDetectedJobRole] = useState<JobRoleAnalysis | null>(null);
  const [finalKeywords, setFinalKeywords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [aiServiceAvailable, setAiServiceAvailable] = useState<boolean | null>(null);
  const [aiConsentGiven, setAiConsentGiven] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showAISettings, setShowAISettings] = useState(false);
  const [aiPreferences, setAiPreferences] = useState({
    enableAIAnalysis: true,
    enableResumeAnalysis: true,
    enableJobDescriptionAnalysis: true,
    autoDeleteData: true,
    showAIIndicators: true,
    consentGiven: false
  });
  const [showATSDetails, setShowATSDetails] = useState(false);
  const [showATSModal, setShowATSModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [lastClearedKeywords, setLastClearedKeywords] = useState<string[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [originalAnalysis, setOriginalAnalysis] = useState<ATSAnalysis | null>(null);
  const [optimizedAnalysis, setOptimizedAnalysis] = useState<ATSAnalysis | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const { error, showError, clearError } = useErrorHandler();

  // Re-analyze current file
  const reanalyzeFile = useCallback(async () => {
    if (!uploadedFile) return;
    
    setIsLoading(true);
    setLoadingMessage('Re-analyzing resume...');
    
    try {
      const response = await apiService.analyzeResume(uploadedFile);
      
      if (response.success && response.data) {
        const analysisWithTimestamp = {
          ...response.data,
          analyzedAt: new Date().toISOString()
        };
        setAnalysisResult(analysisWithTimestamp);
      } else {
        showError('generic', response.error || 'Failed to analyze resume');
      }
    } catch (err) {
      showError('generic', 'Failed to analyze resume');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [uploadedFile, showError]);

  // Check AI service availability and load preferences on mount
  useEffect(() => {
    const checkAIHealth = async () => {
      try {
        const response = await apiService.checkAIHealth();
        setAiServiceAvailable(response.success && response.data?.aiServiceAvailable === true);
      } catch (error) {
        setAiServiceAvailable(false);
      }
    };
    
    // Load stored AI preferences
    const loadPreferences = () => {
      try {
        const stored = localStorage.getItem('bats-ai-preferences');
        if (stored) {
          const prefs = JSON.parse(stored);
          setAiPreferences(prev => ({ ...prev, ...prefs }));
          setAiConsentGiven(prefs.consentGiven || false);
        }
      } catch (error) {
        console.warn('Failed to load AI preferences');
      }
    };
    
    checkAIHealth();
    loadPreferences();
  }, []);

  const steps: WorkflowStep[] = workflowMode === 'scan' ? [
    {
      id: 1,
      title: 'Upload & Analyze',
      description: 'Upload your resume and get FREE ATS compatibility analysis',
      icon: Upload,
      status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'current' : 'pending'
    },
    {
      id: 2,
      title: 'View Results',
      description: 'See your ATS score and improvement suggestions',
      icon: Target,
      status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'current' : 'pending'
    }
  ] : [
    {
      id: 1,
      title: 'Upload & Analyze',
      description: 'Upload your resume and get ATS compatibility score',
      icon: Upload,
      status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'current' : 'pending'
    },
    {
      id: 2,
      title: 'Select Keywords',
      description: 'Choose how to optimize your resume',
      icon: Target,
      status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'current' : 'pending'
    },
    {
      id: 3,
      title: 'Process & Download',
      description: 'Get your optimized resume',
      icon: Download,
      status: currentStep > 3 ? 'completed' : currentStep === 3 ? 'current' : 'pending'
    }
  ];

  const handleFileUpload = useCallback(async (file: File) => {
    setIsLoading(true);
    setLoadingMessage('Analyzing your resume...');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`);
      }

      const data = await response.json();
      const analysisWithTimestamp = {
        ...data,
        analyzedAt: new Date().toISOString()
      };
      
      setUploadedFile(file);
      setAnalysisResult(analysisWithTimestamp);
      setOriginalAnalysis(analysisWithTimestamp);
      
      if (workflowMode === 'scan') {
        setCurrentStep(2);
      } else {
        setCurrentStep(2);
      }
      
    } catch (err) {
      showError('generic', 'Failed to analyze resume. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [showError, clearError, workflowMode]);

  const loadCategories = useCallback(async () => {
    try {
      // First try to get smart categories based on job role analysis
      if (analysisResult?.jobRoleAnalysis) {
        setDetectedJobRole(analysisResult.jobRoleAnalysis);
        setSmartCategories([]);
        
        // Load all categories as fallback
        const allCategoriesResponse = await fetch('http://localhost:5000/api/categories');
        if (allCategoriesResponse.ok) {
          const allCategoriesData = await allCategoriesResponse.json();
          setCategories(allCategoriesData);
        }
        
        // Try to get smart categories from the detected job role
        try {
          const smartResponse = await fetch(`http://localhost:5000/api/categories/smart?jobRole=${encodeURIComponent(analysisResult.jobRoleAnalysis.primaryRole)}&confidence=${analysisResult.jobRoleAnalysis.confidence}`);
          if (smartResponse.ok) {
            const smartData = await smartResponse.json();
            setSmartCategories(smartData.categories || []);
          }
        } catch (smartErr) {
          console.warn('Failed to load smart categories, using all categories');
        }
      } else {
        // No job role analysis available, load all categories
        const response = await fetch('http://localhost:5000/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
          setSmartCategories([]);
        }
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }, [analysisResult]);

  const handleKeywordOptionSelect = useCallback(async (option: KeywordOption) => {
    setSelectedKeywordOption(option);
    if (option === 'categories') {
      await loadCategories();
    }
  }, [loadCategories]);

  const handleCategoryToggle = useCallback((categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  const showToastNotification = useCallback((message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, []);

  const handleManualKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addManualKeyword();
    }
  }, []);

  const addManualKeyword = useCallback(() => {
    const input = manualInputRef.current;
    if (input) {
      const value = input.value.trim();
      if (value && !manualKeywords.includes(value)) {
        setManualKeywords(prev => [...prev, value]);
        input.value = '';
        showToastNotification(`Added "${value}"`);
      }
    }
  }, [manualKeywords, showToastNotification]);

  const removeManualKeyword = useCallback((index: number) => {
    const removedKeyword = manualKeywords[index];
    setManualKeywords(prev => prev.filter((_, i) => i !== index));
    showToastNotification(`Removed "${removedKeyword}"`);
  }, [manualKeywords, showToastNotification]);

  const proceedToProcessing = useCallback(async () => {
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
    
    setFinalKeywords([...new Set(keywords)]);
    setCurrentStep(3);
  }, [selectedKeywordOption, selectedCategories, manualKeywords, jobKeywords]);

  const processResume = useCallback(async () => {
    if (!uploadedFile || !finalKeywords.length) return;

    setIsLoading(true);
    setProcessingProgress(0);
    setProcessingStep('Preparing optimization...');
    setLoadingMessage('🚀 Starting resume enhancement process...');

    try {
      // Step 1: Prepare and send data
      setProcessingProgress(20);
      setProcessingStep('Embedding keywords into your resume...');
      setLoadingMessage('📝 Strategically placing ATS-optimized keywords...');
      
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('keywords', JSON.stringify(finalKeywords));

      const response = await fetch('http://localhost:5000/api/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Processing failed');
      }

      setProcessingProgress(60);
      setProcessingStep('Generating optimized resume...');
      setLoadingMessage('✨ Creating your enhanced resume...');

      const blob = await response.blob();
      
      // Create a File object from the blob for analysis
      const optimizedFile = new File([blob], `optimized_${uploadedFile.name}`, { type: 'application/pdf' });
      
      // Analyze the optimized resume
      setProcessingProgress(80);
      setProcessingStep('Analyzing optimized resume...');
      setLoadingMessage('🔍 Analyzing your optimized resume...');

      const analyzeFormData = new FormData();
      analyzeFormData.append('file', optimizedFile);
      
      const analyzeResponse = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        body: analyzeFormData,
        credentials: 'include',
      });

      if (analyzeResponse.ok) {
        const optimizedAnalysisData = await analyzeResponse.json();
        setOptimizedAnalysis({
          ...optimizedAnalysisData,
          analyzedAt: new Date().toISOString()
        });
        setShowComparison(true);
      }

      setProcessingProgress(100);
      setProcessingStep('Complete!');
      setLoadingMessage('🎉 Resume optimization complete!');

      // Auto-download the file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `optimized_${uploadedFile.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err) {
      showError('generic', 'Failed to process resume. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
      setProcessingProgress(0);
      setProcessingStep('');
    }
  }, [uploadedFile, finalKeywords, showError]);

  const FileUploadStep = () => {
    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      const pdfFile = files.find(file => file.type === 'application/pdf');
      
      if (pdfFile) {
        if (workflowMode === 'optimize' || termsAccepted) {
          handleFileUpload(pdfFile);
        }
      } else {
        showError('file', 'Please upload a PDF file');
      }
    }, [handleFileUpload, showError, workflowMode, termsAccepted]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (workflowMode === 'optimize' || termsAccepted) {
          handleFileUpload(file);
        }
      }
    }, [handleFileUpload, workflowMode, termsAccepted]);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">
            {workflowMode === 'scan' ? 'Upload Resume for FREE Analysis' : 'Upload Your Resume'}
          </h2>
          <p className="text-muted-foreground">
            {workflowMode === 'scan' 
              ? 'Get instant ATS compatibility analysis' 
              : 'Upload your resume to start the optimization process'
            }
          </p>
        </div>

        {workflowMode === 'scan' && !termsAccepted && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Privacy Notice
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                  Your resume will be analyzed for ATS compatibility. We don't store your files - they're processed in memory and deleted immediately after analysis.
                </p>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    I agree to the analysis of my resume for ATS compatibility
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            (workflowMode === 'optimize' || termsAccepted)
              ? "border-primary hover:border-primary/70 cursor-pointer"
              : "border-muted-foreground/30 cursor-not-allowed opacity-50"
          )}
        >
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Drop your resume here</h3>
              <p className="text-muted-foreground mb-4">or click to browse files</p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                disabled={workflowMode === 'scan' && !termsAccepted}
              />
              <label
                htmlFor="file-upload"
                className={cn(
                  "inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors",
                  (workflowMode === 'optimize' || termsAccepted)
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                <FileText className="h-4 w-4 mr-2" />
                Select PDF File
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              Supports PDF files up to 10MB
            </p>
          </div>
        </div>

        {analysisResult && (
          <ATSScoreHeader
            analysis={analysisResult}
            fileName={uploadedFile?.name}
            onReanalyze={reanalyzeFile}
            onViewDetails={() => setShowATSModal(true)}
            isLoading={isLoading}
          />
        )}

        {showATSModal && (
          <ATSDetailsModal
            isOpen={showATSModal}
            onClose={() => setShowATSModal(false)}
            analysis={analysisResult}
            fileName={uploadedFile?.name}
            onReanalyze={() => {
              setShowATSModal(false);
              reanalyzeFile();
            }}
            isLoading={isLoading}
          />
        )}
      </div>
    );
  };

  const KeywordSelectionStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Your Keywords</h2>
        <p className="text-muted-foreground">Select how you'd like to optimize your resume</p>
        
        {/* AI Status and Settings */}
        <div className="mt-4 flex items-center justify-center gap-4">
          <div className={cn(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
            aiServiceAvailable === true 
              ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300" 
              : aiServiceAvailable === false 
                ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                : "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
          )}>
            {aiServiceAvailable === true ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                🤖 AI Service Online
              </>
            ) : aiServiceAvailable === false ? (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                ⚠️ AI Service Offline
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                Checking AI Service...
              </>
            )}
          </div>
          
          <button
            onClick={() => setShowAISettings(true)}
            className="p-1.5 hover:bg-muted rounded-full transition-colors"
            title="AI Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!selectedKeywordOption ? (
        <div className="grid gap-4 md:grid-cols-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleKeywordOptionSelect('categories')}
            className="p-6 border border-border rounded-lg text-left hover:border-primary transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Job Categories</h3>
                <p className="text-sm text-muted-foreground">Choose from predefined keyword sets for different roles</p>
              </div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleKeywordOptionSelect('manual')}
            className="p-6 border border-border rounded-lg text-left hover:border-primary transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Edit3 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Manual Keywords</h3>
                <p className="text-sm text-muted-foreground">Enter your own keywords manually</p>
              </div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (aiServiceAvailable) {
                if (!aiConsentGiven) {
                  setShowConsentModal(true);
                  return;
                }
              }
              handleKeywordOptionSelect('job-description');
            }}
            className={cn(
              "p-6 border border-border rounded-lg text-left transition-colors",
              aiServiceAvailable ? "hover:border-primary" : "opacity-50 cursor-not-allowed"
            )}
            disabled={!aiServiceAvailable}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">AI-Powered {!aiServiceAvailable && '(Offline)'}</h3>
                <p className="text-sm text-muted-foreground">Extract keywords from job description using AI</p>
              </div>
            </div>
          </motion.button>
        </div>
      ) : (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedKeywordOption(null)}
            className="flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to options
          </button>

          {selectedKeywordOption === 'categories' && (
            <div>
              {detectedJobRole && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Job Role Detected</span>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    <strong>{detectedJobRole.primaryRole}</strong> ({Math.round(detectedJobRole.confidence * 100)}% confidence)
                  </p>
                  <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                    {detectedJobRole.seniorityLevel} • {detectedJobRole.industry}
                  </p>
                </div>
              )}
              
              {smartCategories.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2 text-green-700 dark:text-green-300">
                    🎯 Recommended for You
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Based on your {detectedJobRole?.primaryRole} role
                  </p>
                  <div className="grid gap-3">
                    {smartCategories.map((category) => (
                      <label key={category.id} className="flex items-center space-x-3 p-3 border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.id)}
                          onChange={() => handleCategoryToggle(category.id)}
                          className="rounded"
                        />
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="mr-2">{category.icon}</span>
                            <span className="font-medium">{category.name}</span>
                            <span className="ml-2 text-xs bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                              {category.keywords.length} keywords
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              
              {categories.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">
                      {smartCategories.length > 0 ? 'All Categories' : 'Select Job Categories'}
                    </h3>
                    {smartCategories.length > 0 && (
                      <button
                        onClick={() => setShowAllCategories(!showAllCategories)}
                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {showAllCategories ? 'Hide' : 'Show'} all categories
                      </button>
                    )}
                  </div>
                  
                  {(showAllCategories || smartCategories.length === 0) && (
                    <div className="grid gap-3">
                      {categories.filter(cat => !smartCategories.some(smart => smart.id === cat.id)).map((category) => (
                        <label key={category.id} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category.id)}
                            onChange={() => handleCategoryToggle(category.id)}
                            className="rounded"
                          />
                          <div className="flex items-center space-x-3 flex-1">
                            <span className="text-2xl">{category.icon}</span>
                            <div>
                              <div className="font-medium">{category.name}</div>
                              <div className="text-sm text-muted-foreground">{category.description}</div>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">{category.keywords.length} keywords</div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {selectedKeywordOption === 'manual' && (
            <div>
              <h3 className="font-semibold mb-4">Enter Keywords</h3>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    ref={manualInputRef}
                    type="text"
                    onKeyDown={handleManualKeyPress}
                    placeholder="Type a keyword and press Enter to add..."
                    className="flex-1 p-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    autoComplete="off"
                  />
                  <button
                    onClick={addManualKeyword}
                    className="px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>

                {manualKeywords.length > 0 && (
                  <div className="p-3 border border-border rounded-lg bg-muted/50">
                    <div className="text-sm font-medium mb-2">Added Keywords ({manualKeywords.length}):</div>
                    <div className="flex flex-wrap gap-2">
                      {manualKeywords.map((keyword, index) => (
                        <div
                          key={`${keyword}-${index}`}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-sm font-medium"
                        >
                          <span>{keyword}</span>
                          <button
                            onClick={() => removeManualKeyword(index)}
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
          )}

          {selectedKeywordOption === 'job-description' && (
            <div>
              <h3 className="font-semibold mb-4">Paste Job Description</h3>
              <textarea
                ref={jobDescriptionRef}
                placeholder="Paste the job description here..."
                className="w-full h-32 p-3 border border-border rounded-lg resize-none bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <div className="space-y-3">
                <button
                  onClick={() => {
                    if (jobDescriptionRef.current) {
                      const description = jobDescriptionRef.current.value;
                      // Basic keyword extraction for now
                      const words = description.toLowerCase()
                        .split(/[\s,.\-():\n\r\t]+/)
                        .filter(word => word.length >= 3)
                        .filter(word => word.match(/^[a-zA-Z0-9+#\-\.\/]+$/));
                      const uniqueWords = [...new Set(words)];
                      setJobKeywords(uniqueWords.slice(0, 30));
                    }
                  }}
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Zap className="h-4 w-4" />
                  Extract Keywords
                </button>
              </div>
              {jobKeywords.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Extracted Keywords ({jobKeywords.length}):</p>
                  <div className="flex flex-wrap gap-2">
                    {jobKeywords.map((keyword, index) => (
                      <div
                        key={`${keyword}-${index}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-sm font-medium"
                      >
                        <span>{keyword}</span>
                        <button
                          onClick={() => setJobKeywords(prev => prev.filter((_, i) => i !== index))}
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
            </div>
          )}

          <button
            onClick={proceedToProcessing}
            disabled={
              (selectedKeywordOption === 'categories' && selectedCategories.length === 0) ||
              (selectedKeywordOption === 'manual' && manualKeywords.length === 0) ||
              (selectedKeywordOption === 'job-description' && jobKeywords.length === 0)
            }
            className="w-full bg-primary text-primary-foreground rounded-lg py-3 font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            Continue to Processing
            <ArrowRight className="inline ml-2 h-4 w-4" />
          </button>
        </div>
      )}

      {/* AI Consent Modal */}
      <AIConsentModal
        isOpen={showConsentModal}
        onClose={() => setShowConsentModal(false)}
        onConsent={(consented) => {
          setAiConsentGiven(consented);
          if (consented) {
            const newPrefs = { 
              ...aiPreferences, 
              consentGiven: true, 
              consentDate: new Date().toISOString() 
            };
            setAiPreferences(newPrefs);
            localStorage.setItem('bats-ai-preferences', JSON.stringify(newPrefs));
          }
        }}
        analysisType="job-description"
        title="AI Job Description Analysis"
      />
      
      {/* AI Settings Modal */}
      <AISettings
        isOpen={showAISettings}
        onClose={() => setShowAISettings(false)}
        onPreferencesChange={(prefs) => {
          setAiPreferences(prefs);
          setAiConsentGiven(prefs.consentGiven);
        }}
        initialPreferences={aiPreferences}
      />
    </div>
  );

  const ScanResultsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">🎯 Free ATS Analysis Complete!</h2>
        <p className="text-muted-foreground">Here's how your resume performs with ATS systems</p>
      </div>

      {analysisResult && (
        <div className="space-y-4">
          <ATSScoreHeader
            analysis={analysisResult}
            fileName={uploadedFile?.name}
            onReanalyze={reanalyzeFile}
            onViewDetails={() => setShowATSModal(true)}
            isLoading={isLoading}
            showDetailed={true}
          />

          <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-6 text-center">
            <h3 className="text-xl font-semibold mb-2">Want to Fix These Issues?</h3>
            <p className="text-muted-foreground mb-4">
              We can optimize your resume with the missing keywords and fix the identified issues.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setWorkflowMode('optimize');
                  setCurrentStep(2);
                }}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                🚀 Optimize My Resume
              </button>
              <button
                onClick={() => {
                  setUploadedFile(null);
                  setAnalysisResult(null);
                  setCurrentStep(1);
                }}
                className="px-6 py-3 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
              >
                Scan Another Resume
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const ProcessingStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Processing Your Resume</h2>
        <p className="text-muted-foreground">Please wait while we optimize your resume...</p>
      </div>

      <div className="space-y-4">
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="font-medium">Processing Progress</span>
            <span className="text-sm text-muted-foreground">{processingProgress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${processingProgress}%` }}
            />
          </div>
          {processingStep && (
            <div className="mt-2 text-sm text-muted-foreground">
              {processingStep}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const ComparisonResultsModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border rounded-lg p-6 max-w-2xl w-full mx-4">
        <h3 className="text-xl font-bold mb-4">Before vs After Comparison</h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Original Resume</h4>
            {originalAnalysis && (
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-muted-foreground">
                  {originalAnalysis.score?.overall || 0}
                </div>
                <div className="text-sm text-muted-foreground">ATS Score</div>
              </div>
            )}
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Optimized Resume</h4>
            {optimizedAnalysis && (
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {optimizedAnalysis.score?.overall || 0}
                </div>
                <div className="text-sm text-muted-foreground">ATS Score</div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setShowComparison(false)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ErrorHandler error={error} onClear={clearError} />
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
            {workflowMode === 'scan' ? 'FREE Resume Scanner' : 'Resume Optimizer'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {workflowMode === 'scan' 
              ? 'Get instant ATS compatibility analysis' 
              : 'Optimize your resume for better job opportunities'
            }
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-muted p-1 rounded-lg">
            <button
              onClick={() => {
                setWorkflowMode('scan');
                setCurrentStep(1);
                setUploadedFile(null);
                setAnalysisResult(null);
              }}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                workflowMode === 'scan'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              🎯 FREE Analysis Mode
            </button>
            <button
              onClick={() => {
                setWorkflowMode('optimize');
                setCurrentStep(1);
                setUploadedFile(null);
                setAnalysisResult(null);
              }}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                workflowMode === 'optimize'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              🚀 Optimization Mode
            </button>
          </div>
        </div>

        {/* Steps */}
        <div className="mb-8">
          <div className="flex justify-center">
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.status === 'completed' 
                        ? 'bg-green-500 text-white' 
                        : step.status === 'current'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {step.status === 'completed' ? '✓' : step.id}
                    </div>
                    <span className="text-sm font-medium">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-8 h-0.5 bg-muted mx-4"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && <FileUploadStep />}
            {currentStep === 2 && workflowMode === 'scan' && <ScanResultsStep />}
            {currentStep === 2 && workflowMode === 'optimize' && <KeywordSelectionStep />}
            {currentStep === 3 && <ProcessingStep />}
          </motion.div>
        </AnimatePresence>

        {/* Comparison Results Modal */}
        {showComparison && <ComparisonResultsModal />}

        {/* Toast Notification */}
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 bg-background border border-border rounded-lg p-4 shadow-lg z-50"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}