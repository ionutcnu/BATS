'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  background?: string;
  shimmerColor?: string;
}

export function ShimmerButton({
  children,
  className,
  background,
  shimmerColor,
  ...props
}: ShimmerButtonProps) {
  return (
    <motion.button
      className={cn(
        'relative overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-medium text-white transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">{children}</div>
    </motion.button>
  );
}
