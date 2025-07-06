'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Download, CheckCircle, ArrowRight, Loader2, FileText, Target, Zap } from 'lucide-react';
import { ATSAnalysis } from '@/services/api';

interface ProcessingStepProps {
  isLoading: boolean;
  processingProgress: number;
  processingStep: string;
  loadingMessage: string;
  fileName?: string;
  originalAnalysis: ATSAnalysis | null;
  optimizedAnalysis: ATSAnalysis | null;
  showComparison: boolean;
  onDownload: () => void;
  onStartNew: () => void;
  onCloseComparison: () => void;
}

export function ProcessingStep({
  isLoading,
  processingProgress,
  processingStep,
  loadingMessage,
  fileName,
  originalAnalysis,
  optimizedAnalysis,
  showComparison,
  onDownload,
  onStartNew,
  onCloseComparison
}: ProcessingStepProps) {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
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

          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-center space-x-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="font-medium">{loadingMessage}</span>
            </div>
            
            <div className="mt-6 space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <div className={`w-2 h-2 rounded-full ${processingProgress >= 20 ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className={processingProgress >= 20 ? 'text-green-600' : 'text-muted-foreground'}>
                  Preparing optimization
                </span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className={`w-2 h-2 rounded-full ${processingProgress >= 40 ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className={processingProgress >= 40 ? 'text-green-600' : 'text-muted-foreground'}>
                  Embedding keywords
                </span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className={`w-2 h-2 rounded-full ${processingProgress >= 60 ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className={processingProgress >= 60 ? 'text-green-600' : 'text-muted-foreground'}>
                  Generating optimized resume
                </span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className={`w-2 h-2 rounded-full ${processingProgress >= 80 ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className={processingProgress >= 80 ? 'text-green-600' : 'text-muted-foreground'}>
                  Analyzing results
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">🎉 Resume Optimization Complete!</h2>
        <p className="text-muted-foreground">Your resume has been successfully optimized for ATS systems</p>
      </div>

      {/* Comparison Results */}
      {originalAnalysis && optimizedAnalysis && (
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Before vs After Comparison
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-muted-foreground">Original Resume</h4>
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {originalAnalysis.score?.overall || 0}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {originalAnalysis.score?.grade || 'N/A'} Grade
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-muted-foreground">Optimized Resume</h4>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {optimizedAnalysis.score?.overall || 0}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {optimizedAnalysis.score?.grade || 'N/A'} Grade
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-primary/5 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">Improvement</span>
              <span className="text-lg font-bold text-primary">
                +{((optimizedAnalysis.score?.overall || 0) - (originalAnalysis.score?.overall || 0))}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Download Section */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Download className="h-5 w-5" />
          Download Your Optimized Resume
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <FileText className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <div className="font-medium">
                optimized_{fileName || 'resume.pdf'}
              </div>
              <div className="text-sm text-muted-foreground">
                Ready for download
              </div>
            </div>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>

          <button
            onClick={onDownload}
            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Optimized Resume
          </button>
        </div>
      </div>

      {/* Success Features */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">✨ What We've Done</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-sm">Added ATS-friendly keywords strategically</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-sm">Maintained original formatting and design</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-sm">Improved ATS compatibility score</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-sm">Enhanced keyword matching</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={onStartNew}
          className="px-6 py-3 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
        >
          Process Another Resume
        </button>
      </div>

      {/* Comparison Modal */}
      {showComparison && (
        <ComparisonResultsModal
          isOpen={showComparison}
          onClose={onCloseComparison}
          originalAnalysis={originalAnalysis}
          optimizedAnalysis={optimizedAnalysis}
          fileName={fileName}
        />
      )}
    </motion.div>
  );
}

// Comparison Results Modal Component
interface ComparisonResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalAnalysis: ATSAnalysis | null;
  optimizedAnalysis: ATSAnalysis | null;
  fileName?: string;
}

function ComparisonResultsModal({
  isOpen,
  onClose,
  originalAnalysis,
  optimizedAnalysis,
  fileName
}: ComparisonResultsModalProps) {
  if (!isOpen) return null;

  const improvement = (optimizedAnalysis?.score?.overall || 0) - (originalAnalysis?.score?.overall || 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-background border rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">🎯 Optimization Results</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Score Comparison */}
          <div className="text-center">
            <div className="inline-flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-green-50 dark:from-red-900/20 dark:to-green-900/20 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {originalAnalysis?.score?.overall || 0}%
                </div>
                <div className="text-sm text-muted-foreground">Before</div>
              </div>
              <ArrowRight className="h-6 w-6 text-primary" />
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {optimizedAnalysis?.score?.overall || 0}%
                </div>
                <div className="text-sm text-muted-foreground">After</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  +{improvement}%
                </div>
                <div className="text-sm text-muted-foreground">Improvement</div>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Original Resume</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Keywords</span>
                  <span>{originalAnalysis?.score?.keywordMatch || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Formatting</span>
                  <span>{originalAnalysis?.score?.formatting || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Readability</span>
                  <span>{originalAnalysis?.score?.readability || 0}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Optimized Resume</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Keywords</span>
                  <span className="text-green-600">{optimizedAnalysis?.score?.keywordMatch || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Formatting</span>
                  <span className="text-green-600">{optimizedAnalysis?.score?.formatting || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Readability</span>
                  <span className="text-green-600">{optimizedAnalysis?.score?.readability || 0}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}