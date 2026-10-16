import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TulipFieldScene } from '../three/TulipFieldScene';
import {
  ChevronRight,
  ChevronLeft,
  Wind,
  Footprints,
  Sparkles,
  Heart,
  Calendar,
  MapPin,
  X,
  Maximize2,
  Minimize2,
  Video,
  Image as ImageIcon,
  Compass,
  ArrowLeft,
  ArrowRight,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { soundService } from '../../services/soundService';
import { MemoryItem } from '../../types';

interface Step4TulipFieldProps {
  onContinueToMemories: () => void;
  onSelectMemoryNode: (index: number) => void;
  coupleNames: { yourName: string; partnerName: string };
  memories?: MemoryItem[];
  isDesktopView?: boolean;
  onUpdateMemory?: (id: string, updates: Partial<MemoryItem>) => void;
}

export const Step4TulipField: React.FC<Step4TulipFieldProps> = ({
  onContinueToMemories,
  coupleNames,
  memories = [],
  isDesktopView = false,
  onUpdateMemory,
}) => {
  // Start from the very first stepping stone (index 0)
  const [currentStoneIndex, setCurrentStoneIndex] = useState(0);
  const totalStones = 16;
  const [windSpeed, setWindSpeed] = useState(1.0);
  const [activeMemory, setActiveMemory] = useState<MemoryItem | null>(null);
  const [memoryLikes, setMemoryLikes] = useState<{ [id: string]: number }>({});
  const [isMediaZoomed, setIsMediaZoomed] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [mediaReady, setMediaReady] = useState(false);
  const [isVideoBuffering, setIsVideoBuffering] = useState(false);
  const [lookYawTarget, setLookYawTarget] = useState(0); // 0 = forward, >0 = look left, <0 = look right
  const [viewMode, setViewMode] = useState<'elevated' | 'overhead' | 'pathway'>('elevated');
  const [showAllThumbnails, setShowAllThumbnails] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1.0); // 3D Camera Zoom
  // Garden options drawer: minimized by default for 100% unobstructed view of flowers!
  const [showOptionsDrawer, setShowOptionsDrawer] = useState(false);

  // Fresh start on reload: no floating thumbnails initially, only pure flowers!
  const [discoveredIndices, setDiscoveredIndices] = useState<number[]>([]);

  useEffect(() => {
    try {
      localStorage.removeItem('tulip_bloom_discovered_v1');
    } catch {}
  }, []);

  // Preload adjacent photos when a memory is active for 0ms transition speed
  useEffect(() => {
    if (!activeMemory || !memories.length) return;
    const currIdx = memories.findIndex((m) => m.id === activeMemory.id);
    if (currIdx >= 0) {
      [-1, 1].forEach((offset) => {
        const adjacent = memories[currIdx + offset];
        if (adjacent && adjacent.imageUrl && !adjacent.videoUrl) {
          const img = new Image();
          img.src = adjacent.imageUrl;
        }
      });
    }
  }, [activeMemory, memories]);

  const videoCount = useMemo(() => memories.filter((m) => !!m.videoUrl).length, [memories]);
  const photoCount = memories.length - videoCount;

  // Handle hopping to a specific stone
  const handleHopToStone = (index: number) => {
    const target = Math.max(0, Math.min(totalStones - 1, index));
    setCurrentStoneIndex(target);
    soundService.playChime(1.0 + target * 0.05);
  };

  const handleHopForward = () => {
    if (currentStoneIndex < totalStones - 1) {
      handleHopToStone(currentStoneIndex + 1);
    }
  };

  const handleHopBack = () => {
    if (currentStoneIndex > 0) {
      handleHopToStone(currentStoneIndex - 1);
    }
  };

  // Keyboard navigation for stones and looking
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeMemory) {
        if (e.key === 'Escape') {
          setActiveMemory(null);
          setIsMediaZoomed(false);
        }
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        handleHopForward();
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        handleHopBack();
      } else if (e.key === 'q' || e.key === 'Q') {
        setLookYawTarget(0.95); // Look left
      } else if (e.key === 'e' || e.key === 'E') {
        setLookYawTarget(-0.95); // Look right
      } else if (e.key === 'w' || e.key === 'W') {
        setLookYawTarget(0); // Center
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStoneIndex, activeMemory]);

  // When ANY flower is clicked in 3D:
  // Every single flower opens its OWN distinct photo or video!
  const handleSelectFlower = (idx: number) => {
    if (memories && memories.length > 0) {
      const targetIdx = Math.max(0, Math.min(memories.length - 1, idx));
      const mem = memories[targetIdx];
      setActiveMemory(mem);
      setIsMediaZoomed(false);
      setMediaReady(false);
      setIsVideoBuffering(false);
      setDiscoveredIndices((prev) => (prev.includes(targetIdx) ? prev : [...prev, targetIdx]));
      soundService.playChime(1.25);
    }
  };

  // Like interaction
  const handleLike = (id: string, initialLikes: number) => {
    soundService.playChime(1.35);
    setMemoryLikes((prev) => ({
      ...prev,
      [id]: (prev[id] ?? initialLikes) + 1,
    }));
  };

  const isVideoMemory = !!activeMemory?.videoUrl;

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* 3D Tulip Field Canvas with Interactive Stepping Stones, Clickable Flowers, and Free Look-Around */}
      <TulipFieldScene
        currentStoneIndex={currentStoneIndex}
        totalStones={totalStones}
        onSelectStone={handleHopToStone}
        onSelectMemoryTulip={handleSelectFlower}
        memories={memories}
        windSpeed={windSpeed}
        lookYawTarget={lookYawTarget}
        isPaused={!!activeMemory}
        viewMode={viewMode}
        discoveredIndices={discoveredIndices}
        showAllThumbnails={showAllThumbnails}
        zoomLevel={zoomLevel}
        onZoomChange={setZoomLevel}
      />

      {/* Retractable My Heart Camera & View Options Drawer */}
      <AnimatePresence>
        {showOptionsDrawer && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-32 sm:top-36 inset-x-4 max-w-xl mx-auto z-30 pointer-events-auto bg-black/90 backdrop-blur-xl p-3.5 rounded-2xl border border-rose-500/35 shadow-2xl flex flex-col gap-2.5"
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-white/10 text-xs">
              <div className="flex items-center gap-1.5 text-rose-200 font-medium">
                <SlidersHorizontal className="w-3.5 h-3.5 text-rose-400" />
                <span>My Heart Controls</span>
              </div>
              <button
                onClick={() => setShowOptionsDrawer(false)}
                className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
              {/* Look Left / Forward / Right */}
              <div className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-xl border border-white/10">
                <span className="text-[11px] text-stone-300 mr-1">Rotation:</span>
                <button
                  onClick={() => setLookYawTarget(0.95)}
                  className={`px-2 py-0.5 rounded-lg text-xs cursor-pointer ${
                    lookYawTarget > 0.4 ? 'bg-rose-500 text-white' : 'bg-white/10 text-stone-300'
                  }`}
                >
                  Right
                </button>
                <button
                  onClick={() => setLookYawTarget(0)}
                  className={`px-2 py-0.5 rounded-lg text-xs cursor-pointer ${
                    Math.abs(lookYawTarget) <= 0.4 ? 'bg-rose-500 text-white' : 'bg-white/10 text-stone-300'
                  }`}
                >
                  Forward
                </button>
                <button
                  onClick={() => setLookYawTarget(-0.95)}
                  className={`px-2 py-0.5 rounded-lg text-xs cursor-pointer ${
                    lookYawTarget < -0.4 ? 'bg-rose-500 text-white' : 'bg-white/10 text-stone-300'
                  }`}
                >
                  Left
                </button>
              </div>

              {/* Camera Angle */}
              <div className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-xl border border-white/10">
                <span className="text-[11px] text-stone-300 mr-1">View:</span>
                <button
                  onClick={() => { setViewMode('elevated'); soundService.playChime(1.1); }}
                  className={`px-2 py-0.5 rounded-lg text-xs cursor-pointer ${
                    viewMode === 'elevated' ? 'bg-rose-500 text-white' : 'bg-white/10 text-stone-300'
                  }`}
                >
                  By Height
                </button>
                <button
                  onClick={() => { setViewMode('overhead'); soundService.playChime(1.2); }}
                  className={`px-2 py-0.5 rounded-lg text-xs cursor-pointer ${
                    viewMode === 'overhead' ? 'bg-amber-500 text-white' : 'bg-white/10 text-stone-300'
                  }`}
                >
                  On Top
                </button>
                <button
                  onClick={() => { setViewMode('pathway'); soundService.playChime(1.05); }}
                  className={`px-2 py-0.5 rounded-lg text-xs cursor-pointer ${
                    viewMode === 'pathway' ? 'bg-purple-500 text-white' : 'bg-white/10 text-stone-300'
                  }`}
                >
                  Ground Level
                </button>
              </div>

              {/* 3D Zoom */}
              <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-xl border border-white/10">
                <span className="text-[11px] text-stone-300">Zoom:</span>
                <button
                  onClick={() => { setZoomLevel((z) => Math.max(0.7, +(z - 0.25).toFixed(2))); soundService.playChime(0.95); }}
                  className="w-5 h-5 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 text-xs cursor-pointer"
                >
                  -
                </button>
                <span className="text-[11px] font-mono text-amber-300">{zoomLevel.toFixed(1)}x</span>
                <button
                  onClick={() => { setZoomLevel((z) => Math.min(2.5, +(z + 0.25).toFixed(2))); soundService.playChime(1.15); }}
                  className="w-5 h-5 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 text-xs cursor-pointer"
                >
                  +
                </button>
                {zoomLevel !== 1.0 && (
                  <button
                    onClick={() => { setZoomLevel(1.0); soundService.playChime(1.0); }}
                    className="text-[10px] px-1 bg-rose-500/30 rounded text-rose-200"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Floating Thumbnails Toggle */}
              <div className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-xl border border-white/10">
                <button
                  onClick={() => {
                    setShowAllThumbnails((prev) => !prev);
                    soundService.playChime(showAllThumbnails ? 0.95 : 1.3);
                  }}
                  className={`px-2 py-0.5 rounded-lg text-xs cursor-pointer ${
                    showAllThumbnails ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white' : 'bg-white/10 text-stone-300'
                  }`}
                >
                  {showAllThumbnails ? 'Clicked Memories' : 'All Memories'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unified Low-Profile Bottom Dock: Leaves 90%+ of the Screen 100% Unobstructed! */}
      <div
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="absolute top-12 inset-x-0 flex flex-col items-center justify-center px-2 sm:px-4 z-20 pointer-events-auto"
      >
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/15 shadow-2xl max-w-full">
          {/* Step Back button */}
          <button
            onClick={handleHopBack}
            disabled={currentStoneIndex <= 0}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-25 text-rose-200 text-xs transition-colors cursor-pointer"
            title="Step back to previous stone"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden md:inline">Back</span>
          </button>

          {/* Current stone display */}
          <div className="px-2 py-0.5 bg-white/5 rounded-lg text-center">
            <span className="text-[11px] font-bold text-amber-300 font-mono">
              Stone {currentStoneIndex + 1}/{totalStones}
            </span>
          </div>

          {/* 16 Stepping Stones Quick Jump Pills */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-[240px] sm:max-w-xs md:max-w-md scrollbar-none px-1">
            {Array.from({ length: totalStones }).map((_, idx) => {
              const isCurrent = idx === currentStoneIndex;
              return (
                <button
                  key={idx}
                  onClick={() => handleHopToStone(idx)}
                  title={`Hop to Stone ${idx + 1}`}
                  className={`px-1.5 py-0.5 rounded-md text-[10px] sm:text-[11px] font-mono transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold scale-110 shadow-[0_0_10px_rgba(245,158,11,0.6)]'
                      : 'bg-white/10 hover:bg-white/20 text-stone-300'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Step Forward button */}
          <button
            onClick={handleHopForward}
            disabled={currentStoneIndex >= totalStones - 1}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-25 text-rose-200 text-xs transition-colors cursor-pointer"
            title="Step forward to next stone"
          >
            <span className="hidden md:inline">Next</span>
            <ChevronRight className="w-3.5 h-3.5 text-rose-400" />
          </button>

          <span className="h-4 w-px bg-white/15 hidden sm:block" />

          {/* Breeze Speed */}
          <button
            onClick={() => {
              const nextSpeed = windSpeed === 1.0 ? 1.7 : windSpeed === 1.7 ? 0.4 : 1.0;
              setWindSpeed(nextSpeed);
              soundService.playChime(1.1);
            }}
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-rose-200 text-xs transition-colors cursor-pointer"
            title="Heart Breeze Speed"
          >
            <Wind className="w-3.5 h-3.5 text-rose-300" />
            <span className="hidden lg:inline text-[11px]">
              {windSpeed === 1.0 ? 'Breeze' : windSpeed === 1.7 ? 'Brisk' : 'Still'}
            </span>
          </button>

          {/* Garden Options Toggle Button */}
          <button
            onClick={() => {
              setShowOptionsDrawer((prev) => !prev);
              soundService.playChime(showOptionsDrawer ? 0.95 : 1.15);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
              showOptionsDrawer
                ? 'bg-rose-500/30 text-rose-200 border border-rose-400/40 shadow-sm'
                : 'bg-white/10 hover:bg-white/20 text-rose-200 border border-white/10'
            }`}
            title={showOptionsDrawer ? 'Hide Controls' : 'Camera & Angle Controls'}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-rose-300" />
            <span className="text-[11px]">{showOptionsDrawer ? 'Clear View' : 'Options'}</span>
          </button>

          <span className="h-4 w-px bg-white/15" />

          {/* Proceed to Step 5 Memory Nodes button */}
          <button
            onClick={() => {
              soundService.playChime(1.3);
              onContinueToMemories();
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs font-semibold shadow-md shadow-rose-500/25 transition-all cursor-pointer whitespace-nowrap"
          >
            <span>All {memories.length} Blooms</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Flower Memory Card Modal (Photo Flower -> ONLY Photo, Video Flower -> ONLY Video) */}
      <AnimatePresence>
        {activeMemory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 select-none">
            {/* Dedicated Outside Backdrop: clicking anywhere outside the card dismisses the popup */}
            <div
              className="absolute inset-0 bg-black/85 backdrop-blur-sm cursor-pointer"
              onClick={() => {
                setActiveMemory(null);
                setIsMediaZoomed(false);
                setIsFullScreen(false);
                soundService.playChime(0.9);
              }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className={`relative z-10 w-full ${
                isFullScreen
                  ? 'fixed inset-0 max-w-none max-h-none h-full rounded-none z-50'
                  : 'max-w-xl max-h-[92vh] rounded-3xl'
              } bg-gradient-to-b from-[#1b0b15] to-[#10050c] border border-rose-500/30 shadow-[0_0_40px_rgba(244,63,94,0.25)] overflow-hidden flex flex-col cursor-default transition-all duration-300`}
            >
              {/* Top Navigation & Close Bar */}
              <div className="absolute top-3.5 right-3.5 z-30 flex items-center gap-2">
                {/* Fullscreen Toggle Button */}
                <button
                  onClick={() => {
                    setIsFullScreen((prev) => !prev);
                    soundService.playChime(1.2);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    isFullScreen
                      ? 'bg-rose-500 text-white shadow shadow-rose-500/40'
                      : 'bg-black/60 hover:bg-black/90 text-rose-200 hover:text-white border border-rose-500/30'
                  }`}
                  title={isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
                >
                  {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{isFullScreen ? 'Default' : 'Full Screen'}</span>
                </button>

                {/* Prev flower button */}
                <button
                  onClick={() => {
                    const idx = memories.findIndex((m) => m.id === activeMemory.id);
                    if (idx > 0) {
                      const prevIdx = idx - 1;
                      setActiveMemory(memories[prevIdx]);
                      setMediaReady(false);
                      setIsVideoBuffering(false);
                      setDiscoveredIndices((prev) => (prev.includes(prevIdx) ? prev : [...prev, prevIdx]));
                      soundService.playChime(1.1);
                    }
                  }}
                  disabled={memories.findIndex((m) => m.id === activeMemory.id) <= 0}
                  className="p-2 rounded-full bg-black/60 hover:bg-black/90 disabled:opacity-20 text-rose-200 hover:text-white transition-colors cursor-pointer"
                  title="Previous"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Next flower button */}
                <button
                  onClick={() => {
                    const idx = memories.findIndex((m) => m.id === activeMemory.id);
                    if (idx < memories.length - 1) {
                      const nextIdx = idx + 1;
                      setActiveMemory(memories[nextIdx]);
                      setMediaReady(false);
                      setIsVideoBuffering(false);
                      setDiscoveredIndices((prev) => (prev.includes(nextIdx) ? prev : [...prev, nextIdx]));
                      soundService.playChime(1.1);
                    }
                  }}
                  disabled={memories.findIndex((m) => m.id === activeMemory.id) >= memories.length - 1}
                  className="p-2 rounded-full bg-black/60 hover:bg-black/90 disabled:opacity-20 text-rose-200 hover:text-white transition-colors cursor-pointer"
                  title="Next"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Close Button */}
                <button
                  onClick={() => {
                    setActiveMemory(null);
                    setIsMediaZoomed(false);
                    setIsFullScreen(false);
                    soundService.playChime(0.9);
                  }}
                  className="p-2 rounded-full bg-black/60 hover:bg-black/90 text-rose-200 hover:text-white transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Media Container: Fast thumbnail placeholder + web-optimized media */}
              <div
                className={`relative w-full ${
                  isFullScreen ? 'flex-1 min-h-[60vh]' : 'aspect-[4/3]'
                } bg-black overflow-hidden group flex items-center justify-center`}
              >
                {/* Immediate 0ms Crisp Thumbnail Placeholder Preview */}
                <img
                  src={activeMemory.thumbnailUrl || activeMemory.imageUrl}
                  alt="thumbnail preview"
                  className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-200 pointer-events-none ${
                    mediaReady ? 'opacity-0' : 'opacity-100'
                  } ${activeMemory.id === 'mem-38' || activeMemory.id === 'mem-58' ? 'p-3 scale-90' : ''}`}
                />

                {!mediaReady && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 text-rose-200 text-xs border border-rose-500/30 backdrop-blur-sm animate-pulse">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                      <span>Umma 😘...</span>
                    </div>
                  </div>
                )}

                {isVideoMemory ? (
                  // Dedicated Fast-Start Web-Optimized Video Player with Instant Streaming
                  <div className="relative z-10 w-full h-full flex items-center justify-center bg-black/40">
                    <video
                      key={activeMemory.videoUrl}
                      src={activeMemory.videoUrl}
                      poster={activeMemory.thumbnailUrl}
                      autoPlay
                      loop
                      playsInline
                      controls
                      preload="auto"
                      onWaiting={() => setIsVideoBuffering(true)}
                      onPlaying={() => {
                        setIsVideoBuffering(false);
                        setMediaReady(true);
                      }}
                      onLoadedData={() => {
                        setMediaReady(true);
                        setIsVideoBuffering(false);
                      }}
                      onCanPlay={() => {
                        setMediaReady(true);
                        setIsVideoBuffering(false);
                      }}
                      style={{ transform: 'translateZ(0)', willChange: 'transform' }}
                      className="w-full h-full object-contain"
                    />

                    {isVideoBuffering && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 bg-black/35 backdrop-blur-[1px]">
                        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/80 text-amber-300 text-xs border border-amber-500/40 shadow-xl animate-pulse">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                          <span>I Love You 🥰...</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Dedicated Fast High-Performance Photo Viewer
                  <div
                    className="relative z-10 w-full h-full cursor-zoom-in flex items-center justify-center"
                    onClick={() => setIsMediaZoomed(true)}
                    title="Click to view full photo"
                  >
                    <img
                      key={activeMemory.imageUrl}
                      src={activeMemory.imageUrl}
                      alt={activeMemory.title}
                      loading="eager"
                      decoding="async"
                      ref={(el) => {
                        if (el && el.complete && el.naturalWidth > 0) setMediaReady(true);
                      }}
                      onLoad={() => setMediaReady(true)}
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (activeMemory.thumbnailUrl && target.src !== window.location.origin + activeMemory.thumbnailUrl) {
                          target.src = activeMemory.thumbnailUrl;
                        }
                        setMediaReady(true);
                      }}
                      style={{ transform: 'translateZ(0)' }}
                      className={`w-full h-full object-contain transition-opacity duration-300 ${
                        mediaReady ? 'opacity-100' : 'opacity-0'
                      } ${
                        activeMemory && (
                          activeMemory.id === 'mem-37' ||
                          activeMemory.id === 'mem-38' ||
                          activeMemory.id === 'mem-57' ||
                          activeMemory.id === 'mem-58' ||
                          activeMemory.title?.includes('#38') ||
                          activeMemory.title?.includes('#39') ||
                          activeMemory.title?.includes('#58') ||
                          activeMemory.title?.includes('#59')
                        )
                          ? 'p-4 sm:p-6 scale-80 sm:scale-75'
                          : ''
                      } ${activeMemory?.id === 'mem-8' ? 'rotate-180 scale-x-[-1]' : ''}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#10050c] via-transparent to-black/20 pointer-events-none" />
                  </div>
                )}

                {/* Media Type Badge & Flower Number */}
                <div className="absolute top-3.5 left-3.5 z-20 flex items-center gap-1.5 bg-black/80 px-3 py-1 rounded-full border border-rose-500/30 text-xs text-rose-200 shadow-md">
                  {isVideoMemory ? (
                    <>
                      <Video className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-semibold text-amber-300">Video</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
                      <span>{activeMemory.flowerVariety || 'Heart Blossom'}</span>
                    </>
                  )}
                  <span className="text-white/40">·</span>
                  <span className="text-[11px] font-mono text-rose-300">
                    #{memories.findIndex((m) => m.id === activeMemory.id) + 1}/{memories.length}
                  </span>
                </div>

                {/* Date & Location Pill */}
                <div className="absolute bottom-3 left-4 right-14 z-20 flex items-center justify-between text-xs text-rose-200/90 drop-shadow pointer-events-none">
                  <div className="flex items-center gap-1.5 bg-black/75 px-2.5 py-1 rounded-lg border border-white/10">
                    <Calendar className="w-3 h-3 text-rose-400" />
                    <span>{activeMemory.date}</span>
                  </div>
                  {activeMemory.location ? (
                    <div className="flex items-center gap-1.5 bg-black/75 px-2.5 py-1 rounded-lg border border-white/10 truncate max-w-[200px]">
                      <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                      <span className="truncate">{activeMemory.location}</span>
                    </div>
                  ) : null}
                </div>

                {/* Zoom Fullscreen Button */}
                <button
                  onClick={() => setIsMediaZoomed(true)}
                  className="absolute bottom-3 right-3 z-25 p-2 rounded-xl bg-black/75 hover:bg-black/95 text-white/90 transition-colors cursor-pointer"
                  title="Expand Fullscreen"
                >
                  <Maximize2 className="w-4 h-4 text-rose-200" />
                </button>
              </div>

              {/* Memory Story & Loving Sinhala Quote */}
              <div className="p-6 flex flex-col gap-3.5 overflow-y-auto">
                <h3 className="text-xl sm:text-2xl font-serif-romantic text-rose-50 font-medium leading-snug">
                  {activeMemory.title}
                </h3>

                {/* Romantic Sinhala Sentence Under The Photo / Video */}
                {activeMemory.sinhalaQuote && (
                  <div className="relative bg-rose-950/45 border border-rose-400/30 rounded-2xl p-4 shadow-inner">
                    <div className="text-[10px] uppercase tracking-wider text-rose-300 font-medium mb-1 flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                      <span>Loving Memory</span>
                    </div>
                    <p className="text-sm sm:text-base text-rose-100 font-serif-romantic italic leading-relaxed">
                      « {activeMemory.sinhalaQuote} »
                    </p>
                  </div>
                )}

                {/* Narrative Caption */}
                <p className="text-xs sm:text-sm text-rose-200/80 leading-relaxed font-light">
                  {activeMemory.caption}
                </p>

                {/* Bottom Interaction Bar */}
                <div className="pt-2 flex items-center justify-between border-t border-rose-500/20 mt-1">
                  {/* Like Button */}
                  <button
                    onClick={() => handleLike(activeMemory.id, activeMemory.likes)}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-200 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Heart className="w-4 h-4 text-rose-400 fill-rose-400 animate-pulse" />
                    <span>{memoryLikes[activeMemory.id] ?? activeMemory.likes} Love Our Memory</span>
                  </button>

                  <div className="flex items-center gap-2 text-xs text-rose-300/80 font-mono">
                    <span>{isVideoMemory ? 'Video' : 'Photo'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fullscreen Photo / Video Lightbox */}
      <AnimatePresence>
        {isMediaZoomed && activeMemory && (
          <div
            className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-center p-4 select-none"
            onClick={() => setIsMediaZoomed(false)}
          >
            <button
              onClick={() => setIsMediaZoomed(false)}
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
                  activeMemory && (
                    activeMemory.id === 'mem-37' ||
                    activeMemory.id === 'mem-38' ||
                    activeMemory.id === 'mem-57' ||
                    activeMemory.id === 'mem-58' ||
                    activeMemory.title?.includes('#38') ||
                    activeMemory.title?.includes('#39') ||
                    activeMemory.title?.includes('#58') ||
                    activeMemory.title?.includes('#59')
                  )
                    ? 'p-6 sm:p-10 scale-85 sm:scale-80'
                    : ''
                }`}
              />
            )}

            <div className="mt-4 text-center">
              <p className="font-serif-romantic text-rose-100 text-lg sm:text-xl font-medium">
                {activeMemory.title}
              </p>
              {activeMemory.sinhalaQuote && (
                <p className="mt-1 text-sm text-rose-300 font-serif-romantic">
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
