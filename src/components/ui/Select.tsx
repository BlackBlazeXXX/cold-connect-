// FILE: src/components/ui/Select.tsx
import React, { SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  wrapperClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', wrapperClassName = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={`w-full flex flex-col gap-1.5 ${wrapperClassName}`}>
        {label && (
          <label htmlFor={selectId} className="text-xs font-semibold text-zinc-300 tracking-wide">
            {label}
            {props.required && <span className="text-rose-400 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            className={`w-full appearance-none bg-[#0a0a0a] border text-sm text-white rounded-lg transition-all duration-150 py-2 pl-3 pr-9 focus:outline-none focus:ring-1 ${
              error ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/30' : 'border-white/10 focus:border-emerald-500/60 focus:ring-emerald-500/30'
            } disabled:bg-white/[0.02] disabled:text-zinc-600 disabled:cursor-not-allowed cursor-pointer ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#0c0c0c] text-white">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 pointer-events-none text-zinc-500">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && <p className="text-xs text-rose-400 mt-0.5">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
