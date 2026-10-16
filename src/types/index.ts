export interface MemoryItem {
  id: string;
  title: string;
  date: string;
  location: string;
  imageUrl: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  caption: string;
  sinhalaQuote?: string; // Loving sentence under the photo in Sinhala
  color: string;
  flowerVariety?: string;
  stoneIndex?: number;
  likes: number;
}

export interface MapLocation {
  id: string;
  name: string;
  coordinates: string;
  dateVisited: string;
  description: string;
  imageUrl: string;
  x: number; // percentage on map
  y: number; // percentage on map
  tulipColor: 'pink' | 'red' | 'coral';
  highlights: string[];
}

export interface InsideJoke {
  id: string;
  title: string;
  date: string;
  subtitle: string;
  transcription: string;
  duration: string;
  audioFrequencyData?: number[];
  category: string;
}

export interface SingingItem {
  id: string;
  performer: 'gf' | 'me';
  performerName: string;
  title: string;
  subtitle: string;
  badge: string;
  videoUrl: string;
  driveUrl: string;
  thumbnailUrl: string;
  sinhalaTitle: string;
  sinhalaDescription: string;
  duration: string;
  category: string;
  accentColor: string;
  quote: string;
}

export interface StemMilestone {
  id: string;
  month: string;
  title: string;
  date: string;
  description: string;
  tulipColor: string;
  progressPercent: number;
  highlight: string;
}

export interface TulipVariety {
  id: string;
  name: string;
  meaning: string;
  colorHex: string;
  petalStyle: string;
  textColor: string;
}

export interface CoupleProfile {
  partnerName: string;
  yourName: string;
  anniversaryDate: string; // e.g. "2025-10-15"
  anniversaryYear: number;
  specialNote: string;
}
