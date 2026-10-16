import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { soundService } from '../../services/soundService';

interface Step2BloomAnimationProps {
  onComplete: () => void;
  coupleNames: { yourName: string; partnerName: string };
}

export const Step2BloomAnimation: React.FC<Step2BloomAnimationProps> = ({
  onComplete,
  coupleNames,
}) => {
  const [bloomPhaseText, setBloomPhaseText] = useState('Unfolding first petals...');

  useEffect(() => {
    soundService.playBloomSwell();

    const t1 = setTimeout(() => {
      setBloomPhaseText('Awakening golden embers...');
    }, 1200);

    const t2 = setTimeout(() => {
      setBloomPhaseText('Our journey begins...');
    }, 2400);

    const t3 = setTimeout(() => {
      onComplete();
    }, 3800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between py-12 px-6 z-20 pointer-events-none select-none">
      {/* Top Editorial Kicker */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex items-center gap-2 text-xs tracking-widest text-rose-300/80 font-medium uppercase"
      >
        <span>{coupleNames.yourName}</span>
        <span className="text-rose-400">♥</span>
        <span>{coupleNames.partnerName}</span>
      </motion.div>

      {/* Center Cinematic Message */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.4 }}
        className="text-center my-auto px-4"
      >
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-400/20 text-rose-200 text-xs font-medium mb-4 backdrop-blur-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          <span>{bloomPhaseText}</span>
        </motion.div>

        <h2 className="text-4xl sm:text-6xl font-serif-romantic tracking-wide text-rose-50 drop-shadow-[0_0_25px_rgba(255,200,220,0.6)]">
          Our Journey Begins...
        </h2>
        <p className="mt-3 text-sm sm:text-base text-rose-200/70 font-light max-w-md mx-auto">
          Entering the glowing heart of 365 cherished memories.
        </p>
      </motion.div>

      {/* Skip / Fast Forward Option */}
      <div className="pointer-events-auto">
        <button
          onClick={onComplete}
          className="flex items-center gap-2 text-xs text-rose-300/70 hover:text-white transition-colors py-2 px-4 rounded-full bg-black/40 border border-white/10 backdrop-blur-sm cursor-pointer"
        >
          <span>Step inside immediately</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
