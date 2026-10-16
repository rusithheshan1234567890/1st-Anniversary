import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { soundService } from '../../services/soundService';

interface StepProgressTrackerProps {
  currentStep: number;
  totalSteps: number;
  onSelectStep: (step: number) => void;
  stepNames: string[];
}

export const StepProgressTracker: React.FC<StepProgressTrackerProps> = ({
  currentStep,
  totalSteps,
  onSelectStep,
  stepNames,
}) => {
  const handlePrev = () => {
    if (currentStep > 1) {
      soundService.playChime(0.9);
      onSelectStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      soundService.playChime(1.1);
      onSelectStep(currentStep + 1);
    }
  };

  return (
    <div className="fixed bottom-3 inset-x-0 z-30 flex items-center justify-center px-4 pointer-events-none select-none">
      <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-rose-500/20 shadow-2xl pointer-events-auto">
        {/* Prev Arrow */}
        <button
          onClick={handlePrev}
          disabled={currentStep <= 1}
          className="p-1 rounded-full text-rose-300 hover:text-white disabled:opacity-20 transition-colors cursor-pointer"
          title="Previous Step"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* 12 Step dots */}
        <div className="flex items-center gap-1.5 px-1">
          {Array.from({ length: totalSteps }).map((_, idx) => {
            const stepNum = idx + 1;
            const isActive = currentStep === stepNum;
            const isCompleted = currentStep > stepNum;

            return (
              <button
                key={stepNum}
                onClick={() => {
                  soundService.playChime(1.0 + idx * 0.05);
                  onSelectStep(stepNum);
                }}
                title={`Step ${stepNum}: ${stepNames[idx] || ''}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  isActive
                    ? 'w-6 h-2 bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.9)]'
                    : isCompleted
                    ? 'w-2 h-2 bg-rose-600/70 hover:bg-rose-500'
                    : 'w-2 h-2 bg-stone-700 hover:bg-stone-500'
                }`}
              />
            );
          })}
        </div>

        {/* Next Arrow */}
        <button
          onClick={handleNext}
          disabled={currentStep >= totalSteps}
          className="p-1 rounded-full text-rose-300 hover:text-white disabled:opacity-20 transition-colors cursor-pointer"
          title="Next Step"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Current Step Label */}
        <span className="hidden sm:inline text-[11px] font-mono text-rose-200/70 border-l border-white/10 pl-2 ml-1">
          {stepNames[currentStep - 1]}
        </span>
      </div>
    </div>
  );
};
