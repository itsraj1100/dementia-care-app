import React, { useEffect } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { sound } from '../../utils/audio.ts';

interface CognitivePrepOverlayProps {
  activityId: 'object-match' | 'photo-recall' | 'routine-order' | 'music-moment';
  activityNameAs: string;
  activityNameEn: string;
  icon: React.ReactNode;
  onComplete: () => void;
  durationMs?: number;
}

export const CognitivePrepOverlay: React.FC<CognitivePrepOverlayProps> = ({
  activityId,
  activityNameAs,
  activityNameEn,
  icon,
  onComplete,
  durationMs = 1800,
}) => {
  useEffect(() => {
    // Play the specific activity signature chime cue
    switch (activityId) {
      case 'object-match':
        sound.playObjectMatchCue();
        break;
      case 'photo-recall':
        sound.playPhotoRecallCue();
        break;
      case 'routine-order':
        sound.playRoutineOrderCue();
        break;
      case 'music-moment':
        sound.playMusicMomentCue();
        break;
      default:
        sound.playChime('chime');
    }

    // Auto-advance after cognitive preparation interval
    const timer = setTimeout(() => {
      onComplete();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [activityId, durationMs, onComplete]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 bg-[#FBF9F5]/95 dark:bg-[#0f172a]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300"
    >
      {/* Concentric Breathing Pulse Halo */}
      <div className="relative flex items-center justify-center mb-8">
        {/* Outer slow breathing wave */}
        <div className="absolute w-44 h-44 rounded-full bg-[#00524d]/10 dark:bg-[#5eead4]/10 animate-ping duration-1000" />
        
        {/* Mid pulsing halo */}
        <div className="absolute w-36 h-36 rounded-full bg-[#E8F5E9] dark:bg-emerald-950/60 animate-pulse duration-700" />

        {/* Center tactile badge with icon */}
        <div className="relative w-24 h-24 rounded-full bg-[#00524d] text-white flex items-center justify-center shadow-xl border-4 border-white dark:border-slate-800">
          {icon}
        </div>
      </div>

      {/* Gentle Reassuring Guidance */}
      <div className="max-w-md flex flex-col items-center">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E8F5E9] dark:bg-emerald-950/80 text-[#2D6A4F] dark:text-emerald-400 font-bold text-xs sm:text-sm mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>প্ৰস্তুতি · Calm Preparation</span>
        </span>

        <h2 className="text-3xl sm:text-4xl font-bold text-[#1E293B] dark:text-slate-100 tracking-tight leading-snug">
          মন শান্ত কৰক
        </h2>

        <p className="text-xl sm:text-2xl text-[#00524d] dark:text-[#5eead4] font-medium mt-1">
          Take a calm breath
        </p>

        <p className="text-base text-[#475569] dark:text-slate-300 mt-3">
          {activityNameAs} · {activityNameEn}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 italic">
          আপোনাৰ নিজৰ গতিত আৰাম লওক (No rush, in your own pace)
        </p>
      </div>

      {/* Non-blocking skip button */}
      <button
        onClick={() => {
          sound.playChime('gentle');
          onComplete();
        }}
        className="mt-10 px-5 py-2.5 rounded-full bg-white dark:bg-slate-800 border border-[#E2DCD5] dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all"
        type="button"
      >
        <span>এৰাই চলক / Start now</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
