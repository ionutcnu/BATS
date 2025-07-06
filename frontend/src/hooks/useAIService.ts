import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/api';

export interface AIPreferences {
  enableAIAnalysis: boolean;
  enableResumeAnalysis: boolean;
  enableJobDescriptionAnalysis: boolean;
  autoDeleteData: boolean;
  showAIIndicators: boolean;
  consentGiven: boolean;
  consentDate?: string;
}

interface AIServiceState {
  aiServiceAvailable: boolean | null;
  aiConsentGiven: boolean;
  aiPreferences: AIPreferences;
  showConsentModal: boolean;
  showAISettings: boolean;
  isCheckingHealth: boolean;
  lastHealthCheck: Date | null;
}

interface AIServiceActions {
  setAiServiceAvailable: (available: boolean | null) => void;
  setAiConsentGiven: (given: boolean) => void;
  setAiPreferences: (preferences: AIPreferences) => void;
  setShowConsentModal: (show: boolean) => void;
  setShowAISettings: (show: boolean) => void;
  checkAIHealth: () => Promise<boolean>;
  updatePreferences: (preferences: Partial<AIPreferences>) => void;
  giveConsent: (analysisType?: string) => void;
  revokeConsent: () => void;
  resetAISettings: () => void;
}

const DEFAULT_AI_PREFERENCES: AIPreferences = {
  enableAIAnalysis: true,
  enableResumeAnalysis: true,
  enableJobDescriptionAnalysis: true,
  autoDeleteData: true,
  showAIIndicators: true,
  consentGiven: false,
};

const AI_PREFERENCES_KEY = 'bats-ai-preferences';
const HEALTH_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useAIService() {
  const [aiServiceAvailable, setAiServiceAvailable] = useState<boolean | null>(null);
  const [aiConsentGiven, setAiConsentGiven] = useState(false);
  const [aiPreferences, setAiPreferences] = useState<AIPreferences>(DEFAULT_AI_PREFERENCES);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showAISettings, setShowAISettings] = useState(false);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [lastHealthCheck, setLastHealthCheck] = useState<Date | null>(null);

  // Load stored preferences on mount
  useEffect(() => {
    const loadPreferences = () => {
      try {
        const stored = localStorage.getItem(AI_PREFERENCES_KEY);
        if (stored) {
          const prefs = JSON.parse(stored);
          setAiPreferences(prev => ({ ...prev, ...prefs }));
          setAiConsentGiven(prefs.consentGiven || false);
        }
      } catch (error) {
        console.warn('Failed to load AI preferences:', error);
      }
    };
    
    loadPreferences();
  }, []);

  // Check AI health on mount and periodically
  useEffect(() => {
    checkAIHealth();
    
    const interval = setInterval(checkAIHealth, HEALTH_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const checkAIHealth = useCallback(async (): Promise<boolean> => {
    if (isCheckingHealth) return aiServiceAvailable === true;
    
    setIsCheckingHealth(true);
    
    try {
      const response = await apiService.checkAIHealth();
      const available = response.success && response.data?.aiServiceAvailable === true;
      setAiServiceAvailable(available);
      setLastHealthCheck(new Date());
      return available;
    } catch (error) {
      console.error('AI health check failed:', error);
      setAiServiceAvailable(false);
      setLastHealthCheck(new Date());
      return false;
    } finally {
      setIsCheckingHealth(false);
    }
  }, [isCheckingHealth, aiServiceAvailable]);

  const updatePreferences = useCallback((newPreferences: Partial<AIPreferences>) => {
    const updatedPreferences = { ...aiPreferences, ...newPreferences };
    setAiPreferences(updatedPreferences);
    
    try {
      localStorage.setItem(AI_PREFERENCES_KEY, JSON.stringify(updatedPreferences));
    } catch (error) {
      console.warn('Failed to save AI preferences:', error);
    }
  }, [aiPreferences]);

  const giveConsent = useCallback((analysisType?: string) => {
    const consentData = {
      ...aiPreferences,
      consentGiven: true,
      consentDate: new Date().toISOString(),
    };
    
    if (analysisType) {
      // Enable specific analysis type
      switch (analysisType) {
        case 'resume':
          consentData.enableResumeAnalysis = true;
          break;
        case 'job-description':
          consentData.enableJobDescriptionAnalysis = true;
          break;
        default:
          consentData.enableAIAnalysis = true;
      }
    }
    
    updatePreferences(consentData);
    setAiConsentGiven(true);
    setShowConsentModal(false);
  }, [aiPreferences, updatePreferences]);

  const revokeConsent = useCallback(() => {
    const updatedPreferences = {
      ...aiPreferences,
      consentGiven: false,
      enableAIAnalysis: false,
      enableResumeAnalysis: false,
      enableJobDescriptionAnalysis: false,
    };
    
    updatePreferences(updatedPreferences);
    setAiConsentGiven(false);
  }, [aiPreferences, updatePreferences]);

  const resetAISettings = useCallback(() => {
    setAiPreferences(DEFAULT_AI_PREFERENCES);
    setAiConsentGiven(false);
    setShowConsentModal(false);
    setShowAISettings(false);
    
    try {
      localStorage.removeItem(AI_PREFERENCES_KEY);
    } catch (error) {
      console.warn('Failed to clear AI preferences:', error);
    }
  }, []);

  // Computed values
  const isAIEnabled = aiServiceAvailable && aiConsentGiven && aiPreferences.enableAIAnalysis;
  const canUseAI = (feature: 'resume' | 'job-description' | 'general' = 'general') => {
    if (!isAIEnabled) return false;
    
    switch (feature) {
      case 'resume':
        return aiPreferences.enableResumeAnalysis;
      case 'job-description':
        return aiPreferences.enableJobDescriptionAnalysis;
      default:
        return true;
    }
  };

  const needsConsent = (feature: 'resume' | 'job-description' | 'general' = 'general') => {
    if (!aiServiceAvailable) return false;
    if (aiConsentGiven) return false;
    
    // Show consent modal if trying to use AI features without consent
    return true;
  };

  const getAIStatusMessage = () => {
    if (aiServiceAvailable === null) return 'Checking AI Service...';
    if (aiServiceAvailable === false) return 'AI Service Offline';
    if (!aiConsentGiven) return 'AI Consent Required';
    if (!aiPreferences.enableAIAnalysis) return 'AI Analysis Disabled';
    return 'AI Service Online';
  };

  const getAIStatusColor = () => {
    if (aiServiceAvailable === null) return 'gray';
    if (aiServiceAvailable === false) return 'red';
    if (!aiConsentGiven || !aiPreferences.enableAIAnalysis) return 'yellow';
    return 'green';
  };

  const state: AIServiceState = {
    aiServiceAvailable,
    aiConsentGiven,
    aiPreferences,
    showConsentModal,
    showAISettings,
    isCheckingHealth,
    lastHealthCheck,
  };

  const actions: AIServiceActions = {
    setAiServiceAvailable,
    setAiConsentGiven,
    setAiPreferences,
    setShowConsentModal,
    setShowAISettings,
    checkAIHealth,
    updatePreferences,
    giveConsent,
    revokeConsent,
    resetAISettings,
  };

  return {
    ...state,
    ...actions,
    isAIEnabled,
    canUseAI,
    needsConsent,
    getAIStatusMessage,
    getAIStatusColor,
  };
}