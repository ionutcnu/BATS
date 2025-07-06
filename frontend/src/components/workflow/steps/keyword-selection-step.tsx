'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Hash,
  Edit3,
  Briefcase,
  Settings,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Zap,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAIService } from '@/hooks/useAIService';
import { useKeywordSelection } from '@/hooks/useKeywordSelection';
import { useToast } from '@/hooks/useToast';
import { AIConsentModal } from '@/components/ai-consent-modal';
import { AISettings } from '@/components/ai-settings';

interface KeywordSelectionStepProps {
  onProceed: (keywords: string[]) => void;
  onBack?: () => void;
}

export function KeywordSelectionStep({ onProceed, onBack }: KeywordSelectionStepProps) {
  const {
    aiServiceAvailable,
    aiConsentGiven,
    aiPreferences,
    showConsentModal,
    showAISettings,
    setShowConsentModal,
    setShowAISettings,
    giveConsent,
    updatePreferences,
    getAIStatusMessage,
    getAIStatusColor,
    canUseAI
  } = useAIService();

  const {
    selectedKeywordOption,
    selectedCategories,
    manualKeywords,
    jobDescription,
    jobKeywords,
    categories,
    smartCategories,
    showAllCategories,
    detectedJobRole,
    isExtractingKeywords,
    extractionError,
    setSelectedKeywordOption,
    setJobDescription,
    setShowAllCategories,
    handleCategoryToggle,
    addManualKeyword,
    removeManualKeyword,
    handleManualKeyPress,
    extractKeywordsFromJobDescription,
    prepareFinalKeywords,
    manualInputRef
  } = useKeywordSelection();

  const { showToastNotification } = useToast();

  const handleProceed = async () => {
    if (!selectedKeywordOption) {
      showToastNotification('Please select a keyword option', 'warning');
      return;
    }

    const keywords = await prepareFinalKeywords();
    if (keywords.length === 0) {
      showToastNotification('Please select at least one keyword', 'warning');
      return;
    }

    onProceed(keywords);
  };

  const handleJobDescriptionAnalysis = async () => {
    if (!jobDescription.trim()) {
      showToastNotification('Please enter a job description', 'warning');
      return;
    }

    if (!canUseAI('job-description')) {
      if (aiServiceAvailable && !aiConsentGiven) {
        setShowConsentModal(true);
        return;
      }
      showToastNotification('AI service is not available', 'error');
      return;
    }

    await extractKeywordsFromJobDescription();
  };

  const statusColor = getAIStatusColor();
  const statusMessage = getAIStatusMessage();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Your Keywords</h2>
        <p className="text-muted-foreground">Select how you'd like to optimize your resume</p>
        
        {/* AI Status and Settings */}
        <div className="mt-4 flex items-center justify-center gap-4">
          <div className={cn(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
            statusColor === 'green' 
              ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300" 
              : statusColor === 'red' 
                ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                : statusColor === 'yellow'
                  ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                  : "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
          )}>
            <div className={cn(
              "w-2 h-2 rounded-full",
              statusColor === 'green' ? "bg-green-500 animate-pulse" : 
              statusColor === 'red' ? "bg-red-500" :
              statusColor === 'yellow' ? "bg-yellow-500" : "bg-gray-500 animate-pulse"
            )}></div>
            {statusColor === 'green' && '🤖'} 
            {statusColor === 'red' && '⚠️'} 
            {statusColor === 'yellow' && '🔒'} 
            {statusMessage}
          </div>
          
          <button
            onClick={() => setShowAISettings(true)}
            className="p-1.5 hover:bg-muted rounded-full transition-colors"
            title="AI Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Keyword Options */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Categories Option */}
        <div 
          className={cn(
            "border-2 rounded-lg p-4 cursor-pointer transition-all",
            selectedKeywordOption === 'categories' 
              ? "border-primary bg-primary/5" 
              : "border-border hover:border-primary/50"
          )}
          onClick={() => setSelectedKeywordOption('categories')}
        >
          <div className="flex items-center justify-between mb-2">
            <Hash className="h-5 w-5 text-primary" />
            <input
              type="radio"
              name="keyword-option"
              checked={selectedKeywordOption === 'categories'}
              onChange={() => setSelectedKeywordOption('categories')}
              className="rounded"
            />
          </div>
          <h3 className="font-semibold mb-1">Job Categories</h3>
          <p className="text-sm text-muted-foreground">
            Choose from pre-built keyword sets for your industry
          </p>
        </div>

        {/* Manual Option */}
        <div 
          className={cn(
            "border-2 rounded-lg p-4 cursor-pointer transition-all",
            selectedKeywordOption === 'manual' 
              ? "border-primary bg-primary/5" 
              : "border-border hover:border-primary/50"
          )}
          onClick={() => setSelectedKeywordOption('manual')}
        >
          <div className="flex items-center justify-between mb-2">
            <Edit3 className="h-5 w-5 text-primary" />
            <input
              type="radio"
              name="keyword-option"
              checked={selectedKeywordOption === 'manual'}
              onChange={() => setSelectedKeywordOption('manual')}
              className="rounded"
            />
          </div>
          <h3 className="font-semibold mb-1">Manual Entry</h3>
          <p className="text-sm text-muted-foreground">
            Enter your own keywords manually
          </p>
        </div>

        {/* Job Description Option */}
        <div 
          className={cn(
            "border-2 rounded-lg p-4 cursor-pointer transition-all",
            selectedKeywordOption === 'job-description' 
              ? "border-primary bg-primary/5" 
              : "border-border hover:border-primary/50"
          )}
          onClick={() => setSelectedKeywordOption('job-description')}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <Briefcase className="h-5 w-5 text-primary" />
              {canUseAI('job-description') && <Sparkles className="h-3 w-3 text-primary" />}
            </div>
            <input
              type="radio"
              name="keyword-option"
              checked={selectedKeywordOption === 'job-description'}
              onChange={() => setSelectedKeywordOption('job-description')}
              className="rounded"
            />
          </div>
          <h3 className="font-semibold mb-1">Job Description</h3>
          <p className="text-sm text-muted-foreground">
            {canUseAI('job-description') ? 'AI-powered analysis' : 'Extract keywords from job posting'}
          </p>
        </div>
      </div>

      {/* Selected Option Content */}
      {selectedKeywordOption && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-card border rounded-lg p-6"
        >
          {selectedKeywordOption === 'categories' && (
            <div>
              {/* Smart Categories */}
              {smartCategories.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-green-500" />
                    Smart Recommendations
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Based on your {detectedJobRole?.primaryRole} role
                  </p>
                  <div className="grid gap-3">
                    {smartCategories.map((category) => (
                      <label key={category.id} className="flex items-center space-x-3 p-3 border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.id)}
                          onChange={() => handleCategoryToggle(category.id)}
                          className="rounded"
                        />
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="mr-2">{category.icon}</span>
                            <span className="font-medium">{category.name}</span>
                            <span className="ml-2 text-xs bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                              {category.keywords.length} keywords
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              
              {/* All Categories */}
              {categories.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">
                      {smartCategories.length > 0 ? 'All Categories' : 'Select Job Categories'}
                    </h3>
                    {smartCategories.length > 0 && (
                      <button
                        onClick={() => setShowAllCategories(!showAllCategories)}
                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {showAllCategories ? 'Hide' : 'Show'} all categories
                      </button>
                    )}
                  </div>
                  
                  {(showAllCategories || smartCategories.length === 0) && (
                    <div className="grid gap-3">
                      {categories.filter(cat => !smartCategories.some(smart => smart.id === cat.id)).map((category) => (
                        <label key={category.id} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category.id)}
                            onChange={() => handleCategoryToggle(category.id)}
                            className="rounded"
                          />
                          <div className="flex items-center space-x-3 flex-1">
                            <span className="text-2xl">{category.icon}</span>
                            <div>
                              <div className="font-medium">{category.name}</div>
                              <div className="text-sm text-muted-foreground">{category.description}</div>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">{category.keywords.length} keywords</div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {selectedKeywordOption === 'manual' && (
            <div>
              <h3 className="font-semibold mb-4">Enter Keywords</h3>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    ref={manualInputRef}
                    type="text"
                    onKeyDown={handleManualKeyPress}
                    placeholder="Type a keyword and press Enter to add..."
                    className="flex-1 p-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    autoComplete="off"
                  />
                  <button
                    onClick={() => addManualKeyword()}
                    className="px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>

                {manualKeywords.length > 0 && (
                  <div className="p-3 border border-border rounded-lg bg-muted/50">
                    <div className="text-sm font-medium mb-2">Added Keywords ({manualKeywords.length}):</div>
                    <div className="flex flex-wrap gap-2">
                      {manualKeywords.map((keyword, index) => (
                        <div key={index} className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                          <span>{keyword}</span>
                          <button
                            onClick={() => removeManualKeyword(index)}
                            className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedKeywordOption === 'job-description' && (
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                Analyze Job Description
                {canUseAI('job-description') && <Sparkles className="h-4 w-4 text-primary" />}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here..."
                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    rows={6}
                  />
                </div>
                
                <button
                  onClick={handleJobDescriptionAnalysis}
                  disabled={!jobDescription.trim() || isExtractingKeywords}
                  className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isExtractingKeywords ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {canUseAI('job-description') ? 'Analyzing with AI...' : 'Extracting keywords...'}
                    </>
                  ) : (
                    <>
                      <Briefcase className="h-4 w-4" />
                      {canUseAI('job-description') ? 'Analyze with AI' : 'Extract Keywords'}
                    </>
                  )}
                </button>

                {extractionError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-700 dark:text-red-300">{extractionError}</span>
                  </div>
                )}

                {jobKeywords.length > 0 && (
                  <div className="p-3 border border-border rounded-lg bg-muted/50">
                    <div className="text-sm font-medium mb-2">
                      {canUseAI('job-description') ? 'AI-Extracted Keywords' : 'Extracted Keywords'} ({jobKeywords.length}):
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {jobKeywords.map((keyword, index) => (
                        <div key={index} className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                          {keyword}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        {onBack && (
          <button
            onClick={onBack}
            className="px-6 py-3 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
          >
            Back
          </button>
        )}
        
        <button
          onClick={handleProceed}
          disabled={!selectedKeywordOption}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
        >
          Continue with Keywords
        </button>
      </div>

      {/* AI Consent Modal */}
      <AIConsentModal
        isOpen={showConsentModal}
        onClose={() => setShowConsentModal(false)}
        onConsent={(consented) => {
          if (consented) {
            giveConsent('job-description');
          }
        }}
        analysisType="job-description"
        title="AI Job Description Analysis"
      />
      
      {/* AI Settings Modal */}
      <AISettings
        isOpen={showAISettings}
        onClose={() => setShowAISettings(false)}
        onPreferencesChange={updatePreferences}
        initialPreferences={aiPreferences}
      />
    </div>
  );
}