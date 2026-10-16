import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MemoryItem } from '../../types';
import {
  Heart,
  MapPin,
  Calendar,
  X,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Video,
  Image as ImageIcon,
} from 'lucide-react';
import { soundService } from '../../services/soundService';

interface Step5MemoryNodesProps {
  memories: MemoryItem[];
  onNextStep: () => void;
  coupleNames: { yourName: string; partnerName: string };
  isDesktopView?: boolean;
  onUpdateMemory?: (id: string, updates: Partial<MemoryItem>) => void;
}

const isFramedMemory = (mem: MemoryItem | null) => {
  if (!mem) return false;
  return (
    mem.id === 'mem-37' ||
    mem.id === 'mem-38' ||
    mem.id === 'mem-57' ||
    mem.id === 'mem-58' ||
    mem.title?.includes('#38') ||
    mem.title?.includes('#39') ||
    mem.title?.includes('#58') ||
    mem.title?.includes('#59')
  );
};

// Memoized individual flower button to prevent re-rendering 65 items on every click
const MemoryFlowerButton = memo(({
  mem,
  originalIndex,
  isSelected,
  onSelect,
}: {
  mem: MemoryItem;
  originalIndex: number;
  isSelected: boolean;
  onSelect: (index: number) => void;
}) => {
  const flowerColor = mem.color || '#ef4444';
  const isVid = !!mem.videoUrl;

  return (
    <button
      onClick={() => onSelect(originalIndex)}
      className={`group relative flex flex-col items-center p-2 rounded-2xl transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'bg-rose-500/30 border-2 border-rose-400 shadow-[0_0_16px_rgba(244,63,94,0.6)] scale-105 z-10'
          : isVid
          ? 'bg-amber-950/40 border border-amber-500/40 hover:border-amber-400'
          : 'bg-black/40 border border-rose-500/20 hover:border-rose-400/50'
      }`}
      style={{ transform: 'translateZ(0)' }}
    >
      {/* Flower Avatar / SVG */}
      <div className="relative w-12 h-14 sm:w-14 sm:h-16 flex items-center justify-center">
        <svg
          viewBox="0 0 64 64"
          className={`w-10 h-10 transition-transform duration-200 drop-shadow-md ${
            isSelected ? 'scale-110' : 'group-hover:scale-105'
          }`}
        >
          <path d="M 32 36 Q 31 52 32 62" stroke="#15803d" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M 32 48 Q 22 42 16 46 Q 22 56 32 50" fill="#22c55e" opacity="0.85" />
          <path d="M 32 44 Q 42 38 48 42 Q 42 52 32 46" fill="#16a34a" opacity="0.85" />
          <path d="M 22 34 C 17 25, 23 12, 32 16 C 41 12, 47 25, 42 34 C 36 38, 28 38, 22 34 Z" fill={isVid ? '#fbbf24' : flowerColor} />
        </svg>

        {/* Thumbnail Avatar Preview */}
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full overflow-hidden border border-white/60 shadow-md bg-black">
          {isVid ? (
            <div className="w-full h-full flex items-center justify-center bg-amber-500 text-black">
              <Video className="w-3 h-3 text-white" />
            </div>
          ) : (
            <img
              src={mem.thumbnailUrl || mem.imageUrl}
              alt=""
              loading="lazy"
              decoding="async"
              className={`w-full h-full object-cover ${mem.id === 'mem-8' ? 'rotate-180 scale-x-[-1]' : ''}`}
            />
          )}
        </div>
      </div>

      {/* Micro Label */}
      <span className="text-[10px] text-rose-200/90 font-mono mt-0.5 truncate max-w-[64px] text-center">
        #{originalIndex + 1}
      </span>
    </button>
  );
});
MemoryFlowerButton.displayName = 'MemoryFlowerButton';

export const Step5MemoryNodes: React.FC<Step5MemoryNodesProps> = ({
  memories,
  onNextStep,
  coupleNames,
  isDesktopView = false,
  onUpdateMemory,
}) => {
  const [selectedMemoryIndex, setSelectedMemoryIndex] = useState<number | null>(0);
  const [memoryLikes, setMemoryLikes] = useState<{ [id: string]: number }>({});
  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false);

  const activeMemory =
    selectedMemoryIndex !== null && selectedMemoryIndex < memories.length
      ? memories[selectedMemoryIndex]
      : null;

  const isVideoMemory = !!activeMemory?.videoUrl;

  const handleLike = (id: string, initialLikes: number) => {
    soundService.playChime(1.4);
    setMemoryLikes((prev) => ({
      ...prev,
      [id]: (prev[id] ?? initialLikes) + 1,
    }));
  };

  const handleSelectFlower = (index: number) => {
    soundService.playChime(1.0 + (index % 12) * 0.05);
    setSelectedMemoryIndex(index);
  };

  return (
    <div className={`relative w-full h-full flex flex-col lg:flex-row items-center justify-center py-4 px-3 sm:px-6 z-20 select-none overflow-y-auto gap-6 ${
      isDesktopView ? 'max-w-7xl mx-auto' : ''
    }`}>

      {/* Left / Top: 65 Flowers Grid clearly displaying all 65 flowers */}
      <div className="w-full lg:w-3/5 max-h-[48vh] lg:max-h-[82vh] overflow-y-auto p-3.5 rounded-2xl bg-black/40 border border-white/10 scrollbar-thin">
        <div className="flex items-center justify-center gap-2.5 sm:gap-3 flex-wrap">
          {memories.map((mem, originalIndex) => {
            const isSelected = selectedMemoryIndex === originalIndex;

            return (
              <MemoryFlowerButton
                key={mem.id}
                mem={mem}
                originalIndex={originalIndex}
                isSelected={isSelected}
                onSelect={handleSelectFlower}
              />
            );
          })}
        </div>
      </div>

      {/* Right / Bottom: Selected Memory Preview Card (Smaller & Centered) */}
      {activeMemory && (
        <div className="w-full lg:w-2/5 flex flex-col items-center justify-center">
          <motion.div
            key={activeMemory.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-sm sm:max-w-md bg-stone-100 p-3.5 sm:p-4 rounded-2xl shadow-xl border-2 border-white flex flex-col"
          >
            {/* Media Container */}
            <div className="relative w-full aspect-[4/3] bg-black overflow-hidden rounded-lg flex items-center justify-center group">
              {isVideoMemory ? (
                <video
                  key={activeMemory.videoUrl}
                  src={activeMemory.videoUrl}
                  autoPlay
                  loop
                  playsInline
                  controls
                  preload="metadata"
                  style={{ transform: 'translateZ(0)' }}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div
                  className="relative w-full h-full cursor-zoom-in flex items-center justify-center"
                  onClick={() => setIsPhotoZoomed(true)}
                  title="Click to zoom in"
                >
                  <img
                    key={activeMemory.imageUrl}
                    src={activeMemory.imageUrl}
                    alt={activeMemory.title}
                    loading="eager"
                    decoding="async"
                    style={{ transform: 'translateZ(0)' }}
                    className={`w-full h-full object-contain transition-transform duration-300 ${
                      isFramedMemory(activeMemory) ? 'p-3 sm:p-4 scale-80' : ''
                    } ${activeMemory.id === 'mem-8' ? 'rotate-180 scale-x-[-1]' : ''}`}
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-sm p-1.5 rounded-full text-white">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}

              {/* Date & Location Pill */}
              <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-white text-[11px] font-mono flex items-center gap-1.5 pointer-events-none">
                <Calendar className="w-3 h-3 text-rose-400" />
                <span>{activeMemory.date}</span>
              </div>

              {/* Media Tag */}
              <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm text-white text-[10px] font-medium flex items-center gap-1.5 border border-white/20 pointer-events-none">
                {isVideoMemory ? (
                  <>
                    <Video className="w-3 h-3 text-amber-400" />
                    <span>Video Memory</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-3 h-3 text-rose-400" />
                    <span>Photo Blossom</span>
                  </>
                )}
              </div>
            </div>

            {/* Memory Info & Heart Button */}
            <div className="mt-3 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <h3 className="font-serif-romantic text-base sm:text-lg font-bold text-stone-900 truncate">
                  {activeMemory.title}
                </h3>
                <button
                  onClick={() => handleLike(activeMemory.id, activeMemory.likes)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer text-xs font-semibold"
                >
                  <Heart className="w-3.5 h-3.5 fill-rose-500" />
                  <span>{memoryLikes[activeMemory.id] ?? activeMemory.likes}</span>
                </button>
              </div>

              {activeMemory.location ? (
                <div className="flex items-center gap-1.5 text-xs text-stone-600 font-sans">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                  <span className="truncate">{activeMemory.location}</span>
                </div>
              ) : null}

              {activeMemory.sinhalaQuote && (
                <p className="text-xs font-serif-romantic text-rose-950 font-medium italic mt-0.5 leading-snug">
                  « {activeMemory.sinhalaQuote} »
                </p>
              )}

              {activeMemory.caption && (
                <p className="text-xs text-stone-700 line-clamp-2 font-light">
                  {activeMemory.caption}
                </p>
              )}

              {/* Prev / Next Blossom Quick Switch */}
              <div className="flex items-center justify-between pt-2 border-t border-stone-200 mt-1.5 text-xs">
                <button
                  onClick={() => {
                    const prevIdx = (selectedMemoryIndex ?? 0) - 1;
                    if (prevIdx >= 0) handleSelectFlower(prevIdx);
                  }}
                  disabled={(selectedMemoryIndex ?? 0) <= 0}
                  className="flex items-center gap-1 text-stone-600 hover:text-stone-900 disabled:opacity-30 cursor-pointer font-medium"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <span className="font-mono text-[11px] text-stone-500">
                  {(selectedMemoryIndex ?? 0) + 1} of {memories.length}
                </span>
                <button
                  onClick={() => {
                    const nextIdx = (selectedMemoryIndex ?? 0) + 1;
                    if (nextIdx < memories.length) handleSelectFlower(nextIdx);
                  }}
                  disabled={(selectedMemoryIndex ?? 0) >= memories.length - 1}
                  className="flex items-center gap-1 text-stone-600 hover:text-stone-900 disabled:opacity-30 cursor-pointer font-medium"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Next Step Button */}
          <div className="mt-4 flex items-center justify-center">
            <button
              onClick={() => {
                soundService.playChime(1.2);
                onNextStep();
              }}
              className="py-2.5 px-5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium text-xs sm:text-sm tracking-wide shadow-lg shadow-rose-950/50 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <span>Chapter 6: Our Singings</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Full Photo / Video Zoom Modal */}
      <AnimatePresence>
        {isPhotoZoomed && activeMemory && (
          <div
            className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-center p-4 select-none"
            onClick={() => setIsPhotoZoomed(false)}
          >
            <button
              onClick={() => setIsPhotoZoomed(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-20 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            {isVideoMemory ? (
              <video
                src={activeMemory.videoUrl}
                autoPlay
                controls
                playsInline
                loop
                preload="metadata"
                style={{ transform: 'translateZ(0)' }}
                className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl border border-rose-500/20"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <motion.img
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                src={activeMemory.imageUrl}
                alt={activeMemory.title}
                loading="eager"
                decoding="async"
                style={{ transform: 'translateZ(0)' }}
                className={`max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl border border-rose-500/20 cursor-zoom-out ${
                  isFramedMemory(activeMemory) ? 'p-6 sm:p-10 scale-85 sm:scale-80' : ''
                } ${activeMemory.id === 'mem-8' ? 'rotate-180 scale-x-[-1]' : ''}`}
              />
            )}

            <div className="mt-4 text-center">
              <p className="font-serif-romantic text-rose-100 text-lg sm:text-xl font-medium">
                {activeMemory.title}
              </p>
              {activeMemory.sinhalaQuote && (
                <p className="mt-1 text-sm text-rose-300 font-serif-romantic italic">
                  « {activeMemory.sinhalaQuote} »
                </p>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
