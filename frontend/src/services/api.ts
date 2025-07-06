const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-api-domain.com' 
  : 'http://localhost:5000';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ProcessResponse {
  message: string;
  fileName: string;
  fileSize: number;
  downloadUrl: string;
}

export interface KeywordsResponse {
  keywords: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
}

export interface ATSAnalysis {
  score: {
    overall: number;
    keywordMatch: number;
    formatting: number;
    readability: number;
    grade: string;
    description: string;
  };
  foundKeywords: string[];
  missingKeywords: string[];
  suggestions: any[];
  issues: any[];
  jobRoleAnalysis?: JobRoleAnalysis;
}

export interface JobCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  keywords: string[];
  popularityScore: number;
}

export interface AIKeywordExtractionResult {
  success: boolean;
  errorMessage?: string;
  suggestedKeywords: string[];
  requiredSkills: string[];
  technicalSkills: string[];
  softSkills: string[];
  experienceRequirements: string[];
  industries: string[];
  jobTitles: string[];
  certifications: string[];
  jobLevel?: string;
  jobType?: string;
  relevanceScore?: number;
  keywordFrequency: Record<string, number>;
}

export interface AIHealthResponse {
  aiServiceAvailable: boolean;
  timestamp: string;
}

export interface JobRoleAnalysis {
  primaryRole: string;
  secondaryRoles: string[];
  industry: string;
  seniorityLevel: string;
  confidence: number;
  roleConfidenceScores: RoleConfidenceScore[];
  recommendedCategories: string[];
  reasoning: string;
}

export interface RoleConfidenceScore {
  role: string;
  confidence: number;
  reasoning: string;
}

export interface JobRoleAnalysisResult {
  success: boolean;
  errorMessage?: string;
  analysis?: JobRoleAnalysis;
}

export interface SmartCategoriesResponse {
  success: boolean;
  jobRoleAnalysis?: JobRoleAnalysis;
  categories: JobCategory[];
  message: string;
  error?: string;
}

export interface AIResumeAnalysisResult {
  atsAnalysis: ATSAnalysis;
  aiSuggestions?: AIKeywordExtractionResult;
  aiError?: string;
  improvements: {
    missingKeywords: string[];
    skillsToAdd: string[];
    recommendedCertifications: string[];
    experienceGaps: string[];
  };
  timestamp: string;
}

// Simple Mode Interfaces
export interface RoleOption {
  key: string;
  displayName: string;
  description: string;
}

export interface SimpleAnalysisResult {
  analysis: {
    score: {
      overall: number;
      keywordMatch: number;
      formatting: number;
      readability: number;
      grade: string;
      description: string;
    };
    foundKeywords: string[];
    missingKeywords: string[];
    suggestions: Array<{
      type: string;
      title: string;
      description: string;
      priority: string;
      keywords: string[];
    }>;
    issues: Array<{
      type: string;
      title: string;
      description: string;
      severity: string;
    }>;
    analysisDate: string;
    analysisType: string;
    selectedRole: string;
    roleDisplayName: string;
  };
  message: string;
  timestamp: string;
}

export interface RoleKeywordsResponse {
  role: string;
  roleInfo: {
    displayName: string;
    description: string;
  };
  keywords: {
    primary: string[];
    technical: string[];
    process: string[];
    tools: string[];
  };
  totalKeywords: number;
}

export interface TextExtractionResponse {
  extractedText: string;
  wordCount: number;
  characterCount: number;
}

class ApiService {
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } else {
            const textError = await response.text();
            errorMessage = textError || errorMessage;
          }
        } catch (parseError) {
          // If we can't parse the error, use the status text
          errorMessage = response.statusText || errorMessage;
        }
        
        return {
          success: false,
          error: errorMessage,
        };
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return {
          success: false,
          error: 'Server returned non-JSON response',
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private async handleFileResponse(response: Response): Promise<ApiResponse<Blob>> {
    try {
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } else {
            const textError = await response.text();
            errorMessage = textError || errorMessage;
          }
        } catch (parseError) {
          errorMessage = response.statusText || errorMessage;
        }
        
        return {
          success: false,
          error: errorMessage,
        };
      }

      const blob = await response.blob();
      return {
        success: true,
        data: blob,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async uploadAndOptimize(file: File): Promise<ApiResponse<Blob>> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      return await this.handleFileResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  async processResume(file: File, jobDescription?: string): Promise<ApiResponse<ProcessResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    if (jobDescription) {
      formData.append('jobDescription', jobDescription);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/process`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      return await this.handleResponse<ProcessResponse>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  async getKeywords(): Promise<ApiResponse<KeywordsResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/keywords`, {
        method: 'GET',
        credentials: 'include',
      });

      return await this.handleResponse<KeywordsResponse>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  async checkHealth(): Promise<ApiResponse<HealthResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`, {
        method: 'GET',
        credentials: 'include',
      });

      return await this.handleResponse<HealthResponse>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  async analyzeResume(file: File): Promise<ApiResponse<ATSAnalysis>> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      return await this.handleResponse<ATSAnalysis>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  async getCategories(): Promise<ApiResponse<JobCategory[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`, {
        method: 'GET',
        credentials: 'include',
      });

      return await this.handleResponse<JobCategory[]>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  async searchCategories(query: string): Promise<ApiResponse<JobCategory[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        credentials: 'include',
      });

      return await this.handleResponse<JobCategory[]>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  async getCategoryKeywords(categoryId: string): Promise<ApiResponse<{categoryId: string; keywords: string[]}>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories/${categoryId}/keywords`, {
        method: 'GET',
        credentials: 'include',
      });

      return await this.handleResponse<{categoryId: string; keywords: string[]}>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  async processResumeWithKeywords(file: File, keywords: string[], jobDescription?: string): Promise<ApiResponse<Blob>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('keywords', JSON.stringify(keywords));
    if (jobDescription) {
      formData.append('jobDescription', jobDescription);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/process`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      return await this.handleFileResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  async extractKeywordsFromJobDescription(jobDescription: string, resumeText?: string): Promise<ApiResponse<AIKeywordExtractionResult>> {
    const formData = new FormData();
    formData.append('jobDescription', jobDescription);
    if (resumeText) {
      formData.append('resumeText', resumeText);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/extract-keywords`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      return await this.handleResponse<AIKeywordExtractionResult>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  async checkAIHealth(): Promise<ApiResponse<AIHealthResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/health`, {
        method: 'GET',
        credentials: 'include',
      });

      return await this.handleResponse<AIHealthResponse>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  async analyzeResumeWithAI(resumeText: string, jobDescription?: string): Promise<ApiResponse<AIResumeAnalysisResult>> {
    const formData = new FormData();
    formData.append('resumeText', resumeText);
    if (jobDescription) {
      formData.append('jobDescription', jobDescription);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze-resume`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      return await this.handleResponse<AIResumeAnalysisResult>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  async analyzeJobRole(resumeText: string): Promise<ApiResponse<JobRoleAnalysisResult>> {
    const formData = new FormData();
    formData.append('resumeText', resumeText);

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze-job-role`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      return await this.handleResponse<JobRoleAnalysisResult>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  async getSmartCategories(jobRole: string, confidence?: number): Promise<ApiResponse<{jobRole: string; confidence: number; categories: JobCategory[]; message: string}>> {
    try {
      const params = new URLSearchParams({
        jobRole,
        ...(confidence !== undefined && { confidence: confidence.toString() })
      });

      const response = await fetch(`${API_BASE_URL}/api/categories/smart?${params}`, {
        method: 'GET',
        credentials: 'include',
      });

      return await this.handleResponse<{jobRole: string; confidence: number; categories: JobCategory[]; message: string}>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  async getSmartCategoriesFromAnalysis(resumeText: string): Promise<ApiResponse<SmartCategoriesResponse>> {
    const formData = new FormData();
    formData.append('resumeText', resumeText);

    try {
      const response = await fetch(`${API_BASE_URL}/api/categories/smart-analysis`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      return await this.handleResponse<SmartCategoriesResponse>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  // Text extraction from PDF
  async extractTextFromPdf(file: File): Promise<ApiResponse<TextExtractionResponse>> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/extract-text`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      return await this.handleResponse<TextExtractionResponse>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  // Simple Mode API Methods
  async getAvailableRoles(): Promise<ApiResponse<{ roles: RoleOption[]; message: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/simple/roles`, {
        method: 'GET',
        credentials: 'include',
      });

      return await this.handleResponse<{ roles: RoleOption[]; message: string }>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  async analyzeResumeByRole(file: File, selectedRole: string): Promise<ApiResponse<SimpleAnalysisResult>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('selectedRole', selectedRole);

    try {
      const response = await fetch(`${API_BASE_URL}/api/simple/analyze`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      return await this.handleResponse<SimpleAnalysisResult>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  async getRoleKeywords(role: string): Promise<ApiResponse<RoleKeywordsResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/simple/keywords/${role}`, {
        method: 'GET',
        credentials: 'include',
      });

      return await this.handleResponse<RoleKeywordsResponse>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  async getKeywordsByCategory(role: string, category: string): Promise<ApiResponse<{ role: string; category: string; keywords: string[]; count: number }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/simple/keywords/${role}/${category}`, {
        method: 'GET',
        credentials: 'include',
      });

      return await this.handleResponse<{ role: string; category: string; keywords: string[]; count: number }>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  // Helper function to download file
  downloadFile(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const apiService = new ApiService();