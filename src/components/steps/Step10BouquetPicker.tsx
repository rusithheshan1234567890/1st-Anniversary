import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TulipVariety } from '../../types';
import { Plus, Trash2, Heart, ChevronRight, Gift } from 'lucide-react';
import { soundService } from '../../services/soundService';

interface Step10BouquetPickerProps {
  varieties: TulipVariety[];
  onCompleteBouquet: (selectedFlowers: TulipVariety[], wrapper: string, note: string) => void;
  coupleNames: { yourName: string; partnerName: string };
}

export const Step10BouquetPicker: React.FC<Step10BouquetPickerProps> = ({
  varieties,
  onCompleteBouquet,
  coupleNames,
}) => {
  // Initial starting arrangement (3 lush romantic flowers)
  const [arrangedFlowers, setArrangedFlowers] = useState<TulipVariety[]>([
    varieties[0],
    varieties[1],
    varieties[2],
  ]);

  const [selectedWrapper, setSelectedWrapper] = useState('Rustic Kraft');
  const [giftNote, setGiftNote] = useState('Picked with all my love for you, my favorite blossom.');

  const wrapperOptions = [
    { id: 'kraft', name: 'Rustic Kraft', color: 'bg-amber-900/50 border-amber-600/40' },
    { id: 'silk', name: 'Blush Satin', color: 'bg-pink-950/60 border-pink-500/40' },
    { id: 'midnight', name: 'Midnight Velvet', color: 'bg-stone-950/80 border-rose-500/40' },
  ];

  const handleAddFlower = (flower: TulipVariety) => {
    if (arrangedFlowers.length >= 20) return;
    soundService.playChime(1.1 + arrangedFlowers.length * 0.03);
    setArrangedFlowers((prev) => [...prev, flower]);
  };

  const handleRemoveFlower = (index: number) => {
    soundService.playChime(0.9);
    setArrangedFlowers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFinish = () => {
    soundService.playBloomSwell();
    onCompleteBouquet(arrangedFlowers, selectedWrapper, giftNote);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between py-6 px-4 sm:px-8 z-20 select-none overflow-y-auto">
      {/* Main Builder Grid */}
      <div className="my-auto py-1 max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left Column: Tulip Variety Selector Shelf */}
        <div className="lg:col-span-5 bg-[#160e15]/95 border border-rose-500/20 rounded-3xl p-3.5 sm:p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-rose-500/20 pb-2 mb-2.5">
              <span className="text-xs uppercase tracking-wider text-rose-300 font-semibold">
                Select Tulip Varieties (6 Varieties)
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-200 font-mono font-semibold border border-rose-500/30">
                {arrangedFlowers.length}/20 Flowers
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-2 gap-2 pr-1">
              {varieties.map((v) => (
                <motion.button
                  key={v.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleAddFlower(v)}
                  disabled={arrangedFlowers.length >= 20}
                  className="flex flex-col items-start p-2 sm:p-2.5 rounded-2xl bg-black/50 border border-white/10 hover:border-rose-400/50 transition-all text-left cursor-pointer group disabled:opacity-40"
                >
                  <div className="flex items-center justify-between w-full">
                    {/* Garden-Sized Tulip Blossom Thumbnail Preview */}
                    <div className="w-8 h-9 sm:w-10 sm:h-11 flex items-center justify-center">
                      <svg viewBox="0 0 44 56" className="w-7 h-8 sm:w-9 sm:h-11 drop-shadow-md">
                        <path d="M 22 24 Q 22 40 22 54" stroke="#15803d" strokeWidth="3" strokeLinecap="round" />
                        <path d="M 22 38 Q 12 32 6 36 Q 12 46 22 42" fill="#22c55e" opacity="0.9" />
                        <path d="M 12 24 C 6 14, 12 4, 22 6 C 32 4, 38 14, 32 24 C 28 29, 16 29, 12 24 Z" fill={v.colorHex} />
                        <path d="M 12 24 C 8 14, 14 5, 21 7 C 17 14, 14 20, 12 24 Z" fill="#ffffff" fillOpacity="0.25" />
                        <path d="M 17 12 C 19 6, 25 6, 27 12 C 25 18, 19 18, 17 12 Z" fill="#ffffff" fillOpacity="0.35" />
                      </svg>
                    </div>

                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-rose-500/20 group-hover:bg-rose-500/40 text-rose-200 flex items-center justify-center text-xs transition-colors">
                      <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </div>
                  </div>

                  <span className="mt-1 text-[11px] sm:text-xs font-semibold text-rose-100 line-clamp-1">
                    {v.name}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-rose-300/70 line-clamp-1">
                    {v.meaning}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Wrapper Selector */}
          <div className="border-t border-rose-500/20 pt-3 mt-3">
            <span className="text-xs uppercase tracking-wider text-rose-300 font-semibold block mb-2">
              Bouquet Wrap &amp; Ribbon
            </span>
            <div className="grid grid-cols-3 gap-2">
              {wrapperOptions.map((w) => (
                <button
                  key={w.id}
                  onClick={() => {
                    soundService.playChime(1.0);
                    setSelectedWrapper(w.name);
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                    selectedWrapper === w.name
                      ? 'border-rose-400 bg-rose-500/30 text-white shadow-md'
                      : 'border-white/10 bg-white/5 text-rose-200/70 hover:bg-white/10'
                  }`}
                >
                  {w.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Garden-Sized Bouquet Arrangement Visualizer */}
        <div className="lg:col-span-7 bg-[#190f19]/95 border border-rose-500/30 rounded-3xl p-6 shadow-2xl flex flex-col justify-between min-h-[460px]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-rose-400" />
              <span className="font-serif-romantic text-lg text-rose-50 font-semibold">
                Your Arrangement Preview ({arrangedFlowers.length}/20)
              </span>
            </div>
            {arrangedFlowers.length > 0 && (
              <button
                onClick={() => {
                  soundService.playChime(0.9);
                  setArrangedFlowers([]);
                }}
                className="text-xs text-rose-400 hover:text-rose-200 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All
              </button>
            )}
          </div>

          {/* Arrangement Bouquet Art Canvas - Big, Magnificent Garden-Quality Flowers */}
          <div className="relative flex-1 flex flex-col items-center justify-center my-2 min-h-[320px] sm:min-h-[360px] overflow-visible">
            {arrangedFlowers.length === 0 ? (
              <div className="text-center text-xs text-rose-300/50 max-w-xs">
                වම්පසින් ඇති ටියුලිප් වර්ග මත ක්ලික් කර විශාල මල් 20ක් දක්වා මල් කළඹට එක් කරන්න.
              </div>
            ) : (
              <div className="relative flex items-center justify-center w-full max-w-md h-72 sm:h-80">
                {/* Bouquet Wrapping Cone */}
                <div
                  className="absolute bottom-0 w-60 sm:w-72 h-40 sm:h-48 bg-gradient-to-t from-stone-950 via-rose-950/80 to-[#2c1322] rounded-b-[40px] border-b-2 border-rose-500/40 shadow-2xl flex items-end justify-center pb-3 z-10"
                >
                  <span className="text-[11px] uppercase font-mono tracking-widest text-rose-200/90 font-semibold bg-black/40 px-3 py-1 rounded-full border border-white/10">
                    {selectedWrapper}
                  </span>
                </div>

                {/* Satin Ribbon Bow */}
                <div className="absolute bottom-10 w-11 h-11 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 shadow-[0_0_20px_rgba(244,63,94,0.9)] flex items-center justify-center text-white z-30">
                  <Heart className="w-5 h-5 fill-white" />
                </div>

                {/* Layered Tulips Fanned Out - Big Majestic Garden Blossoms */}
                <div className="relative z-20 flex items-center justify-center -top-8 w-full h-full">
                  <AnimatePresence>
                    {arrangedFlowers.map((fl, i) => {
                      const total = arrangedFlowers.length;
                      // Layering logic: 3 depth tiers for a 3D garden bouquet effect
                      const depthTier = i % 3; // 0 = back, 1 = mid, 2 = front
                      const spreadAngle = total <= 5 ? 45 : total <= 10 ? 68 : 88;
                      const angle = ((i - (total - 1) / 2) / Math.max(1, total - 1)) * spreadAngle;
                      const yOffset = Math.abs(angle) * (total > 10 ? 0.38 : 0.48) + (depthTier === 0 ? 24 : depthTier === 1 ? 12 : 0);
                      const zIdx = depthTier === 0 ? 12 : depthTier === 1 ? 18 : 24;

                      return (
                        <motion.div
                          key={`${fl.id}-${i}`}
                          initial={{ scale: 0, y: 50, opacity: 0 }}
                          animate={{ scale: 1, y: -yOffset, rotate: angle, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                          onClick={() => handleRemoveFlower(i)}
                          title={`${fl.name} (Click to remove)`}
                          className="absolute transform cursor-pointer group"
                          style={{
                            transformOrigin: 'bottom center',
                            left: 'calc(50% - 36px)',
                            zIndex: zIdx,
                          }}
                        >
                          {/* Large Lush Garden-Sized Tulip Blossom */}
                          <div className="relative group-hover:scale-115 transition-transform duration-200">
                            <svg viewBox="0 0 72 96" className="w-18 sm:w-22 md:w-24 h-24 sm:h-28 md:h-32 drop-shadow-2xl">
                              {/* Organic Long Stem */}
                              <path d="M 36 44 Q 36 70 36 96" stroke="#15803d" strokeWidth="4.5" strokeLinecap="round" />
                              
                              {/* Lush Leaves */}
                              <path d="M 36 65 Q 20 54 8 62 Q 18 78 36 72" fill="#22c55e" opacity="0.9" />
                              <path d="M 36 58 Q 50 48 62 56 Q 52 72 36 66" fill="#16a34a" opacity="0.9" />

                              {/* Back Petals */}
                              <path d="M 22 36 C 14 18, 26 4, 36 8 C 46 4, 58 18, 50 36 C 44 44, 28 44, 22 36 Z" fill={fl.colorHex} />
                              <path d="M 22 36 C 16 20, 24 6, 35 9 C 30 18, 26 28, 22 36 Z" fill="#ffffff" fillOpacity="0.22" />

                              {/* Core Center Velvet Petal */}
                              <path d="M 18 40 C 10 24, 18 8, 36 12 C 54 8, 62 24, 54 40 C 48 48, 24 48, 18 40 Z" fill={fl.colorHex} />
                              
                              {/* Shading Contour & Petal Separations */}
                              <path d="M 18 40 C 14 24, 24 10, 36 14 C 30 24, 24 32, 18 40 Z" fill="#ffffff" fillOpacity="0.25" />
                              <path d="M 54 40 C 58 24, 48 10, 36 14 C 42 24, 48 32, 54 40 Z" fill="#000000" fillOpacity="0.22" />

                              {/* Center Petal Glint */}
                              <path d="M 26 22 C 30 14, 42 14, 46 22 C 42 32, 30 32, 26 22 Z" fill="#ffffff" fillOpacity="0.38" />

                              {/* Golden Heart Pistil */}
                              <circle cx="36" cy="18" r="2.8" fill="#fef08a" />
                              <circle cx="33" cy="19" r="1.5" fill="#fef08a" opacity="0.8" />
                              <circle cx="39" cy="19" r="1.5" fill="#fef08a" opacity="0.8" />
                            </svg>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>

          {/* Gift Card Tag Input */}
          <div className="bg-black/50 rounded-2xl p-3 border border-rose-500/20 text-xs mt-2">
            <label className="text-rose-300/80 mb-1 block font-medium">
              Handwritten Card Tag / ආදර පණිවිඩය
            </label>
            <input
              type="text"
              value={giftNote}
              onChange={(e) => setGiftNote(e.target.value)}
              className="w-full bg-stone-900/80 border border-white/10 rounded-xl px-3 py-2 text-rose-100 text-xs focus:outline-none focus:border-rose-400"
              placeholder="Write a sweet romantic message on the ribbon..."
            />
          </div>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="flex items-center justify-center pt-2">
        <button
          onClick={handleFinish}
          disabled={arrangedFlowers.length === 0}
          className="py-3 px-8 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 text-white font-medium text-xs sm:text-sm tracking-wide shadow-lg shadow-rose-950/50 flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-40 cursor-pointer"
        >
          <span>Wrap Bouquet &amp; Continue ({arrangedFlowers.length} Flowers)</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
