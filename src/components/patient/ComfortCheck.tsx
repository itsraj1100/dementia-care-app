import React, { useState, useEffect } from 'react';
import { Smile, Meh, Frown, Heart, Volume2 } from 'lucide-react';
import { sound } from '../../utils/audio.ts';

interface ComfortCheckProps {
  activityId: string;
  onComplete: (feeling: 'good' | 'ok' | 'uncomfortable') => void;
  onSkip: () => void;
}

export const ComfortCheck: React.FC<ComfortCheckProps> = ({
  activityId,
  onComplete,
  onSkip,
}) => {
  const [selectedFeeling, setSelectedFeeling] = useState<'good' | 'ok' | 'uncomfortable' | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handlePlayVoice();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handlePlayVoice = () => {
    sound.playChime('chime');
    setIsPlayingAudio(true);
    const text = 'কেনেকুৱা লাগিল? How was that? মনৰ অনুভূতি বাছক।';
    sound.speak(text, {
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
    });
  };

  const handleSelect = (feeling: 'good' | 'ok' | 'uncomfortable') => {
    setSelectedFeeling(feeling);
    sound.playChime('gentle');

    if (feeling === 'good') {
      sound.speak('বৰ ভাল লাগিল শুনি! ধন্যবাদ আইতা। So glad you enjoyed it!');
    } else if (feeling === 'ok') {
      sound.speak('ধন্যবাদ আইতা। Thank you for spending time together.');
    } else {
      sound.speak('ধন্যবাদ, আমি পৰৱৰ্তী সময়ত আৰু আৰামদায়ক কৰিম। We will make it more comfortable next time.');
    }

    setShowThankYou(true);
    setTimeout(() => {
      onComplete(feeling);
    }, 1200);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[70vh] py-8 px-4 animate-in fade-in duration-300 text-center">
      {showThankYou ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 sm:p-12 shadow-lg border border-[#E2DCD5] dark:border-slate-700 max-w-md w-full animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 rounded-full bg-[#E8F5E9] dark:bg-emerald-950/80 text-[#2D6A4F] dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Heart className="w-10 h-10 fill-current animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold text-[#1E293B] dark:text-slate-100">
            ধন্যবাদ, আইতা!
          </h2>
          <p className="text-xl text-[#00524d] dark:text-[#5eead4] font-medium mt-1">
            Thank you!
          </p>
          <p className="text-base text-[#475569] dark:text-slate-300 mt-3">
            আপোনাৰ দিনটো শান্তিময় হওক। Returning gently to home...
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-10 shadow-md border border-[#E2DCD5] dark:border-slate-700 max-w-xl w-full flex flex-col items-center">
          {/* Audio Trigger */}
          <div className="mb-4">
            <button
              onClick={handlePlayVoice}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all ${
                isPlayingAudio
                  ? 'bg-[#00524d] text-white'
                  : 'bg-[#F3EFEA] dark:bg-slate-700 text-[#00524d] dark:text-[#5eead4]'
              }`}
              type="button"
            >
              <Volume2 className="w-4 h-4" />
              <span>পুনৰ শুনক / Listen again</span>
            </button>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-[#1E293B] dark:text-slate-100 tracking-tight">
            কেনেকুৱা লাগিল?
          </h2>
          <p className="text-xl text-[#00524d] dark:text-[#5eead4] font-medium mt-1">
            How was that?
          </p>
          <p className="text-base text-[#475569] dark:text-slate-300 mt-2">
            আপোনাৰ মনটো এতিয়া কেনে লাগিছে কওক
          </p>

          {/* ComfortFacesRow: 3 drawn face buttons with visible labels */}
          <div className="w-full grid grid-cols-3 gap-3 sm:gap-4 mt-8 mb-8">
            {/* GOOD Face */}
            <button
              onClick={() => handleSelect('good')}
              aria-label="ভাল লাগিল / Good"
              className={`min-h-[140px] p-3 sm:p-4 rounded-3xl border transition-all flex flex-col items-center justify-center gap-2.5 active:scale-95 cursor-pointer ${
                selectedFeeling === 'good'
                  ? 'bg-[#E8F5E9] dark:bg-emerald-950/80 border-[#2D6A4F] ring-2 ring-emerald-500'
                  : 'bg-[#FBF9F5] dark:bg-slate-750 border-[#E2DCD5] dark:border-slate-700 hover:border-[#2D6A4F]'
              }`}
              type="button"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-[#2D6A4F] dark:text-emerald-400 flex items-center justify-center shadow-sm">
                <Smile className="w-10 h-10 stroke-[2.2]" />
              </div>
              <div>
                <span className="font-bold text-base sm:text-lg text-[#1E293B] dark:text-slate-100 block">
                  ভাল লাগিল
                </span>
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                  Good 😊
                </span>
              </div>
            </button>

            {/* OK Face */}
            <button
              onClick={() => handleSelect('ok')}
              aria-label="ঠিক আছে / OK"
              className={`min-h-[140px] p-3 sm:p-4 rounded-3xl border transition-all flex flex-col items-center justify-center gap-2.5 active:scale-95 cursor-pointer ${
                selectedFeeling === 'ok'
                  ? 'bg-[#FEF3C7] dark:bg-amber-950/80 border-[#D97706] ring-2 ring-amber-500'
                  : 'bg-[#FBF9F5] dark:bg-slate-750 border-[#E2DCD5] dark:border-slate-700 hover:border-[#D97706]'
              }`}
              type="button"
            >
              <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shadow-sm">
                <Meh className="w-10 h-10 stroke-[2.2]" />
              </div>
              <div>
                <span className="font-bold text-base sm:text-lg text-[#1E293B] dark:text-slate-100 block">
                  ঠিক আছে
                </span>
                <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
                  OK 😐
                </span>
              </div>
            </button>

            {/* UNCOMFORTABLE Face */}
            <button
              onClick={() => handleSelect('uncomfortable')}
              aria-label="অসুবিধা হʼল / Uncomfortable"
              className={`min-h-[140px] p-3 sm:p-4 rounded-3xl border transition-all flex flex-col items-center justify-center gap-2.5 active:scale-95 cursor-pointer ${
                selectedFeeling === 'uncomfortable'
                  ? 'bg-[#FEE2E2] dark:bg-rose-950/80 border-rose-500 ring-2 ring-rose-500'
                  : 'bg-[#FBF9F5] dark:bg-slate-750 border-[#E2DCD5] dark:border-slate-700 hover:border-rose-400'
              }`}
              type="button"
            >
              <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-400 flex items-center justify-center shadow-sm">
                <Frown className="w-10 h-10 stroke-[2.2]" />
              </div>
              <div>
                <span className="font-bold text-base sm:text-lg text-[#1E293B] dark:text-slate-100 block">
                  অসুবিধা
                </span>
                <span className="text-xs text-rose-700 dark:text-rose-400 font-semibold">
                  Tired / ☹
                </span>
              </div>
            </button>
          </div>

          {/* Small Skip button */}
          <button
            onClick={() => {
              sound.playChime('gentle');
              onSkip();
            }}
            className="text-sm font-semibold text-[#475569] dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 py-2 px-4 rounded-xl cursor-pointer"
            type="button"
          >
            এৰাই চলক / Skip
          </button>
        </div>
      )}
    </div>
  );
};
