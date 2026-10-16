import React from 'react';
import { motion } from 'motion/react';

interface ScrollSideIndicatorProps {
  currentStep: number;
  totalSteps: number;
  onSelectStep: (step: number) => void;
  stepNames: string[];
}

export const ScrollSideIndicator: React.FC<ScrollSideIndicatorProps> = ({
  currentStep,
  totalSteps,
  onSelectStep,
  stepNames,
}) => {
  return (
    <>
      {/* Right Side Vertical Navigation Bar (Full Page Scroll Indicator) */}
      <div className="fixed right-4 sm:right-6 top-1/2 transform -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-2.5 select-none pointer-events-auto">
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const stepNum = idx + 1;
          const isActive = currentStep === stepNum;

          return (
            <div key={stepNum} className="relative flex items-center justify-end group">
              {/* Tooltip on hover */}
              <div className="absolute right-6 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-[11px] font-sans text-rose-100 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
                <span className="font-mono text-rose-400 mr-1.5">{String(stepNum).padStart(2, '0')}.</span>
                <span>{stepNames[idx]}</span>
              </div>

              {/* Dot / Pill Button */}
              <button
                onClick={() => onSelectStep(stepNum)}
                className={`transition-all duration-300 rounded-full cursor-pointer flex items-center justify-center ${
                  isActive
                    ? 'w-3 h-8 bg-gradient-to-b from-rose-400 to-pink-500 shadow-[0_0_12px_rgba(244,63,94,0.9)]'
                    : 'w-2 h-2 bg-white/20 hover:bg-white/50 hover:scale-125'
                }`}
                title={stepNames[idx]}
              />
            </div>
          );
        })}
      </div>
    </>
  );
};
