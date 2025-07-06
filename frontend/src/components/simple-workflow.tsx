'use client';

import React, { useState, useCallback, useRef } from 'react';
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
  Settings,
  Plus,
  X,
  Loader2
} from 'lucide-react';
import { RoleSelection } from '@/components/role-selection';
import { ManualKeywordInput } from '@/components/manual-keywords-input';
import { ATSScoreHeader } from '@/components/ats-score-header';
import { ATSDetailsModal } from '@/components/ats-details-modal';
import { ErrorHandler, useErrorHandler } from '@/components/error-handler';
import { Loading } from '@/components/loading';
import { cn } from '@/lib/utils';
import { apiService, SimpleAnalysisResult } from '@/services/api';

interface WorkflowStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'pending' | 'current' | 'completed';
}

interface SimpleWorkflowProps {
  onUpgrade?: () => void;
}

export function SimpleWorkflow({ onUpgrade }: SimpleWorkflowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<SimpleAnalysisResult | null>(null);
  const [selectedMissingKeywords, setSelectedMissingKeywords] = useState<string[]>([]);
  const [manualKeywords, setManualKeywords] = useState<string[]>([]);
  const [finalKeywords, setFinalKeywords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showATSModal, setShowATSModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [originalAnalysis, setOriginalAnalysis] = useState<SimpleAnalysisResult | null>(null);
  const [enhancedAnalysis, setEnhancedAnalysis] = useState<SimpleAnalysisResult | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { error, showError, clearError } = useErrorHandler();

  const steps: WorkflowStep[] = [
    {
      id: 1,
      title: 'Select Role',
      description: 'Choose your target role',
      icon: Briefcase,
      status: currentStep === 1 ? 'current' : currentStep > 1 ? 'completed' : 'pending'
    },
    {
      id: 2,
      title: 'Upload Resume',
      description: 'Upload your PDF resume',
      icon: Upload,
      status: currentStep === 2 ? 'current' : currentStep > 2 ? 'completed' : 'pending'
    },
    {
      id: 3,
      title: 'View Results',
      description: 'See your ATS score',
      icon: Target,
      status: currentStep === 3 ? 'current' : currentStep > 3 ? 'completed' : 'pending'
    },
    {
      id: 4,
      title: 'Enhance Keywords',
      description: 'Add missing keywords',
      icon: Plus,
      status: currentStep === 4 ? 'current' : currentStep > 4 ? 'completed' : 'pending'
    }
  ];

  const showToastNotification = (message: string, duration: number = 3000) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), duration);
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setCurrentStep(2);
    clearError();
  };

  const handleFileUpload = useCallback(async (file: File) => {
    if (!selectedRole) {
      showError('Please select a role first');
      return;
    }

    try {
      setIsLoading(true);
      setLoadingMessage('Analyzing your resume...');
      clearError();

      const result = await apiService.analyzeResumeByRole(file, selectedRole);

      if (result.success && result.data) {
        setAnalysisResult(result.data);
        setUploadedFile(file);
        setCurrentStep(3);
        showToastNotification('Analysis completed successfully!');
      } else {
        showError(result.error || 'Failed to analyze resume');
      }
    } catch (err) {
      showError('Network error during analysis');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [selectedRole, showError]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      handleFileUpload(file);
    } else {
      showError('Please upload a PDF file');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const resetWorkflow = () => {
    setCurrentStep(1);
    setSelectedRole('');
    setUploadedFile(null);
    setAnalysisResult(null);
    setSelectedMissingKeywords([]);
    setManualKeywords([]);
    setFinalKeywords([]);
    setOriginalAnalysis(null);
    setEnhancedAnalysis(null);
    setShowComparison(false);
    clearError();
  };

  const handleEnhanceKeywords = () => {
    setCurrentStep(4);
  };

  const toggleMissingKeyword = (keyword: string) => {
    setSelectedMissingKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  };

  const processResumeWithKeywords = async () => {
    if (!uploadedFile || !analysisResult) return;

    try {
      setIsLoading(true);
      setLoadingMessage('Processing your resume with selected keywords...');

      // Store original analysis for comparison
      setOriginalAnalysis(analysisResult);

      const allKeywords = [...selectedMissingKeywords, ...manualKeywords];
      setFinalKeywords(allKeywords);

      const result = await apiService.processResumeWithKeywords(uploadedFile, allKeywords);

      if (result.success && result.data) {
        // Download the processed file
        apiService.downloadFile(result.data, `optimized_${uploadedFile.name}`);
        showToastNotification('Resume processed successfully! Download started.');
        
        setLoadingMessage('Re-analyzing your enhanced resume...');
        
        // Create a new File object from the processed blob for re-analysis
        const processedFile = new File([result.data], `optimized_${uploadedFile.name}`, {
          type: 'application/pdf'
        });

        // Re-analyze the processed resume
        const reAnalysisResult = await apiService.analyzeResumeByRole(processedFile, selectedRole);

        if (reAnalysisResult.success && reAnalysisResult.data) {
          setEnhancedAnalysis(reAnalysisResult.data);
          setShowComparison(true);
          showToastNotification('Analysis complete! See your improvements.');
        } else {
          showError('Failed to re-analyze enhanced resume');
        }
      } else {
        showError(result.error || 'Failed to process resume');
      }
    } catch (err) {
      showError('Network error during processing');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const getStepIcon = (step: WorkflowStep) => {
    if (step.status === 'completed') return CheckCircle;
    if (step.status === 'current') return step.icon;
    return step.icon;
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <ErrorHandler error={error} onClear={clearError} />
      
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = getStepIcon(step);
          return (
            <React.Fragment key={step.id}>
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                  step.status === 'completed' && "border-primary bg-primary text-primary-foreground",
                  step.status === 'current' && "border-primary bg-background text-primary",
                  step.status === 'pending' && "border-muted-foreground/30 bg-muted text-muted-foreground"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="hidden sm:block">
                  <p className={cn(
                    "text-sm font-medium",
                    step.status === 'current' && "text-foreground",
                    step.status === 'completed' && "text-foreground",
                    step.status === 'pending' && "text-muted-foreground"
                  )}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "h-0.5 w-16 transition-colors",
                  step.status === 'completed' ? "bg-primary" : "bg-muted"
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="role-selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="rounded-lg border bg-card p-6"
          >
            <RoleSelection
              onRoleSelect={handleRoleSelect}
              selectedRole={selectedRole}
              disabled={isLoading}
            />
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="file-upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="rounded-lg border bg-card p-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Upload Your Resume</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload your PDF resume for analysis as a <strong>{analysisResult?.analysis?.roleDisplayName || 'selected role'}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Change Role</span>
                </button>
              </div>

              <div
                className={cn(
                  "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                  dragActive && "border-primary bg-primary/10",
                  !dragActive && "border-muted-foreground/30 hover:border-muted-foreground/50"
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isLoading}
                />
                
                {isLoading ? (
                  <div className="space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <div>
                      <p className="font-medium">Analyzing your resume...</p>
                      <p className="text-sm text-muted-foreground">{loadingMessage}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                    <div>
                      <p className="font-medium">Drop your PDF here or click to browse</p>
                      <p className="text-sm text-muted-foreground">Maximum file size: 10MB</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === 3 && analysisResult && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* ATS Score Header */}
            <ATSScoreHeader
              score={analysisResult.analysis.score}
              onDetailsClick={() => setShowATSModal(true)}
            />

            {/* Keywords Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-lg border bg-card p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold">Found Keywords ({analysisResult.analysis.foundKeywords.length})</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.analysis.foundKeywords.slice(0, 10).map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    >
                      {keyword}
                    </span>
                  ))}
                  {analysisResult.analysis.foundKeywords.length > 10 && (
                    <span className="text-xs text-muted-foreground">
                      +{analysisResult.analysis.foundKeywords.length - 10} more
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <h3 className="font-semibold">Missing Keywords ({analysisResult.analysis.missingKeywords.length})</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.analysis.missingKeywords.slice(0, 10).map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                    >
                      {keyword}
                    </span>
                  ))}
                  {analysisResult.analysis.missingKeywords.length > 10 && (
                    <span className="text-xs text-muted-foreground">
                      +{analysisResult.analysis.missingKeywords.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Suggestions */}
            {analysisResult.analysis.suggestions.length > 0 && (
              <div className="rounded-lg border bg-card p-6">
                <h3 className="font-semibold mb-4">Improvement Suggestions</h3>
                <div className="space-y-3">
                  {analysisResult.analysis.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                        <span className="text-xs font-medium text-primary">{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{suggestion.title}</h4>
                        <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                onClick={resetWorkflow}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
              >
                <FileSearch className="h-4 w-4" />
                Analyze Another Resume
              </button>
              
              <button
                onClick={handleEnhanceKeywords}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Missing Keywords
              </button>
              
              {onUpgrade && (
                <button
                  onClick={onUpgrade}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Zap className="h-4 w-4" />
                  Upgrade to AI Mode
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </motion.div>
        )}

        {currentStep === 4 && analysisResult && (
          <motion.div
            key="enhance-keywords"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Enhance Your Resume</h3>
                  <p className="text-sm text-muted-foreground">
                    Select keywords to add to your resume and boost your ATS score
                  </p>
                </div>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Results</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Missing Keywords Selection */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    Select Missing Keywords ({analysisResult.analysis.missingKeywords.filter(k => !selectedMissingKeywords.includes(k)).length})
                  </h4>
                  <div className="max-h-60 overflow-y-auto p-3 border rounded-lg bg-muted/50">
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.analysis.missingKeywords
                        .filter(keyword => !selectedMissingKeywords.includes(keyword))
                        .map((keyword, index) => (
                        <button
                          key={index}
                          onClick={() => toggleMissingKeyword(keyword)}
                          className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:hover:bg-orange-800 transition-colors cursor-pointer"
                        >
                          {keyword}
                        </button>
                      ))}
                      {analysisResult.analysis.missingKeywords.filter(k => !selectedMissingKeywords.includes(k)).length === 0 && (
                        <p className="text-sm text-muted-foreground italic">All keywords selected</p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Click keywords to add them to your resume
                  </p>
                </div>

                {/* Manual Keywords Input */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Plus className="h-5 w-5 text-blue-600" />
                    Enter Keywords ({manualKeywords.length})
                  </h4>
                  <ManualKeywordInput
                    onKeywordsChange={setManualKeywords}
                    placeholder="Add custom keywords..."
                    className="[&>h3]:hidden"
                  />
                </div>
              </div>

              {/* Selected Keywords Summary */}
              {(selectedMissingKeywords.length > 0 || manualKeywords.length > 0) && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="font-medium mb-3 text-blue-900 dark:text-blue-100">
                    Keywords to Add ({selectedMissingKeywords.length + manualKeywords.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMissingKeywords.map((keyword, index) => (
                      <button
                        key={`missing-${index}`}
                        onClick={() => toggleMissingKeyword(keyword)}
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors cursor-pointer"
                        title="Click to remove"
                      >
                        {keyword}
                        <X className="ml-1.5 w-3 h-3" />
                      </button>
                    ))}
                    {manualKeywords.map((keyword, index) => (
                      <span
                        key={`manual-${index}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-500 text-white"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                    Orange: From missing keywords • Blue: Custom keywords • Click orange pills to remove
                  </p>
                </div>
              )}

              {/* Process Button */}
              <div className="flex gap-4 pt-6">
                <button
                  onClick={processResumeWithKeywords}
                  disabled={isLoading || (selectedMissingKeywords.length === 0 && manualKeywords.length === 0)}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Process Resume ({selectedMissingKeywords.length + manualKeywords.length} keywords)
                    </>
                  )}
                </button>

                {onUpgrade && (
                  <button
                    onClick={onUpgrade}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
                  >
                    <Zap className="h-4 w-4" />
                    AI Mode Instead
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ATS Details Modal */}
      {showATSModal && analysisResult && (
        <ATSDetailsModal
          isOpen={showATSModal}
          onClose={() => setShowATSModal(false)}
          analysis={analysisResult.analysis}
        />
      )}

      {/* Before/After Comparison Modal */}
      {showComparison && originalAnalysis && enhancedAnalysis && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowComparison(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Resume Enhancement Results</h2>
                <button
                  onClick={() => setShowComparison(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Score Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-muted-foreground">Before Enhancement</h3>
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <div className="text-center mb-4">
                      <div className="text-4xl font-bold text-orange-600">
                        {originalAnalysis.analysis.score.overall}
                      </div>
                      <div className="text-sm text-muted-foreground">ATS Score</div>
                      <div className="text-lg font-medium">{originalAnalysis.analysis.score.grade}</div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Keywords:</span>
                        <span>{originalAnalysis.analysis.score.keywordMatch}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Formatting:</span>
                        <span>{originalAnalysis.analysis.score.formatting}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Readability:</span>
                        <span>{originalAnalysis.analysis.score.readability}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-green-600">After Enhancement</h3>
                  <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    <div className="text-center mb-4">
                      <div className="text-4xl font-bold text-green-600">
                        {enhancedAnalysis.analysis.score.overall}
                      </div>
                      <div className="text-sm text-muted-foreground">ATS Score</div>
                      <div className="text-lg font-medium">{enhancedAnalysis.analysis.score.grade}</div>
                      <div className="text-sm text-green-600 font-medium">
                        +{enhancedAnalysis.analysis.score.overall - originalAnalysis.analysis.score.overall} points improvement!
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Keywords:</span>
                        <span className="text-green-600">
                          {enhancedAnalysis.analysis.score.keywordMatch}% 
                          (+{enhancedAnalysis.analysis.score.keywordMatch - originalAnalysis.analysis.score.keywordMatch})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Formatting:</span>
                        <span>{enhancedAnalysis.analysis.score.formatting}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Readability:</span>
                        <span>{enhancedAnalysis.analysis.score.readability}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Keywords Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold mb-3">Keywords Before ({originalAnalysis.analysis.foundKeywords.length})</h4>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {originalAnalysis.analysis.foundKeywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-xs"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-green-600">Keywords After ({enhancedAnalysis.analysis.foundKeywords.length})</h4>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {enhancedAnalysis.analysis.foundKeywords.map((keyword, index) => {
                      const isNew = !originalAnalysis.analysis.foundKeywords.includes(keyword);
                      return (
                        <span
                          key={index}
                          className={`px-2 py-1 rounded text-xs ${
                            isNew 
                              ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 font-medium' 
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {keyword}
                          {isNew && ' ✨'}
                        </span>
                      );
                    })}
                  </div>
                  <p className="text-xs text-green-600 mt-2">
                    ✨ New keywords added: {enhancedAnalysis.analysis.foundKeywords.length - originalAnalysis.analysis.foundKeywords.length}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <button
                  onClick={resetWorkflow}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <FileSearch className="h-4 w-4" />
                  Analyze Another Resume
                </button>
                
                <button
                  onClick={() => setShowComparison(false)}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <CheckCircle className="h-4 w-4" />
                  Done
                </button>

                {onUpgrade && (
                  <button
                    onClick={() => {
                      setShowComparison(false);
                      onUpgrade();
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
                  >
                    <Zap className="h-4 w-4" />
                    Try AI Mode
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 z-50 flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-3 rounded-lg shadow-lg"
          >
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}