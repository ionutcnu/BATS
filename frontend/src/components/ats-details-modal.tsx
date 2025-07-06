'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Target,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  FileText,
  Eye,
  Lightbulb,
  Calendar,
  BarChart3,
  Download,
  RefreshCw,
  Info,
  Star,
  Zap,
  Bug,
  Clipboard
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ATSScore {
  overall: number;
  keywordMatch: number;
  formatting: number;
  readability: number;
  grade: string;
  description: string;
}

interface ATSAnalysis {
  score: ATSScore;
  foundKeywords: string[];
  missingKeywords: string[];
  suggestions: any[];
  issues: any[];
  analyzedAt?: string;
}

interface ATSDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: ATSAnalysis;
  fileName?: string;
  onReanalyze?: () => void;
  onDownloadReport?: () => void;
  isLoading?: boolean;
}

export function ATSDetailsModal({
  isOpen,
  onClose,
  analysis,
  fileName,
  onReanalyze,
  onDownloadReport,
  isLoading = false
}: ATSDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'keywords' | 'suggestions' | 'issues'>('overview');
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900 border-green-200 dark:border-green-800';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-800';
    return 'bg-red-100 dark:bg-red-900 border-red-200 dark:border-red-800';
  };

  const getGradeIcon = (grade: string) => {
    switch (grade.toLowerCase()) {
      case 'excellent':
        return <Star className="h-6 w-6 text-green-500" />;
      case 'good':
        return <TrendingUp className="h-6 w-6 text-blue-500" />;
      case 'fair':
        return <AlertCircle className="h-6 w-6 text-yellow-500" />;
      default:
        return <AlertCircle className="h-6 w-6 text-red-500" />;
    }
  };

  const copyKeyword = async (keyword: string) => {
    try {
      await navigator.clipboard.writeText(keyword);
      setCopiedKeyword(keyword);
      setTimeout(() => setCopiedKeyword(null), 2000);
    } catch (err) {
      console.error('Failed to copy keyword');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recently';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'keywords', label: 'Keywords', icon: Target },
    { id: 'suggestions', label: 'Suggestions', icon: Lightbulb },
    { id: 'issues', label: 'Issues', icon: Bug }
  ];

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
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-background border border-border rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-background border-b border-border p-6 rounded-t-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center border-2",
                    getScoreBgColor(analysis.score.overall)
                  )}>
                    <span className={cn(
                      "text-xl font-bold",
                      getScoreColor(analysis.score.overall)
                    )}>
                      {analysis.score.overall}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">ATS Analysis Report</h2>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                      {fileName && (
                        <div className="flex items-center space-x-1">
                          <FileText className="h-3 w-3" />
                          <span>{fileName}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Analyzed {formatDate(analysis.analyzedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {onDownloadReport && (
                    <button
                      onClick={onDownloadReport}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      title="Download Report"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                  {onReanalyze && (
                    <button
                      onClick={onReanalyze}
                      disabled={isLoading}
                      className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
                      title="Re-analyze"
                    >
                      <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 mt-6 bg-muted p-1 rounded-lg">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      activeTab === tab.id
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Score Breakdown */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Score Breakdown</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-card border rounded-lg">
                        <div className={cn(
                          "text-3xl font-bold mb-1",
                          getScoreColor(analysis.score.overall)
                        )}>
                          {analysis.score.overall}
                        </div>
                        <div className="text-sm text-muted-foreground">Overall</div>
                        <div className="mt-2">{getGradeIcon(analysis.score.grade)}</div>
                      </div>
                      <div className="text-center p-4 bg-card border rounded-lg">
                        <div className={cn(
                          "text-3xl font-bold mb-1",
                          getScoreColor(analysis.score.keywordMatch)
                        )}>
                          {analysis.score.keywordMatch}%
                        </div>
                        <div className="text-sm text-muted-foreground">Keywords</div>
                      </div>
                      <div className="text-center p-4 bg-card border rounded-lg">
                        <div className={cn(
                          "text-3xl font-bold mb-1",
                          getScoreColor(analysis.score.formatting)
                        )}>
                          {analysis.score.formatting}%
                        </div>
                        <div className="text-sm text-muted-foreground">Formatting</div>
                      </div>
                      <div className="text-center p-4 bg-card border rounded-lg">
                        <div className={cn(
                          "text-3xl font-bold mb-1",
                          getScoreColor(analysis.score.readability)
                        )}>
                          {analysis.score.readability}%
                        </div>
                        <div className="text-sm text-muted-foreground">Readability</div>
                      </div>
                    </div>
                  </div>

                  {/* Grade Description */}
                  <div className={cn(
                    "p-4 border rounded-lg",
                    getScoreBgColor(analysis.score.overall)
                  )}>
                    <div className="flex items-start space-x-3">
                      {getGradeIcon(analysis.score.grade)}
                      <div>
                        <h4 className={cn(
                          "font-semibold",
                          getScoreColor(analysis.score.overall)
                        )}>
                          {analysis.score.grade} ATS Compatibility
                        </h4>
                        <p className={cn(
                          "text-sm mt-1",
                          getScoreColor(analysis.score.overall)
                        )}>
                          {analysis.score.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <h4 className="font-medium text-green-800 dark:text-green-200">
                          Strengths
                        </h4>
                      </div>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {analysis.foundKeywords.length}
                      </div>
                      <div className="text-sm text-green-700 dark:text-green-300">
                        Keywords found
                      </div>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                        <h4 className="font-medium text-orange-800 dark:text-orange-200">
                          Improvements
                        </h4>
                      </div>
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {analysis.missingKeywords.length + analysis.issues.length}
                      </div>
                      <div className="text-sm text-orange-700 dark:text-orange-300">
                        Areas to improve
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'keywords' && (
                <div className="space-y-6">
                  {/* Found Keywords */}
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <h3 className="text-lg font-semibold">Found Keywords ({analysis.foundKeywords.length})</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {analysis.foundKeywords.map((keyword, index) => (
                        <button
                          key={index}
                          onClick={() => copyKeyword(keyword)}
                          className="group px-3 py-1.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg text-sm hover:bg-green-200 dark:hover:bg-green-800 transition-colors cursor-pointer relative"
                        >
                          {keyword}
                          {copiedKeyword === keyword ? (
                            <CheckCircle className="h-3 w-3 inline ml-1" />
                          ) : (
                            <Clipboard className="h-3 w-3 inline ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Missing Keywords */}
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                      <h3 className="text-lg font-semibold">Missing Keywords ({analysis.missingKeywords.length})</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {analysis.missingKeywords.map((keyword, index) => (
                        <button
                          key={index}
                          onClick={() => copyKeyword(keyword)}
                          className="group px-3 py-1.5 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-lg text-sm hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors cursor-pointer relative"
                        >
                          {keyword}
                          {copiedKeyword === keyword ? (
                            <CheckCircle className="h-3 w-3 inline ml-1" />
                          ) : (
                            <Clipboard className="h-3 w-3 inline ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'suggestions' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Lightbulb className="h-5 w-5 text-blue-500" />
                    <h3 className="text-lg font-semibold">Optimization Suggestions ({analysis.suggestions.length})</h3>
                  </div>
                  {analysis.suggestions.length > 0 ? (
                    <div className="space-y-3">
                      {analysis.suggestions.map((suggestion, index) => (
                        <div key={index} className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <Zap className="h-4 w-4 text-blue-500 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-blue-800 dark:text-blue-200">
                                {suggestion.title || 'Optimization Suggestion'}
                              </h4>
                              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                {suggestion.description || suggestion}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No specific suggestions available at this time.</p>
                      <p className="text-sm">Your resume is performing well overall!</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'issues' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Bug className="h-5 w-5 text-red-500" />
                    <h3 className="text-lg font-semibold">Issues to Fix ({analysis.issues.length})</h3>
                  </div>
                  {analysis.issues.length > 0 ? (
                    <div className="space-y-3">
                      {analysis.issues.map((issue, index) => (
                        <div key={index} className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-red-800 dark:text-red-200">
                                {issue.title || 'Issue Detected'}
                              </h4>
                              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                {issue.description || issue}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                      <p>No issues detected!</p>
                      <p className="text-sm">Your resume meets ATS standards.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-background border-t border-border p-4 rounded-b-xl">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Tip: Click on keywords to copy them to your clipboard
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
                  >
                    Close
                  </button>
                  {onReanalyze && (
                    <button
                      onClick={() => {
                        onReanalyze();
                        onClose();
                      }}
                      disabled={isLoading}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                      <span>Re-analyze</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}