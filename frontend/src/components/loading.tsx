'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Upload, Download, FileText, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export type LoadingType = 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'progress' | 'upload' | 'process';
export type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';

interface LoadingProps {
  type?: LoadingType;
  size?: LoadingSize;
  message?: string;
  progress?: number;
  className?: string;
  overlay?: boolean;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
};

const messageSizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl'
};

export function Loading({ 
  type = 'spinner', 
  size = 'md', 
  message, 
  progress, 
  className,
  overlay = false,
  fullScreen = false
}: LoadingProps) {
  const LoadingSpinner = () => (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={cn(sizeClasses[size], 'text-primary')}
    >
      <Loader2 className="h-full w-full" />
    </motion.div>
  );

  const LoadingDots = () => (
    <div className="flex items-center space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.2
          }}
          className={cn(
            'rounded-full bg-primary',
            size === 'sm' ? 'h-1 w-1' : '',
            size === 'md' ? 'h-2 w-2' : '',
            size === 'lg' ? 'h-3 w-3' : '',
            size === 'xl' ? 'h-4 w-4' : ''
          )}
        />
      ))}
    </div>
  );

  const LoadingPulse = () => (
    <motion.div
      animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className={cn(
        'rounded-full bg-primary/20 border-2 border-primary',
        sizeClasses[size]
      )}
    />
  );

  const LoadingSkeleton = () => (
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-muted rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-3 bg-muted rounded"></div>
        <div className="h-3 bg-muted rounded w-5/6"></div>
      </div>
      <div className="h-8 bg-muted rounded w-1/2"></div>
    </div>
  );

  const LoadingProgress = () => (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-between mb-2">
        <span className={cn('font-medium', messageSizes[size])}>
          {message || 'Processing...'}
        </span>
        {progress !== undefined && (
          <span className="text-sm text-muted-foreground">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress || 0}%` }}
          transition={{ duration: 0.3 }}
          className="bg-primary h-2 rounded-full"
        />
      </div>
    </div>
  );

  const LoadingUpload = () => (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 border-2 border-primary/20 border-t-primary rounded-full"
        />
        <div className={cn(
          'flex items-center justify-center rounded-full bg-primary/10',
          size === 'sm' ? 'h-12 w-12' : '',
          size === 'md' ? 'h-16 w-16' : '',
          size === 'lg' ? 'h-20 w-20' : '',
          size === 'xl' ? 'h-24 w-24' : ''
        )}>
          <Upload className={cn('text-primary', sizeClasses[size])} />
        </div>
      </div>
      {message && (
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={cn('text-center text-muted-foreground', messageSizes[size])}
        >
          {message}
        </motion.p>
      )}
    </div>
  );

  const LoadingProcess = () => (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className={cn(
            'flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500',
            size === 'sm' ? 'h-12 w-12' : '',
            size === 'md' ? 'h-16 w-16' : '',
            size === 'lg' ? 'h-20 w-20' : '',
            size === 'xl' ? 'h-24 w-24' : ''
          )}
        >
          <Zap className={cn('text-white', sizeClasses[size])} />
        </motion.div>
        
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 border-2 border-transparent border-t-primary rounded-full"
        />
      </div>
      
      {message && (
        <div className="text-center">
          <motion.p
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={cn('font-medium', messageSizes[size])}
          >
            {message}
          </motion.p>
          <motion.div
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            className="mt-2"
          >
            <LoadingDots />
          </motion.div>
        </div>
      )}
    </div>
  );

  const renderLoading = () => {
    switch (type) {
      case 'dots':
        return <LoadingDots />;
      case 'pulse':
        return <LoadingPulse />;
      case 'skeleton':
        return <LoadingSkeleton />;
      case 'progress':
        return <LoadingProgress />;
      case 'upload':
        return <LoadingUpload />;
      case 'process':
        return <LoadingProcess />;
      default:
        return <LoadingSpinner />;
    }
  };

  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center space-y-4',
      className
    )}>
      {renderLoading()}
      {message && type !== 'progress' && type !== 'upload' && type !== 'process' && (
        <motion.p
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={cn('text-center text-muted-foreground', messageSizes[size])}
        >
          {message}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      >
        {content}
      </motion.div>
    );
  }

  if (overlay) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg"
      >
        {content}
      </motion.div>
    );
  }

  return content;
}

// Specialized loading components
export function FileUploadLoading({ progress, fileName }: { progress?: number; fileName?: string }) {
  return (
    <Loading
      type="upload"
      size="lg"
      message={fileName ? `Uploading ${fileName}...` : 'Uploading file...'}
      progress={progress}
    />
  );
}

export function ProcessingLoading({ message }: { message?: string }) {
  return (
    <Loading
      type="process"
      size="lg"
      message={message || 'Processing your resume...'}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-center space-x-4">
        <div className="h-12 w-12 rounded-full bg-muted"></div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-3 bg-muted rounded w-1/2"></div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 bg-muted rounded"></div>
        <div className="h-3 bg-muted rounded w-5/6"></div>
        <div className="h-8 bg-muted rounded w-1/3 mt-4"></div>
      </div>
    </div>
  );
}