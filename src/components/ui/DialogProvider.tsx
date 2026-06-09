"use client";

import React, { createContext, useContext, useState } from 'react';
import { Button } from './Button';
import { X } from 'lucide-react';

interface DialogOptions {
  title?: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  confirmLabel?: string;
  cancelLabel?: string;
}

interface DialogContextType {
  showAlert: (options: DialogOptions | string) => Promise<void>;
  showConfirm: (options: DialogOptions | string) => Promise<boolean>;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) throw new Error('useDialog must be used within a DialogProvider');
  return context;
}

export default function DialogProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirm, setIsConfirm] = useState(false);
  const [options, setOptions] = useState<DialogOptions>({ message: '' });
  const [resolveRef, setResolveRef] = useState<((val?: any) => void) | null>(null);

  const showAlert = (opts: DialogOptions | string) => {
    const parsedOpts = typeof opts === 'string' ? { message: opts } : opts;
    setOptions({
      title: 'Notification',
      type: 'info',
      confirmLabel: 'OK',
      ...parsedOpts
    });
    setIsConfirm(false);
    setIsOpen(true);
    return new Promise<void>((resolve) => {
      setResolveRef(() => resolve);
    });
  };

  const showConfirm = (opts: DialogOptions | string) => {
    const parsedOpts = typeof opts === 'string' ? { message: opts } : opts;
    setOptions({
      title: 'Are you sure?',
      type: 'warning',
      confirmLabel: 'Confirm',
      cancelLabel: 'Cancel',
      ...parsedOpts
    });
    setIsConfirm(true);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolveRef(() => resolve);
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolveRef) {
      if (isConfirm) resolveRef(true);
      else resolveRef();
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolveRef && isConfirm) resolveRef(false);
  };

  return (
    <DialogContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 bg-navy/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-ivory rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in border border-border/30">
            <div className="p-6 text-center relative" style={{ background: 'linear-gradient(135deg, #0F2640, #1E3A5F)' }}>
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner">
                <img src="/logo.png" className="w-10 h-10 object-contain" alt="Store Logo" />
              </div>
              <h3 className="text-lg font-bold text-white">{options.title}</h3>
              <button 
                type="button" 
                className="absolute right-4 top-4 text-white/60 hover:text-white transition-colors"
                onClick={handleCancel}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-center">
              <p className="text-sm text-brown/70 leading-relaxed font-semibold">
                {options.message}
              </p>
            </div>
            <div className="p-6 bg-cream/50 border-t border-border/30 flex gap-3">
              {isConfirm && (
                <Button variant="outline" className="flex-1" onClick={handleCancel}>
                  {options.cancelLabel}
                </Button>
              )}
              <Button variant="accent" className="flex-1 font-bold" onClick={handleConfirm}>
                {options.confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}
