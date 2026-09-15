// FILE: src/components/ui/EmptyState.tsx
import React from 'react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-xl bg-white/[0.01] ${className}`}
    >
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 shadow-xs flex items-center justify-center text-emerald-400 mb-3">
          {icon}
        </div>
      )}
      <h4 className="text-sm font-semibold text-white tracking-tight">{title}</h4>
      <p className="text-xs text-zinc-500 max-w-sm mt-1 mb-4 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
