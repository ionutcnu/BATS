'use client';

import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  FileText,
  Shield,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ATSAnalysis } from '@/services/api';
import { ATSScoreHeader } from '@/components/ats-score-header';
import { ATSDetailsModal } from '@/components/ats-details-modal';

interface FileUploadStepProps {
  workflowMode: 'scan' | 'optimize';
  termsAccepted: boolean;
  setTermsAccepted: (accepted: boolean) => void;
  uploadedFile: File | null;
  analysisResult: ATSAnalysis | null;
  isLoading: boolean;
  showATSModal: boolean;
  setShowATSModal: (show: boolean) => void;
  onFileUpload: (file: File) => Promise<void>;
  onReanalyze: () => void;
  showError: (type: string, message: string) => void;
}

export function FileUploadStep({
  workflowMode,
  termsAccepted,
  setTermsAccepted,
  uploadedFile,
  analysisResult,
  isLoading,
  showATSModal,
  setShowATSModal,
  onFileUpload,
  onReanalyze,
  showError
}: FileUploadStepProps) {
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (pdfFile) {
      if (workflowMode === 'optimize' || termsAccepted) {
        onFileUpload(pdfFile);
      }
    } else {
      showError('file', 'Please upload a PDF file');
    }
  }, [onFileUpload, showError, workflowMode, termsAccepted]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (workflowMode === 'optimize' || termsAccepted) {
        onFileUpload(file);
      }
    }
  }, [onFileUpload, workflowMode, termsAccepted]);

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
          onReanalyze={onReanalyze}
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
            onReanalyze();
          }}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}