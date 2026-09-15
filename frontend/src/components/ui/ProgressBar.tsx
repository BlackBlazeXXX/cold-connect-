// FILE: src/components/ui/ProgressBar.tsx
import React from 'react';

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  subLabel?: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  subLabel,
  variant = 'primary',
  size = 'md',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const heightClass = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }[size];

  const colorClass = {
    primary: 'bg-emerald-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
  }[variant];

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {(label || subLabel) && (
        <div className="flex justify-between items-center text-xs font-medium">
          {label && <span className="text-zinc-300">{label}</span>}
          {subLabel && <span className="text-zinc-500 font-mono text-[11px]">{subLabel}</span>}
        </div>
      )}
      <div className={`w-full bg-white/10 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`${colorClass} h-full transition-all duration-300 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
