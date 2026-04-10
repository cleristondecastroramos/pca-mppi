import React from 'react';

interface ShimmerTextProps {
  text: string;
  className?: string;
}

export const ShimmerText = ({ text, className }: ShimmerTextProps) => {
  return (
    <div
      className="relative group cursor-pointer select-none px-2 py-1"
      style={{ perspective: '800px' }}
    >
      <span
        className={`bg-clip-text text-transparent bg-gradient-to-r from-white via-red-200 to-white transition-all duration-700 ease-out inline-block ${className}`}
      >
        {text}
      </span>
      {/* Shimmer overlay */}
      <span
        className="pointer-events-none absolute inset-0 rounded bg-gradient-to-r from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-shimmer"
        style={{
          mixBlendMode: 'overlay',
          backgroundSize: '200% 100%',
        }}
      />
      <style>{`
        @keyframes shimmer-effect {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .animate-shimmer {
          animation: shimmer-effect 2.2s linear infinite;
        }
      `}</style>
    </div>
  );
};
