'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Calendar, 
  FileText, 
  Trash2, 
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  Eye,
  Copy,
  Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProcessedFile {
  id: string;
  originalName: string;
  processedName: string;
  processedAt: Date;
  fileSize: number;
  keywords: string[];
  status: 'completed' | 'failed' | 'processing';
  downloadUrl?: string;
  blob?: Blob;
}

interface ProcessingHistoryProps {
  className?: string;
  maxItems?: number;
  showSearch?: boolean;
  showStats?: boolean;
}

export function ProcessingHistory({ 
  className, 
  maxItems = 50,
  showSearch = true,
  showStats = true
}: ProcessingHistoryProps) {
  const [history, setHistory] = useState<ProcessedFile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'failed'>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    loadHistoryFromStorage();
  }, []);

  const loadHistoryFromStorage = () => {
    try {
      const stored = localStorage.getItem('bats-processing-history');
      if (stored) {
        const parsedHistory = JSON.parse(stored).map((item: any) => ({
          ...item,
          processedAt: new Date(item.processedAt)
        }));
        setHistory(parsedHistory);
      }
    } catch (error) {
      console.error('Failed to load processing history:', error);
    }
  };

  const saveHistoryToStorage = (newHistory: ProcessedFile[]) => {
    try {
      localStorage.setItem('bats-processing-history', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to save processing history:', error);
    }
  };

  const addToHistory = (file: ProcessedFile) => {
    const newHistory = [file, ...history.slice(0, maxItems - 1)];
    setHistory(newHistory);
    saveHistoryToStorage(newHistory);
  };

  const removeFromHistory = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    saveHistoryToStorage(newHistory);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('bats-processing-history');
  };

  const downloadFile = (file: ProcessedFile) => {
    if (file.blob) {
      const url = URL.createObjectURL(file.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.processedName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const filteredHistory = history
    .filter(item => {
      const matchesSearch = item.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.processedName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.processedAt.getTime() - a.processedAt.getTime();
        case 'name':
          return a.originalName.localeCompare(b.originalName);
        case 'size':
          return b.fileSize - a.fileSize;
        default:
          return 0;
      }
    });

  const stats = {
    total: history.length,
    completed: history.filter(item => item.status === 'completed').length,
    failed: history.filter(item => item.status === 'failed').length,
    totalSize: history.reduce((sum, item) => sum + item.fileSize, 0)
  };

  const getStatusIcon = (status: ProcessedFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
    }
  };

  const getStatusText = (status: ProcessedFile['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'processing':
        return 'Processing';
    }
  };

  if (history.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Processing History</h3>
        <p className="text-muted-foreground">
          Your processed files will appear here once you start optimizing resumes.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Processing History</h2>
          <p className="text-muted-foreground">
            View and download your previously optimized resumes
          </p>
        </div>
        
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
          >
            Clear History
          </button>
        )}
      </div>

      {/* Stats */}
      {showStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Files</div>
          </div>
          <div className="bg-card border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
          <div className="bg-card border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-sm text-muted-foreground">Failed</div>
          </div>
          <div className="bg-card border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{formatFileSize(stats.totalSize)}</div>
            <div className="text-sm text-muted-foreground">Total Size</div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      {showSearch && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="size">Sort by Size</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      )}

      {/* File List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredHistory.map((file, index) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium truncate">{file.originalName}</h3>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(file.status)}
                        <span className="text-xs text-muted-foreground">
                          {getStatusText(file.status)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(file.processedAt)}</span>
                      </span>
                      <span>{formatFileSize(file.fileSize)}</span>
                      <span>{file.keywords.length} keywords</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {file.status === 'completed' && file.blob && (
                    <button
                      onClick={() => downloadFile(file)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      title="Download file"
                    >
                      <Download className="h-4 w-4 text-green-600" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => removeFromHistory(file.id)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    title="Remove from history"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>
              
              {/* Keywords Preview */}
              {file.keywords.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex flex-wrap gap-1">
                    {file.keywords.slice(0, 5).map((keyword, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                      >
                        {keyword}
                      </span>
                    ))}
                    {file.keywords.length > 5 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                        +{file.keywords.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State for Filtered Results */}
      {filteredHistory.length === 0 && history.length > 0 && (
        <div className="text-center py-8">
          <Search className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            No files match your search criteria.
          </p>
        </div>
      )}
    </div>
  );
}