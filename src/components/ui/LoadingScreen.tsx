"use client";

import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-cream via-ivory to-cream">
      {/* Spinning Gold Ring */}
      <div className="relative w-32 h-32 mb-8">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-gold/20 animate-pulse-glow" />
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-gold border-r-gold-light animate-spin-slow"
        />
        {/* Logo in Center */}
        <div className="absolute inset-3 rounded-full overflow-hidden bg-white shadow-lg flex items-center justify-center">
          <img src="/logo.png" alt="MR Fancy Store" className="w-full h-full object-contain p-2" />
        </div>
      </div>

      {/* Brand Text */}
      <h1 className="text-3xl font-bold tracking-tight mb-2 text-navy">
        MR Fancy Stores
      </h1>
      <p
        className="text-sm font-semibold tracking-[0.3em] uppercase shimmer"
      >
        Gifts • Fancy • Grocery
      </p>

      {/* Loading Dots */}
      <div className="flex items-center gap-1.5 mt-8">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-gold"
            style={{
              animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
