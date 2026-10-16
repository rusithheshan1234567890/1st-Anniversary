import React, { useState } from 'react';
import { Volume2, VolumeX, Settings, Heart, Monitor } from 'lucide-react';
import { soundService } from '../../services/soundService';
import { CoupleProfile } from '../../types';

interface HeaderNavProps {
  currentStep: number;
  totalSteps: number;
  onNavigateToStep: (step: number) => void;
  coupleProfile: CoupleProfile;
  onUpdateCoupleProfile: (profile: CoupleProfile) => void;
  isDesktopView?: boolean;
  onToggleDesktopView?: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentStep,
  totalSteps,
  onNavigateToStep,
  coupleProfile,
  onUpdateCoupleProfile,
  isDesktopView = false,
  onToggleDesktopView,
}) => {
  const [isMuted, setIsMuted] = useState(soundService.getMuted());
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editYourName, setEditYourName] = useState(coupleProfile.yourName);
  const [editPartnerName, setEditPartnerName] = useState(coupleProfile.partnerName);
  const [editAnniversaryDate, setEditAnniversaryDate] = useState(coupleProfile.anniversaryDate);

  const handleToggleSound = () => {
    const muted = soundService.toggleMute();
    setIsMuted(muted);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCoupleProfile({
      ...coupleProfile,
      yourName: editYourName.trim() || 'Rusith',
      partnerName: editPartnerName.trim() || 'Vimasha',
      anniversaryDate: editAnniversaryDate || '2025-10-15',
    });
    setShowSettingsModal(false);
    soundService.playChime(1.2);
  };

  // 6 primary curated milestone chapters for the top bar nav links
  const chapterLinks = [
    { label: 'Intro', step: 1 },
    { label: 'Field', step: 4 },
    { label: 'Memories', step: 5 },
    { label: 'Singings', step: 6 },
    { label: 'Letter', step: 7 },
    { label: 'Bouquet', step: 8 },
  ];

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 h-16 flex items-center justify-between px-4 sm:px-6 bg-black/40 backdrop-blur-md border-b border-rose-500/15">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={() => onNavigateToStep(1)}
          className="text-lg font-serif-romantic tracking-wide font-bold text-rose-100 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Happy Anniversary
        </button>

        {/* Zone 2: 4-6 Clean Text Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-rose-200/80">
          {chapterLinks.map((link) => (
            <button
              key={link.step}
              onClick={() => onNavigateToStep(link.step)}
              className={`hover:text-rose-100 transition-colors whitespace-nowrap cursor-pointer ${
                currentStep === link.step
                  ? 'text-rose-400 font-semibold underline underline-offset-4'
                  : ''
              }`}
            >
              {link.label}
            </button>
          ))}
          <span className="text-[11px] text-rose-300/50 font-mono">
            {currentStep}/{totalSteps}
          </span>
        </nav>

        {/* Zone 3: Primary Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Subtle Desktop View Button (Udinma podiyata wadiya highlight nowena widiyata) */}
          {onToggleDesktopView && (
            <button
              onClick={onToggleDesktopView}
              aria-label={isDesktopView ? 'Switch to Standard View' : 'Switch to Desktop & TV View'}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-full border transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                isDesktopView
                  ? 'bg-rose-500/25 text-rose-100 border-rose-400/40 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                  : 'bg-white/5 hover:bg-white/10 text-rose-300/70 hover:text-rose-100 border-white/10'
              }`}
              title="Desktop View (Laptop & TV Widescreen mode)"
            >
              <Monitor className="w-3.5 h-3.5 text-rose-300" />
              <span className="hidden xs:inline sm:inline">Desktop View</span>
              {isDesktopView && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          )}

          <button
            onClick={handleToggleSound}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-rose-200 transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-stone-400" /> : <Volume2 className="w-4 h-4 text-rose-400" />}
          </button>

          <button
            onClick={() => setShowSettingsModal(true)}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-rose-900/60 hover:bg-rose-800/80 border border-rose-500/30 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-sm"
          >
            <Settings className="w-3.5 h-3.5 text-rose-300" />
            <span className="hidden sm:inline">Personalize</span>
          </button>
        </div>
      </header>

      {/* Personalization Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="max-w-md w-full bg-[#180e15] border border-rose-500/30 rounded-3xl p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-rose-500/20 pb-3">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                <h3 className="font-serif-romantic text-xl font-bold text-rose-50">
                  Personalize Our Anniversary
                </h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-xs text-rose-300/70 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="text-rose-300/80 mb-1 block">Your Name</label>
                <input
                  type="text"
                  value={editYourName}
                  onChange={(e) => setEditYourName(e.target.value)}
                  className="w-full bg-black/50 border border-rose-500/30 rounded-xl px-3 py-2 text-rose-100 focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="text-rose-300/80 mb-1 block">Partner's Name</label>
                <input
                  type="text"
                  value={editPartnerName}
                  onChange={(e) => setEditPartnerName(e.target.value)}
                  className="w-full bg-black/50 border border-rose-500/30 rounded-xl px-3 py-2 text-rose-100 focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="text-rose-300/80 mb-1 block">Anniversary Date</label>
                <input
                  type="date"
                  value={editAnniversaryDate}
                  onChange={(e) => setEditAnniversaryDate(e.target.value)}
                  className="w-full bg-black/50 border border-rose-500/30 rounded-xl px-3 py-2 text-rose-100 focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="flex gap-2 mt-3 pt-2 border-t border-rose-500/20">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-rose-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium shadow-md shadow-rose-950/50"
                >
                  Save Names
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
