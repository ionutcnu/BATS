import { useState, useCallback, useEffect } from 'react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  isVisible: boolean;
}

interface ToastState {
  toasts: Toast[];
  showToast: boolean;
  currentToast: Toast | null;
}

interface ToastActions {
  showToastNotification: (message: string, type?: Toast['type'], duration?: number) => void;
  hideToast: (id?: string) => void;
  clearAllToasts: () => void;
}

const DEFAULT_DURATION = 3000; // 3 seconds

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [currentToast, setCurrentToast] = useState<Toast | null>(null);

  const showToastNotification = useCallback((
    message: string, 
    type: Toast['type'] = 'success', 
    duration: number = DEFAULT_DURATION
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      message,
      type,
      duration,
      isVisible: true,
    };

    setToasts(prev => [...prev, newToast]);
    setCurrentToast(newToast);
    setShowToast(true);

    // Auto-hide after duration
    if (duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, duration);
    }
  }, []);

  const hideToast = useCallback((id?: string) => {
    if (id) {
      setToasts(prev => prev.filter(toast => toast.id !== id));
      // If hiding current toast, show next one if available
      setToasts(prev => {
        const remaining = prev.filter(toast => toast.id !== id);
        if (remaining.length > 0 && currentToast?.id === id) {
          setCurrentToast(remaining[0]);
        } else if (remaining.length === 0) {
          setShowToast(false);
          setCurrentToast(null);
        }
        return remaining;
      });
    } else {
      // Hide current toast
      setShowToast(false);
      setTimeout(() => {
        setToasts(prev => {
          const remaining = prev.slice(1);
          if (remaining.length > 0) {
            setCurrentToast(remaining[0]);
            setShowToast(true);
          } else {
            setCurrentToast(null);
          }
          return remaining;
        });
      }, 200); // Small delay for animation
    }
  }, [currentToast]);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
    setShowToast(false);
    setCurrentToast(null);
  }, []);

  // Handle queue - show next toast when current one is hidden
  useEffect(() => {
    if (!showToast && toasts.length > 0 && !currentToast) {
      setCurrentToast(toasts[0]);
      setShowToast(true);
    }
  }, [showToast, toasts, currentToast]);

  const state: ToastState = {
    toasts,
    showToast,
    currentToast,
  };

  const actions: ToastActions = {
    showToastNotification,
    hideToast,
    clearAllToasts,
  };

  return {
    ...state,
    ...actions,
  };
}