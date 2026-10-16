import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ChevronRight, RotateCcw, CheckCircle, Sparkles, Wind } from 'lucide-react';
import { soundService } from '../../services/soundService';

interface Step8UnpeelLoveLetterProps {
  letterText: string;
  onNextStep: () => void;
  coupleNames: { yourName: string; partnerName: string };
}

interface MagicalPetal {
  id: number;
  xPercent: number;
  yPercent: number;
  rotation: number;
  width: number;
  height: number;
  gradientId: string;
  delay: number;
}

export const Step8UnpeelLoveLetter: React.FC<Step8UnpeelLoveLetterProps> = ({
  letterText,
  onNextStep,
  coupleNames,
}) => {
  // Dense 28-petal blanket covering the entire parchment letter 100%
  const initialPetals: MagicalPetal[] = [
    // Row 1: Top edge & Header (y: 6% - 12%)
    { id: 1, xPercent: 10, yPercent: 8, rotation: -28, width: 155, height: 215, gradientId: 'grad-crimson', delay: 0 },
    { id: 2, xPercent: 30, yPercent: 6, rotation: 12, width: 160, height: 220, gradientId: 'grad-rose', delay: 0.02 },
    { id: 3, xPercent: 50, yPercent: 10, rotation: -8, width: 170, height: 225, gradientId: 'grad-ruby', delay: 0.04 },
    { id: 4, xPercent: 70, yPercent: 7, rotation: 22, width: 160, height: 220, gradientId: 'grad-magenta', delay: 0.06 },
    { id: 5, xPercent: 90, yPercent: 10, rotation: 35, width: 155, height: 215, gradientId: 'grad-deeprose', delay: 0.08 },

    // Row 2: Upper Mid (y: 26% - 32%)
    { id: 6, xPercent: 8, yPercent: 28, rotation: -35, width: 165, height: 225, gradientId: 'grad-ruby', delay: 0.1 },
    { id: 7, xPercent: 25, yPercent: 26, rotation: -14, width: 160, height: 220, gradientId: 'grad-coral', delay: 0.12 },
    { id: 8, xPercent: 42, yPercent: 30, rotation: 14, width: 170, height: 230, gradientId: 'grad-crimson', delay: 0.14 },
    { id: 9, xPercent: 60, yPercent: 25, rotation: -16, width: 165, height: 225, gradientId: 'grad-rose', delay: 0.16 },
    { id: 10, xPercent: 78, yPercent: 28, rotation: 24, width: 160, height: 220, gradientId: 'grad-magenta', delay: 0.18 },
    { id: 11, xPercent: 94, yPercent: 30, rotation: 40, width: 155, height: 215, gradientId: 'grad-deeprose', delay: 0.2 },

    // Row 3: Center & Core Bloom (y: 46% - 52%)
    { id: 12, xPercent: 8, yPercent: 48, rotation: -22, width: 170, height: 230, gradientId: 'grad-magenta', delay: 0.22 },
    { id: 13, xPercent: 26, yPercent: 50, rotation: 16, width: 165, height: 225, gradientId: 'grad-crimson', delay: 0.24 },
    { id: 14, xPercent: 44, yPercent: 46, rotation: -6, width: 180, height: 240, gradientId: 'grad-center', delay: 0.26 },
    { id: 15, xPercent: 62, yPercent: 52, rotation: 18, width: 175, height: 235, gradientId: 'grad-ruby', delay: 0.28 },
    { id: 16, xPercent: 80, yPercent: 48, rotation: -12, width: 165, height: 225, gradientId: 'grad-coral', delay: 0.3 },
    { id: 17, xPercent: 94, yPercent: 50, rotation: 32, width: 155, height: 215, gradientId: 'grad-rose', delay: 0.32 },

    // Row 4: Lower Mid (y: 68% - 74%)
    { id: 18, xPercent: 8, yPercent: 70, rotation: -30, width: 165, height: 225, gradientId: 'grad-deeprose', delay: 0.34 },
    { id: 19, xPercent: 25, yPercent: 68, rotation: 12, width: 160, height: 220, gradientId: 'grad-crimson', delay: 0.36 },
    { id: 20, xPercent: 42, yPercent: 72, rotation: -14, width: 170, height: 230, gradientId: 'grad-ruby', delay: 0.38 },
    { id: 21, xPercent: 60, yPercent: 68, rotation: 20, width: 165, height: 225, gradientId: 'grad-magenta', delay: 0.4 },
    { id: 22, xPercent: 78, yPercent: 72, rotation: -20, width: 160, height: 220, gradientId: 'grad-rose', delay: 0.42 },
    { id: 23, xPercent: 94, yPercent: 70, rotation: 34, width: 155, height: 215, gradientId: 'grad-coral', delay: 0.44 },

    // Row 5: Bottom Edge & Wax Seal area (y: 88% - 94%)
    { id: 24, xPercent: 10, yPercent: 90, rotation: -18, width: 160, height: 220, gradientId: 'grad-ruby', delay: 0.46 },
    { id: 25, xPercent: 30, yPercent: 92, rotation: 15, width: 165, height: 225, gradientId: 'grad-coral', delay: 0.48 },
    { id: 26, xPercent: 50, yPercent: 88, rotation: -10, width: 175, height: 235, gradientId: 'grad-crimson', delay: 0.5 },
    { id: 27, xPercent: 70, yPercent: 92, rotation: 22, width: 170, height: 230, gradientId: 'grad-deeprose', delay: 0.52 },
    { id: 28, xPercent: 90, yPercent: 90, rotation: -28, width: 160, height: 220, gradientId: 'grad-magenta', delay: 0.54 },
  ];

  const [peeledPetalIds, setPeeledPetalIds] = useState<number[]>([]);
  const [sealStamped, setSealStamped] = useState(false);

  const handlePeelPetal = (id: number) => {
    if (!peeledPetalIds.includes(id)) {
      soundService.playChime(1.1 + (peeledPetalIds.length % 12) * 0.05);
      setPeeledPetalIds((prev) => [...prev, id]);
    }
  };

  const handlePeelAll = () => {
    soundService.playBloomSwell();
    setPeeledPetalIds(initialPetals.map((p) => p.id));
  };

  const handleResetPetals = () => {
    soundService.playChime(0.9);
    setPeeledPetalIds([]);
  };

  const handleSealClick = () => {
    soundService.playChime(1.35);
    setSealStamped(true);
    setTimeout(() => setSealStamped(false), 800);
  };

  const isFullyRevealed = peeledPetalIds.length === initialPetals.length;
  const coverageRatio = 1 - peeledPetalIds.length / initialPetals.length;

  return (
    <div className="relative w-full h-full flex flex-col justify-between py-6 px-4 sm:px-8 z-20 select-none overflow-y-auto">
      {/* SVG Definitions for Hyper-Realistic Magical Tulip Petals */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          {/* Crimson Velvet Gradient */}
          <linearGradient id="grad-crimson" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#fda4af" stopOpacity="0.95" />
            <stop offset="25%" stopColor="#f43f5e" />
            <stop offset="70%" stopColor="#be123c" />
            <stop offset="100%" stopColor="#881337" />
          </linearGradient>

          {/* Rose Blush Gradient */}
          <linearGradient id="grad-rose" x1="0.1" y1="0" x2="0.9" y2="1">
            <stop offset="0%" stopColor="#fecdd3" stopOpacity="0.95" />
            <stop offset="30%" stopColor="#fb7185" />
            <stop offset="75%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#9f1239" />
          </linearGradient>

          {/* Deep Ruby Wine Gradient */}
          <linearGradient id="grad-ruby" x1="0" y1="0.1" x2="1" y2="0.9">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="35%" stopColor="#e11d48" />
            <stop offset="80%" stopColor="#9f1239" />
            <stop offset="100%" stopColor="#4c0519" />
          </linearGradient>

          {/* Magenta Sunset Gradient */}
          <linearGradient id="grad-magenta" x1="0.3" y1="0" x2="0.7" y2="1">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="40%" stopColor="#db2777" />
            <stop offset="80%" stopColor="#9d174d" />
            <stop offset="100%" stopColor="#500724" />
          </linearGradient>

          {/* Coral Sunset Glow Gradient */}
          <linearGradient id="grad-coral" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="30%" stopColor="#fb7185" />
            <stop offset="70%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#881337" />
          </linearGradient>

          {/* Deep Rose Gradient */}
          <linearGradient id="grad-deeprose" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#fbcfe8" />
            <stop offset="35%" stopColor="#f43f5e" />
            <stop offset="75%" stopColor="#b91c1c" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </linearGradient>

          {/* Center Petal (Glow & High Contrast Velvet) */}
          <radialGradient id="grad-center" cx="45%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fff1f2" stopOpacity="0.9" />
            <stop offset="25%" stopColor="#fb7185" />
            <stop offset="65%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#881337" />
          </radialGradient>

          {/* Gold Wax Seal Gradient */}
          <linearGradient id="grad-gold-seal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#facc15" />
            <stop offset="80%" stopColor="#ca8a04" />
            <stop offset="100%" stopColor="#854d0e" />
          </linearGradient>

          {/* Wax Base Organic Gradient */}
          <radialGradient id="grad-wax-base" cx="45%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#e11d48" />
            <stop offset="45%" stopColor="#9f1239" />
            <stop offset="85%" stopColor="#881337" />
            <stop offset="100%" stopColor="#4c0519" />
          </radialGradient>
        </defs>
      </svg>

      {/* Top Header */}
      <div className="flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-xs tracking-widest text-rose-300 font-medium uppercase bg-rose-950/40 border border-rose-500/20 px-3.5 py-1 rounded-full shadow-sm"
        >
          <span>{coupleNames.yourName} &amp; {coupleNames.partnerName}</span>
          <span aria-hidden="true">·</span>
          <span>The Digital Love Letter</span>
        </motion.div>

        <h2 className="mt-2 text-2xl sm:text-4xl font-serif-romantic text-rose-50">
          Unpeel The Petals of My Heart
        </h2>
        <p className="text-xs sm:text-sm text-rose-200/75 max-w-md mt-1 font-light">
          Gently drag, swipe, or tap each velvety tulip petal away to reveal the handwritten letter waiting beneath.
        </p>

        {/* Petal Progress Pill & Action Buttons */}
        <div className="mt-2.5 flex items-center gap-2.5 text-xs font-mono text-rose-300/85">
          <span className="bg-rose-950/60 px-3 py-1 rounded-full border border-rose-500/20">
            {peeledPetalIds.length} of {initialPetals.length} Petals Cleared
          </span>

          {isFullyRevealed ? (
            <span className="flex items-center gap-1 text-emerald-400 font-medium bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/30">
              <CheckCircle className="w-3.5 h-3.5" /> Letter Revealed!
            </span>
          ) : (
            <button
              onClick={handlePeelAll}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 hover:bg-rose-500/40 text-rose-200 border border-rose-400/30 transition-all cursor-pointer font-sans text-xs"
            >
              <Wind className="w-3 h-3 text-rose-300" />
              <span>Sweep All Petals</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Letter Parchment Container with 100% Solid Petal Blanket */}
      <div className="my-auto py-3 max-w-xl w-full mx-auto relative flex items-center justify-center">
        {/* Interactive Floating Hint when petals remain */}
        {!isFullyRevealed && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-3 z-30 flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-900/90 backdrop-blur-md border border-rose-400/40 text-[11px] text-rose-100 shadow-lg pointer-events-none"
          >
            <Sparkles className="w-3 h-3 text-amber-300 animate-spin" />
            <span>Tap or drag any petal to uncover the letter</span>
          </motion.div>
        )}

        {/* Parchment Letter Base Container */}
        <div className="relative w-full bg-[#fdfaf5] text-[#292524] rounded-3xl p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-amber-200/80 overflow-hidden min-h-[420px] sm:min-h-[470px] flex flex-col justify-between">
          <div>
            {/* Letter Header */}
            <div className="flex items-center justify-between border-b border-amber-200/70 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span className="font-serif-romantic text-lg sm:text-xl font-bold tracking-tight text-stone-900">
                  Dearest Mage Manika,
                </span>
              </div>
              <span className="font-mono text-xs text-stone-500">
                October 15, 2026
              </span>
            </div>

            {/* Letter Body Text - No drop-caps, normal clean letters */}
            <div className="font-serif-romantic text-stone-800 text-sm sm:text-base leading-relaxed space-y-3.5 font-normal max-h-[270px] overflow-y-auto pr-2 scrollbar-thin">
              {letterText.split('\n\n').map((paragraph, pIdx) => (
                <p key={pIdx}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Letter Sign-off with Wax Seal (S & M) */}
          <div className="flex items-center justify-between border-t border-amber-200/70 pt-3 mt-4">
            <div>
              <p className="font-script-romantic text-2xl text-stone-900">
                With All My Love,
              </p>
              <p className="font-serif-romantic text-sm font-semibold text-rose-950">
                Sudu
              </p>
            </div>

            {/* Authentic Embossed Wax Seal (R & V) */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              onClick={handleSealClick}
              title="Royal Wax Seal: R & V"
              className="relative w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-transform group"
            >
              {/* Organic Melted Wax Silhouette SVG */}
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_10px_rgba(136,19,55,0.6)]">
                <path
                  d="M 50 4 
                     C 62 3, 76 10, 84 20 
                     C 93 30, 97 44, 96 56 
                     C 95 68, 88 80, 78 88 
                     C 68 96, 54 97, 42 96 
                     C 28 95, 14 88, 8 76 
                     C 2 64, 3 48, 8 36 
                     C 14 22, 28 8, 42 5 Z"
                  fill="url(#grad-wax-base)"
                  stroke="#4c0519"
                  strokeWidth="1.5"
                />

                {/* Wax Inner Ring Ridge */}
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="none"
                  stroke="#fda4af"
                  strokeWidth="2.5"
                  strokeOpacity="0.4"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="32"
                  fill="none"
                  stroke="#4c0519"
                  strokeWidth="2"
                  strokeOpacity="0.7"
                />

                {/* Inner Wax Cavity */}
                <circle
                  cx="50"
                  cy="50"
                  r="30"
                  fill="#881337"
                  opacity="0.9"
                />

                {/* Golden Monogram: R ♥ V */}
                <text
                  x="50"
                  y="55"
                  textAnchor="middle"
                  fontFamily="'Cormorant Garamond', Georgia, serif"
                  fontSize="21"
                  fontWeight="bold"
                  fill="url(#grad-gold-seal)"
                  filter="drop-shadow(0 1px 1px rgba(0,0,0,0.8))"
                  letterSpacing="1"
                >
                  R ♥ V
                </text>
              </svg>

              {/* Sparkle burst when clicked */}
              {sealStamped && (
                <motion.div
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 rounded-full border-2 border-amber-300 pointer-events-none"
                />
              )}
            </motion.button>
          </div>

          {/* Protective Velvet Curtain Underneath Petals - Ensures 100% complete letter opacity until petals are swept */}
          {!isFullyRevealed && (
            <motion.div
              animate={{ opacity: Math.max(0, coverageRatio * 0.95) }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-gradient-to-br from-[#1a0812] via-[#240a18] to-[#12050e] pointer-events-none rounded-3xl z-10 flex items-center justify-center"
            >
              <div className="text-center px-6">
                <Heart className="w-8 h-8 text-rose-500/40 mx-auto mb-2 animate-pulse" />
                <p className="font-serif-romantic text-rose-200/60 text-sm">
                  The words of love rest hidden beneath the petals...
                </p>
              </div>
            </motion.div>
          )}

          {/* 100% Solid Petal Blanket Overlay (Draggable, swipable, tactile) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            <AnimatePresence>
              {initialPetals.map((petal) => {
                const isPeeled = peeledPetalIds.includes(petal.id);
                if (isPeeled) return null;

                return (
                  <motion.div
                    key={petal.id}
                    drag
                    dragConstraints={{ left: -180, right: 180, top: -180, bottom: 180 }}
                    dragElastic={0.5}
                    onDragEnd={(_, info) => {
                      if (Math.abs(info.offset.x) > 30 || Math.abs(info.offset.y) > 30) {
                        handlePeelPetal(petal.id);
                      }
                    }}
                    onClick={() => handlePeelPetal(petal.id)}
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{
                      scale: 1,
                      opacity: 0.99,
                      rotate: petal.rotation,
                    }}
                    exit={{
                      x: petal.id % 2 === 0 ? 380 : -380,
                      y: petal.id % 3 === 0 ? -340 : 340,
                      rotate: petal.rotation + (petal.id % 2 === 0 ? 140 : -140),
                      opacity: 0,
                      scale: 0.4,
                      transition: { duration: 0.55, ease: 'easeOut' },
                    }}
                    whileHover={{ scale: 1.06, rotate: petal.rotation + (petal.id % 2 === 0 ? 4 : -4) }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      width: petal.width,
                      height: petal.height,
                      left: `${petal.xPercent}%`,
                      top: `${petal.yPercent}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className="absolute pointer-events-auto cursor-grab active:cursor-grabbing flex items-center justify-center filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)]"
                  >
                    {/* Exquisite Realistic Organic Tulip Petal SVG */}
                    <svg
                      viewBox="0 0 100 150"
                      className="w-full h-full overflow-visible transition-transform duration-300"
                    >
                      {/* Petal Outer Soft Halo */}
                      <path
                        d="M 50 12 
                           C 22 18, 4 48, 10 92 
                           C 14 116, 32 138, 50 148 
                           C 68 138, 86 116, 90 92 
                           C 96 48, 78 18, 50 12 Z"
                        fill={`url(#${petal.gradientId})`}
                        stroke="#fff"
                        strokeWidth="0.8"
                        strokeOpacity="0.4"
                      />

                      {/* Organic Delicate Vein Network */}
                      <g stroke="#ffffff" strokeOpacity="0.32" strokeWidth="0.75" fill="none">
                        {/* Central Spine Vein */}
                        <path d="M 50 144 Q 50 80 50 20" />
                        
                        {/* Branching Capillaries Left */}
                        <path d="M 50 125 Q 38 105 24 95" />
                        <path d="M 50 105 Q 34 85 20 72" />
                        <path d="M 50 82 Q 36 65 26 48" />
                        <path d="M 50 60 Q 40 45 34 32" />

                        {/* Branching Capillaries Right */}
                        <path d="M 50 125 Q 62 105 76 95" />
                        <path d="M 50 105 Q 66 85 80 72" />
                        <path d="M 50 82 Q 64 65 74 48" />
                        <path d="M 50 60 Q 60 45 66 32" />
                      </g>

                      {/* Silky Velvet Sheen & Translucent Dew Highlight */}
                      <path
                        d="M 50 16 
                           C 32 24, 20 48, 24 82 
                           C 26 95, 34 80, 42 60 
                           C 48 44, 49 26, 50 16 Z"
                        fill="#ffffff"
                        opacity="0.24"
                      />

                      {/* Sparkling Dew Drop on selected petals */}
                      {petal.id % 2 === 0 && (
                        <g>
                          <ellipse cx="42" cy="52" rx="3.5" ry="4.5" fill="#ffffff" opacity="0.8" />
                          <circle cx="41" cy="50" r="1.2" fill="#ffffff" />
                        </g>
                      )}
                    </svg>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        {peeledPetalIds.length > 0 && (
          <button
            onClick={handleResetPetals}
            className="flex items-center gap-1.5 text-xs text-rose-300 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-full transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Recover Petals / නැවත මල් පෙති අතුරන්න</span>
          </button>
        )}

        <button
          onClick={() => {
            soundService.playChime(1.2);
            onNextStep();
          }}
          className="py-3 px-6 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium text-xs sm:text-sm tracking-wide shadow-lg shadow-rose-950/50 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
        >
          <span>Virtual Bouquet Picker</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
