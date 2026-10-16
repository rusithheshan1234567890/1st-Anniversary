import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Heart } from 'lucide-react';
import { soundService } from '../../services/soundService';

interface Step1IntroProps {
  onStartBloom: () => void;
  coupleNames: { yourName: string; partnerName: string };
}

export const Step1Intro: React.FC<Step1IntroProps> = ({
  onStartBloom,
  coupleNames,
}) => {
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isHolding) {
      soundService.playChime(0.9);
      holdIntervalRef.current = window.setInterval(() => {
        setHoldProgress((prev) => {
          if (prev >= 100) {
            if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
            soundService.playChime(1.5);
            onStartBloom();
            return 100;
          }
          return prev + 3;
        });
      }, 30);
    } else {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
      setHoldProgress(0);
    }

    return () => {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    };
  }, [isHolding, onStartBloom]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between py-12 px-6 z-20 text-center select-none">
      {/* Editorial Top Kicker */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0 }}
        className="flex flex-col items-center gap-1.5"
      >
        <div className="flex items-center gap-2 text-xs tracking-widest text-rose-300/80 font-medium uppercase">
          <span>{coupleNames.yourName}</span>
          <span className="text-rose-400">♥</span>
          <span>{coupleNames.partnerName}</span>
        </div>
        <p className="text-sm text-rose-200/60 font-light">
          A Celebration of 365 Days in Full Bloom
        </p>
      </motion.div>

      {/* Center Breathing Core Message - Circle removed so 3D Tulip is 100% visible */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 1.2 }}
        className="flex flex-col items-center justify-center my-auto pointer-events-none"
      >
        <h1 className="text-3xl sm:text-5xl font-serif-romantic tracking-wide text-rose-50 mb-3 max-w-2xl text-center px-4 drop-shadow-[0_2px_16px_rgba(244,63,94,0.4)]">
          Every Love Story is Beautiful, But Ours is in Full Bloom
        </h1>
        <p className="text-sm sm:text-base text-rose-200/80 max-w-lg mx-auto font-light leading-relaxed px-4 drop-shadow">
          Step into My Heart of shared adventures, quiet laughter, and infinite dreams.
        </p>
      </motion.div>

      {/* Interactive Hold-to-Bloom Button */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="flex flex-col items-center gap-3 w-full max-w-xs"
      >
        <div className="relative w-full">
          {/* Progress Ring / Bar underneath */}
          <div className="absolute inset-0 rounded-full bg-rose-950/60 border border-rose-500/20 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-pink-400 transition-all duration-75 ease-out shadow-[0_0_15px_rgba(244,63,94,0.8)]"
              style={{ width: `${holdProgress}%` }}
            />
          </div>

          <button
            onMouseDown={() => setIsHolding(true)}
            onMouseUp={() => setIsHolding(false)}
            onMouseLeave={() => setIsHolding(false)}
            onTouchStart={() => setIsHolding(true)}
            onTouchEnd={() => setIsHolding(false)}
            onClick={() => {
              if (holdProgress < 20) {
                setHoldProgress(100);
                soundService.playChime(1.5);
                onStartBloom();
              }
            }}
            className="relative w-full py-4 px-6 rounded-full flex items-center justify-center gap-2.5 text-sm font-medium tracking-wider text-white transition-transform active:scale-[0.98] cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-rose-300 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="font-semibold uppercase tracking-widest text-xs">
              {holdProgress > 0 ? `Blooming... ${holdProgress}%` : 'Hold to Begin The Bloom'}
            </span>
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-rose-300/60">
          <span>Press &amp; hold or tap to ignite</span>
          <span aria-hidden="true">·</span>
          <span>1st Anniversary</span>
        </div>
      </motion.div>
    </div>
  );
};
