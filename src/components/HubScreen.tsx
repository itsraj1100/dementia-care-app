import React, { useState } from 'react';
import { Volume2, ArrowRight, LifeBuoy, Home, Sparkles, Smile, Image as ImageIcon, Coffee, Award, CheckCircle } from 'lucide-react';
import { HUB_ACTIVITIES } from '../data/activities.ts';
import { ScreenType } from '../types.ts';
import { sound } from '../utils/audio.ts';

interface HubScreenProps {
  onSelectActivity: (activity: ScreenType) => void;
  onNotifyCaregiver: () => void;
}

export const HubScreen: React.FC<HubScreenProps> = ({
  onSelectActivity,
  onNotifyCaregiver,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioFeedback, setAudioFeedback] = useState<string | null>(null);

  const handlePlayVoice = () => {
    sound.playChime('chime');
    setIsPlayingAudio(true);
    setAudioFeedback('স্নিগ্ধ মাত বাজিছে... (Playing peaceful voice guidance)');

    const promptText = 'মনৰ সন্তোষজনক কাৰ্যসূচী। আজি আপোনাৰ মন জুৰোৱা কিবা খেলিব বিচাৰে নেকি? Choose a familiar quiet activity. আপোনাৰ নিজৰ গতিত আনন্দ লওক।';

    sound.speak(promptText, {
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => {
        setIsPlayingAudio(false);
        setAudioFeedback(null);
      },
    });
  };

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'collections':
        return <ImageIcon className="w-4 h-4" />;
      case 'coffee':
        return <Coffee className="w-4 h-4" />;
      case 'workspace_premium':
        return <Award className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full flex flex-col pb-12 animate-in fade-in duration-300">
      {/* Intro Guidance Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-[#E2DCD5] dark:border-slate-700/80 p-5 sm:p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8F5E9] dark:bg-emerald-950/80 text-[#2D6A4F] dark:text-emerald-400 font-medium text-xs sm:text-sm mb-2.5">
              <span className="w-2 h-2 rounded-full bg-[#2D6A4F] dark:bg-emerald-400 animate-pulse"></span>
              শান্ত সময় · Gentle Session
            </span>
            <h2 className="font-bold text-2xl sm:text-3xl text-[#1E293B] dark:text-slate-100 tracking-tight leading-tight">
              মনৰ সন্তোষজনক কাৰ্যসূচী
            </h2>
            <p className="font-semibold text-xl sm:text-2xl text-[#00524d] dark:text-[#5eead4] mt-0.5">
              Calm Activities
            </p>
          </div>

          <div className="w-13 h-13 rounded-full bg-[#F3EFEA] dark:bg-slate-700 text-[#00524d] dark:text-[#5eead4] flex items-center justify-center shrink-0 shadow-inner">
            <Sparkles className="w-7 h-7" />
          </div>
        </div>

        <p className="text-base sm:text-lg text-[#475569] dark:text-slate-300 mt-3.5 leading-relaxed">
          আজি আপোনাৰ মন জুৰোৱা কিবা খেলিব বিচাৰে নেকি? Choose a familiar quiet activity. আপোনাৰ নিজৰ গতিত আনন্দ লওক।
        </p>

        <div className="pt-4">
          <button
            onClick={handlePlayVoice}
            className={`w-full min-h-[56px] px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-3 cursor-pointer ${
              isPlayingAudio
                ? 'bg-[#00524d] dark:bg-[#1e6b65] text-white shadow-md'
                : 'bg-[#F3EFEA] dark:bg-slate-700/80 text-[#00524d] dark:text-[#5eead4] hover:bg-[#E7E2DA] dark:hover:bg-slate-700 active:scale-[0.99]'
            }`}
            type="button"
            aria-label="পুনৰ শুনক / Listen again"
          >
            <Volume2 className={`w-6 h-6 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
            <span className="font-bold text-base sm:text-lg">
              {isPlayingAudio ? 'ধ্বনি বাজিছে... / Listening...' : 'পুনৰ শুনক / Listen again'}
            </span>
          </button>

          {audioFeedback && (
            <p className="text-center mt-2.5 text-xs sm:text-sm font-medium text-[#00524d] dark:text-[#5eead4] animate-pulse">
              {audioFeedback}
            </p>
          )}
        </div>
      </div>

      {/* Activities Grid: 1 col on mobile, 3 cols on laptop/desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mb-6">
        {HUB_ACTIVITIES.map((activity) => (
          <div
            key={activity.id}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-[#E2DCD5] dark:border-slate-700/80 overflow-hidden flex flex-col hover:shadow-md transition-all group"
          >
            {/* Image banner with overlay label */}
            <div className="relative w-full h-48 bg-slate-100 dark:bg-slate-700 overflow-hidden">
              <img
                src={activity.imageSrc}
                alt={activity.imageAlt}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute top-3 right-3 bg-white/95 dark:bg-slate-900/95 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1.5 backdrop-blur-md">
                {getBadgeIcon(activity.badgeIcon)}
                <span className={activity.badgeColorClass}>
                  {activity.badgeAs} / {activity.badgeEn}
                </span>
              </div>
            </div>

            {/* Content area */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg sm:text-xl text-[#1E293B] dark:text-slate-100 leading-snug">
                  {activity.titleAs} · {activity.titleEn}
                </h3>
                <p className="text-sm sm:text-base text-[#475569] dark:text-slate-400 mt-1 leading-snug">
                  {activity.subtitleAs} / {activity.subtitleEn}
                </p>
              </div>

              <button
                onClick={() => {
                  sound.playChime('gentle');
                  onSelectActivity(activity.id);
                }}
                className="w-full min-h-[58px] rounded-xl bg-[#00524d] hover:bg-[#1e6b65] text-white font-bold text-base sm:text-lg flex items-center justify-between px-5 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
                type="button"
                aria-label={`আৰম্ভ কৰক / Start ${activity.titleEn}`}
              >
                <span>আৰম্ভ কৰক / Start</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Gentle Reassurance Banner */}
      <div className="bg-[#F3EFEA] dark:bg-slate-800/60 rounded-2xl p-4 sm:p-5 mb-6 border border-[#E2DCD5] dark:border-slate-700/80 shadow-sm flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-full bg-[#a8f0e8] dark:bg-teal-900/60 text-[#00524d] dark:text-[#5eead4] flex items-center justify-center shrink-0 shadow-inner">
          <Smile className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-base sm:text-lg text-[#1E293B] dark:text-slate-100">
            কোনো তাৰাহুৰা নাই · Take Your Time
          </p>
          <p className="text-sm sm:text-base text-[#475569] dark:text-slate-300 mt-0.5">
            সকলো শুদ্ধ বা ভুলৰ ঊৰ্ধ্বত। কেৱল মন ভাল লগাৰ বাবে। (No scores or time pressure, just peaceful comfort.)
          </p>
        </div>
      </div>

      {/* Bottom Action Triggers: Caregiver Help and Back to Home */}
      <div className="flex flex-col gap-3 pt-1">
        <button
          onClick={() => {
            sound.playChime('alert');
            onNotifyCaregiver();
          }}
          className="w-full min-h-[64px] rounded-2xl bg-[#ffdbd1] hover:bg-[#ffb59f] dark:bg-[#7d2c13]/80 dark:hover:bg-[#9c4328] text-[#3a0a00] dark:text-[#ffdbd1] font-bold text-lg sm:text-xl flex items-center justify-center gap-3 shadow-sm active:scale-[0.99] transition-all cursor-pointer border border-[#ffb59f]/50 dark:border-amber-900/50"
          type="button"
        >
          <LifeBuoy className="w-7 h-7 text-[#9c4328] dark:text-[#ffb59f]" />
          <span>সহায় / Help (Caregiver Ananya)</span>
        </button>

        <button
          onClick={() => {
            sound.playChime('gentle');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="w-full min-h-[56px] rounded-2xl bg-white dark:bg-slate-800 text-[#1E293B] dark:text-slate-100 font-bold text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-sm hover:bg-[#F3EFEA] dark:hover:bg-slate-700 active:scale-[0.99] transition-all border border-[#E2DCD5] dark:border-slate-700 cursor-pointer"
          type="button"
        >
          <Home className="w-5 h-5 text-[#475569] dark:text-slate-400" />
          <span>ঘৰলৈ / Back to Home</span>
        </button>
      </div>
    </div>
  );
};
