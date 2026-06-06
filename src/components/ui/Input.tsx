import React from 'react';
import { cn } from './Button';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && <label className="text-sm font-bold text-navy uppercase tracking-tight">{label}</label>}
        <input
          ref={ref}
          className={cn(
            'flex h-11 w-full rounded-xl border border-border bg-cream px-4 py-2 text-sm text-navy ring-offset-ivory file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-brown/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all',
            error && 'border-crimson focus-visible:ring-crimson/20',
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-crimson font-medium">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
