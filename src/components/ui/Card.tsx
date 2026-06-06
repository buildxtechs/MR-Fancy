import React from 'react';
import { cn } from './Button';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'outline';
  onClick?: () => void;
}

const Card = ({ children, className, variant = 'default', onClick }: CardProps) => {
  const variants = {
    default: 'bg-ivory border border-border/50 shadow-sm',
    glass: 'glass',
    outline: 'bg-transparent border border-border',
  };

  return (
    <div 
      className={cn('rounded-xl overflow-hidden', variants[variant], className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('p-6 border-b border-border/30', className)}>{children}</div>
);

const CardTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h3 className={cn('text-lg font-semibold text-navy', className)}>{children}</h3>
);

const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('p-6', className)}>{children}</div>
);

const CardFooter = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('p-6 bg-cream/50 border-t border-border/30', className)}>{children}</div>
);

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
