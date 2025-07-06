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
  Shield,
  Brain,
  Loader2,
  X,
  Clipboard,
  Sparkles,
  FileSearch,
  Plus
} from 'lucide-react';
import { ATSScoreHeader } from '@/components/ats-score-header';
import { ATSDetailsModal } from '@/components/ats-details-modal';
import { ErrorHandler, useErrorHandler } from '@/components/error-handler';
import { apiService, AIKeywordExtractionResult, ATSAnalysis } from '@/services/api';
import { cn } from '@/lib/utils';

interface WorkflowStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'pending' | 'current' | 'completed';
}

interface AIWorkflowProps {
  onDowngrade?: () => void;
}

export function AIWorkflow({ onDowngrade }: AIWorkflowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [aiConsentGiven, setAiConsentGiven] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ATSAnalysis | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<AIKeywordExtractionResult | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [jobKeywords, setJobKeywords] = useState<string[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [keywordSource, setKeywordSource] = useState<'ai-role' | 'job-description'>('ai-role');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showATSModal, setShowATSModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [originalAnalysis, setOriginalAnalysis] = useState<ATSAnalysis | null>(null);
  const [enhancedAnalysis, setEnhancedAnalysis] = useState<ATSAnalysis | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { error, showError, clearError } = useErrorHandler();

  const steps: WorkflowStep[] = [
    {
      id: 1,
      title: 'AI Consent',
      description: 'Authorize AI processing',
      icon: Shield,
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
      title: 'AI Analysis',
      description: 'Smart keyword detection',
      icon: Brain,
      status: currentStep === 3 ? 'current' : currentStep > 3 ? 'completed' : 'pending'
    },
    {
      id: 4,
      title: 'Select Keywords',
      description: 'Review and customize',
      icon: Target,
      status: currentStep === 4 ? 'current' : currentStep > 4 ? 'completed' : 'pending'
    },
    {
      id: 5,
      title: 'Process Resume',
      description: 'Download enhanced CV',
      icon: Download,
      status: currentStep === 5 ? 'current' : currentStep > 5 ? 'completed' : 'pending'
    }
  ];

  // Extract text from file
  const extractTextFromFile = async (file: File): Promise<string> => {
    try {
      console.log('=== Extracting Text from PDF ===');
      console.log('File name:', file.name);
      console.log('File size:', file.size);
      console.log('File type:', file.type);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:5000/api/extract-text', {
        method: 'POST',
        body: formData,
      });

      console.log('Text extraction response status:', response.status);
      console.log('Text extraction response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Text extraction HTTP error:', errorText);
        throw new Error(`Failed to extract text: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Text extraction result keys:', Object.keys(result));
      console.log('Extracted text length:', result.text?.length || 0);
      
      const extractedText = result.text || '';
      if (!extractedText || extractedText.length < 50) {
        throw new Error('Insufficient text extracted from PDF. Please ensure the file is readable.');
      }

      return extractedText;
    } catch (error) {
      console.error('=== Text Extraction Error ===');
      console.error('Error:', error);
      throw error; // Re-throw to be handled by caller
    }
  };

  const showToastNotification = (message: string, duration: number = 3000) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), duration);
  };

  const handleConsentGiven = () => {
    setAiConsentGiven(true);
    setCurrentStep(2);
    clearError();
  };

  const handleFileUpload = useCallback(async (file: File) => {
    if (!aiConsentGiven) {
      showError('Please provide AI consent first');
      return;
    }

    try {
      setIsLoading(true);
      setLoadingMessage('Analyzing your resume with AI...');
      clearError();

      console.log('Starting AI analysis for file:', file.name);

      // Get basic ATS analysis
      const analysisResponse = await apiService.analyzeResume(file);
      console.log('ATS Analysis Response:', analysisResponse);

      if (!analysisResponse.success) {
        console.error('ATS Analysis failed:', analysisResponse.error);
        showError(analysisResponse.error || 'Failed to analyze resume');
        return;
      }

      if (!analysisResponse.data) {
        console.error('No analysis data received');
        showError('No analysis data received from server');
        return;
      }

      // Validate the response structure
      if (!analysisResponse.data.score || typeof analysisResponse.data.score.overall !== 'number') {
        console.error('Invalid analysis data structure:', analysisResponse.data);
        showError('Invalid analysis data received from server');
        return;
      }

      console.log('Setting analysis result:', analysisResponse.data);
      
      // Ensure the analysis result has the correct structure
      const analysis = {
        ...analysisResponse.data,
        analyzedAt: new Date().toISOString()
      };
      
      setAnalysisResult(analysis);
      setOriginalAnalysis(analysis);
      setUploadedFile(file);
      
      // Debug: Check if analysis result is properly set
      console.log('Analysis result set:', analysis);
      console.log('Has score?', analysis.score);
      console.log('Overall score:', analysis.score?.overall);

      // Extract resume text and get AI keyword suggestions
      setLoadingMessage('Extracting resume text for AI analysis...');
      
      try {
        // First, extract text from the uploaded PDF
        const extractedText = await extractTextFromFile(file);
        console.log('Extracted text length:', extractedText.length);
        
        if (extractedText.trim() && extractedText.length > 50) {
          setLoadingMessage('Getting AI keyword suggestions...');
          
          // Create a job description from the resume to get AI suggestions
          const resumeAsJobDescription = `Based on this resume, suggest relevant keywords for ATS optimization:

${extractedText.substring(0, 2000)}

Please provide keywords that would help this resume pass ATS systems.`;

          const aiResponse = await apiService.extractKeywordsFromJobDescription(resumeAsJobDescription);

          console.log('AI Keyword Response:', aiResponse);

          if (aiResponse.success && aiResponse.data && aiResponse.data.suggestedKeywords) {
            setAiSuggestions(aiResponse.data);
            setSelectedKeywords(aiResponse.data.suggestedKeywords);
            console.log('AI keywords set:', aiResponse.data.suggestedKeywords);
          } else {
            console.warn('AI keyword extraction failed, using fallback keywords');
            // Fallback: use some default keywords if AI fails
            const fallbackKeywords = ['Communication', 'Leadership', 'Problem Solving', 'Team Work', 'Project Management', 'Microsoft Office', 'Data Analysis', 'Customer Service'];
            setSelectedKeywords(fallbackKeywords);
          }
        } else {
          console.warn('Insufficient text extracted from PDF, using fallback keywords');
          const fallbackKeywords = ['Communication', 'Leadership', 'Problem Solving', 'Team Work', 'Project Management', 'Microsoft Office', 'Data Analysis', 'Customer Service'];
          setSelectedKeywords(fallbackKeywords);
        }
      } catch (aiError) {
        console.warn('AI analysis failed:', aiError);
        // Fallback keywords if AI fails
        const fallbackKeywords = ['Communication', 'Leadership', 'Problem Solving', 'Team Work', 'Project Management', 'Microsoft Office', 'Data Analysis', 'Customer Service'];
        setSelectedKeywords(fallbackKeywords);
      }

      setCurrentStep(3);
      showToastNotification('Resume analyzed successfully!');
      
      // Debug log to verify analysis result is set
      console.log('Final analysis result set to state');
      console.log('Moving to step 3 with analysis:', analysis);
    } catch (error) {
      console.error('Error during file analysis:', error);
      showError(error instanceof Error ? error.message : 'Failed to analyze resume');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [aiConsentGiven, showError]);

  const handleJobDescriptionAnalysis = async () => {
    if (!jobDescription.trim()) {
      showError('Please enter a job description');
      return;
    }

    if (!uploadedFile) {
      showError('Please upload your resume first');
      return;
    }

    try {
      setIsLoading(true);
      setLoadingMessage('Analyzing job description with AI...');
      clearError();

      console.log('=== Starting Job Description Analysis ===');
      console.log('Job description length:', jobDescription.length);
      console.log('Uploaded file:', uploadedFile.name);

      // Step 1: Extract keywords from job description
      setLoadingMessage('Extracting keywords from job description...');
      const jobResponse = await apiService.extractKeywordsFromJobDescription(jobDescription);
      
      console.log('=== Job Description API Response ===');
      console.log('Success:', jobResponse.success);
      console.log('Data:', jobResponse.data);
      console.log('Error:', jobResponse.error);
      
      if (!jobResponse.success) {
        const errorMsg = jobResponse.error || 'Failed to analyze job description with AI';
        console.error('Job description analysis failed:', errorMsg);
        showError(`AI Analysis Failed: ${errorMsg}`);
        return;
      }

      if (!jobResponse.data) {
        console.error('No data received from job description analysis');
        showError('No keywords extracted from job description. Please try again.');
        return;
      }

      // Step 2: Extract text from uploaded resume
      setLoadingMessage('Extracting text from your resume...');
      let resumeText = '';
      try {
        resumeText = await extractTextFromFile(uploadedFile);
        console.log('Resume text extracted successfully, length:', resumeText.length);
        
        if (resumeText.length < 50) {
          console.warn('Resume text too short, may indicate extraction failure');
          showError('Unable to extract sufficient text from resume. Please ensure it\'s a valid PDF.');
          return;
        }
      } catch (extractError) {
        console.error('Resume text extraction failed:', extractError);
        showError('Failed to extract text from resume. Please try uploading again.');
        return;
      }

      // Step 3: Process keywords and find missing ones
      setLoadingMessage('Comparing keywords with your resume...');
      
      // Get all keywords from different categories
      const suggestedKeywords = jobResponse.data.suggestedKeywords || [];
      const technicalSkills = jobResponse.data.technicalSkills || [];
      const requiredSkills = jobResponse.data.requiredSkills || [];
      const softSkills = jobResponse.data.softSkills || [];
      
      console.log('=== Extracted Keywords ===');
      console.log('Suggested:', suggestedKeywords);
      console.log('Technical:', technicalSkills);
      console.log('Required:', requiredSkills);
      console.log('Soft Skills:', softSkills);
      
      // Combine all keywords and remove duplicates
      const allJobKeywords = [...new Set([
        ...suggestedKeywords,
        ...technicalSkills,
        ...requiredSkills,
        ...softSkills
      ])].filter(keyword => keyword && keyword.length > 2); // Filter out empty/short keywords
      
      console.log('All combined keywords:', allJobKeywords);

      if (allJobKeywords.length === 0) {
        console.warn('No valid keywords extracted from job description');
        showError('No valid keywords found in job description. Please try with a more detailed job posting.');
        return;
      }

      // Find missing keywords by comparing with resume text (case-insensitive)
      const resumeTextLower = resumeText.toLowerCase();
      const missingKeywords = allJobKeywords.filter(keyword => {
        const keywordLower = keyword.toLowerCase();
        const isPresent = resumeTextLower.includes(keywordLower);
        console.log(`Keyword "${keyword}": ${isPresent ? 'FOUND' : 'MISSING'}`);
        return !isPresent;
      });

      console.log('=== Analysis Complete ===');
      console.log('Total keywords found:', allJobKeywords.length);
      console.log('Missing keywords:', missingKeywords.length);
      console.log('Missing list:', missingKeywords);

      // Update state with results
      setAiSuggestions(jobResponse.data);
      setJobKeywords(missingKeywords);
      setSelectedKeywords(missingKeywords);
      
      if (missingKeywords.length > 0) {
        showToastNotification(`Found ${missingKeywords.length} missing keywords from job description!`);
      } else {
        showToastNotification('Great! Your resume already contains most relevant keywords.');
      }

    } catch (error) {
      console.error('=== Unexpected Error in Job Description Analysis ===');
      console.error('Error type:', typeof error);
      console.error('Error message:', error instanceof Error ? error.message : error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showError(`Analysis failed: ${errorMessage}. Please try again.`);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleKeywordToggle = (keyword: string) => {
    setSelectedKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  };

  const handleProcessResume = async () => {
    if (!uploadedFile) {
      showError('Please upload a PDF file');
      return;
    }

    try {
      setIsLoading(true);
      setLoadingMessage('Processing your resume with selected keywords...');
      clearError();

      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('keywords', JSON.stringify(selectedKeywords));
      formData.append('jobDescription', jobDescription);

      const response = await apiService.processResume(formData);

      if (response.success && response.data) {
        // Download the processed file
        const link = document.createElement('a');
        link.href = response.data.downloadUrl;
        link.download = response.data.fileName || 'optimized-resume.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setCurrentStep(5);
        showToastNotification('Resume processed successfully! Download started.');
      } else {
        showError(response.error || 'Failed to process resume');
      }
    } catch (error) {
      console.error('Error processing resume:', error);
      showError('Network error during processing');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const getStepIcon = (step: WorkflowStep) => {
    if (step.status === 'completed') return CheckCircle;
    if (step.status === 'current') return step.icon;
    return step.icon;
  };

  return (
    <div className="mx-auto max-w-4xl lg:max-w-7xl space-y-8">
      <ErrorHandler error={error} />

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
                  <div className={cn(
                    "text-sm font-medium",
                    step.status === 'current' && "text-primary",
                    step.status === 'completed' && "text-primary",
                    step.status === 'pending' && "text-muted-foreground"
                  )}>
                    {step.title}
                  </div>
                  <div className="text-xs text-muted-foreground">{step.description}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "h-px w-8 sm:w-16 transition-colors",
                  step.status === 'completed' ? "bg-primary" : "bg-muted-foreground/30"
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: AI Consent */}
        {currentStep === 1 && (
          <motion.div
            key="consent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="rounded-lg border bg-card p-8 text-center"
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="mb-4 text-xl font-semibold">AI-Powered Resume Analysis</h3>
            <p className="mb-6 text-muted-foreground">
              This workflow uses AI to analyze your resume and job descriptions to provide intelligent keyword suggestions.
              Your documents will be processed securely and temporarily for analysis purposes only.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleConsentGiven}
                className="w-full rounded-lg bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90"
              >
                I Agree - Proceed with AI Analysis
              </button>
              {onDowngrade && (
                <button
                  onClick={onDowngrade}
                  className="w-full rounded-lg border px-6 py-3 hover:bg-muted"
                >
                  Use Simple Mode Instead
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 2: File Upload */}
        {currentStep === 2 && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="rounded-lg border bg-card p-6">
              <h3 className="mb-4 text-lg font-semibold">Upload Your Resume</h3>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                  dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/30",
                  isLoading && "opacity-50 pointer-events-none"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  const file = e.dataTransfer.files[0];
                  if (file && file.type === 'application/pdf') {
                    handleFileUpload(file);
                  }
                }}
              >
                {isLoading ? (
                  <div className="space-y-3">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">{loadingMessage}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        Drop your PDF resume here or{' '}
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="text-primary hover:text-primary/80"
                        >
                          browse files
                        </button>
                      </p>
                      <p className="text-xs text-muted-foreground">PDF files only, max 10MB</p>
                    </div>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
            </div>
          </motion.div>
        )}

        {/* Step 3: AI Analysis */}
        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Desktop: Side by Side (Bigger), Mobile: Stacked */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 max-w-none lg:max-w-7xl mx-auto">
              {/* ATS Analysis Results */}
              <div className="rounded-lg border bg-card p-6 lg:p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">ATS Analysis Results</h3>
                      <p className="text-sm text-muted-foreground">
                        Your resume compatibility score and analysis
                      </p>
                    </div>
                  </div>
                  {analysisResult && (
                    <button
                      onClick={() => setShowATSModal(true)}
                      className="px-3 py-1 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      View Details
                    </button>
                  )}
                </div>
                
                {isLoading && currentStep === 2 ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Analyzing your resume...</span>
                  </div>
                ) : analysisResult && analysisResult.score ? (
                  <div className="space-y-4">
                    <ATSScoreHeader
                      analysis={analysisResult}
                      fileName={uploadedFile?.name}
                      onViewDetails={() => setShowATSModal(true)}
                      showDetailed={true}
                    />
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>Analysis results not available. Please try uploading your resume again.</p>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="mt-2 text-primary hover:text-primary/80"
                    >
                      Upload Again
                    </button>
                  </div>
                )}
              </div>

              {/* Job Description Analysis - Main Focus */}
              <div className="rounded-lg border bg-card p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                    <FileSearch className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Job Description Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      Paste the job description to find missing keywords in your resume
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Large Job Description Input */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">
                      Job Description
                    </label>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the complete job description here. Include requirements, responsibilities, and qualifications for the best keyword analysis..."
                      className="w-full p-4 lg:p-6 border rounded-lg resize-y text-sm bg-background text-foreground border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[200px] lg:min-h-[250px]"
                      rows={8}
                    />
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{jobDescription.length} characters</span>
                      <span>{jobDescription.trim().split(/\s+/).filter(word => word.length > 0).length} words</span>
                    </div>
                  </div>

                  {/* Analyze Button */}
                  <button
                    onClick={handleJobDescriptionAnalysis}
                    disabled={!jobDescription.trim() || isLoading}
                    className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg font-medium transition-all transform hover:scale-105"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Analyzing Job Description...
                      </>
                    ) : (
                      <>
                        <Brain className="h-5 w-5" />
                        Analyze Job Description
                      </>
                    )}
                  </button>

                  {/* Missing Keywords Results */}
                  {jobKeywords.length > 0 && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border border-orange-200 dark:border-orange-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                        <h4 className="font-medium text-orange-900 dark:text-orange-100">
                          Missing Keywords Found
                        </h4>
                      </div>
                      <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                        These keywords from the job description are missing from your resume:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {jobKeywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-sm font-medium"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          setSelectedKeywords(jobKeywords);
                          setCurrentStep(4);
                        }}
                        className="mt-4 w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add These Keywords to Resume
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Keyword Selection */}
        {currentStep === 4 && (
          <motion.div
            key="keywords"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="rounded-lg border bg-card p-6">
              <h3 className="mb-4 text-lg font-semibold">Select Keywords to Add</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                Review and customize the keywords that will be added to your resume. Click to toggle selection.
              </p>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {selectedKeywords.map((keyword, index) => (
                    <button
                      key={index}
                      onClick={() => handleKeywordToggle(keyword)}
                      className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm"
                    >
                      {keyword}
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    {selectedKeywords.length} keywords selected
                  </p>
                  <div className="space-x-3">
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="px-4 py-2 border rounded-lg hover:bg-muted"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleProcessResume}
                      disabled={selectedKeywords.length === 0 || isLoading}
                      className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Process Resume'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 5: Download */}
        {currentStep === 5 && (
          <motion.div
            key="download"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="rounded-lg border bg-card p-8 text-center"
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="mb-4 text-xl font-semibold">Resume Optimized Successfully!</h3>
            <p className="mb-6 text-muted-foreground">
              Your resume has been enhanced with the selected keywords and is ready for download.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setCurrentStep(1)}
                className="w-full rounded-lg bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90"
              >
                Optimize Another Resume
              </button>
              {onDowngrade && (
                <button
                  onClick={onDowngrade}
                  className="w-full rounded-lg border px-6 py-3 hover:bg-muted"
                >
                  Use Simple Mode
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ATS Details Modal */}
      {showATSModal && analysisResult && (
        <ATSDetailsModal
          isOpen={showATSModal}
          onClose={() => setShowATSModal(false)}
          analysis={analysisResult}
        />
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