import React, { useEffect, useState } from 'react';
import { ShieldCheck, Heart, Volume2 } from 'lucide-react';
import { sound } from '../../utils/audio.ts';

interface PatientHelpProps {
  isOffline: boolean;
  onDismiss: () => void;
}

export const PatientHelp: React.FC<PatientHelpProps> = ({
  isOffline,
  onDismiss,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const primaryMessageAs = isOffline
    ? 'আপুনি সম্পূৰ্ণ সুৰক্ষিত। ফʼন সংযোগ হোৱাৰ লগে লগে অনামিকাক খবৰ দিয়া হʼব।'
    : 'আপুনি সম্পূৰ্ণ সুৰক্ষিত। অনামিকাক শান্তভাৱে জনোৱা হৈছে।';

  const primaryMessageEn = isOffline
    ? 'You are safe. Ananya will be told as soon as the phone connects.'
    : 'You are safe. Ananya is being gently notified.';

  useEffect(() => {
    handlePlayVoice();
  }, []);

  const handlePlayVoice = () => {
    sound.playChime('alert');
    setIsPlayingAudio(true);
    sound.speak(`${primaryMessageAs} ${primaryMessageEn}`, {
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
    });
  };

  return (
    <div className="w-full min-h-[75vh] flex flex-col items-center justify-center p-4 text-center animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 sm:p-12 shadow-xl border-2 border-[#E2DCD5] dark:border-slate-700 max-w-lg w-full flex flex-col items-center">
        {/* Soft comforting icon */}
        <div className="w-24 h-24 rounded-full bg-[#E8F5E9] dark:bg-emerald-950/80 text-[#2D6A4F] dark:text-emerald-400 flex items-center justify-center mb-6 shadow-inner">
          <ShieldCheck className="w-14 h-14" />
        </div>

        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8F5E9] dark:bg-emerald-950/80 text-[#2D6A4F] dark:text-emerald-400 font-bold text-sm mb-3">
          <Heart className="w-4 h-4 fill-current" />
          শান্তিৰে থাকক · Peaceful Care
        </span>

        <h2 className="text-3xl sm:text-4xl font-bold text-[#1E293B] dark:text-slate-100 tracking-tight leading-snug">
          {primaryMessageAs}
        </h2>

        <p className="text-xl sm:text-2xl text-[#00524d] dark:text-[#5eead4] font-medium mt-2 leading-relaxed">
          {primaryMessageEn}
        </p>

        <p className="text-base text-[#475569] dark:text-slate-300 mt-4 max-w-md">
          অনামিকা ওচৰতে উপস্থিত আছে। কোনো ভয় বা চিন্তা নকৰিব।
        </p>

        {/* Audio Replay Button */}
        <button
          onClick={handlePlayVoice}
          className="mt-6 px-4 py-2 rounded-full bg-[#F3EFEA] dark:bg-slate-700 text-[#00524d] dark:text-[#5eead4] text-sm font-semibold flex items-center gap-2 cursor-pointer hover:bg-[#E7E2DA]"
          type="button"
        >
          <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
          <span>পুনৰ শুনক / Listen again</span>
        </button>

        {/* Big Single OK button */}
        <div className="w-full mt-8">
          <button
            onClick={() => {
              sound.playChime('gentle');
              onDismiss();
            }}
            className="w-full min-h-[68px] rounded-3xl bg-[#00524d] hover:bg-[#1e6b65] text-white font-bold text-2xl flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
            type="button"
          >
            বুজিলোঁ / OK
          </button>
        </div>
      </div>
    </div>
  );
};
