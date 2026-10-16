import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapLocation } from '../../types';
import { Calendar, Compass, ChevronRight, Sparkles, Navigation, X, Upload } from 'lucide-react';
import { soundService } from '../../services/soundService';

interface Step6MapGalleryProps {
  locations: MapLocation[];
  onNextStep: () => void;
  coupleNames: { yourName: string; partnerName: string };
  onUpdateLocationPhoto?: (id: string, newUrl: string) => void;
}

export const Step6MapGallery: React.FC<Step6MapGalleryProps> = ({
  locations,
  onNextStep,
  coupleNames,
  onUpdateLocationPhoto,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation>(locations[0]);
  const [isPhotoExpanded, setIsPhotoExpanded] = useState(false);
  const locationFileInputRef = React.useRef<HTMLInputElement>(null);

  const handleLocationFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdateLocationPhoto) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          soundService.playChime(1.2);
          onUpdateLocationPhoto(selectedLocation.id, result);
          setSelectedLocation((prev) => ({ ...prev, imageUrl: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between py-8 px-4 sm:px-8 z-20 select-none overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-xs tracking-widest text-pink-300 font-medium uppercase bg-pink-950/40 border border-pink-500/20 px-3 py-1 rounded-full"
        >
          <span>{coupleNames.yourName} &amp; {coupleNames.partnerName}</span>
          <span aria-hidden="true">·</span>
          <span>Chapter 06: Our Favorite Places</span>
        </motion.div>

        <h2 className="mt-2 text-2xl sm:text-4xl font-serif-romantic text-rose-50">
          Where Our Petals Drifted
        </h2>
        <p className="text-xs sm:text-sm text-pink-200/70 max-w-md mt-1 font-light">
          Pink tulips celebrate affection and shared journeys. Click each pink tulip pin across our favorite destinations.
        </p>
      </div>

      {/* Main Map & Detail Layout */}
      <div className="my-auto py-4 max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Interactive Stylized Map */}
        <div className="lg:col-span-7 relative h-[360px] sm:h-[420px] rounded-3xl bg-[#140f1a] border border-pink-500/20 overflow-hidden shadow-2xl p-4 flex flex-col justify-between">
          {/* Stylized Island Map SVG background representing our travel realm */}
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            <svg viewBox="0 0 400 500" className="w-full h-full text-pink-950 fill-current">
              {/* Island Contour */}
              <path
                d="M170 40 C210 50 250 100 260 160 C270 230 290 300 270 370 C250 430 200 460 150 450 C110 440 90 380 90 310 C90 230 110 160 130 90 Z"
                className="text-pink-900/30"
              />
              <path
                d="M160 60 C195 70 230 110 240 165 C250 230 265 295 245 355 C230 405 185 435 145 425 C115 415 105 365 105 305 C105 235 120 170 140 105 Z"
                className="text-pink-800/20"
              />
              {/* Topo lines */}
              <circle cx="180" cy="220" r="45" fill="none" stroke="rgba(244,114,182,0.15)" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="180" cy="220" r="90" fill="none" stroke="rgba(244,114,182,0.1)" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="180" cy="220" r="135" fill="none" stroke="rgba(244,114,182,0.06)" strokeWidth="1" />
            </svg>
          </div>

          {/* Compass Rose */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-pink-300/80 font-mono bg-black/40 px-2.5 py-1 rounded-full border border-pink-500/20">
              <Compass className="w-3.5 h-3.5 text-pink-400" />
              <span>Sri Lanka Romantic Expedition</span>
            </div>
            <div className="text-[10px] text-pink-300/50 font-mono">
              {locations.length} Blossomed Cities
            </div>
          </div>

          {/* Map Pins Container */}
          <div className="relative flex-1 w-full h-full my-2">
            {locations.map((loc) => {
              const isSelected = selectedLocation.id === loc.id;
              return (
                <div
                  key={loc.id}
                  style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
                  onClick={() => {
                    soundService.playChime(1.1);
                    setSelectedLocation(loc);
                  }}
                >
                  {/* Radar Ripple Ring */}
                  {isSelected && (
                    <span className="absolute -inset-3 rounded-full bg-pink-500/40 animate-ping pointer-events-none" />
                  )}

                  {/* Pink Tulip Pin Icon */}
                  <motion.div
                    whileHover={{ scale: 1.25 }}
                    className={`relative p-1.5 rounded-full transition-all flex items-center justify-center ${
                      isSelected
                        ? 'bg-pink-500 shadow-[0_0_20px_rgba(244,114,182,0.9)] scale-110'
                        : 'bg-pink-950/80 border border-pink-400/50 hover:bg-pink-800'
                    }`}
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                      <path d="M12 2C8.5 2 6 4.5 6 7.5C6 11 9 13.5 12 13.5C15 13.5 18 11 18 7.5C18 4.5 15.5 2 12 2Z" />
                      <path d="M12 13.5V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </motion.div>

                  {/* Pin City Label */}
                  <div
                    className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-pink-500 text-white shadow-md'
                        : 'bg-black/70 text-pink-200 border border-pink-500/20'
                    }`}
                  >
                    {loc.name}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Location Pills Bar */}
          <div className="relative z-10 flex items-center gap-1.5 overflow-x-auto pb-1 pt-2">
            {locations.map((loc) => (
              <button
                key={loc.id}
                onClick={() => {
                  soundService.playChime(1.0);
                  setSelectedLocation(loc);
                }}
                className={`text-xs px-3 py-1 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  selectedLocation.id === loc.id
                    ? 'bg-pink-500 text-white font-medium shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 text-pink-200/80'
                }`}
              >
                {loc.name}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Destination Detail Card */}
        <div className="lg:col-span-5 bg-[#170e17]/90 rounded-3xl border border-pink-500/25 p-6 shadow-2xl flex flex-col justify-between h-[360px] sm:h-[420px]">
          <div>
            {/* Header info */}
            <div className="flex items-center justify-between text-xs text-pink-300/70 border-b border-pink-500/20 pb-3">
              <span className="flex items-center gap-1 font-mono">
                <Navigation className="w-3.5 h-3.5 text-pink-400" />
                {selectedLocation.coordinates}
              </span>
              <span className="flex items-center gap-1 font-mono">
                <Calendar className="w-3.5 h-3.5 text-pink-400" />
                {selectedLocation.dateVisited}
              </span>
            </div>

            {/* City Title */}
            <h3 className="text-2xl sm:text-3xl font-serif-romantic text-rose-50 mt-3">
              {selectedLocation.name}
            </h3>
            <p className="text-xs sm:text-sm text-pink-100/80 font-light mt-1.5 leading-relaxed">
              {selectedLocation.description}
            </p>

            {/* Photo Preview Thumbnail & Replace Button */}
            <div className="mt-4 flex flex-col gap-1.5">
              <div
                onClick={() => setIsPhotoExpanded(true)}
                className="relative h-28 rounded-2xl overflow-hidden border border-pink-500/30 group cursor-pointer"
              >
                <img
                  src={selectedLocation.imageUrl}
                  alt={selectedLocation.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2.5">
                  <span className="text-[11px] text-pink-200 font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-pink-400" /> Click to enlarge memory photo
                  </span>
                </div>
              </div>

              {onUpdateLocationPhoto && (
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => locationFileInputRef.current?.click()}
                    className="text-[11px] text-pink-300 hover:text-white flex items-center gap-1.5 bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    <Upload className="w-3 h-3 text-pink-400" />
                    <span>Replace Location Photo</span>
                  </button>
                  <input
                    ref={locationFileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleLocationFileChange}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* Highlights Tag List */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {selectedLocation.highlights.map((hl, i) => (
                <span
                  key={i}
                  className="text-[11px] bg-pink-950/60 border border-pink-500/20 text-pink-200 px-2 py-0.5 rounded-md"
                >
                  {hl}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Photo Lightbox */}
      <AnimatePresence>
        {isPhotoExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsPhotoExpanded(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full bg-[#160d16] rounded-3xl overflow-hidden border border-pink-500/30 shadow-2xl p-4"
            >
              <button
                onClick={() => setIsPhotoExpanded(false)}
                className="absolute top-6 right-6 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <img
                src={selectedLocation.imageUrl}
                alt={selectedLocation.name}
                referrerPolicy="no-referrer"
                className="w-full max-h-[70vh] object-cover rounded-2xl"
              />
              <div className="pt-3 px-2 flex items-center justify-between text-xs text-pink-200">
                <span className="font-semibold text-sm">{selectedLocation.name}</span>
                <span className="font-mono text-pink-300/70">{selectedLocation.dateVisited}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom CTA */}
      <div className="flex items-center justify-center pt-2">
        <button
          onClick={() => {
            soundService.playChime(1.2);
            onNextStep();
          }}
          className="py-3 px-6 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 text-white font-medium text-xs sm:text-sm tracking-wide shadow-lg shadow-pink-950/50 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
        >
          <span>Listen to Our Inside Jokes (Yellow Tulips)</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
