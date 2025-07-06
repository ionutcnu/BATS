'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Lock,
  Trash2,
  Bot,
  FileText,
  Eye,
  AlertCircle,
  Check,
  X,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConsent: (consented: boolean) => void;
  analysisType: 'resume' | 'job-description';
  title?: string;
}

export function AIConsentModal({
  isOpen,
  onClose,
  onConsent,
  analysisType,
  title = 'AI Analysis Consent'
}: AIConsentModalProps) {
  const [showDetails, setShowDetails] = useState(false);

  const handleConsent = (consented: boolean) => {
    onConsent(consented);
    onClose();
  };

  const dataTypes = analysisType === 'resume' 
    ? [
        'Resume text content and formatting',
        'Skills and experience information',
        'Job titles and employment history',
        'Education and certification details',
        'Contact information (for optimization suggestions)'
      ]
    : [
        'Job description text content',
        'Required skills and qualifications',
        'Company information and role details',
        'Experience requirements',
        'Job responsibilities and duties'
      ];

  const benefits = analysisType === 'resume'
    ? [
        'ATS compatibility score and recommendations',
        'Keyword optimization suggestions',
        'Skills gap analysis',
        'Format and structure improvements',
        'Industry-specific optimization'
      ]
    : [
        'Smart keyword extraction',
        'Skills and requirements identification',
        'Experience level detection',
        'Industry-specific terminology',
        'ATS-optimized keyword suggestions'
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
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background border border-border rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-background border-b border-border p-6 rounded-t-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-lg">
                    <Bot className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {analysisType === 'resume' ? 'Resume Analysis' : 'Job Description Analysis'}
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
              {/* Main Message */}
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-full flex items-center justify-center">
                  <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold">
                  Enhance Your {analysisType === 'resume' ? 'Resume' : 'Job Analysis'} with AI
                </h3>
                <p className="text-muted-foreground">
                  We use advanced AI to analyze your {analysisType === 'resume' ? 'resume' : 'job description'} and provide 
                  intelligent optimization suggestions. Your privacy and data security are our top priorities.
                </p>
              </div>

              {/* Privacy Assurance */}
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Lock className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-800 dark:text-green-200">
                      🔒 Your Data is Safe & Secure
                    </h4>
                    <ul className="text-sm text-green-700 dark:text-green-300 mt-2 space-y-1">
                      <li>• No data is stored on our servers</li>
                      <li>• All analysis happens in real-time</li>
                      <li>• Data is automatically deleted after processing</li>
                      <li>• No third-party data sharing</li>
                      <li>• GDPR & privacy law compliant</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* What We Analyze */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center justify-between w-full p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">What data will be analyzed?</span>
                  </div>
                  <motion.div
                    animate={{ rotate: showDetails ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Info className="h-4 w-4" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-card border rounded-lg p-4 space-y-4">
                        <div>
                          <h5 className="font-medium mb-2">📄 Data Processed:</h5>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {dataTypes.map((item, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <div className="w-1 h-1 bg-primary rounded-full mt-2"></div>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h5 className="font-medium mb-2">🎯 AI Analysis Provides:</h5>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {benefits.map((item, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <Check className="w-3 h-3 text-green-500 mt-0.5" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Data Deletion Notice */}
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Trash2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-200">
                      Automatic Data Deletion
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Your {analysisType === 'resume' ? 'resume' : 'job description'} data is processed 
                      temporarily and permanently deleted within seconds after analysis completion.
                    </p>
                  </div>
                </div>
              </div>

              {/* Alternative Option */}
              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                      Prefer Manual Analysis?
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      You can always choose to skip AI analysis and use our basic keyword extraction 
                      instead. No data will be processed externally.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 bg-background border-t border-border p-6 rounded-b-xl">
              <div className="flex space-x-3">
                <button
                  onClick={() => handleConsent(false)}
                  className="flex-1 px-4 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
                >
                  Skip AI Analysis
                </button>
                <button
                  onClick={() => handleConsent(true)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Bot className="h-4 w-4" />
                  Consent to AI Analysis
                </button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-3">
                By consenting, you agree to our AI processing terms and confirm you understand 
                how your data will be used and deleted.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}