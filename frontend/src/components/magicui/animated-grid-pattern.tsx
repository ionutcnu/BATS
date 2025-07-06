'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedGridPatternProps {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  strokeDasharray?: string;
  numSquares?: number;
  className?: string;
  maxOpacity?: number;
  duration?: number;
  repeatDelay?: number;
}

export function AnimatedGridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = '0',
  numSquares = 50,
  className,
  maxOpacity = 0.5,
  duration = 4,
  repeatDelay = 0.5,
  ...props
}: AnimatedGridPatternProps) {
  const id = useMemo(() => Math.random().toString(36).substr(2, 9), []);

  const squares = useMemo(() => {
    return Array.from({ length: numSquares }, (_, i) => ({
      id: i,
      x: Math.floor(Math.random() * 100),
      y: Math.floor(Math.random() * 100),
      delay: Math.random() * duration,
    }));
  }, [numSquares, duration]);

  return (
    <svg
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 h-full w-full fill-gray-400/30 stroke-gray-400/30',
        className
      )}
      {...props}
    >
      <defs>
        <pattern id={id} width={width} height={height} patternUnits="userSpaceOnUse" x={x} y={y}>
          <path d={`M.5 ${height}V.5H${width}`} fill="none" strokeDasharray={strokeDasharray} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
      {squares.map((square) => (
        <motion.rect
          key={square.id}
          x={`${square.x}%`}
          y={`${square.y}%`}
          width={width}
          height={height}
          fill="currentColor"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, maxOpacity, 0],
          }}
          transition={{
            duration,
            repeat: Infinity,
            delay: square.delay,
            repeatDelay,
          }}
        />
      ))}
    </svg>
  );
}
