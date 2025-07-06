'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ATSAnalysis } from '@/services/api';
import { ATSScoreHeader } from '@/components/ats-score-header';
import { ATSDetailsModal } from '@/components/ats-details-modal';

interface ScanResultsStepProps {
  analysisResult: ATSAnalysis | null;
  fileName?: string;
  isLoading: boolean;
  showATSModal: boolean;
  onViewDetails: () => void;
  onCloseModal: () => void;
  onReanalyze: () => void;
  onOptimize: () => void;
  onScanAnother: () => void;
}

export function ScanResultsStep({
  analysisResult,
  fileName,
  isLoading,
  showATSModal,
  onViewDetails,
  onCloseModal,
  onReanalyze,
  onOptimize,
  onScanAnother
}: ScanResultsStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">🎯 Free ATS Analysis Complete!</h2>
        <p className="text-muted-foreground">Here's how your resume performs with ATS systems</p>
      </div>

      {analysisResult && (
        <div className="space-y-4">
          <ATSScoreHeader
            analysis={analysisResult}
            fileName={fileName}
            onReanalyze={onReanalyze}
            onViewDetails={onViewDetails}
            isLoading={isLoading}
            showDetailed={true}
          />

          <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-6 text-center">
            <h3 className="text-xl font-semibold mb-2">Want to Fix These Issues?</h3>
            <p className="text-muted-foreground mb-4">
              We can optimize your resume with the missing keywords and fix the identified issues.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={onOptimize}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                🚀 Optimize My Resume
              </button>
              <button
                onClick={onScanAnother}
                className="px-6 py-3 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
              >
                Scan Another Resume
              </button>
            </div>
          </div>
        </div>
      )}

      {showATSModal && (
        <ATSDetailsModal
          isOpen={showATSModal}
          onClose={onCloseModal}
          analysis={analysisResult}
          fileName={fileName}
          onReanalyze={() => {
            onCloseModal();
            onReanalyze();
          }}
          isLoading={isLoading}
        />
      )}
    </motion.div>
  );
}