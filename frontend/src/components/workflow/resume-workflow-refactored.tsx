'use client';

import React, { useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useWorkflowState } from '@/hooks/useWorkflowState';
import { useKeywordSelection } from '@/hooks/useKeywordSelection';
import { useAIService } from '@/hooks/useAIService';
import { useToast } from '@/hooks/useToast';
import { useErrorHandler } from '@/components/error-handler';
import { FileUploadStep } from '@/components/workflow/file-upload-step';
import { KeywordSelectionStep } from '@/components/workflow/steps/keyword-selection-step';
import { ScanResultsStep } from '@/components/workflow/steps/scan-results-step';
import { ProcessingStep } from '@/components/workflow/steps/processing-step';
import { workflowService } from '@/services/workflow/workflowService';

interface ResumeWorkflowProps {
  mode?: 'scan' | 'optimize';
}

export function ResumeWorkflowRefactored({ mode = 'optimize' }: ResumeWorkflowProps) {
  const {
    workflowMode,
    currentStep,
    uploadedFile,
    analysisResult,
    termsAccepted,
    isLoading,
    loadingMessage,
    showComparison,
    originalAnalysis,
    optimizedAnalysis,
    processingProgress,
    processingStep,
    steps,
    setWorkflowMode,
    setUploadedFile,
    setAnalysisResult,
    setTermsAccepted,
    setIsLoading,
    setLoadingMessage,
    setShowComparison,
    setOriginalAnalysis,
    setOptimizedAnalysis,
    setProcessingProgress,
    setProcessingStep,
    nextStep,
    resetWorkflow,
  } = useWorkflowState(mode);

  const { resetKeywordSelection } = useKeywordSelection();
  const { showToastNotification } = useToast();
  const { error, showError, clearError } = useErrorHandler();

  // State for modals
  const [showATSModal, setShowATSModal] = React.useState(false);
  const [downloadUrl, setDownloadUrl] = React.useState<string | null>(null);

  // Set up workflow service progress callback
  useEffect(() => {
    workflowService.setProgressCallback(({ step, progress, message }) => {
      setProcessingStep(step);
      setProcessingProgress(progress);
      setLoadingMessage(message);
    });
  }, [setProcessingStep, setProcessingProgress, setLoadingMessage]);

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    // Validate file
    const validation = workflowService.validateFile(file);
    if (!validation.valid) {
      showError('file', validation.error || 'Invalid file');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Analyzing your resume...');
    clearError();

    try {
      // Store original analysis for comparison
      if (workflowMode === 'optimize') {
        setOriginalAnalysis(analysisResult);
      }

      const result = await workflowService.analyzeResume(file);
      
      if (result.success && result.data) {
        setUploadedFile(file);
        setAnalysisResult(result.data);
        nextStep();
        showToastNotification('Resume analyzed successfully!');
      } else {
        showError('analysis', result.error || 'Failed to analyze resume');
      }
    } catch (err) {
      showError('analysis', 'Failed to analyze resume');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [
    workflowMode,
    analysisResult,
    setIsLoading,
    setLoadingMessage,
    setOriginalAnalysis,
    setUploadedFile,
    setAnalysisResult,
    nextStep,
    showToastNotification,
    showError,
    clearError
  ]);

  // Handle re-analysis
  const handleReanalyze = useCallback(async () => {
    if (!uploadedFile) return;
    
    setIsLoading(true);
    setLoadingMessage('Re-analyzing resume...');
    
    try {
      const result = await workflowService.analyzeResume(uploadedFile);
      
      if (result.success && result.data) {
        setAnalysisResult(result.data);
        showToastNotification('Resume re-analyzed successfully!');
      } else {
        showError('analysis', result.error || 'Failed to re-analyze resume');
      }
    } catch (err) {
      showError('analysis', 'Failed to re-analyze resume');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [uploadedFile, setIsLoading, setLoadingMessage, setAnalysisResult, showToastNotification, showError]);

  // Handle keyword processing
  const handleKeywordProcessing = useCallback(async (keywords: string[]) => {
    if (!uploadedFile || !keywords.length) return;

    setIsLoading(true);
    setProcessingProgress(0);
    setProcessingStep('Preparing optimization...');
    setLoadingMessage('🚀 Starting resume enhancement process...');

    try {
      const result = await workflowService.processResumeWithKeywords(uploadedFile, keywords);
      
      if (result.success && result.data) {
        if (result.data.optimizedAnalysis) {
          setOptimizedAnalysis(result.data.optimizedAnalysis);
        }
        
        if (result.data.downloadUrl) {
          setDownloadUrl(result.data.downloadUrl);
        }
        
        setShowComparison(true);
        nextStep();
        showToastNotification('Resume optimization complete!');
      } else {
        showError('processing', result.error || 'Failed to process resume');
      }
    } catch (err) {
      showError('processing', 'Failed to process resume');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [
    uploadedFile,
    setIsLoading,
    setProcessingProgress,
    setProcessingStep,
    setLoadingMessage,
    setOptimizedAnalysis,
    setShowComparison,
    nextStep,
    showToastNotification,
    showError
  ]);

  // Handle download
  const handleDownload = useCallback(async () => {
    if (!downloadUrl || !uploadedFile) return;

    try {
      const fileName = workflowService.generateOptimizedFileName(uploadedFile.name);
      await workflowService.downloadOptimizedResume(downloadUrl, fileName);
      showToastNotification('Resume downloaded successfully!');
    } catch (err) {
      showError('download', 'Failed to download resume');
    }
  }, [downloadUrl, uploadedFile, showToastNotification, showError]);

  // Handle workflow mode changes
  const handleOptimizeMode = useCallback(() => {
    setWorkflowMode('optimize');
    nextStep();
  }, [setWorkflowMode, nextStep]);

  const handleStartNew = useCallback(() => {
    resetWorkflow();
    resetKeywordSelection();
    if (downloadUrl) {
      workflowService.cleanup(downloadUrl);
      setDownloadUrl(null);
    }
    setShowATSModal(false);
    setShowComparison(false);
    clearError();
  }, [resetWorkflow, resetKeywordSelection, downloadUrl, clearError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (downloadUrl) {
        workflowService.cleanup(downloadUrl);
      }
    };
  }, [downloadUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              {workflowMode === 'scan' ? '🔍 Free Resume Scan' : '🚀 Resume Optimizer'}
            </h1>
            <p className="text-xl text-muted-foreground">
              {workflowMode === 'scan' 
                ? 'Get instant ATS compatibility analysis' 
                : 'Optimize your resume for ATS systems'
              }
            </p>
          </div>

          {/* Steps Progress */}
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

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="text-red-500">⚠️</div>
                <span className="text-red-700 dark:text-red-300">{error}</span>
                <button
                  onClick={clearError}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && (
                <FileUploadStep
                  workflowMode={workflowMode}
                  termsAccepted={termsAccepted}
                  setTermsAccepted={setTermsAccepted}
                  uploadedFile={uploadedFile}
                  analysisResult={analysisResult}
                  isLoading={isLoading}
                  showATSModal={showATSModal}
                  setShowATSModal={setShowATSModal}
                  onFileUpload={handleFileUpload}
                  onReanalyze={handleReanalyze}
                  showError={showError}
                />
              )}

              {currentStep === 2 && workflowMode === 'scan' && (
                <ScanResultsStep
                  analysisResult={analysisResult}
                  fileName={uploadedFile?.name}
                  isLoading={isLoading}
                  showATSModal={showATSModal}
                  onViewDetails={() => setShowATSModal(true)}
                  onCloseModal={() => setShowATSModal(false)}
                  onReanalyze={handleReanalyze}
                  onOptimize={handleOptimizeMode}
                  onScanAnother={handleStartNew}
                />
              )}

              {currentStep === 2 && workflowMode === 'optimize' && (
                <KeywordSelectionStep
                  onProceed={handleKeywordProcessing}
                />
              )}

              {currentStep === 3 && (
                <ProcessingStep
                  isLoading={isLoading}
                  processingProgress={processingProgress}
                  processingStep={processingStep}
                  loadingMessage={loadingMessage}
                  fileName={uploadedFile?.name}
                  originalAnalysis={originalAnalysis}
                  optimizedAnalysis={optimizedAnalysis}
                  showComparison={showComparison}
                  onDownload={handleDownload}
                  onStartNew={handleStartNew}
                  onCloseComparison={() => setShowComparison(false)}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Toast Notification */}
          <ToastNotification />
        </div>
      </div>
    </div>
  );
}

// Toast Notification Component
function ToastNotification() {
  const { showToast, currentToast, hideToast } = useToast();

  if (!showToast || !currentToast) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-4 right-4 bg-background border border-border rounded-lg p-4 shadow-lg z-50"
    >
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <span className="text-sm font-medium">{currentToast.message}</span>
        <button
          onClick={() => hideToast()}
          className="ml-2 text-muted-foreground hover:text-foreground"
        >
          ×
        </button>
      </div>
    </motion.div>
  );
}