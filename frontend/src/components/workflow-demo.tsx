'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle,
  Shield,
  Zap,
  Target,
  Upload,
  Download,
  FileText,
  Star,
  AlertCircle,
  TrendingUp,
  Users,
  Clock,
} from 'lucide-react';

interface WorkflowDemoProps {
  className?: string;
}

export function WorkflowDemo({ className }: WorkflowDemoProps) {
  const [activeTab, setActiveTab] = useState<'scan' | 'optimize'>('scan');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const mockAnalysisResult = {
    score: { overall: 67, keywordMatch: 45, formatting: 85, readability: 72 },
    foundKeywords: ['Quality Assurance', 'Testing', 'Bug Tracking', 'Manual Testing'],
    missingKeywords: ['Automated Testing', 'Selenium', 'API Testing', 'Performance Testing', 'CI/CD'],
    suggestions: [
      { title: 'Add Technical Skills', description: 'Include automation tools like Selenium, Cypress' },
      { title: 'Enhance Keywords', description: 'Add more QA-specific terminology' },
      { title: 'Improve Format', description: 'Use bullet points for better ATS parsing' }
    ]
  };

  const handleScanDemo = () => {
    if (termsAccepted) {
      setShowResults(true);
    }
  };

  const ScanWorkflowDemo = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">FREE Scan Workflow</h3>
        <p className="text-muted-foreground">Get instant ATS compatibility analysis</p>
      </div>

      {/* Step 1: Terms & Upload */}
      <div className="bg-card border rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
          <span className="font-medium">Accept Terms & Upload Resume</span>
        </div>
        
        <div className="flex items-center gap-3 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="w-4 h-4 rounded border-2 border-muted-foreground/30 bg-background checked:bg-primary checked:border-primary"
            />
            <span className="text-muted-foreground">I agree to resume processing for analysis</span>
          </label>
        </div>

        <button
          onClick={handleScanDemo}
          disabled={!termsAccepted}
          className={`w-full px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
            termsAccepted
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          <Shield className="h-4 w-4" />
          Scan My Resume (FREE)
        </button>
      </div>

      {/* Step 2: Results */}
      {showResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border rounded-lg p-6 space-y-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
            <span className="font-medium">FREE Analysis Results</span>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div>
              <div className="text-2xl font-bold text-primary">{mockAnalysisResult.score.overall}/100</div>
              <div className="text-xs text-muted-foreground">ATS Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{mockAnalysisResult.foundKeywords.length}</div>
              <div className="text-xs text-muted-foreground">Keywords Found</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{mockAnalysisResult.missingKeywords.length}</div>
              <div className="text-xs text-muted-foreground">Missing Keywords</div>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Missing Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {mockAnalysisResult.missingKeywords.map((keyword, index) => (
                <span key={index} className="px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 rounded text-sm">
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 text-center">
            <h4 className="font-medium mb-2">Want to Fix These Issues?</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Upgrade to our optimization service to add missing keywords and improve your ATS score.
            </p>
            <button
              onClick={() => setActiveTab('optimize')}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              🚀 Optimize My Resume
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );

  const OptimizeWorkflowDemo = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Optimization Workflow</h3>
        <p className="text-muted-foreground">Get full resume optimization with AI-powered keywords</p>
      </div>

      {/* Step 1: Upload & Analyze */}
      <div className="bg-card border rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
          <span className="font-medium">Upload & Analyze Resume</span>
        </div>
        <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Upload your resume for analysis</p>
        </div>
      </div>

      {/* Step 2: Choose Optimization Method */}
      <div className="bg-card border rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
          <span className="font-medium">Choose Optimization Method</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
            <div className="text-center">
              <Zap className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h4 className="font-medium mb-1">AI Analysis</h4>
              <p className="text-xs text-muted-foreground">Smart keyword extraction from job descriptions</p>
            </div>
          </div>
          <div className="border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
            <div className="text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-medium mb-1">Categories</h4>
              <p className="text-xs text-muted-foreground">Pre-built keyword sets for job roles</p>
            </div>
          </div>
          <div className="border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
            <div className="text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h4 className="font-medium mb-1">Manual</h4>
              <p className="text-xs text-muted-foreground">Custom keyword input for specific needs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Step 3: Download */}
      <div className="bg-card border rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
          <span className="font-medium">Download Optimized Resume</span>
        </div>
        <div className="text-center">
          <Download className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Get your ATS-optimized resume ready for applications</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`max-w-4xl mx-auto p-6 ${className}`}>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">🎯 New Workflow Demo</h2>
        <p className="text-muted-foreground">Experience our enhanced two-button workflow</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => setActiveTab('scan')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'scan'
              ? 'border-b-2 border-green-500 text-green-600'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Shield className="inline mr-2 h-4 w-4" />
          Scan Workflow (FREE)
        </button>
        <button
          onClick={() => setActiveTab('optimize')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'optimize'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Zap className="inline mr-2 h-4 w-4" />
          Optimize Workflow
        </button>
      </div>

      {/* Content */}
      <div className="min-h-96">
        {activeTab === 'scan' ? <ScanWorkflowDemo /> : <OptimizeWorkflowDemo />}
      </div>

      {/* Benefits */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
          <h4 className="font-medium mb-1">98% Success Rate</h4>
          <p className="text-xs text-muted-foreground">Higher interview callback rates</p>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
          <h4 className="font-medium mb-1">15s Processing</h4>
          <p className="text-xs text-muted-foreground">Lightning-fast optimization</p>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
          <h4 className="font-medium mb-1">10K+ Happy Users</h4>
          <p className="text-xs text-muted-foreground">Trusted by professionals worldwide</p>
        </div>
      </div>
    </div>
  );
}