import React, { useState } from 'react';
import { Volume2, ArrowRight, LifeBuoy, Home, Sparkles, Image as ImageIcon, Coffee, Award, Music } from 'lucide-react';
import { PatientRoute } from '../../types.ts';
import { sound } from '../../utils/audio.ts';

interface ActivityHubProps {
  onSelectActivity: (route: PatientRoute) => void;
  onBackToHome: () => void;
  onHelp: () => void;
}

export const ActivityHub: React.FC<ActivityHubProps> = ({
  onSelectActivity,
  onBackToHome,
  onHelp,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const activities = [
    {
      id: 'photo-recall' as PatientRoute,
      titleAs: 'ঘৰৰ স্মৃতি',
      titleEn: 'Photo Recall',
      subtitleAs: 'পৰিয়ালৰ চিনাকী মানুহবোৰ চাওক',
      subtitleEn: 'Recognize familiar family faces',
      badgeAs: '৩ খন ফটো সাজু',
      badgeEn: '3 photos ready',
      icon: ImageIcon,
      imageSrc:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBHhF3l4uGI9Li0CiSCv_f9gzh9NxMepXqDtU7caxQuR3FQ2901hGbIJRd4IlGk2_VuknOoa6NJSm6bdnrP5_QjDYdTB6QMfLpr7KAV4jAKsrK7LOFTYUycEytJ6T0BdBekJIW3mG4fTf0PHdSZtqLqY6qTBm2oVayfMt48wjQrKzTA6ObtXsv7YWpG6y40CPgcqEHC-ZatWyeaWBNm_Vk_uXL1msskwYZmY2zp0Gd9-CXFxtr2EH2KAA',
      alt: 'Assamese grandmother and granddaughter sharing warm tea together',
    },
    {
      id: 'routine-order' as PatientRoute,
      titleAs: 'দৈনন্দিন নিয়ম',
      titleEn: 'Routine Order',
      subtitleAs: 'দিনটোৰ নিয়মবোৰ সজাওঁ আহক',
      subtitleEn: 'Arrange familiar daily steps',
      badgeAs: 'চাহ বনোৱাৰ নিয়ম',
      badgeEn: 'Tea routine',
      icon: Coffee,
      imageSrc:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBvMT20wvk9EX9IzK5VSUcvCTvOHIK3trS_IMjdIa1n-29gM9DWhXWn6mglOMADC3hGn2R8fMjjmyNPofgiMPA_qSOTDJTbwBmzJmckctOYWuaXFhMur63wsE8Xt5j6RywBm2U0goWNxxHD27Z0hnXrFLrtMqh3jsg0OBte8rUYPYjnUr5H59Mds-9VGh1aP806TpSOcRU1DGsONtjPAQCFFaw0KDw61Ij-3Wq2_A1aRxDo3xm6o70MIw',
      alt: 'Clay kettle warming on hearth in authentic kitchen',
    },
    {
      id: 'object-match' as PatientRoute,
      titleAs: 'বস্তুৰ মিল',
      titleEn: 'Familiar Object Match',
      subtitleAs: 'চিনাকী কাঁহ-পিতলৰ বাচন চিনক',
      subtitleEn: 'Match traditional household items',
      badgeAs: 'কাঁহৰ বাচন',
      badgeEn: 'Bell-metal items',
      icon: Award,
      imageSrc:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAAKQsreXEz48tUQrjf9y5eoZMyvKw2OjPirK60sYJUWeeu8Esu7rwMEZytKHxtR5M7J5aRLjALoSj7jbC9mrg0EwyKv66nlUm71jh4-f318ctIPtbZBXQ0dXpWwIRrgymyjDSXrfSnwLxUQWe1ZqD5IXNcZm6kTQr3sKT2G4KqOjItApbRI7KtlOxLsOiQCU2uoQdMnAHfivxddeRVWKxn5ead43Helfq_d-nw-4LwHrJQ6yyQiNFunw',
      alt: 'Traditional Assamese bell-metal brass bowl on woven mat',
    },
    {
      id: 'music-moment' as PatientRoute,
      titleAs: 'সংগীতৰ পল',
      titleEn: 'Music Moment',
      subtitleAs: 'বাঁহীৰ সুৰ আৰু বৰগীত শুনক',
      subtitleEn: 'Calming instrumental melodies',
      badgeAs: 'শান্ত সুৰ',
      badgeEn: 'Relaxing flute',
      icon: Music,
      imageSrc:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBcNtGSCJeZ6VulYlpJM0tRfkC_RYUSbaeC0jv-epLl1KfBfuybFSv3OGecu5q9XaiV9jkYk7z28X-7xvy1XvCI_eK0HWy1onObRtBYGHaH0GrDhUqZjGwNOqGc6nZCIR4XVgOyn0XEUQKfQLtJPQguB05-6yG9xqaZPz_BguXBwEewHcqLuE2vgUvm67vvC_aB99ZOJelrdnkZReSrX1aDvwggc_9GAif_1pbW56BCNuEfxkjr1w0j3A',
      alt: 'Bamboo fan and serene veranda atmosphere',
    },
  ];

  const handlePlayVoice = () => {
    sound.playChime('chime');
    setIsPlayingAudio(true);
    const text = 'মনৰ সন্তোষজনক কাৰ্যসূচী। আপোনাৰ ভাল লগা কাৰ্যসূচী বাছক। Choose a familiar quiet activity. আপোনাৰ নিজৰ গতিত আনন্দ লওক।';
    sound.speak(text, {
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
    });
  };

  return (
    <div className="w-full flex flex-col pb-12 animate-in fade-in duration-300">
      {/* Intro Guidance Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-[#E2DCD5] dark:border-slate-700/80 p-5 sm:p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8F5E9] dark:bg-emerald-950/80 text-[#2D6A4F] dark:text-emerald-400 font-medium text-xs sm:text-sm mb-2.5">
              <span className="w-2 h-2 rounded-full bg-[#2D6A4F] dark:bg-emerald-400 animate-pulse" />
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
            className={`w-full min-h-[56px] px-4 py-3 rounded-2xl transition-all flex items-center justify-center gap-3 cursor-pointer ${
              isPlayingAudio
                ? 'bg-[#00524d] text-white shadow-md'
                : 'bg-[#F3EFEA] dark:bg-slate-700 text-[#00524d] dark:text-[#5eead4] hover:bg-[#E7E2DA] active:scale-[0.99]'
            }`}
            type="button"
          >
            <Volume2 className={`w-6 h-6 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
            <span className="font-bold text-base sm:text-lg">
              {isPlayingAudio ? 'ধ্বনি বাজিছে...' : 'পুনৰ শুনক / Listen again'}
            </span>
          </button>
        </div>
      </div>

      {/* Activities Grid: 1 col on phone, 2 cols on tablet/laptop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {activities.map((act) => {
          const Icon = act.icon;
          return (
            <div
              key={act.id}
              className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-[#E2DCD5] dark:border-slate-700/80 overflow-hidden flex flex-col hover:shadow-md transition-all group"
            >
              <div className="relative w-full h-44 bg-slate-100 dark:bg-slate-700 overflow-hidden">
                <img
                  src={act.imageSrc}
                  alt={act.alt}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-3 right-3 bg-white/95 dark:bg-slate-900/95 px-3 py-1 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1.5 backdrop-blur-md text-[#00524d] dark:text-[#5eead4]">
                  <Icon className="w-3.5 h-3.5" />
                  <span>{act.badgeAs} / {act.badgeEn}</span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div>
                  <h3 className="font-bold text-xl text-[#1E293B] dark:text-slate-100">
                    {act.titleAs} · {act.titleEn}
                  </h3>
                  <p className="text-sm text-[#475569] dark:text-slate-400 mt-1">
                    {act.subtitleAs} / {act.subtitleEn}
                  </p>
                </div>

                <button
                  onClick={() => {
                    sound.playChime('gentle');
                    onSelectActivity(act.id);
                  }}
                  className="w-full min-h-[58px] rounded-2xl bg-[#00524d] hover:bg-[#1e6b65] text-white font-bold text-base sm:text-lg flex items-center justify-between px-5 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
                  type="button"
                >
                  <span>আৰম্ভ কৰক / Start</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gentle Reassurance Note */}
      <div className="bg-[#F3EFEA] dark:bg-slate-800/80 rounded-3xl p-5 mb-6 border border-[#E2DCD5] dark:border-slate-700/80 flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-full bg-[#a8f0e8] text-[#00524d] flex items-center justify-center shrink-0">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-base text-[#1E293B] dark:text-slate-100">
            কোনো তাৰাহুৰা নাই · Take Your Time
          </p>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-300 mt-0.5">
            সকলো শুদ্ধ বা ভুলৰ ঊৰ্ধ্বত। কেৱল মন ভাল লগাৰ বাবে।
          </p>
        </div>
      </div>

      {/* Action Buttons: Home & Help */}
      <div className="grid grid-cols-2 gap-3">
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
