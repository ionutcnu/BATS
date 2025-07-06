import { useState, useMemo } from 'react';
import { Upload, Target, Download, FileText } from 'lucide-react';
import { ATSAnalysis } from '@/services/api';

export interface WorkflowStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'pending' | 'current' | 'completed';
}

export type WorkflowMode = 'scan' | 'optimize';

interface WorkflowState {
  workflowMode: WorkflowMode;
  currentStep: number;
  uploadedFile: File | null;
  analysisResult: ATSAnalysis | null;
  termsAccepted: boolean;
  showOptimizeOptions: boolean;
  isLoading: boolean;
  loadingMessage: string;
  showComparison: boolean;
  originalAnalysis: ATSAnalysis | null;
  optimizedAnalysis: ATSAnalysis | null;
  processingProgress: number;
  processingStep: string;
}

interface WorkflowActions {
  setWorkflowMode: (mode: WorkflowMode) => void;
  setCurrentStep: (step: number) => void;
  setUploadedFile: (file: File | null) => void;
  setAnalysisResult: (result: ATSAnalysis | null) => void;
  setTermsAccepted: (accepted: boolean) => void;
  setShowOptimizeOptions: (show: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setLoadingMessage: (message: string) => void;
  setShowComparison: (show: boolean) => void;
  setOriginalAnalysis: (analysis: ATSAnalysis | null) => void;
  setOptimizedAnalysis: (analysis: ATSAnalysis | null) => void;
  setProcessingProgress: (progress: number) => void;
  setProcessingStep: (step: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  resetWorkflow: () => void;
}

export function useWorkflowState(initialMode: WorkflowMode = 'optimize') {
  const [workflowMode, setWorkflowMode] = useState<WorkflowMode>(initialMode);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ATSAnalysis | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showOptimizeOptions, setShowOptimizeOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showComparison, setShowComparison] = useState(false);
  const [originalAnalysis, setOriginalAnalysis] = useState<ATSAnalysis | null>(null);
  const [optimizedAnalysis, setOptimizedAnalysis] = useState<ATSAnalysis | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState('');

  const steps: WorkflowStep[] = useMemo(() => {
    return workflowMode === 'scan' ? [
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
  }, [workflowMode, currentStep]);

  const maxSteps = useMemo(() => {
    return workflowMode === 'scan' ? 2 : 3;
  }, [workflowMode]);

  const nextStep = () => {
    if (currentStep < maxSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetWorkflow = () => {
    setCurrentStep(1);
    setUploadedFile(null);
    setAnalysisResult(null);
    setTermsAccepted(false);
    setShowOptimizeOptions(false);
    setIsLoading(false);
    setLoadingMessage('');
    setShowComparison(false);
    setOriginalAnalysis(null);
    setOptimizedAnalysis(null);
    setProcessingProgress(0);
    setProcessingStep('');
  };

  const state: WorkflowState = {
    workflowMode,
    currentStep,
    uploadedFile,
    analysisResult,
    termsAccepted,
    showOptimizeOptions,
    isLoading,
    loadingMessage,
    showComparison,
    originalAnalysis,
    optimizedAnalysis,
    processingProgress,
    processingStep,
  };

  const actions: WorkflowActions = {
    setWorkflowMode,
    setCurrentStep,
    setUploadedFile,
    setAnalysisResult,
    setTermsAccepted,
    setShowOptimizeOptions,
    setIsLoading,
    setLoadingMessage,
    setShowComparison,
    setOriginalAnalysis,
    setOptimizedAnalysis,
    setProcessingProgress,
    setProcessingStep,
    nextStep,
    previousStep,
    resetWorkflow,
  };

  return {
    ...state,
    ...actions,
    steps,
    maxSteps,
  };
}