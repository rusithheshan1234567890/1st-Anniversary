import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Heart, Sparkles, Compass } from 'lucide-react';
import { soundService } from '../../services/soundService';

interface Step3WelcomeCardProps {
  onEnterGarden: () => void;
  partnerName: string;
  yourName: string;
  anniversaryDate: string;
}

export const Step3WelcomeCard: React.FC<Step3WelcomeCardProps> = ({
  onEnterGarden,
  partnerName,
  yourName,
  anniversaryDate,
}) => {
  useEffect(() => {
    soundService.playChime(1.2);

    // Rose & Gold celebration confetti burst
    const end = Date.now() + 1200;
    const colors = ['#f43f5e', '#fb7185', '#fde047', '#f472b6', '#ffffff'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4 z-30 select-none">
      {/* Background Soft Scrim */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      {/* Main Floral Parchment Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative max-w-lg w-full bg-[#180e14]/90 border border-rose-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-rose-950/80 text-center overflow-hidden"
      >
        {/* Decorative corner florals */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Small top emblem */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="h-px w-8 bg-rose-400/40" />
          <Heart className="w-5 h-5 text-rose-400 fill-rose-400/60 animate-pulse" />
          <span className="h-px w-8 bg-rose-400/40" />
        </div>

        {/* Header Kicker */}
        <p className="text-xs uppercase tracking-widest text-rose-300 font-semibold mb-2">
          Welcome to My Heart
        </p>

        {/* Main Title */}
        <h2 className="text-3xl sm:text-4xl font-serif-romantic tracking-wide text-rose-50 font-normal leading-tight mb-2">
          Happy <span className="inline-flex items-baseline align-baseline"><span className="text-[1.28em] [font-variant-numeric:lining-nums] leading-none font-medium">1</span><sup className="text-xs sm:text-sm font-sans font-light -top-2.5 ml-0.5 text-rose-200">st</sup></span> Anniversary!
        </h2>

        {/* Dedicated to partner */}
        <p className="text-base sm:text-lg font-script-romantic text-rose-300 text-2xl sm:text-3xl mb-4">
          To My Love, Manika
        </p>

        {/* Romantic Letter Snip */}
        <div className="my-5 py-4 px-5 rounded-2xl bg-rose-950/40 border border-rose-500/20 text-rose-100/90 text-sm leading-relaxed font-light">
          <p className="text-align-last:center">
            &ldquo;365 Days Ago, Our Paths Aligned And Blossomed Into Something Extraordinary.
            Every Memory, Every Whispered Laugh, And Every Quiet Adventure Has Made This The Most Magical Year Of My Life.&rdquo;
          </p>
          <div className="mt-3 flex items-center justify-between text-xs text-rose-300/70 border-t border-rose-500/20 pt-2 font-mono">
            <span>2026-10-15</span>
            <span>Forever Yours, Sudu</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={() => {
              soundService.playChime(1.1);
              onEnterGarden();
            }}
            className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium text-sm tracking-wide shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] cursor-pointer"
          >
            
            <span>Enter My Heart &amp; Stroll Memories</span>
            
          </button>

        </div>
      </motion.div>
    </div>
  );
};
