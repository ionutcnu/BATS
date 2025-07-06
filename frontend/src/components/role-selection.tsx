'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Code,
  TrendingUp,
  DollarSign,
  Calculator,
  UserCheck,
  Palette,
  Settings,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { apiService, RoleOption } from '@/services/api';

interface RoleSelectionProps {
  onRoleSelect: (role: string) => void;
  selectedRole?: string;
  disabled?: boolean;
}

const roleIcons: Record<string, React.ComponentType<any>> = {
  qa: Settings,
  developer: Code,
  marketing: TrendingUp,
  sales: DollarSign,
  finance: Calculator,
  hr: UserCheck,
  design: Palette,
  operations: Users
};

export function RoleSelection({ onRoleSelect, selectedRole, disabled = false }: RoleSelectionProps) {
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiService.getAvailableRoles();
      
      if (result.success && result.data) {
        setRoles(result.data.roles || []);
      } else {
        setError(result.error || 'Failed to fetch roles');
      }
    } catch (err) {
      setError('Network error while fetching roles');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (roleKey: string) => {
    if (!disabled) {
      onRoleSelect(roleKey);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading roles...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-center">
        <p className="text-destructive mb-2">Error loading roles</p>
        <p className="text-sm text-muted-foreground">{error}</p>
        <button
          onClick={fetchRoles}
          className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Select Your Role</h3>
        <p className="text-sm text-muted-foreground">
          Choose the role that best matches your resume for targeted analysis
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role, index) => {
          const Icon = roleIcons[role.key] || Users;
          const isSelected = selectedRole === role.key;

          return (
            <motion.div
              key={role.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`
                relative p-4 rounded-lg border cursor-pointer transition-all duration-200
                ${isSelected 
                  ? 'border-primary bg-primary/10 shadow-md' 
                  : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={() => handleRoleSelect(role.key)}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="h-4 w-4 text-primary-foreground" />
                </motion.div>
              )}

              <div className="flex items-start space-x-3">
                <div className={`
                  flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
                  ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
                `}>
                  <Icon className="h-5 w-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium text-sm ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                    {role.displayName}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {role.description}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Click to select
                </span>
                {isSelected && (
                  <span className="text-xs text-primary font-medium">
                    Selected
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {selectedRole && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">
              {roles.find(r => r.key === selectedRole)?.displayName} selected
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Your resume will be analyzed using {roles.find(r => r.key === selectedRole)?.displayName.toLowerCase()} specific keywords and requirements.
          </p>
        </motion.div>
      )}
    </div>
  );
}