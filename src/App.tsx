/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  initialCoupleProfile,
  memoryItemsData,
  mapLocationsData,
  insideJokesData,
  stemMilestonesData,
  tulipVarietiesData,
  defaultLoveLetter,
} from './data/anniversaryData';
import { CoupleProfile, MemoryItem, TulipVariety, MapLocation } from './types';
import { HeaderNav } from './components/common/HeaderNav';
import { StepProgressTracker } from './components/common/StepProgressTracker';
import { ScrollSideIndicator } from './components/common/ScrollSideIndicator';
import { TulipBloomScene } from './components/three/TulipBloomScene';
import { soundService } from './services/soundService';

// Step components
import { Step1Intro } from './components/steps/Step1Intro';
import { Step2BloomAnimation } from './components/steps/Step2BloomAnimation';
import { Step3WelcomeCard } from './components/steps/Step3WelcomeCard';
import { Step4TulipField } from './components/steps/Step4TulipField';
import { Step5MemoryNodes } from './components/steps/Step5MemoryNodes';
import { Step7InsideJokes } from './components/steps/Step7InsideJokes';
import { Step8UnpeelLoveLetter } from './components/steps/Step8UnpeelLoveLetter';
import { Step10BouquetPicker } from './components/steps/Step10BouquetPicker';
import { Step11HeartMerge } from './components/steps/Step11HeartMerge';
import { Step12Outro } from './components/steps/Step12Outro';

const stepNames = [
  'Intro',
  'Bloom Transition',
  'Welcome Card',
  'Interactive Path',
  'Memory Nodes',
  'Our Singings',
  'Unpeel Love Letter',
  'Bouquet Picker',
  'Heart Merge',
  'Our Future Blooms',
];

export default function App() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [scrollDirection, setScrollDirection] = useState<'down' | 'up'>('down');
  const [coupleProfile, setCoupleProfile] = useState<CoupleProfile>(() => {
    try {
      const saved = localStorage.getItem('tulip_bloom_profile_v3') || localStorage.getItem('tulip_bloom_profile');
      if (saved) {
        const parsed: CoupleProfile = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          // Guarantee girlfriend name is Vimasha
          const partner = (!parsed.partnerName || parsed.partnerName === 'Vidushi') ? 'Vimasha' : parsed.partnerName;
          return {
            ...initialCoupleProfile,
            ...parsed,
            partnerName: partner,
          };
        }
      }
    } catch {
      // ignore
    }
    return initialCoupleProfile;
  });

  const [memories, setMemories] = useState<MemoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('tulip_bloom_memories_v7');
      if (saved) {
        const parsed: MemoryItem[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === memoryItemsData.length) {
          return memoryItemsData.map((defaultItem, idx) => {
            const matching = parsed.find((p) => p.id === defaultItem.id) || parsed[idx];
            return {
              ...defaultItem,
              likes: matching?.likes ?? defaultItem.likes,
            };
          });
        }
      }
    } catch {
      // ignore
    }
    return memoryItemsData;
  });

  const [locations, setLocations] = useState<MapLocation[]>(() => {
    try {
      const saved = localStorage.getItem('tulip_bloom_locations_v4');
      if (saved) {
        const parsed: MapLocation[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === mapLocationsData.length) {
          return mapLocationsData.map((defaultLoc, idx) => {
            const matching = parsed.find((p) => p.id === defaultLoc.id) || parsed[idx];
            return {
              ...defaultLoc,
              imageUrl: matching?.imageUrl || defaultLoc.imageUrl,
            };
          });
        }
      }
    } catch {
      // ignore
    }
    return mapLocationsData;
  });
  const [jokes] = useState(insideJokesData);
  const [milestones] = useState(stemMilestonesData);
  const [varieties] = useState(tulipVarietiesData);
  const [letterText] = useState(defaultLoveLetter);
  const [arrangedFlowers, setArrangedFlowers] = useState<TulipVariety[]>([]);

  // Desktop & TV View mode state (persisted for user convenience)
  const [isDesktopView, setIsDesktopView] = useState<boolean>(() => {
    try {
      return localStorage.getItem('tulip_bloom_desktop_view') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleDesktopView = useCallback(() => {
    setIsDesktopView((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('tulip_bloom_desktop_view', String(next));
        // If enabling and supported, attempt full-screen on TV/laptop
        if (next && typeof document !== 'undefined' && !document.fullscreenElement) {
          document.documentElement.requestFullscreen?.().catch(() => {});
        } else if (!next && typeof document !== 'undefined' && document.fullscreenElement) {
          document.exitFullscreen?.().catch(() => {});
        }
      } catch {}
      soundService.playChime(next ? 1.3 : 0.95);
      return next;
    });
  }, []);

  // Bloom animation scene controller state
  const [bloomProgress, setBloomProgress] = useState(0.05);
  const [isCameraZooming, setIsCameraZooming] = useState(false);

  useEffect(() => {
    localStorage.setItem('tulip_bloom_profile', JSON.stringify(coupleProfile));
  }, [coupleProfile]);

  useEffect(() => {
    localStorage.setItem('tulip_bloom_memories_v6', JSON.stringify(memories));
  }, [memories]);

  useEffect(() => {
    localStorage.setItem('tulip_bloom_locations_v3', JSON.stringify(locations));
  }, [locations]);

  const goToStep = useCallback((targetStep: number, dir?: 'down' | 'up') => {
    if (targetStep < 1 || targetStep > 10) return;
    setScrollDirection(dir || (targetStep > currentStep ? 'down' : 'up'));

    if (targetStep >= 2) {
      setBloomProgress(1.0);
    } else {
      setBloomProgress(0.05);
      setIsCameraZooming(false);
    }

    if (targetStep === 2) {
      setIsCameraZooming(true);
      soundService.playBloomSwell();
    } else {
      soundService.playChime(1.0 + targetStep * 0.05);
    }

    setCurrentStep(targetStep);
  }, [currentStep]);

  // Handle Step 1 to Step 2 Bloom Start
  const handleStartBloom = () => {
    goToStep(2, 'down');
  };

  // Handle Step 2 Complete (enters glowing core -> Welcome Card)
  const handleBloomTransitionComplete = () => {
    setIsCameraZooming(false);
    setCurrentStep(3);
  };

  // Step 3 to Step 4 (Entering field)
  const handleEnterGarden = () => {
    goToStep(4, 'down');
  };

  // Step 10 Bouquet complete handler
  const handleCompleteBouquet = (flowers: TulipVariety[]) => {
    setArrangedFlowers(flowers);
    goToStep(9, 'down');
  };

  // Note: Continuous automatic scroll step switching has been removed per request
  // ("site eken ekata scroll karaddi maru wena eka nathi karanna")
  // Users now scroll freely through content and switch steps deliberately via Next/Prev buttons & StepProgressTracker.

  // Keyboard navigation (PageDown & PageUp keys)
  const isKeyLockedRef = useRef(false);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'PageDown') {
        e.preventDefault();
        if (currentStep < 10 && !isKeyLockedRef.current) {
          isKeyLockedRef.current = true;
          goToStep(currentStep + 1, 'down');
          setTimeout(() => { isKeyLockedRef.current = false; }, 600);
        }
      } else if (e.key === 'PageUp') {
        e.preventDefault();
        if (currentStep > 1 && !isKeyLockedRef.current) {
          isKeyLockedRef.current = true;
          goToStep(currentStep - 1, 'up');
          setTimeout(() => { isKeyLockedRef.current = false; }, 600);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, goToStep]);

  // Ultra-Smooth Hardware-Accelerated Step Transition Variants (Zero Blur overhead for 60fps)
  const slideVariants = {
    enter: (direction: 'down' | 'up') => ({
      y: direction === 'down' ? 40 : -40,
      opacity: 0,
      scale: 0.99,
    }),
    center: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        y: { type: 'spring' as const, stiffness: 240, damping: 26 },
        opacity: { duration: 0.28 },
        scale: { duration: 0.28 },
      },
    },
    exit: (direction: 'down' | 'up') => ({
      y: direction === 'down' ? -40 : 40,
      opacity: 0,
      scale: 0.99,
      transition: {
        y: { duration: 0.22, ease: 'easeOut' as const },
        opacity: { duration: 0.2 },
      },
    }),
  };

  return (
    <div
      className={`relative w-screen h-screen overflow-hidden bg-[#0c070a] text-white flex flex-col ${
        isDesktopView ? 'desktop-view-active' : ''
      }`}
    >
      {/* 3D Bloom Scene for Steps 1, 2, and 3 */}
      {(currentStep === 1 || currentStep === 2 || currentStep === 3) && (
        <TulipBloomScene
          bloomProgress={bloomProgress}
          isCameraZooming={isCameraZooming}
          onZoomComplete={handleBloomTransitionComplete}
          interactiveParallax={currentStep === 1}
        />
      )}

      {/* Top Navigation Bar */}
      <HeaderNav
        currentStep={currentStep}
        totalSteps={10}
        onNavigateToStep={(step) => goToStep(step)}
        coupleProfile={coupleProfile}
        onUpdateCoupleProfile={setCoupleProfile}
        isDesktopView={isDesktopView}
        onToggleDesktopView={handleToggleDesktopView}
      />

      {/* Side Vertical Scroll Indicator (TikTok / WebGL portfolio style) */}
      <ScrollSideIndicator
        currentStep={currentStep}
        totalSteps={10}
        onSelectStep={(step) => goToStep(step)}
        stepNames={stepNames}
      />

      {/* Main Step Content Container */}
      <main className="relative flex-1 w-full h-full pt-16 pb-12 overflow-hidden flex items-center justify-center">
        <AnimatePresence mode="popLayout" custom={scrollDirection}>
          <motion.div
            key={currentStep}
            custom={scrollDirection}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full h-full relative"
          >
            {/* Step 1: Intro */}
            {currentStep === 1 && (
              <Step1Intro
                onStartBloom={handleStartBloom}
                coupleNames={coupleProfile}
              />
            )}

            {/* Step 2: Bloom Animation */}
            {currentStep === 2 && (
              <Step2BloomAnimation
                onComplete={handleBloomTransitionComplete}
                coupleNames={coupleProfile}
              />
            )}

            {/* Step 3: Welcome Card */}
            {currentStep === 3 && (
              <Step3WelcomeCard
                onEnterGarden={handleEnterGarden}
                partnerName={coupleProfile.partnerName}
                yourName={coupleProfile.yourName}
                anniversaryDate={coupleProfile.anniversaryDate}
              />
            )}

            {/* Step 4: 3D Tulip Field */}
            {currentStep === 4 && (
              <Step4TulipField
                onContinueToMemories={() => goToStep(5, 'down')}
                onSelectMemoryNode={() => goToStep(5, 'down')}
                coupleNames={coupleProfile}
                memories={memories}
                isDesktopView={isDesktopView}
                onUpdateMemory={(id, updates) => {
                  setMemories((prev) =>
                    prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
                  );
                }}
              />
            )}

            {/* Step 5: Memory Nodes (Red Tulips) */}
            {currentStep === 5 && (
              <Step5MemoryNodes
                memories={memories}
                onNextStep={() => goToStep(6, 'down')}
                coupleNames={coupleProfile}
                isDesktopView={isDesktopView}
                onUpdateMemory={(id, updates) => {
                  setMemories((prev) =>
                    prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
                  );
                }}
              />
            )}

            {/* Step 6: Our Singings */}
            {currentStep === 6 && (
              <Step7InsideJokes
                jokes={jokes}
                onNextStep={() => goToStep(7, 'down')}
                coupleNames={coupleProfile}
              />
            )}

            {/* Step 7: Unpeel Love Letter */}
            {currentStep === 7 && (
              <Step8UnpeelLoveLetter
                letterText={letterText}
                onNextStep={() => goToStep(8, 'down')}
                coupleNames={coupleProfile}
              />
            )}

            {/* Step 8: Bouquet Picker */}
            {currentStep === 8 && (
              <Step10BouquetPicker
                varieties={varieties}
                onCompleteBouquet={handleCompleteBouquet}
                coupleNames={coupleProfile}
              />
            )}

            {/* Step 9: Heart Merge */}
            {currentStep === 9 && (
              <Step11HeartMerge
                onContinueToOutro={() => goToStep(10, 'down')}
                coupleNames={coupleProfile}
                flowerCount={arrangedFlowers.length || 7}
              />
            )}

            {/* Step 10: Our Future Blooms (Outro) */}
            {currentStep === 10 && (
              <Step12Outro
                onRestartJourney={() => goToStep(1, 'up')}
                coupleNames={coupleProfile}
                anniversaryDate={coupleProfile.anniversaryDate}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Persistent Bottom Step Tracker & Quick Navigator */}
      <StepProgressTracker
        currentStep={currentStep}
        totalSteps={10}
        onSelectStep={(step) => goToStep(step)}
        stepNames={stepNames}
      />
    </div>
  );
}
