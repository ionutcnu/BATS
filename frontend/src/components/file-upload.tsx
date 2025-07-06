'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  File,
  X,
  CheckCircle,
  AlertCircle,
  Download,
  Loader2,
  FileText,
} from 'lucide-react';
import { apiService } from '@/services/api';
import { ErrorHandler, useErrorHandler, ErrorType } from '@/components/error-handler';
import { Loading, ProcessingLoading } from '@/components/loading';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onUploadComplete?: (file: File) => void;
  onError?: (error: string) => void;
  maxSize?: number; // in MB
  className?: string;
}

interface UploadState {
  file: File | null;
  isUploading: boolean;
  isProcessing: boolean;
  progress: number;
  error: string | null;
  success: boolean;
  optimizedBlob: Blob | null;
  optimizedFileName: string | null;
}

export function FileUpload({ 
  onUploadComplete, 
  onError, 
  maxSize = 10,
  className 
}: FileUploadProps) {
  const [state, setState] = useState<UploadState>({
    file: null,
    isUploading: false,
    isProcessing: false,
    progress: 0,
    error: null,
    success: false,
    optimizedBlob: null,
    optimizedFileName: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const { error: errorState, showError, clearError } = useErrorHandler();

  const resetState = useCallback(() => {
    setState({
      file: null,
      isUploading: false,
      isProcessing: false,
      progress: 0,
      error: null,
      success: false,
      optimizedBlob: null,
      optimizedFileName: null,
    });
  }, []);

  const validateFile = useCallback((file: File): ErrorType | null => {
    if (file.type !== 'application/pdf') {
      showError('validation', 'Only PDF files are allowed');
      return 'validation';
    }
    if (file.size > maxSize * 1024 * 1024) {
      showError('validation', `File size must be less than ${maxSize}MB`);
      return 'validation';
    }
    return null;
  }, [maxSize, showError]);

  const handleFileSelection = useCallback(async (file: File) => {
    const error = validateFile(file);
    if (error) {
      setState(prev => ({ ...prev, error: 'validation' }));
      onError?.('File validation failed');
      return;
    }

    clearError();
    setState(prev => ({ 
      ...prev, 
      file, 
      error: null, 
      isUploading: true, 
      progress: 0 
    }));

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }));
      }, 200);

      setState(prev => ({ ...prev, isProcessing: true }));

      const response = await apiService.uploadAndOptimize(file);
      
      clearInterval(progressInterval);

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          isUploading: false,
          isProcessing: false,
          progress: 100,
          success: true,
          optimizedBlob: response.data!,
          optimizedFileName: `optimized_${file.name}`,
        }));
        onUploadComplete?.(file);
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      // Determine error type
      let errorType: ErrorType = 'generic';
      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        errorType = 'network';
      } else if (errorMessage.includes('server') || errorMessage.includes('500')) {
        errorType = 'server';
      } else if (errorMessage.includes('timeout')) {
        errorType = 'timeout';
      }

      showError(errorType, errorMessage, { canRetry: true });
      
      setState(prev => ({
        ...prev,
        isUploading: false,
        isProcessing: false,
        progress: 0,
        error: errorMessage,
      }));
      onError?.(errorMessage);
    }
  }, [validateFile, onUploadComplete, onError, clearError, showError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  }, [handleFileSelection]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  }, [handleFileSelection]);

  const handleDownload = useCallback(() => {
    if (state.optimizedBlob && state.optimizedFileName) {
      apiService.downloadFile(state.optimizedBlob, state.optimizedFileName);
    }
  }, [state.optimizedBlob, state.optimizedFileName]);

  const handleRemoveFile = useCallback(() => {
    resetState();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [resetState]);

  const handleRetry = useCallback(() => {
    if (state.file) {
      handleFileSelection(state.file);
    }
  }, [state.file, handleFileSelection]);

  return (
    <div className={cn('w-full max-w-2xl mx-auto', className)}>
      <AnimatePresence mode="wait">
        {!state.file && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200',
              isDragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileInputChange}
              className="hidden"
              id="file-upload"
            />
            
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Upload className="h-12 w-12 text-muted-foreground" />
                {isDragOver && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 rounded-full bg-primary/20"
                  />
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {isDragOver ? 'Drop your PDF here' : 'Drag & drop your PDF here'}
                </p>
                <p className="text-sm text-muted-foreground">
                  or{' '}
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer text-primary hover:underline"
                  >
                    click to browse
                  </label>
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF files up to {maxSize}MB
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {state.file && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* File Info */}
            <div className="flex items-center justify-between p-4 bg-card border rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{state.file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(state.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              
              {!state.isUploading && !state.isProcessing && (
                <button
                  onClick={handleRemoveFile}
                  className="p-1 hover:bg-muted rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Progress */}
            {(state.isUploading || state.isProcessing) && (
              <div className="space-y-4">
                {state.isProcessing ? (
                  <ProcessingLoading message="Optimizing your resume..." />
                ) : (
                  <Loading
                    type="progress"
                    size="md"
                    message={`Uploading ${state.file?.name}...`}
                    progress={state.progress}
                  />
                )}
              </div>
            )}

            {/* Error State */}
            <ErrorHandler
              error={errorState}
              onRetry={handleRetry}
              onDismiss={clearError}
              variant="inline"
            />

            {/* Success State */}
            {state.success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950 dark:border-green-800">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      Resume Optimized Successfully!
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Your ATS-optimized resume is ready for download
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleDownload}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Optimized Resume</span>
                  </button>
                  
                  <button
                    onClick={resetState}
                    className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    Upload Another
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}