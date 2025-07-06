'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  Wifi, 
  Server, 
  FileX, 
  Clock, 
  RefreshCw,
  X,
  Info,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ErrorType = 
  | 'network'
  | 'server'
  | 'validation'
  | 'timeout'
  | 'file'
  | 'generic'
  | 'success'
  | 'warning'
  | 'info';

export interface ErrorMessage {
  type: ErrorType;
  title: string;
  message: string;
  code?: string;
  canRetry?: boolean;
  autoHide?: boolean;
  duration?: number;
}

interface ErrorHandlerProps {
  error: ErrorMessage | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  variant?: 'inline' | 'toast' | 'modal';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const errorConfig: Record<ErrorType, { icon: React.ComponentType<any>; colorClass: string; bgClass: string; borderClass: string }> = {
  network: {
    icon: Wifi,
    colorClass: 'text-orange-600',
    bgClass: 'bg-orange-50 dark:bg-orange-950',
    borderClass: 'border-orange-200 dark:border-orange-800'
  },
  server: {
    icon: Server,
    colorClass: 'text-red-600',
    bgClass: 'bg-red-50 dark:bg-red-950',
    borderClass: 'border-red-200 dark:border-red-800'
  },
  validation: {
    icon: AlertCircle,
    colorClass: 'text-yellow-600',
    bgClass: 'bg-yellow-50 dark:bg-yellow-950',
    borderClass: 'border-yellow-200 dark:border-yellow-800'
  },
  timeout: {
    icon: Clock,
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-50 dark:bg-blue-950',
    borderClass: 'border-blue-200 dark:border-blue-800'
  },
  file: {
    icon: FileX,
    colorClass: 'text-purple-600',
    bgClass: 'bg-purple-50 dark:bg-purple-950',
    borderClass: 'border-purple-200 dark:border-purple-800'
  },
  generic: {
    icon: AlertTriangle,
    colorClass: 'text-red-600',
    bgClass: 'bg-red-50 dark:bg-red-950',
    borderClass: 'border-red-200 dark:border-red-800'
  },
  success: {
    icon: CheckCircle,
    colorClass: 'text-green-600',
    bgClass: 'bg-green-50 dark:bg-green-950',
    borderClass: 'border-green-200 dark:border-green-800'
  },
  warning: {
    icon: AlertTriangle,
    colorClass: 'text-yellow-600',
    bgClass: 'bg-yellow-50 dark:bg-yellow-950',
    borderClass: 'border-yellow-200 dark:border-yellow-800'
  },
  info: {
    icon: Info,
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-50 dark:bg-blue-950',
    borderClass: 'border-blue-200 dark:border-blue-800'
  }
};

export function ErrorHandler({ 
  error, 
  onRetry, 
  onDismiss,
  className,
  variant = 'inline',
  position = 'top-right'
}: ErrorHandlerProps) {
  if (!error) return null;

  const config = errorConfig[error.type];
  const Icon = config.icon;

  const positionClasses = {
    'top-right': 'fixed top-4 right-4 z-50',
    'top-left': 'fixed top-4 left-4 z-50',
    'bottom-right': 'fixed bottom-4 right-4 z-50',
    'bottom-left': 'fixed bottom-4 left-4 z-50',
    'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50',
    'bottom-center': 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50'
  };

  const baseClasses = cn(
    'border rounded-lg p-4 shadow-lg backdrop-blur-sm',
    config.bgClass,
    config.borderClass,
    variant === 'toast' ? positionClasses[position] : '',
    variant === 'modal' ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/50' : '',
    className
  );

  const contentClasses = cn(
    'flex items-start space-x-3',
    variant === 'modal' ? 'bg-background border border-border rounded-lg p-6 max-w-md mx-4' : ''
  );

  const animations = {
    initial: variant === 'toast' 
      ? { opacity: 0, y: -20, scale: 0.9 }
      : { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: variant === 'toast' 
      ? { opacity: 0, y: -20, scale: 0.9 }
      : { opacity: 0, scale: 0.9 }
  };

  const ErrorContent = () => (
    <motion.div
      initial={animations.initial}
      animate={animations.animate}
      exit={animations.exit}
      transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
      className={contentClasses}
    >
      <div className={cn('flex-shrink-0 mt-0.5', config.colorClass)}>
        <Icon className="h-5 w-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-foreground mb-1">
          {error.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          {error.message}
        </p>
        
        {error.code && (
          <p className="text-xs text-muted-foreground mb-3 font-mono">
            Error Code: {error.code}
          </p>
        )}
        
        <div className="flex items-center space-x-2">
          {error.canRetry && onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Retry</span>
            </button>
          )}
          
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Dismiss</span>
            </button>
          )}
        </div>
      </div>
      
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </motion.div>
  );

  if (variant === 'modal') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={baseClasses}
          onClick={(e) => e.target === e.currentTarget && onDismiss?.()}
        >
          <ErrorContent />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <div className={baseClasses}>
        <ErrorContent />
      </div>
    </AnimatePresence>
  );
}

// Helper function to create error messages
export function createErrorMessage(
  type: ErrorType,
  originalError?: string | Error,
  options?: Partial<ErrorMessage>
): ErrorMessage {
  const errorString = originalError instanceof Error ? originalError.message : originalError || '';
  
  const defaultMessages: Record<ErrorType, { title: string; message: string; canRetry: boolean }> = {
    network: {
      title: 'Connection Error',
      message: 'Please check your internet connection and try again.',
      canRetry: true
    },
    server: {
      title: 'Server Error',
      message: 'We\'re experiencing technical difficulties. Please try again later.',
      canRetry: true
    },
    validation: {
      title: 'Invalid Input',
      message: 'Please check your input and try again.',
      canRetry: false
    },
    timeout: {
      title: 'Request Timeout',
      message: 'The request took too long. Please try again.',
      canRetry: true
    },
    file: {
      title: 'File Error',
      message: 'There was an issue with your file. Please try uploading again.',
      canRetry: true
    },
    generic: {
      title: 'Something went wrong',
      message: errorString || 'An unexpected error occurred. Please try again.',
      canRetry: true
    },
    success: {
      title: 'Success',
      message: 'Operation completed successfully.',
      canRetry: false
    },
    warning: {
      title: 'Warning',
      message: 'Please review the information provided.',
      canRetry: false
    },
    info: {
      title: 'Information',
      message: 'Please note this information.',
      canRetry: false
    }
  };

  const defaults = defaultMessages[type];
  
  return {
    type,
    title: options?.title || defaults.title,
    message: options?.message || defaults.message,
    code: options?.code,
    canRetry: options?.canRetry ?? defaults.canRetry,
    autoHide: options?.autoHide ?? (type === 'success' || type === 'info'),
    duration: options?.duration ?? 5000,
    ...options
  };
}

// Hook for managing error state
export function useErrorHandler() {
  const [error, setError] = React.useState<ErrorMessage | null>(null);

  const showError = React.useCallback((type: ErrorType, originalError?: string | Error, options?: Partial<ErrorMessage>) => {
    const errorMessage = createErrorMessage(type, originalError, options);
    setError(errorMessage);
    
    if (errorMessage.autoHide) {
      setTimeout(() => {
        setError(null);
      }, errorMessage.duration);
    }
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    showError,
    clearError
  };
}