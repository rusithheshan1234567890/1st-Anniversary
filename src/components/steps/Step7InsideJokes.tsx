import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InsideJoke, SingingItem } from '../../types';
import { ourSingingsData } from '../../data/anniversaryData';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Heart,
  ExternalLink,
  Sparkles,
  Music,
  ChevronRight,
  Tv,
} from 'lucide-react';
import { soundService } from '../../services/soundService';

interface Step7InsideJokesProps {
  jokes?: InsideJoke[];
  onNextStep: () => void;
  coupleNames: { yourName: string; partnerName: string };
}

export const Step7InsideJokes: React.FC<Step7InsideJokesProps> = ({
  onNextStep,
  coupleNames,
}) => {
  const [activeSongIndex, setActiveSongIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [useDriveEmbed, setUseDriveEmbed] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [loveReactions, setLoveReactions] = useState<{ [id: string]: number }>(() => {
    try {
      const saved = localStorage.getItem('tulip_singings_reactions_v1');
      return saved ? JSON.parse(saved) : { 'singing-gf': 28, 'singing-me': 24 };
    } catch {
      return { 'singing-gf': 28, 'singing-me': 24 };
    }
  });
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; y: number }[]>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const controlsTimeoutRef = useRef<number | null>(null);

  const songs: SingingItem[] = ourSingingsData;
  const currentSong = songs[activeSongIndex] || songs[0];

  // Pause background ambient sound when singing video is playing
  useEffect(() => {
    if (isPlaying) {
      soundService.stopRomanticAmbient();
    }
  }, [isPlaying]);

  // Reset video when switching songs
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
      videoRef.current.load();
    }
  }, [activeSongIndex]);

  // Video time update listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [activeSongIndex]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleTogglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (video.paused) {
        soundService.playChime(1.2);
        await video.play();
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    } catch {
      // Auto-fallback
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
  };

  const handleToggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      videoRef.current.volume = volume || 0.8;
      setIsMuted(false);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleRestart = () => {
    if (!videoRef.current) return;
    soundService.playChime(1.0);
    videoRef.current.currentTime = 0;
    setCurrentTime(0);
    videoRef.current.play().catch(() => {});
    setIsPlaying(true);
  };

  const handleToggleSpeed = () => {
    if (!videoRef.current) return;
    const nextRate = playbackRate === 1 ? 1.25 : playbackRate === 1.25 ? 1.5 : 1;
    videoRef.current.playbackRate = nextRate;
    setPlaybackRate(nextRate);
    soundService.playChime(1.3);
  };

  const handleToggleFullscreen = async () => {
    if (!videoContainerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await videoContainerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fallback
    }
  };

  const handleAddLoveReaction = (e: React.MouseEvent) => {
    soundService.playChime(1.5);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newReactionId = Date.now() + Math.random();
    setFloatingHearts((prev) => [...prev, { id: newReactionId, x, y }]);

    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newReactionId));
    }, 1500);

    setLoveReactions((prev) => {
      const updated = {
        ...prev,
        [currentSong.id]: (prev[currentSong.id] || 0) + 1,
      };
      try {
        localStorage.setItem('tulip_singings_reactions_v1', JSON.stringify(updated));
      } catch {
        // Ignore storage error
      }
      return updated;
    });
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Drive embed preview link
  const driveEmbedUrl = currentSong.driveUrl.replace(/\/view(\?.*)?$/, '/preview');

  return (
    <div className="relative w-full h-full min-h-[92vh] flex flex-col justify-between py-6 px-3 sm:px-6 z-20 select-none overflow-y-auto font-sans">
      {/* Background magical ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-rose-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-yellow-400/10 rounded-full blur-[100px]" />
      </div>

      {/* Floating musical notes */}
      {isPlaying && (
        <div className="fixed inset-0 pointer-events-none z-30">
          {['♪', '♫', '♩', '♬', '✨', '💛', '🎶'].map((note, idx) => (
            <motion.div
              key={idx}
              initial={{
                opacity: 0,
                y: 100,
                x: (idx * 140) % (typeof window !== 'undefined' ? window.innerWidth : 800),
                scale: 0.6,
              }}
              animate={{
                opacity: [0, 0.8, 0],
                y: -300,
                x: ((idx * 140) % (typeof window !== 'undefined' ? window.innerWidth : 800)) + Math.sin(idx) * 60,
                scale: [0.6, 1.2, 0.8],
                rotate: [0, idx % 2 === 0 ? 25 : -25],
              }}
              transition={{
                duration: 6 + (idx % 3),
                repeat: Infinity,
                delay: idx * 0.9,
                ease: 'easeInOut',
              }}
              className="absolute bottom-20 text-amber-300/80 text-xl font-bold drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]"
            >
              {note}
            </motion.div>
          ))}
        </div>
      )}

      {/* Top Header Section */}
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto z-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-[11px] sm:text-xs tracking-widest text-amber-300 font-medium uppercase bg-amber-950/60 border border-amber-500/30 px-3.5 py-1 rounded-full shadow-lg backdrop-blur-md"
        >
          <span>{coupleNames.yourName} &amp; {coupleNames.partnerName}</span>
        </motion.div>

        <h1 className="mt-3 text-3xl sm:text-5xl font-serif-romantic text-rose-50 font-normal tracking-wide drop-shadow-[0_2px_14px_rgba(251,191,36,0.25)]">
          Our Singings
        </h1>

        <p className="text-xs sm:text-sm text-amber-200/80 max-w-lg mt-1.5 font-light leading-relaxed">
          Listen and watch our heartfelt singing videos dedicated with everlasting love.
        </p>

        {/* Performer Switcher Tabs */}
        <div className="mt-4 flex items-center gap-2 sm:gap-3 p-1.5 bg-stone-900/80 border border-amber-500/30 rounded-2xl shadow-xl backdrop-blur-md">
          {songs.map((song, idx) => {
            const isActive = activeSongIndex === idx;
            return (
              <button
                key={song.id}
                onClick={() => {
                  soundService.playChime(1.1);
                  setActiveSongIndex(idx);
                }}
                className={`relative px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 font-semibold shadow-lg shadow-amber-500/30 scale-102'
                    : 'text-amber-200/80 hover:text-amber-100 hover:bg-white/5'
                }`}
              >
                <Music className={`w-3.5 h-3.5 ${isActive ? 'text-stone-950' : 'text-amber-400'}`} />
                <span>{idx === 0 ? "Manika's Singing" : "My Singing"}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-stone-950/20 text-stone-950' : 'bg-amber-950/60 text-amber-300/80 border border-amber-500/20'
                }`}>
                  {song.duration}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Showcase Grid */}
      <div className="my-auto py-4 max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center z-10">
        
        {/* Left Card: Yellow Tulips, Soundwave & Emotional Sentiments */}
        <div className="lg:col-span-5 flex flex-col p-6 bg-[#17120a]/90 border border-amber-500/30 rounded-3xl shadow-2xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Golden Badge */}
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <span className="text-[11px] font-mono tracking-wider uppercase text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/30">
              {activeSongIndex === 1 ? 'Sudu Muhuna Dakaganna' : 'Ordinary'}
            </span>
            <span className="text-[11px] font-mono text-amber-300/70 flex items-center gap-1">
              <span>Full Video &amp; Audio</span>
            </span>
          </div>

          {/* Sinhala Title & Romantic Poem */}
          <div className="mt-4">
            <h3 className="text-xl sm:text-2xl font-serif-romantic text-amber-100">
              {currentSong.sinhalaTitle}
            </h3>
            <p className="text-xs sm:text-sm text-amber-300/90 font-serif-romantic italic mt-1">
              &ldquo;{currentSong.title}&rdquo; · {currentSong.subtitle}
            </p>

            <div className="mt-3 p-3.5 rounded-2xl bg-black/40 border border-amber-500/20 text-xs sm:text-sm text-amber-100/90 leading-relaxed font-light">
              <p className="font-serif-romantic">{currentSong.sinhalaDescription}</p>
              <div className="mt-2 pt-2 border-t border-amber-500/15 text-[11px] text-amber-300/80 italic">
                &ldquo;{currentSong.quote}&rdquo;
              </div>
            </div>
          </div>

          {/* Yellow Tulips & Interactive Graphic with Pulsing Waves */}
          <div className="relative mt-4 py-2 flex items-center justify-center">
            {/* Pulsing Radiator Waves */}
            {isPlaying && (
              <>
                <motion.div
                  animate={{ scale: [1, 1.4, 1.8], opacity: [0.6, 0.25, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                  className="absolute w-32 h-32 rounded-full border border-amber-400/40 pointer-events-none"
                />
                <motion.div
                  animate={{ scale: [1, 1.6, 2.1], opacity: [0.5, 0.2, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
                  className="absolute w-32 h-32 rounded-full border border-amber-400/30 pointer-events-none"
                />
              </>
            )}

            {/* Stylized Romantic Yellow Tulips SVG */}
            <div className="relative w-36 h-36 drop-shadow-[0_0_18px_rgba(250,204,21,0.55)]">
              <svg viewBox="0 0 160 160" className="w-full h-full">
                {/* Left Tulip */}
                <g transform="translate(10, 20) scale(0.7)">
                  <path d="M40 70 L40 130" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" />
                  <path d="M40 30 C25 30 20 50 25 70 C30 80 50 80 55 70 C60 50 55 30 40 30 Z" fill="#eab308" />
                  <path d="M30 45 C20 35 25 25 35 30 C30 40 30 50 30 45 Z" fill="#facc15" />
                </g>
                {/* Center Main Tulip */}
                <g transform="translate(45, 5) scale(0.9)">
                  <path d="M40 80 L40 150" stroke="#16a34a" strokeWidth="5" strokeLinecap="round" />
                  <path d="M40 25 C20 25 15 50 22 75 C30 90 50 90 58 75 C65 50 60 25 40 25 Z" fill="#facc15" />
                  <path d="M25 45 C15 30 25 20 35 25 C30 40 25 55 25 45 Z" fill="#fef08a" />
                  <path d="M55 45 C65 30 55 20 45 25 C50 40 55 55 55 45 Z" fill="#fef08a" />
                </g>
                {/* Right Tulip */}
                <g transform="translate(85, 25) scale(0.75)">
                  <path d="M40 70 L40 130" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" />
                  <path d="M40 30 C25 30 20 50 25 70 C30 80 50 80 55 70 C60 50 55 30 40 30 Z" fill="#eab308" />
                  <path d="M50 45 C60 35 55 25 45 30 C50 40 50 50 50 45 Z" fill="#facc15" />
                </g>
              </svg>
            </div>
          </div>

          {/* Equalizer Frequency Visualizer Bars */}
          <div className="flex items-center justify-between gap-1 h-9 mt-2 px-3 bg-amber-950/40 rounded-xl border border-amber-500/20">
            {[35, 70, 95, 45, 60, 85, 100, 70, 40, 80, 95, 65, 30, 75, 90, 50, 85, 40, 90, 60, 80, 45].map((h, i) => (
              <div
                key={i}
                className={`flex-1 rounded-full transition-all duration-150 ${
                  isPlaying ? 'bg-gradient-to-t from-amber-500 to-yellow-300' : 'bg-amber-700/30'
                }`}
                style={{
                  height: isPlaying
                    ? `${Math.max(15, (h * Math.sin((i * 0.8 + currentTime * 4)) + h) * 0.5)}%`
                    : `${h * 0.25}%`,
                }}
              />
            ))}
          </div>

          {/* Interactive Love / Reaction Button */}
          <div className="mt-4 pt-3 border-t border-amber-500/20 flex items-center justify-between">
            <div className="relative">
              <button
                onClick={handleAddLoveReaction}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-950/80 to-amber-950/80 hover:from-rose-900/80 hover:to-amber-900/80 border border-rose-500/30 text-rose-200 text-xs font-medium shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                <span>Love This Singing</span>
                <span className="font-mono bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded-md text-[11px]">
                  {loveReactions[currentSong.id] || 0}
                </span>
              </button>

              {/* Floating Hearts Animation */}
              <AnimatePresence>
                {floatingHearts.map((heart) => (
                  <motion.div
                    key={heart.id}
                    initial={{ opacity: 1, y: 0, scale: 0.8 }}
                    animate={{ opacity: 0, y: -60, scale: 1.4 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="absolute pointer-events-none text-rose-400 text-lg font-bold"
                    style={{ left: heart.x, top: heart.y }}
                  >
                    💖
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Direct Google Drive Link */}
            <a
              href={currentSong.driveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[11px] text-amber-300/80 hover:text-amber-200 hover:underline px-2.5 py-1.5 rounded-lg bg-white/5 border border-amber-500/20 transition-colors"
              title="Open video directly in Google Drive"
            >
              <span>Drive Link</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Right Card: Full Magical Video Cinema Stage */}
        <div className="lg:col-span-7 flex flex-col">
          <div
            ref={videoContainerRef}
            onMouseEnter={() => {
              setShowControls(true);
              if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
            }}
            onMouseMove={() => {
              setShowControls(true);
              if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
              controlsTimeoutRef.current = window.setTimeout(() => {
                if (isPlaying) setShowControls(false);
              }, 3000);
            }}
            className="relative w-full aspect-[4/3] sm:aspect-[16/11] md:aspect-[16/10] bg-black/95 rounded-3xl border border-amber-500/40 shadow-[0_0_40px_rgba(245,158,11,0.2)] overflow-hidden flex flex-col justify-center items-center group"
          >
            {/* Cinematic Golden Glow Behind Video */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 pointer-events-none z-10" />

            {useDriveEmbed ? (
              /* Google Drive Iframe Embed Fallback */
              <iframe
                src={driveEmbedUrl}
                title={currentSong.title}
                className="w-full h-full border-0 rounded-3xl z-0"
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            ) : (
              /* Native High-Performance HTML5 Video with Full Audio */
              <video
                ref={videoRef}
                src={currentSong.videoUrl}
                poster={currentSong.thumbnailUrl}
                playsInline
                preload="auto"
                onClick={handleTogglePlay}
                className="w-full h-full object-contain cursor-pointer z-0"
              />
            )}

            {/* Central Play/Pause Watermark Button when paused */}
            {!isPlaying && !useDriveEmbed && (
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleTogglePlay}
                className="absolute z-20 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-stone-950 flex items-center justify-center shadow-[0_0_35px_rgba(251,191,36,0.7)] cursor-pointer"
                title="Play Video with Audio"
              >
                <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current ml-1" />
              </motion.button>
            )}

            {/* Top Video Overlay Bar */}
            <div
              className={`absolute top-0 inset-x-0 p-4 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 ${
                showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs sm:text-sm font-serif-romantic text-amber-100 font-medium drop-shadow">
                  {currentSong.performerName} - {currentSong.title}
                </span>
              </div>

              {/* Embed mode switch (HTML5 Fast Video vs Google Drive) */}
              <button
                onClick={() => setUseDriveEmbed(!useDriveEmbed)}
                className="text-[11px] font-mono text-amber-200/90 hover:text-white bg-black/60 border border-amber-500/30 px-2.5 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Toggle Google Drive player if needed"
              >
                <Tv className="w-3 h-3 text-amber-400" />
                <span>{useDriveEmbed ? 'Switch to Fast Player' : 'Drive Player'}</span>
              </button>
            </div>

            {/* Bottom Floating Control Bar */}
            {!useDriveEmbed && (
              <div
                className={`absolute bottom-0 inset-x-0 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/80 to-transparent z-20 flex flex-col gap-2 transition-opacity duration-300 ${
                  showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                {/* Scrubber Progress Bar */}
                <div className="relative flex items-center w-full group/scrubber cursor-pointer">
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    step="0.1"
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1.5 sm:h-2 bg-stone-700/60 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
                    style={{
                      background: `linear-gradient(to right, #facc15 0%, #facc15 ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%, rgba(255,255,255,0.2) 100%)`,
                    }}
                  />
                </div>

                {/* Controls Row */}
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  {/* Left Controls: Play, Restart, Time, Volume */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={handleTogglePlay}
                      className="w-9 h-9 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/30 transition-transform active:scale-95 cursor-pointer"
                      title={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>

                    <button
                      onClick={handleRestart}
                      className="p-1.5 rounded-lg text-amber-300/80 hover:text-amber-100 hover:bg-white/10 transition-colors cursor-pointer"
                      title="Replay from start"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    {/* Time Counter */}
                    <div className="font-mono text-[11px] sm:text-xs text-amber-200/90 ml-1">
                      <span>{formatTime(currentTime)}</span>
                      <span className="text-amber-400/60 mx-1">/</span>
                      <span className="text-amber-400/80">{formatTime(duration)}</span>
                    </div>

                    {/* Volume & Mute Toggle */}
                    <div className="hidden sm:flex items-center gap-1.5 ml-2">
                      <button
                        onClick={handleToggleMute}
                        className="p-1 rounded text-amber-300/80 hover:text-amber-100 transition-colors cursor-pointer"
                        title={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="w-4 h-4 text-rose-400" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-16 h-1 bg-stone-700 rounded appearance-none cursor-pointer accent-amber-400"
                      />
                    </div>
                  </div>

                  {/* Right Controls: Speed, Fullscreen */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleToggleSpeed}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-amber-300 border border-amber-500/20 cursor-pointer"
                      title="Playback speed"
                    >
                      {playbackRate}x
                    </button>

                    <button
                      onClick={handleToggleFullscreen}
                      className="p-1.5 rounded-lg text-amber-300/80 hover:text-amber-100 hover:bg-white/10 transition-colors cursor-pointer"
                      title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                    >
                      {isFullscreen ? (
                        <Minimize2 className="w-4 h-4" />
                      ) : (
                        <Maximize2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick note under the player */}
        </div>
      </div>

      {/* Bottom CTA to proceed to Step 8 */}
      <div className="flex items-center justify-center pt-3 pb-2 z-10">
        <button
          onClick={() => {
            soundService.playChime(1.2);
            onNextStep();
          }}
          className="py-3 px-7 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-medium text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-950/60 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
        >
          <span>Unpeel The Love Letter</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
