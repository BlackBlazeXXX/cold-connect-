// FILE: src/components/ui/Textarea.tsx
import React, { TextareaHTMLAttributes, forwardRef } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCharCount?: boolean;
  maxCharacters?: number;
  wrapperClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      showCharCount = false,
      maxCharacters,
      className = '',
      wrapperClassName = '',
      id,
      value,
      ...props
    },
    ref
  ) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const currentLength = typeof value === 'string' ? value.length : 0;
    const isControlled = 'value' in props || value !== undefined;

    return (
      <div className={`w-full flex flex-col gap-1.5 ${wrapperClassName}`}>
        <div className="flex justify-between items-center">
          {label && (
            <label
              htmlFor={textareaId}
              className="text-xs font-semibold text-zinc-300 tracking-wide"
            >
              {label}
              {props.required && <span className="text-rose-400 ml-0.5">*</span>}
            </label>
          )}
          {showCharCount && (
            <span className="text-[11px] text-zinc-500 font-mono">
              {currentLength} {maxCharacters ? `/ ${maxCharacters}` : 'chars'}
            </span>
          )}
        </div>
        <textarea
          id={textareaId}
          ref={ref}
          className={`w-full bg-[#0a0a0a] border text-sm text-white placeholder-zinc-600 rounded-lg transition-all duration-150 p-3 focus:outline-none focus:ring-1 ${
            error ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/30' : 'border-white/10 focus:border-emerald-500/60 focus:ring-emerald-500/30'
          } disabled:bg-white/[0.02] disabled:text-zinc-600 disabled:cursor-not-allowed ${className}`}
          {...props}
          {...(isControlled ? { value: value ?? '' } : {})}
        />
        {error && <p className="text-xs text-rose-400 mt-0.5">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-zinc-500 mt-0.5">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
