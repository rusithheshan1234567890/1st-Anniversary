import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StemMilestone } from '../../types';
import { Calendar, ChevronRight, Sprout, Heart } from 'lucide-react';
import { soundService } from '../../services/soundService';

interface Step9TimelineStemProps {
  milestones: StemMilestone[];
  onNextStep: () => void;
  coupleNames: { yourName: string; partnerName: string };
}

export const Step9TimelineStem: React.FC<Step9TimelineStemProps> = ({
  milestones,
  onNextStep,
  coupleNames,
}) => {
  const [activeMilestoneIndex, setActiveMilestoneIndex] = useState(milestones.length - 1);
  const [growthPercent, setGrowthPercent] = useState(100);

  const activeMilestone = milestones[activeMilestoneIndex];

  const handleSelectMilestone = (idx: number) => {
    soundService.playChime(1.0 + idx * 0.1);
    setActiveMilestoneIndex(idx);
    setGrowthPercent(milestones[idx].progressPercent);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between py-8 px-4 sm:px-8 z-20 select-none overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-xs tracking-widest text-emerald-300 font-medium uppercase bg-emerald-950/40 border border-emerald-500/20 px-3 py-1 rounded-full"
        >
          <span>{coupleNames.yourName} &amp; {coupleNames.partnerName}</span>
          <span aria-hidden="true">·</span>
          <span>Chapter 09: A Year of Growth</span>
        </motion.div>

        <h2 className="mt-2 text-2xl sm:text-4xl font-serif-romantic text-rose-50">
          Our Vine of 365 Days
        </h2>
        <p className="text-xs sm:text-sm text-emerald-200/70 max-w-md mt-1 font-light">
          Watch our organic vine grow from that first October spark to our 1-year anniversary blossom.
        </p>
      </div>

      {/* Main Growth Vine Visualization */}
      <div className="my-auto py-4 max-w-4xl w-full mx-auto flex flex-col gap-6">
        {/* SVG Curved Vine Container */}
        <div className="relative w-full bg-[#0d160f]/80 rounded-3xl p-6 border border-emerald-500/20 shadow-2xl overflow-hidden">
          {/* Subtle background leaves glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl pointer-events-none" />

          {/* Stem & Flower Nodes Graphic */}
          <div className="relative w-full h-40 sm:h-48">
            <svg
              viewBox="0 0 800 160"
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              {/* Ghost Guide Path */}
              <path
                d="M 50 110 Q 200 40, 400 100 T 750 60"
                fill="none"
                stroke="rgba(34, 197, 94, 0.15)"
                strokeWidth="8"
                strokeLinecap="round"
              />

              {/* Active Growing Green Stem */}
              <path
                d="M 50 110 Q 200 40, 400 100 T 750 60"
                fill="none"
                stroke="url(#vineGradient)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray="800"
                strokeDashoffset={800 - (growthPercent / 100) * 800}
                className="transition-all duration-700 ease-out"
              />

              {/* Gradients */}
              <defs>
                <linearGradient id="vineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#15803d" />
                  <stop offset="50%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#4ade80" />
                </linearGradient>
              </defs>

              {/* Sprouted Nodes & Tulips */}
              {milestones.map((m, idx) => {
                const t = m.progressPercent / 100;
                const cx = 50 + t * 700;
                const cy = 110 - Math.sin(t * Math.PI * 2) * 35;
                const isReached = growthPercent >= m.progressPercent;
                const isSelected = activeMilestoneIndex === idx;

                return (
                  <g
                    key={m.id}
                    className="cursor-pointer group"
                    onClick={() => handleSelectMilestone(idx)}
                  >
                    {/* Small Leaf Sprout */}
                    {isReached && (
                      <path
                        d={`M ${cx} ${cy} Q ${cx - 15} ${cy + (idx % 2 === 0 ? -25 : 25)} ${cx - 28} ${cy + (idx % 2 === 0 ? -15 : 15)}`}
                        fill="none"
                        stroke="#16a34a"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    )}

                    {/* Node Circle Halo */}
                    {isSelected && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r="18"
                        fill="none"
                        stroke={m.tulipColor}
                        strokeWidth="2"
                        className="animate-ping"
                      />
                    )}

                    {/* Node Dot */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 10 : 7}
                      fill={isReached ? m.tulipColor : '#1f2937'}
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="transition-all duration-300 group-hover:scale-125"
                    />

                    {/* Flower Icon / Miniature Tulip */}
                    {isReached && (
                      <g transform={`translate(${cx - 10}, ${cy - 30}) scale(0.6)`}>
                        <path
                          d="M16 2 C10 2 6 7 8 16 C10 20 14 22 16 22 C18 22 22 20 24 16 C26 7 22 2 16 2 Z"
                          fill={m.tulipColor}
                        />
                      </g>
                    )}

                    {/* Date Tag */}
                    <text
                      x={cx}
                      y={cy + (idx % 2 === 0 ? 32 : -36)}
                      textAnchor="middle"
                      fill={isSelected ? '#ffffff' : 'rgba(255,255,255,0.6)'}
                      fontSize="11"
                      fontFamily="monospace"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                    >
                      {m.month}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Interactive Scrub Slider underneath */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-emerald-500/15">
            <div className="flex items-center gap-2 text-xs text-emerald-300 font-mono">
              <Sprout className="w-4 h-4 text-emerald-400" />
              <span>Stem Growth: {growthPercent}%</span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={growthPercent}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setGrowthPercent(val);
                const nearest = milestones.reduce((prev, curr, i) =>
                  Math.abs(curr.progressPercent - val) < Math.abs(milestones[prev].progressPercent - val) ? i : prev,
                  0
                );
                setActiveMilestoneIndex(nearest);
              }}
              className="flex-1 max-w-md accent-emerald-500 cursor-pointer"
            />

            <span className="text-xs text-emerald-300/80 font-mono">
              365 Days
            </span>
          </div>
        </div>

        {/* Milestone Detail Card */}
        <AnimatePresence mode="wait">
          {activeMilestone && (
            <motion.div
              key={activeMilestone.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-[#121914] border border-emerald-500/30 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{activeMilestone.date}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-300/70">{activeMilestone.highlight}</span>
                </div>
                <h3 className="text-2xl font-serif-romantic text-rose-50 font-semibold">
                  {activeMilestone.title}
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100/80 font-light mt-1 max-w-xl leading-relaxed">
                  {activeMilestone.description}
                </p>
              </div>

              {/* Milestone Badge Pill */}
              <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                <div
                  className="px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-semibold text-white shadow-md"
                  style={{ backgroundColor: activeMilestone.tulipColor }}
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>Milestone #{activeMilestoneIndex + 1}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom CTA */}
      <div className="flex items-center justify-center pt-2">
        <button
          onClick={() => {
            soundService.playChime(1.2);
            onNextStep();
          }}
          className="py-3 px-6 rounded-full bg-gradient-to-r from-emerald-600 to-rose-500 hover:from-emerald-500 hover:to-rose-600 text-white font-medium text-xs sm:text-sm tracking-wide shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
        >
          <span>Step 10: Virtual Bouquet Picker</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
