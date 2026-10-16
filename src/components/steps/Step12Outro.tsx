import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PetalRainScene } from '../three/PetalRainScene';
import { Heart, RotateCcw, Share2, Sparkles, Download, Check, Volume2, VolumeX } from 'lucide-react';
import { soundService } from '../../services/soundService';
import confetti from 'canvas-confetti';

interface Step12OutroProps {
  onRestartJourney: () => void;
  coupleNames: { yourName: string; partnerName: string };
  anniversaryDate: string;
}

export const Step12Outro: React.FC<Step12OutroProps> = ({
  onRestartJourney,
  coupleNames,
  anniversaryDate,
}) => {
  const [showKeepsakeModal, setShowKeepsakeModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(soundService.isAmbientActive());

  // Elapsed Time Counter since anniversary start
  const [timeElapsed, setTimeElapsed] = useState({
    days: 365,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Confetti celebration on outro arrival
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#fb7185', '#fde047', '#f472b6'],
    });

    const startDate = new Date(anniversaryDate).getTime() || new Date('2025-10-15T00:00:00').getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, now - startDate);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeElapsed({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [anniversaryDate]);

  const handleToggleMusic = () => {
    const active = soundService.toggleAmbientMusic();
    setIsMusicPlaying(active);
  };

  const handleCopyShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    soundService.playChime(1.2);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between py-10 px-4 sm:px-8 z-20 select-none overflow-y-auto">
      {/* Sunset Background Ambient Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1b0a16] via-[#2d1124] to-[#401229] pointer-events-none" />

      {/* Continuous Floating Petal Animation */}
      <PetalRainScene density={55} speed={1.1} />

      {/* Top Header */}
      <div className="relative flex flex-col items-center text-center z-20">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-xs tracking-widest text-rose-300 font-medium uppercase bg-black/40 border border-rose-500/20 px-4 py-1 rounded-full backdrop-blur-sm"
        >
          <span>{coupleNames.yourName}</span>
          <span className="text-rose-400">♥</span>
          <span>{coupleNames.partnerName}</span>
          <span aria-hidden="true">·</span>
          <span>Forever &amp; Infinite Blooms</span>
        </motion.div>
      </div>

      {/* Center Grand Message & Sunset Tulip Field Silhouette */}
      <div className="relative my-auto py-8 max-w-3xl w-full mx-auto text-center z-20 flex flex-col items-center">
        {/* Glowing Sun Orb over Horizon */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-t from-amber-400 via-rose-400 to-pink-500 shadow-[0_0_60px_rgba(251,113,133,0.8)] filter blur-[1px]" />
        </div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
          className="text-4xl sm:text-6xl md:text-7xl font-serif-romantic tracking-wide text-rose-50 drop-shadow-[0_0_35px_rgba(244,63,94,0.7)] leading-tight text-balance"
        >
          To Infinite Blooms, Together.
        </motion.h1>

        <p className="font-script-romantic text-rose-300 text-3xl sm:text-5xl mt-2 drop-shadow-md">
          I Love You.
        </p>

        {/* Live Elapsed Counter in Love */}
        <div className="mt-8 bg-black/50 backdrop-blur-md border border-rose-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl max-w-lg w-full">
          <p className="text-xs uppercase tracking-widest text-rose-300/80 font-medium mb-3">
            In Love Since October 15, 2025
          </p>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-rose-950/40 border border-rose-500/20 rounded-2xl p-2.5">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-rose-50 tabular-nums">
                {timeElapsed.days}
              </span>
              <span className="block text-[10px] uppercase font-mono text-rose-300/70 mt-0.5">
                Days
              </span>
            </div>
            <div className="bg-rose-950/40 border border-rose-500/20 rounded-2xl p-2.5">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-rose-50 tabular-nums">
                {String(timeElapsed.hours).padStart(2, '0')}
              </span>
              <span className="block text-[10px] uppercase font-mono text-rose-300/70 mt-0.5">
                Hours
              </span>
            </div>
            <div className="bg-rose-950/40 border border-rose-500/20 rounded-2xl p-2.5">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-rose-50 tabular-nums">
                {String(timeElapsed.minutes).padStart(2, '0')}
              </span>
              <span className="block text-[10px] uppercase font-mono text-rose-300/70 mt-0.5">
                Mins
              </span>
            </div>
            <div className="bg-rose-950/40 border border-rose-500/20 rounded-2xl p-2.5">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-rose-400 tabular-nums">
                {String(timeElapsed.seconds).padStart(2, '0')}
              </span>
              <span className="block text-[10px] uppercase font-mono text-rose-300/70 mt-0.5">
                Secs
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="relative flex flex-wrap items-center justify-center gap-3 pt-4 z-20">
        {/* Toggle Ambient Music */}
        <button
          onClick={handleToggleMusic}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/40 hover:bg-black/60 border border-rose-500/30 text-rose-200 text-xs font-medium backdrop-blur-md transition-colors cursor-pointer"
        >
          {isMusicPlaying ? <Volume2 className="w-4 h-4 text-rose-400" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
          <span>{isMusicPlaying ? 'Soundtrack Playing' : 'Play Ambient Music'}</span>
        </button>

        {/* View Keepsake Certificate Modal */}
        <button
          onClick={() => {
            soundService.playChime(1.3);
            setShowKeepsakeModal(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-semibold shadow-lg shadow-rose-950/50 transition-transform active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-200" />
          <span>Save Keepsake Card</span>
        </button>

        {/* Copy Share Link */}
        <button
          onClick={handleCopyShare}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/40 hover:bg-black/60 border border-rose-500/30 text-rose-200 text-xs font-medium backdrop-blur-md transition-colors cursor-pointer"
        >
          {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-rose-400" />}
          <span>{copiedLink ? 'Link Copied!' : 'Share Our Love'}</span>
        </button>

        {/* Replay Whole Journey */}
        <button
          onClick={() => {
            soundService.playChime(1.1);
            onRestartJourney();
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Replay Journey</span>
        </button>
      </div>

      {/* Keepsake Certificate Modal */}
      <AnimatePresence>
        {showKeepsakeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowKeepsakeModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.88, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full bg-[#fdfbf7] text-[#1c1917] p-8 sm:p-10 rounded-3xl shadow-2xl border-4 border-double border-amber-300 text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
              </div>

              <p className="text-xs uppercase tracking-widest text-stone-500 font-mono">
                Official Anniversary Keepsake
              </p>

              <h2 className="text-3xl sm:text-4xl font-serif-romantic font-bold text-stone-900 mt-1">
                Certificate of Eternal Bloom
              </h2>

              <p className="text-sm text-stone-600 mt-2 font-light">
                This document honors 365 days of unconditional love, shared smiles, and unforgettable journeys between
              </p>

              <div className="my-6 py-4 border-y border-amber-300 flex items-center justify-center gap-3">
                <span className="font-serif-romantic text-2xl font-bold text-rose-950">
                  {coupleNames.yourName}
                </span>
                <span className="text-rose-500 text-xl">♥</span>
                <span className="font-serif-romantic text-2xl font-bold text-rose-950">
                  {coupleNames.partnerName}
                </span>
              </div>

              <p className="text-xs text-stone-500 font-mono">
                Sealed on October 15, 2026 · Valid for Eternity
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="flex-1 py-3 rounded-full bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Print / Save PDF
                </button>
                <button
                  onClick={() => setShowKeepsakeModal(false)}
                  className="py-3 px-6 rounded-full bg-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-300 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
