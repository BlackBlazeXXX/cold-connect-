// FILE: src/components/ui/Badge.tsx
import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'custom';
  colorHex?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  colorHex,
  size = 'md',
  className = '',
  style,
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
  }[size];

  const variantClasses = {
    default: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    info: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
    neutral: 'bg-white/5 text-zinc-400 border border-white/10',
    custom: '',
  }[variant];

  const customStyle = colorHex
    ? {
        backgroundColor: `${colorHex}15`,
        color: colorHex,
        borderColor: `${colorHex}35`,
        ...style,
      }
    : style;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full whitespace-nowrap tracking-wide leading-none border transition-colors ${sizeClasses} ${variantClasses} ${className}`}
      style={customStyle}
      {...props}
    >
      {children}
    </span>
  );
};
