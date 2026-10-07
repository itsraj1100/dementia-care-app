import React, { useState } from 'react';
import { Play, Pause, Music, Home, LifeBuoy, Heart, ArrowRight } from 'lucide-react';
import { sound } from '../../utils/audio.ts';
import { CognitivePrepOverlay } from './CognitivePrepOverlay.tsx';

interface MusicMomentProps {
  onBackToHome: () => void;
  onDone: () => void;
  onHelp: () => void;
}

export const MusicMoment: React.FC<MusicMomentProps> = ({
  onBackToHome,
  onDone,
  onHelp,
}) => {
  const [isPreparing, setIsPreparing] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleMusic = () => {
    if (!isPlaying) {
      sound.playChime('success');
      sound.speak('মন জুৰোৱা বাঁহীৰ সুৰ বাজিছে। Calming traditional flute melody.');
      setIsPlaying(true);
    } else {
      sound.playChime('gentle');
      setIsPlaying(false);
    }
  };

  return (
    <div className="w-full flex flex-col pb-8 animate-in fade-in duration-300">
      {isPreparing && (
        <CognitivePrepOverlay
          activityId="music-moment"
          activityNameAs="সংগীতৰ পল"
          activityNameEn="Music Moment"
          icon={<Music className="w-10 h-10" />}
          onComplete={() => {
            setIsPreparing(false);
            setTimeout(() => {
              sound.speak('মন জুৰোৱা বাঁহীৰ সুৰ। Calming bamboo flute melodies.');
            }, 400);
          }}
        />
      )}

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-[#E2DCD5] dark:border-slate-700 p-6 sm:p-8 flex flex-col items-center text-center mb-6">
        <div className="w-20 h-20 rounded-full bg-[#E8F5E9] dark:bg-emerald-950/80 text-[#2D6A4F] dark:text-emerald-400 flex items-center justify-center mb-4 shadow-inner">
          <Music className={`w-10 h-10 ${isPlaying ? 'animate-bounce' : ''}`} />
        </div>

        <span className="px-3.5 py-1 rounded-full bg-[#F3EFEA] dark:bg-slate-700 text-[#00524d] dark:text-[#5eead4] text-xs sm:text-sm font-semibold mb-2">
          শান্ত সময় · Music Moment
        </span>

        <h2 className="text-3xl sm:text-4xl font-bold text-[#1E293B] dark:text-slate-100 tracking-tight">
          মন জুৰোৱা বাঁহীৰ সুৰ
        </h2>
        <p className="text-xl sm:text-2xl text-[#00524d] dark:text-[#5eead4] font-medium mt-1">
          Calming Bamboo Flute Melodies
        </p>

        <p className="text-base sm:text-lg text-[#475569] dark:text-slate-300 mt-3 max-w-md">
          একেলগে শুনি মন শান্ত কৰক। Sit peacefully and listen together.
        </p>

        {/* Breathing wave animation when playing */}
        <div className="w-full max-w-xs h-24 my-6 flex items-center justify-center gap-2">
          {[40, 70, 95, 60, 85, 50, 90, 65, 45].map((height, i) => (
            <span
              key={i}
              style={{
                height: isPlaying ? `${height}%` : '20%',
                transition: 'height 0.4s ease',
              }}
              className="w-2.5 bg-gradient-to-t from-[#00524d] to-[#5eead4] rounded-full"
            />
          ))}
        </div>

        {/* Big tactile Play/Pause button */}
        <button
          onClick={toggleMusic}
          aria-label={isPlaying ? 'Pause music' : 'Play calming music'}
          className="w-24 h-24 rounded-full bg-[#00524d] hover:bg-[#1e6b65] text-white flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer"
          type="button"
        >
          {isPlaying ? (
            <Pause className="w-10 h-10 fill-current" />
          ) : (
            <Play className="w-10 h-10 fill-current translate-x-0.5" />
          )}
        </button>

        <p className="text-sm font-semibold text-[#00524d] dark:text-[#5eead4] mt-3">
          {isPlaying ? 'সুৰ বাজি আছে (Playing)' : 'টিপি শুনক (Tap to listen)'}
        </p>
      </div>

      {/* Done button leading to P-07 Comfort Check */}
      <div className="w-full mb-4">
        <button
          onClick={() => {
            sound.playChime('gentle');
            onDone();
          }}
          className="w-full min-h-[64px] rounded-3xl bg-[#2D6A4F] hover:bg-emerald-800 text-white font-bold text-xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
          type="button"
        >
          <span>কাৰ্যসূচী শেষ হʼল / Finish & Check In</span>
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      {/* Navigation Buttons: Home & Help */}
      <div className="w-full grid grid-cols-2 gap-3">
        <button
          onClick={() => {
            sound.playChime('gentle');
            onBackToHome();
          }}
          className="min-h-[58px] rounded-2xl bg-white dark:bg-slate-800 shadow-sm hover:bg-[#F3EFEA] dark:hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center gap-2.5 text-[#475569] dark:text-slate-200 border border-[#E2DCD5] dark:border-slate-700 cursor-pointer"
          type="button"
        >
          <Home className="w-5 h-5" />
          <span className="font-bold text-base sm:text-lg">ঘৰলৈ / Home</span>
        </button>

        <button
          onClick={() => {
            sound.playChime('alert');
            onHelp();
          }}
          className="min-h-[58px] rounded-2xl bg-[#00524d] hover:bg-[#1e6b65] text-white shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          type="button"
        >
          <LifeBuoy className="w-5 h-5" />
          <span className="font-bold text-base sm:text-lg">সহায় / Help</span>
        </button>
      </div>
    </div>
  );
};
