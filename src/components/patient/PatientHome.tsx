import React, { useState } from 'react';
import { Volume2, Sparkles, LifeBuoy, ArrowRight, Clock, Coffee, Droplet, Pill, Calendar } from 'lucide-react';
import { PlanItem } from '../../types.ts';
import { sound } from '../../utils/audio.ts';

interface PatientHomeProps {
  nextItem?: PlanItem;
  personName?: string;
  planVersion?: number;
  onOpenActivities: () => void;
  onTriggerReminder: (item: PlanItem) => void;
  onOpenHelp: () => void;
}

export const PatientHome: React.FC<PatientHomeProps> = ({
  nextItem,
  personName,
  planVersion,
  onOpenActivities,
  onTriggerReminder,
  onOpenHelp,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const callingLabel = personName
    ? personName.includes('(')
      ? personName.split('(')[1].replace(')', '').trim()
      : personName.trim()
    : 'আইতা (Aita)';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { as: `শুভ প্ৰভাত, ${callingLabel}`, en: `Good morning, ${callingLabel}` };
    if (hour < 17) return { as: `শুভ দুপৰীয়া, ${callingLabel}`, en: `Good afternoon, ${callingLabel}` };
    return { as: `শুভ সন্ধিয়া, ${callingLabel}`, en: `Good evening, ${callingLabel}` };
  };

  const greeting = getGreeting();

  const handlePlayVoice = () => {
    sound.playChime('chime');
    setIsPlayingAudio(true);
    let prompt = `${greeting.as}. ${greeting.en}. `;
    if (nextItem) {
      prompt += `পৰৱৰ্তী কাৰ্যসূচী: ${nextItem.titleAs}. ${nextItem.instructionAs}.`;
    } else {
      prompt += 'আজিৰ বাবে কোনো বিশেষ নিয়ম নাই। আপোনাৰ দিনটো শান্তিত উপভোগ কৰক।';
    }

    sound.speak(prompt, {
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
    });
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'hydration':
        return <Droplet className="w-5 h-5 text-blue-500" />;
      case 'meal':
        return <Coffee className="w-5 h-5 text-amber-600" />;
      case 'medication':
        return <Pill className="w-5 h-5 text-emerald-600" />;
      default:
        return <Calendar className="w-5 h-5 text-[#00524d] dark:text-[#5eead4]" />;
    }
  };

  return (
    <div className="w-full flex flex-col pb-8 animate-in fade-in duration-300">
      {/* Greeting Header */}
      <div className="mb-5 sm:mb-6 text-left">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#1E293B] dark:text-slate-100 tracking-tight leading-tight">
          {greeting.as}
        </h2>
        <p className="text-lg sm:text-xl font-medium text-[#00524d] dark:text-[#5eead4] mt-0.5">
          {greeting.en}
        </p>
      </div>

      {/* Two-column layout on tablet/desktop (card left, actions right) */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 mb-6 items-start">
        {/* Left Column: NextSupportCard */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-[#E2DCD5] dark:border-slate-700/80 p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5E9] dark:bg-emerald-950/80 text-[#2D6A4F] dark:text-emerald-400 font-semibold text-xs sm:text-sm">
                  <span className="w-2 h-2 rounded-full bg-[#2D6A4F] dark:bg-emerald-400 animate-pulse" />
                  পৰৱৰ্তী কাৰ্যসূচী · Next Support
                </span>
                <span className="px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-[#00524d] dark:text-[#5eead4] text-xs font-semibold border border-teal-200/60 dark:border-teal-800">
                  Applied v{planVersion ?? 1}
                </span>
              </div>

              {nextItem && (
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#475569] dark:text-slate-300 bg-[#F3EFEA] dark:bg-slate-700 px-3 py-1 rounded-full">
                  <Clock className="w-3.5 h-3.5 text-[#00524d] dark:text-[#5eead4]" />
                  <span>{nextItem.time}</span>
                </div>
              )}
            </div>

            {nextItem ? (
              <div className="flex flex-col gap-3">
                {nextItem.photoUrl && (
                  <div className="w-full h-44 sm:h-52 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700 relative shadow-inner mb-1">
                    <img
                      src={nextItem.photoUrl}
                      alt={nextItem.titleEn}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 shadow-md flex items-center justify-center">
                      {getTypeIcon(nextItem.type)}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#1E293B] dark:text-slate-100 leading-snug">
                    {nextItem.titleAs}
                  </h3>
                  <p className="text-base sm:text-lg text-[#00524d] dark:text-[#5eead4] font-medium mt-0.5">
                    {nextItem.titleEn}
                  </p>
                  <p className="text-base sm:text-lg text-[#475569] dark:text-slate-300 mt-2 leading-relaxed">
                    {nextItem.instructionAs} · {nextItem.instructionEn}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-xl font-bold text-[#1E293B] dark:text-slate-100">
                  এতিয়া একো নিয়ম নাই — আনন্দ লওক
                </p>
                <p className="text-base text-[#475569] dark:text-slate-400 mt-1">
                  Nothing planned right now — enjoy your day peacefully
                </p>
              </div>
            )}
          </div>

          {/* Prompt card action buttons */}
          <div className="pt-4 flex flex-col sm:flex-row gap-2.5 mt-2">
            <button
              onClick={handlePlayVoice}
              aria-label="পুনৰ শুনক / Listen again"
              className={`flex-1 min-h-[54px] px-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 cursor-pointer transition-all ${
                isPlayingAudio
                  ? 'bg-[#00524d] text-white shadow-md'
                  : 'bg-[#F3EFEA] dark:bg-slate-700 text-[#00524d] dark:text-[#5eead4] hover:bg-[#E7E2DA] dark:hover:bg-slate-600 active:scale-95'
              }`}
              type="button"
            >
              <Volume2 className={`w-5 h-5 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
              <span>{isPlayingAudio ? 'ধ্বনি বাজিছে...' : 'পুনৰ শুনক / Listen again'}</span>
            </button>

            {nextItem && (
              <button
                onClick={() => {
                  sound.playChime('gentle');
                  onTriggerReminder(nextItem);
                }}
                className="flex-1 min-h-[54px] px-4 rounded-2xl bg-[#00524d] hover:bg-[#1e6b65] text-white font-bold text-base flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
                type="button"
              >
                <span>মুকলি কৰক / Open Reminder</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Column: One Primary Action (Activities CTA) + Peaceful Rest note */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Primary Action Button for Patient: Activities */}
          <button
            onClick={() => {
              sound.playChime('gentle');
              onOpenActivities();
            }}
            className="w-full min-h-[120px] sm:min-h-[140px] p-6 rounded-3xl bg-gradient-to-br from-[#00524d] to-[#1e6b65] hover:from-[#1e6b65] hover:to-[#00524d] text-white shadow-lg active:scale-[0.99] transition-all flex flex-col justify-between text-left cursor-pointer group"
            type="button"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5" />
                শান্ত মন · Peaceful Mind
              </span>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-6 h-6" />
              </div>
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
                মনৰ সন্তোষজনক কাৰ্যসূচী
              </h3>
              <p className="text-base sm:text-lg text-teal-100 font-medium">
                Calm Activities · ফটো, নিয়ম আৰু বাচন
              </p>
            </div>
          </button>

          {/* Gentle Reassurance Note */}
          <div className="bg-[#F3EFEA] dark:bg-slate-800/80 rounded-3xl p-5 border border-[#E2DCD5] dark:border-slate-700/80">
            <p className="font-bold text-base sm:text-lg text-[#1E293B] dark:text-slate-100">
              কোনো তাৰাহুৰা নাই · Take Your Time
            </p>
            <p className="text-sm text-[#475569] dark:text-slate-300 mt-1 leading-relaxed">
              সকলো শুদ্ধ বা ভুলৰ ঊৰ্ধ্বত। নিজৰ ইচ্ছা অনুসৰি দিনটো উপভোগ কৰক।
            </p>
          </div>
        </div>
      </div>

      {/* Prominent Help Button (P-08 trigger in bottom zone) */}
      <div className="w-full pt-2">
        <button
          onClick={() => {
            sound.playChime('alert');
            onOpenHelp();
          }}
          className="w-full min-h-[68px] sm:min-h-[72px] rounded-3xl bg-[#ffdbd1] hover:bg-[#ffb59f] dark:bg-[#7d2c13] dark:hover:bg-[#9c4328] text-[#3a0a00] dark:text-[#ffdbd1] font-bold text-lg sm:text-xl flex items-center justify-center gap-3 shadow-md active:scale-[0.99] transition-all cursor-pointer border border-[#ffb59f]/60 dark:border-amber-900/60"
          type="button"
          aria-label="সহায় / Help"
        >
          <LifeBuoy className="w-7 h-7 text-[#9c4328] dark:text-[#ffdbd1]" />
          <span>সহায় / Help (Caregiver Ananya)</span>
        </button>
      </div>
    </div>
  );
};
