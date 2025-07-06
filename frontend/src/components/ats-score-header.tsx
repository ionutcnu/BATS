'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  RefreshCw,
  Eye,
  EyeOff,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Info,
  BarChart3,
  FileText,
  Calendar,
  Zap,
  Briefcase,
  Award
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

interface JobRoleAnalysis {
  primaryRole: string;
  secondaryRoles: string[];
  industry: string;
  seniorityLevel: string;
  confidence: number;
  roleConfidenceScores: RoleConfidenceScore[];
  recommendedCategories: string[];
  reasoning: string;
}

interface RoleConfidenceScore {
  role: string;
  confidence: number;
  reasoning: string;
}

interface ATSAnalysis {
  score: ATSScore;
  foundKeywords: string[];
  missingKeywords: string[];
  suggestions: any[];
  issues: any[];
  analyzedAt?: string;
  jobRoleAnalysis?: JobRoleAnalysis;
}

interface ATSScoreHeaderProps {
  analysis?: ATSAnalysis | null;
  fileName?: string;
  onReanalyze?: () => void;
  onViewDetails?: () => void;
  isLoading?: boolean;
  className?: string;
  showDetailed?: boolean;
}

export function ATSScoreHeader({
  analysis,
  fileName,
  onReanalyze,
  onViewDetails,
  isLoading = false,
  className,
  showDetailed = false
}: ATSScoreHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(showDetailed);
  const [showTooltip, setShowTooltip] = useState(false);

  if (!analysis) {
    return (
      <div className={cn("bg-muted/50 border border-border rounded-lg p-4", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Target className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <h3 className="font-medium text-muted-foreground">No ATS Analysis</h3>
              <p className="text-sm text-muted-foreground">Upload and analyze a resume to see ATS score</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-muted-foreground">--</div>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900';
    return 'bg-red-100 dark:bg-red-900';
  };

  const getGradeIcon = (grade: string) => {
    switch (grade.toLowerCase()) {
      case 'excellent':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'good':
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'fair':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-card border border-border rounded-lg shadow-sm",
        className
      )}
    >
      {/* Main Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Score Circle */}
            <div className="relative">
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center",
                getScoreBgColor(analysis.score.overall)
              )}>
                <span className={cn(
                  "text-xl font-bold",
                  getScoreColor(analysis.score.overall)
                )}>
                  {analysis.score.overall}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1">
                {getGradeIcon(analysis.score.grade)}
              </div>
            </div>

            {/* Score Info */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-lg">ATS Score: {analysis.score.grade}</h3>
                <button
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  className="relative"
                >
                  <Info className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  {showTooltip && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover border rounded-lg shadow-lg text-sm whitespace-nowrap z-10">
                      {analysis.score.description}
                    </div>
                  )}
                </button>
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
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
              {analysis.jobRoleAnalysis && (
                <div className="flex items-center space-x-1 text-sm">
                  <Briefcase className="h-3 w-3 text-blue-500" />
                  <span className="font-medium text-blue-700 dark:text-blue-300">
                    {analysis.jobRoleAnalysis.primaryRole}
                  </span>
                  <span className="text-muted-foreground">
                    ({Math.round(analysis.jobRoleAnalysis.confidence * 100)}% confidence)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title={isExpanded ? "Hide details" : "Show details"}
            >
              {isExpanded ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>

            {onViewDetails && (
              <button
                onClick={onViewDetails}
                className="px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                <BarChart3 className="h-4 w-4 inline mr-1" />
                Details
              </button>
            )}

            {onReanalyze && (
              <button
                onClick={onReanalyze}
                disabled={isLoading}
                className="px-3 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                <span>{isLoading ? 'Analyzing...' : 'Re-analyze'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border"
          >
            <div className="p-4 space-y-4">
              {/* Job Role Analysis */}
              {analysis.jobRoleAnalysis && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Detected Job Role
                    </h4>
                    <span className="text-xs bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                      {Math.round(analysis.jobRoleAnalysis.confidence * 100)}% confidence
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-blue-900 dark:text-blue-100">Primary Role</div>
                      <div className="text-blue-700 dark:text-blue-300">{analysis.jobRoleAnalysis.primaryRole}</div>
                    </div>
                    <div>
                      <div className="font-medium text-blue-900 dark:text-blue-100">Seniority</div>
                      <div className="text-blue-700 dark:text-blue-300">{analysis.jobRoleAnalysis.seniorityLevel}</div>
                    </div>
                    <div>
                      <div className="font-medium text-blue-900 dark:text-blue-100">Industry</div>
                      <div className="text-blue-700 dark:text-blue-300">{analysis.jobRoleAnalysis.industry}</div>
                    </div>
                  </div>
                  {analysis.jobRoleAnalysis.secondaryRoles.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                      <div className="font-medium text-blue-900 dark:text-blue-100 text-sm mb-2">Related Roles</div>
                      <div className="flex flex-wrap gap-1">
                        {analysis.jobRoleAnalysis.secondaryRoles.map((role, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-xs"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Score Breakdown */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className={cn(
                    "text-2xl font-bold",
                    getScoreColor(analysis.score.keywordMatch)
                  )}>
                    {analysis.score.keywordMatch}%
                  </div>
                  <div className="text-sm text-muted-foreground">Keywords</div>
                </div>
                <div className="text-center">
                  <div className={cn(
                    "text-2xl font-bold",
                    getScoreColor(analysis.score.formatting)
                  )}>
                    {analysis.score.formatting}%
                  </div>
                  <div className="text-sm text-muted-foreground">Formatting</div>
                </div>
                <div className="text-center">
                  <div className={cn(
                    "text-2xl font-bold",
                    getScoreColor(analysis.score.readability)
                  )}>
                    {analysis.score.readability}%
                  </div>
                  <div className="text-sm text-muted-foreground">Readability</div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Found Keywords ({analysis.foundKeywords.length})
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {analysis.foundKeywords.slice(0, 8).map((keyword, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-xs"
                      >
                        {keyword}
                      </span>
                    ))}
                    {analysis.foundKeywords.length > 8 && (
                      <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs">
                        +{analysis.foundKeywords.length - 8} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    Missing Keywords ({analysis.missingKeywords.length})
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {analysis.missingKeywords.slice(0, 8).map((keyword, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded text-xs"
                      >
                        {keyword}
                      </span>
                    ))}
                    {analysis.missingKeywords.length > 8 && (
                      <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs">
                        +{analysis.missingKeywords.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center justify-center pt-4 border-t border-border">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Zap className="h-3 w-3" />
                    <span>{analysis.suggestions.length} suggestions</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{analysis.issues.length} issues</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}