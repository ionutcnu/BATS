import { apiService, ATSAnalysis } from '@/services/api';

export interface ProcessingProgress {
  step: string;
  progress: number;
  message: string;
}

export interface WorkflowResult {
  success: boolean;
  data?: any;
  error?: string;
  downloadUrl?: string;
}

export class WorkflowService {
  private static instance: WorkflowService;
  private progressCallback?: (progress: ProcessingProgress) => void;

  private constructor() {}

  static getInstance(): WorkflowService {
    if (!WorkflowService.instance) {
      WorkflowService.instance = new WorkflowService();
    }
    return WorkflowService.instance;
  }

  setProgressCallback(callback: (progress: ProcessingProgress) => void) {
    this.progressCallback = callback;
  }

  private updateProgress(step: string, progress: number, message: string) {
    if (this.progressCallback) {
      this.progressCallback({ step, progress, message });
    }
  }

  async analyzeResume(file: File): Promise<WorkflowResult> {
    try {
      this.updateProgress('analyzing', 0, 'Starting analysis...');
      
      const formData = new FormData();
      formData.append('file', file);
      
      this.updateProgress('analyzing', 30, 'Uploading file...');
      
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      this.updateProgress('analyzing', 70, 'Processing analysis...');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Analysis failed');
      }

      const analysisData = await response.json();
      this.updateProgress('analyzing', 100, 'Analysis complete!');

      return {
        success: true,
        data: {
          ...analysisData,
          analyzedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze resume'
      };
    }
  }

  async processResumeWithKeywords(file: File, keywords: string[]): Promise<WorkflowResult> {
    try {
      this.updateProgress('preparing', 10, '🚀 Starting resume enhancement process...');
      
      // Step 1: Prepare and send data
      this.updateProgress('embedding', 20, '📝 Strategically placing ATS-optimized keywords...');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('keywords', JSON.stringify(keywords));

      const response = await fetch('http://localhost:5000/api/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Processing failed');
      }

      this.updateProgress('generating', 60, '✨ Creating your enhanced resume...');

      const blob = await response.blob();
      
      // Create download URL
      const downloadUrl = URL.createObjectURL(blob);
      
      // Create a File object from the blob for analysis
      const optimizedFile = new File([blob], `optimized_${file.name}`, { type: 'application/pdf' });
      
      // Analyze the optimized resume
      this.updateProgress('analyzing', 80, '🔍 Analyzing your optimized resume...');

      const analyzeFormData = new FormData();
      analyzeFormData.append('file', optimizedFile);
      
      const analyzeResponse = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        body: analyzeFormData,
        credentials: 'include',
      });

      let optimizedAnalysis = null;
      if (analyzeResponse.ok) {
        const optimizedAnalysisData = await analyzeResponse.json();
        optimizedAnalysis = {
          ...optimizedAnalysisData,
          analyzedAt: new Date().toISOString()
        };
      }

      this.updateProgress('complete', 100, '✅ Resume optimization complete!');

      return {
        success: true,
        data: {
          optimizedAnalysis,
          optimizedFile,
          downloadUrl
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process resume'
      };
    }
  }

  async downloadOptimizedResume(downloadUrl: string, fileName: string): Promise<void> {
    try {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      throw new Error('Failed to download resume');
    }
  }

  async fetchCategoryKeywords(categoryId: string): Promise<string[]> {
    try {
      const response = await fetch(`http://localhost:5000/api/categories/${categoryId}/keywords`);
      if (response.ok) {
        const data = await response.json();
        return data.keywords || [];
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch category keywords:', error);
      return [];
    }
  }

  async extractKeywordsFromJobDescription(jobDescription: string, resumeText?: string): Promise<WorkflowResult> {
    try {
      const response = await apiService.extractKeywords(jobDescription, resumeText);
      return {
        success: response.success,
        data: response.data,
        error: response.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to extract keywords'
      };
    }
  }

  async checkAIHealth(): Promise<boolean> {
    try {
      const response = await apiService.checkAIHealth();
      return response.success && response.data?.aiServiceAvailable === true;
    } catch (error) {
      console.error('AI health check failed:', error);
      return false;
    }
  }

  validateFile(file: File): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    if (file.type !== 'application/pdf') {
      return { valid: false, error: 'Only PDF files are supported' };
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return { valid: false, error: 'File size must be less than 10MB' };
    }

    return { valid: true };
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  generateOptimizedFileName(originalFileName: string): string {
    const nameWithoutExtension = originalFileName.replace(/\.[^/.]+$/, '');
    const timestamp = new Date().toISOString().slice(0, 10);
    return `${nameWithoutExtension}_optimized_${timestamp}.pdf`;
  }

  cleanup(downloadUrl?: string) {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }
  }
}

export const workflowService = WorkflowService.getInstance();