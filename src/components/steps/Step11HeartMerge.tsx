import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { HeartMergeScene } from '../three/HeartMergeScene';
import { Heart, ChevronRight, Wand2 } from 'lucide-react';
import { soundService } from '../../services/soundService';

interface Step11HeartMergeProps {
  onContinueToOutro: () => void;
  coupleNames: { yourName: string; partnerName: string };
  flowerCount: number;
}

export const Step11HeartMerge: React.FC<Step11HeartMergeProps> = ({
  onContinueToOutro,
  coupleNames,
  flowerCount,
}) => {
  const [mergeProgress, setMergeProgress] = useState(0.35);
  const [hasMerged, setHasMerged] = useState(false);

  useEffect(() => {
    // Automatically trigger smooth merge progression on entrance immediately
    soundService.playBloomSwell();
    const timer = setTimeout(() => {
      setMergeProgress(1.0);
    }, 120);

    return () => clearTimeout(timer);
  }, []);

  const handleMergeComplete = () => {
    setHasMerged(true);
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-radial from-rose-950/30 via-[#140810] to-[#0c070a]">
      {/* 3D Heart Merge Simulation Canvas */}
      <HeartMergeScene
        mergeProgress={mergeProgress}
        onMergeComplete={handleMergeComplete}
      />

      {/* Top Editorial Kicker */}
      <div className="absolute top-6 inset-x-0 flex flex-col items-center justify-center px-6 z-20 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-xs tracking-widest text-rose-300 font-medium uppercase bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-rose-500/20"
        >
          <span>{coupleNames.yourName} &amp; {coupleNames.partnerName}</span>
          <span aria-hidden="true">·</span>
          <span>The Grand Reveal</span>
        </motion.div>

        <h2 className="mt-3 text-2xl sm:text-5xl font-serif-romantic text-rose-50 text-center drop-shadow-[0_0_20px_rgba(244,63,94,0.8)]">
          {mergeProgress >= 0.8 ? 'Two Souls, One Eternal Heart' : 'Merging Our Blooms...'}
        </h2>
        <p className="text-xs sm:text-sm text-rose-200/80 font-light text-center max-w-md mt-1 drop-shadow">
          {mergeProgress >= 0.8
            ? `All ${flowerCount} blossoms have coalesced into our beating heart of light.`
            : 'Watch as every memory petal is drawn into unity by the gravity of our love.'}
        </p>
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="absolute bottom-8 inset-x-0 flex flex-col items-center justify-center gap-4 px-6 z-20 pointer-events-auto">
        {/* Interactive Convergence Slider */}
        <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md py-2.5 px-4 rounded-2xl border border-rose-500/30 shadow-2xl">
          <Wand2 className="w-4 h-4 text-rose-400" />
          <span className="text-xs text-rose-300 font-mono">Convergence</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={mergeProgress}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setMergeProgress(val);
              if (val > 0.85) setHasMerged(true);
            }}
            className="w-32 sm:w-48 accent-rose-500 cursor-pointer"
          />
          <span className="text-xs text-rose-200 font-mono">
            {Math.round(mergeProgress * 100)}%
          </span>
        </div>

        {/* Continue to Final Chapter Outro Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5 }}
          onClick={() => {
            soundService.playChime(1.4);
            onContinueToOutro();
          }}
          className="py-3.5 px-8 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 text-white font-medium text-xs sm:text-sm tracking-wide shadow-2xl shadow-rose-950/80 flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer"
        >
          <Heart className="w-4 h-4 fill-white animate-pulse" />
          <span>Our Future Blooms</span>
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
};
