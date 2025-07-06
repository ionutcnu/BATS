'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Shield,
  Settings,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  Check,
  X,
  AlertCircle,
  Info,
  Lock,
  Zap,
  FileText,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIPreferences {
  enableAIAnalysis: boolean;
  enableResumeAnalysis: boolean;
  enableJobDescriptionAnalysis: boolean;
  autoDeleteData: boolean;
  showAIIndicators: boolean;
  consentGiven: boolean;
  consentDate?: string;
}

interface AISettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onPreferencesChange: (preferences: AIPreferences) => void;
  initialPreferences?: Partial<AIPreferences>;
}

export function AISettings({
  isOpen,
  onClose,
  onPreferencesChange,
  initialPreferences = {}
}: AISettingsProps) {
  const [preferences, setPreferences] = useState<AIPreferences>({
    enableAIAnalysis: true,
    enableResumeAnalysis: true,
    enableJobDescriptionAnalysis: true,
    autoDeleteData: true,
    showAIIndicators: true,
    consentGiven: false,
    ...initialPreferences
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('bats-ai-preferences');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPreferences(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.warn('Failed to parse stored AI preferences');
      }
    }
  }, []);

  const updatePreference = <K extends keyof AIPreferences>(
    key: K,
    value: AIPreferences[K]
  ) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    setHasChanges(true);
  };

  const savePreferences = () => {
    localStorage.setItem('bats-ai-preferences', JSON.stringify(preferences));
    onPreferencesChange(preferences);
    setHasChanges(false);
  };

  const resetToDefaults = () => {
    const defaults: AIPreferences = {
      enableAIAnalysis: true,
      enableResumeAnalysis: true,
      enableJobDescriptionAnalysis: true,
      autoDeleteData: true,
      showAIIndicators: true,
      consentGiven: false
    };
    setPreferences(defaults);
    setHasChanges(true);
  };

  const clearAllData = () => {
    localStorage.removeItem('bats-ai-preferences');
    localStorage.removeItem('bats-ai-consent');
    setPreferences(prev => ({ ...prev, consentGiven: false, consentDate: undefined }));
    setHasChanges(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-background border border-border rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-background border-b border-border p-6 rounded-t-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-lg">
                    <Settings className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">AI Settings & Privacy</h2>
                    <p className="text-sm text-muted-foreground">
                      Manage your AI analysis preferences and data privacy
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* AI Analysis Toggle */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Bot className="h-5 w-5 text-purple-600" />
                  AI Analysis Settings
                </h3>

                <div className="space-y-4">
                  {/* Master Toggle */}
                  <div className="flex items-center justify-between p-4 bg-card border rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium">Enable AI Analysis</h4>
                        <p className="text-sm text-muted-foreground">
                          Allow AI to analyze your documents for optimization suggestions
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.enableAIAnalysis}
                        onChange={(e) => updatePreference('enableAIAnalysis', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  {/* Sub-options */}
                  <AnimatePresence>
                    {preferences.enableAIAnalysis && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-8 space-y-3"
                      >
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <div>
                              <h5 className="font-medium text-sm">Resume Analysis</h5>
                              <p className="text-xs text-muted-foreground">
                                AI analysis of uploaded resumes
                              </p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={preferences.enableResumeAnalysis}
                              onChange={(e) => updatePreference('enableResumeAnalysis', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Target className="h-4 w-4 text-green-500" />
                            <div>
                              <h5 className="font-medium text-sm">Job Description Analysis</h5>
                              <p className="text-xs text-muted-foreground">
                                AI keyword extraction from job postings
                              </p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={preferences.enableJobDescriptionAnalysis}
                              onChange={(e) => updatePreference('enableJobDescriptionAnalysis', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                          </label>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Privacy & Data Settings
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Trash2 className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-800 dark:text-green-200">
                          Auto-Delete Data
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Automatically delete all processed data after analysis
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.autoDeleteData}
                        onChange={(e) => updatePreference('autoDeleteData', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-card border rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Eye className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Show AI Indicators</h4>
                        <p className="text-sm text-muted-foreground">
                          Display visual indicators when AI is being used
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.showAIIndicators}
                        onChange={(e) => updatePreference('showAIIndicators', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Consent Status */}
              {preferences.consentGiven && (
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-200">
                        AI Consent Active
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        You have consented to AI analysis. 
                        {preferences.consentDate && ` Given on ${new Date(preferences.consentDate).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Advanced Settings */}
              <div className="space-y-4">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span className="font-medium">Advanced Settings</span>
                  </div>
                  <motion.div
                    animate={{ rotate: showAdvanced ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Info className="h-4 w-4" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden space-y-3"
                    >
                      <div className="bg-card border rounded-lg p-4 space-y-3">
                        <button
                          onClick={resetToDefaults}
                          className="w-full flex items-center justify-center gap-2 p-3 border border-border rounded-lg hover:bg-muted transition-colors"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Reset to Defaults
                        </button>

                        <button
                          onClick={clearAllData}
                          className="w-full flex items-center justify-center gap-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          Clear All Data & Consent
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Data Usage Notice */}
              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Lock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                      Data Processing Notice
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      When AI analysis is enabled, your documents are processed by Mistral AI for analysis. 
                      All data is transmitted securely and deleted immediately after processing. 
                      No personal information is stored or shared with third parties.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 bg-background border-t border-border p-6 rounded-b-xl">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {hasChanges && (
                    <span className="text-orange-600 dark:text-orange-400">
                      You have unsaved changes
                    </span>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      savePreferences();
                      onClose();
                    }}
                    disabled={!hasChanges}
                    className={cn(
                      "px-4 py-2 rounded-lg font-medium transition-colors",
                      hasChanges
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    )}
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}