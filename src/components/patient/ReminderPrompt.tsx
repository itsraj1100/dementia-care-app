import React, { useState, useEffect } from 'react';
import { Volume2, Check, Clock, LifeBuoy, Droplet, Coffee, Pill, Calendar, CheckCircle2 } from 'lucide-react';
import { PlanItem } from '../../types.ts';
import { sound } from '../../utils/audio.ts';

interface ReminderPromptProps {
  item: PlanItem;
  onDone: () => void;
  onLater: () => void;
  onHelp: () => void;
}

export const ReminderPrompt: React.FC<ReminderPromptProps> = ({
  item,
  onDone,
  onLater,
  onHelp,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showDoneAnimation, setShowDoneAnimation] = useState(false);
  const [laterMessage, setLaterMessage] = useState<string | null>(null);

  // Auto-play audio on entry as per spec §4
  useEffect(() => {
    const timer = setTimeout(() => {
      handlePlayVoice();
    }, 400);
    return () => clearTimeout(timer);
  }, [item.id]);

  const handlePlayVoice = () => {
    sound.playChime('chime');
    setIsPlayingAudio(true);
    const prompt = `${item.titleAs}. ${item.instructionAs}. ${item.titleEn}.`;
    sound.speak(prompt, {
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
    });
  };

  const handleDoneClick = () => {
    sound.playChime('success');
    setShowDoneAnimation(true);
    sound.speak('বৰ ভাল হʼল! সম্পন্ন কৰা হʼল। Wonderful! Marked as done.');
    setTimeout(() => {
      onDone();
    }, 900);
  };

  const handleLaterClick = () => {
    sound.playChime('gentle');
    setLaterMessage('অলপ পাছত আকৌ মনত পেলাই দিম। I will gently remind you again soon.');
    sound.speak('অলপ পাছত আকৌ মনত পেলাই দিম। No rush, I will remind you again soon.');
    setTimeout(() => {
      onLater();
    }, 1200);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hydration':
        return <Droplet className="w-10 h-10 text-blue-500" />;
      case 'meal':
        return <Coffee className="w-10 h-10 text-amber-600" />;
      case 'medication':
        return <Pill className="w-10 h-10 text-emerald-600" />;
      default:
        return <Calendar className="w-10 h-10 text-[#00524d] dark:text-[#5eead4]" />;
    }
  };

  return (
    <div className="w-full flex flex-col pb-8 animate-in fade-in duration-300">
      {/* Reminder card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-md border border-[#E2DCD5] dark:border-slate-700/80 p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden mb-6">
        {/* Success tick animation overlay */}
        {showDoneAnimation && (
          <div className="absolute inset-0 bg-[#2D6A4F] text-white flex flex-col items-center justify-center gap-3 z-30 animate-in zoom-in-95 duration-200">
            <CheckCircle2 className="w-20 h-20 text-white animate-bounce" />
            <h3 className="text-3xl font-bold">সম্পন্ন হʼল!</h3>
            <p className="text-xl text-emerald-100">Done gracefully</p>
          </div>
        )}

        {/* Generic icon by type without drug imagery */}
        <div className="w-20 h-20 rounded-full bg-[#F3EFEA] dark:bg-slate-700 flex items-center justify-center mb-4 shadow-inner">
          {getTypeIcon(item.type)}
        </div>

        {/* Optional photo cue if available */}
        {item.photoUrl && (
          <div className="w-full max-w-sm h-48 rounded-2xl overflow-hidden mb-4 shadow-sm">
            <img
              src={item.photoUrl}
              alt={item.titleEn}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        )}

        <h2 className="text-3xl sm:text-4xl font-bold text-[#1E293B] dark:text-slate-100 leading-snug tracking-tight">
          {item.titleAs}
        </h2>
        <p className="text-xl sm:text-2xl text-[#00524d] dark:text-[#5eead4] font-medium mt-1">
          {item.titleEn}
        </p>

        <p className="text-lg sm:text-xl text-[#475569] dark:text-slate-300 mt-4 leading-relaxed max-w-lg">
          {item.instructionAs}
        </p>
        <p className="text-sm sm:text-base text-[#475569] dark:text-slate-400 mt-1 italic">
          {item.instructionEn}
        </p>

        {/* Listen Again Button */}
        <div className="mt-6 w-full max-w-xs">
          <button
            onClick={handlePlayVoice}
            className={`w-full min-h-[52px] rounded-2xl flex items-center justify-center gap-2.5 font-bold text-base transition-all cursor-pointer ${
              isPlayingAudio
                ? 'bg-[#00524d] text-white'
                : 'bg-[#F3EFEA] dark:bg-slate-700 text-[#00524d] dark:text-[#5eead4] hover:bg-[#E7E2DA] dark:hover:bg-slate-600'
            }`}
            type="button"
          >
            <Volume2 className={`w-5 h-5 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
            <span>{isPlayingAudio ? 'ধ্বনি বাজিছে...' : 'পুনৰ শুনক / Listen again'}</span>
          </button>
        </div>

        {laterMessage && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/60 rounded-xl text-amber-800 dark:text-amber-300 font-medium text-sm animate-pulse">
            {laterMessage}
          </div>
        )}
      </div>

      {/* Primary Done & Secondary Later buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {/* Primary Action: Done */}
        <button
          onClick={handleDoneClick}
          className="w-full min-h-[72px] rounded-3xl bg-[#2D6A4F] hover:bg-emerald-800 text-white font-bold text-xl sm:text-2xl flex items-center justify-center gap-3 shadow-md active:scale-95 transition-all cursor-pointer"
          type="button"
        >
          <Check className="w-8 h-8 stroke-[3]" />
          <span>সম্পন্ন / Done</span>
        </button>

        {/* Secondary Action: Later */}
        <button
          onClick={handleLaterClick}
          className="w-full min-h-[72px] rounded-3xl bg-white dark:bg-slate-800 hover:bg-[#F3EFEA] dark:hover:bg-slate-700 text-[#475569] dark:text-slate-200 font-bold text-xl sm:text-2xl flex items-center justify-center gap-3 shadow-sm border border-[#E2DCD5] dark:border-slate-700 active:scale-95 transition-all cursor-pointer"
          type="button"
        >
          <Clock className="w-7 h-7 text-[#00524d] dark:text-[#5eead4]" />
          <span>পাছত / Later</span>
        </button>
      </div>

      {/* Help Button */}
      <div className="w-full pt-1">
        <button
          onClick={() => {
            sound.playChime('alert');
            onHelp();
          }}
          className="w-full min-h-[64px] rounded-3xl bg-[#ffdbd1] hover:bg-[#ffb59f] dark:bg-[#7d2c13] dark:hover:bg-[#9c4328] text-[#3a0a00] dark:text-[#ffdbd1] font-bold text-lg sm:text-xl flex items-center justify-center gap-3 shadow-sm active:scale-95 transition-all cursor-pointer border border-[#ffb59f]/60 dark:border-amber-900/60"
          type="button"
        >
          <LifeBuoy className="w-6 h-6 text-[#9c4328] dark:text-[#ffdbd1]" />
          <span>সহায় / Help (Caregiver Ananya)</span>
        </button>
      </div>
    </div>
  );
};
