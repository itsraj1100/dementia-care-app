import React, { useState, useRef } from 'react';
import { Volume2, Lightbulb, Home, LifeBuoy, Check, Heart, Sparkles, UserCheck, ArrowRight } from 'lucide-react';
import { sound } from '../utils/audio.ts';
import { ActivitySession } from '../types.ts';
import { CognitivePrepOverlay } from './patient/CognitivePrepOverlay.tsx';

interface PhotoRecallScreenProps {
  level?: 1 | 2 | 3;
  onBackToHome: () => void;
  onNotifyCaregiver: () => void;
  onDone?: (sessionData?: Partial<ActivitySession>) => void;
}

export const PhotoRecallScreen: React.FC<PhotoRecallScreenProps> = ({
  level = 1,
  onBackToHome,
  onNotifyCaregiver,
  onDone,
}) => {
  const currentLevel = (Math.min(3, Math.max(1, level))) as 1 | 2 | 3;
  const optionCount = currentLevel === 1 ? 2 : currentLevel === 2 ? 3 : 4;

  const [isPreparing, setIsPreparing] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Session tracking
  const startedAtRef = useRef<string>(new Date().toISOString());
  const hintsUsedRef = useRef<number>(0);
  const wrongTapsRef = useRef<number>(0);
  const roundsCompletedRef = useRef<number>(0);

  const photoOptions = [
    {
      id: 'family-tea',
      titleAs: 'আইতা আৰু মৰমৰ নাতি মিনু',
      titleEn: 'Grandmother & loving granddaughter Minu',
      descAs: 'বাৰাণ্ডাত পুৱাৰ ৰʼদ পুৱাই চাহ খোৱা সুখৰ স্মৃতি',
      descEn: 'Sweet memory of enjoying hot tea together in the morning sun',
      isCorrect: true,
    },
    {
      id: 'school-friends',
      titleAs: 'গাঁৱৰ পুৰণি স্কুলীয়া বন্ধু',
      titleEn: 'Old village school companions',
      descAs: 'শৈশৱৰ পুৰণি ধেমালি আৰু গান গোৱা দিন',
      descEn: 'Remembrance of childhood school days',
      isCorrect: false,
    },
    {
      id: 'bazaar-vendor',
      titleAs: 'হাটৰ চিনাকী শাক-পাচলি বেপাৰী',
      titleEn: 'Familiar weekend market vendor',
      descAs: 'দৈনিক হাটৰ চিনাকী মানুহসকল',
      descEn: 'Neighborhood local market visitors',
      isCorrect: false,
    },
    {
      id: 'courtyard-garden',
      titleAs: 'চোতালৰ সুগন্ধি গোলাপ ফুলনি',
      titleEn: 'Courtyard rose garden with family',
      descAs: 'প্ৰভাতৰ নিয়ঁৰ সনা ফুলৰ সুবাস আৰু পানী দিয়া সময়',
      descEn: 'Fragrant morning blossoms in the home courtyard',
      isCorrect: false,
    },
  ];

  const correctOpt = photoOptions.find((o) => o.isCorrect) || photoOptions[0];
  const distractorOpts = photoOptions.filter((o) => o.id !== correctOpt.id);
  const chosenIds = new Set([correctOpt.id, ...distractorOpts.slice(0, optionCount - 1).map((o) => o.id)]);
  const candidateOptions = photoOptions.filter((o) => chosenIds.has(o.id));

  const handleSelect = (id: string, isCorrect: boolean) => {
    setSelectedId(id);
    if (isCorrect) {
      roundsCompletedRef.current = 1;
      sound.playChime('success');
      sound.speak('সুন্দৰ! আইতা আৰু মৰমৰ নাতি মিনুৰ চিনাকী মুখ। Wonderful! Grandmother and loving granddaughter Minu.');
    } else {
      wrongTapsRef.current++;
      sound.playChime('gentle');
      sound.speak('কোনো কথা নাই আইতা, ফটোখনত নাতিৰ হাঁহিটো চাওঁক। Look at the sweet grandchild smiling with grandmother.');
    }
  };

  const handlePlayVoice = () => {
    sound.playChime('chime');
    setIsPlayingAudio(true);
    const text = 'ঘৰৰ স্মৃতি। ফটোখনত কোনে হাঁহি হাঁহি চাহ খাই আছে বাছক। Who is sharing warm morning tea with a smile?';
    sound.speak(text, {
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
    });
  };

  const handleHint = () => {
    hintsUsedRef.current++;
    setShowHint(true);
    sound.playChime('hint');
    sound.speak('ইঙ্গিত: ঘৰৰ মৰমৰ নাতি আৰু আইতাৰ কথা ভৱক। Think of the loving granddaughter with her grandmother.');
  };

  const handleAbandon = () => {
    sound.stopSpeaking();
    const duration = Math.max(5, Math.round((Date.now() - new Date(startedAtRef.current).getTime()) / 1000));
    if (onDone) {
      onDone({
        activityId: 'photo-recall',
        activityType: 'photo-recall',
        level: currentLevel,
        roundsTotal: 1,
        roundsCompleted: roundsCompletedRef.current,
        hintsUsed: hintsUsedRef.current,
        wrongTaps: wrongTapsRef.current,
        abandoned: true,
        completedSuccessfully: false,
        durationSeconds: duration,
        startedAt: startedAtRef.current,
        completedAt: new Date().toISOString(),
      });
    }
    onBackToHome();
  };

  const handleFinish = () => {
    sound.playChime('gentle');
    const duration = Math.max(8, Math.round((Date.now() - new Date(startedAtRef.current).getTime()) / 1000));
    if (onDone) {
      onDone({
        activityId: 'photo-recall',
        activityType: 'photo-recall',
        level: currentLevel,
        roundsTotal: 1,
        roundsCompleted: 1,
        hintsUsed: hintsUsedRef.current,
        wrongTaps: wrongTapsRef.current,
        abandoned: false,
        completedSuccessfully: true,
        durationSeconds: duration,
        startedAt: startedAtRef.current,
        completedAt: new Date().toISOString(),
      });
    }
  };

  const isMatched = selectedId === 'family-tea';

  return (
    <div className="w-full flex flex-col pb-12 animate-in fade-in duration-300">
      {isPreparing && (
        <CognitivePrepOverlay
          activityId="photo-recall"
          activityNameAs="ঘৰৰ স্মৃতি"
          activityNameEn="Photo Recall"
          icon={<UserCheck className="w-10 h-10" />}
          onComplete={() => {
            setIsPreparing(false);
            setTimeout(() => {
              handlePlayVoice();
            }, 400);
          }}
        />
      )}

      {/* Context Header */}
      <div className="w-full flex items-center justify-between py-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#00524d] dark:bg-[#5eead4]"></span>
          <span className="text-sm font-semibold text-[#475569] dark:text-slate-400">
            ঘৰৰ স্মৃতি · Photo Recall (Level {currentLevel}: {optionCount} choices)
          </span>
        </div>

        <button
          onClick={handlePlayVoice}
          aria-label="পুনৰ শুনক / Listen again"
          className={`h-11 px-4 rounded-full transition-all flex items-center gap-2 cursor-pointer ${
            isPlayingAudio
              ? 'bg-[#00524d] text-white shadow-sm'
              : 'bg-[#00524d]/10 dark:bg-teal-950/80 text-[#00524d] dark:text-[#5eead4] hover:bg-[#00524d]/20 active:scale-95'
          }`}
          type="button"
        >
          <Volume2 className={`w-5 h-5 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
          <span className="text-xs sm:text-sm font-bold">পুনৰ শুনক / Listen</span>
        </button>
      </div>

      {/* Primary Headline */}
      <div className="w-full mb-4 text-left">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1E293B] dark:text-slate-100 tracking-tight leading-snug">
          পৰিয়ালৰ চিনাকী মানুহবোৰ চিনক
        </h2>
        <p className="text-base sm:text-lg text-[#475569] dark:text-slate-400 mt-0.5">
          Who is sharing warm morning tea in the veranda?
        </p>
      </div>

      {/* Main Split Layout: Photo on left, options on right on laptop/desktop */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5 items-start">
        {/* Memory Photo Card */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-[#E2DCD5] dark:border-slate-700 p-4 sm:p-5 flex flex-col">
          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 shadow-inner">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHhF3l4uGI9Li0CiSCv_f9gzh9NxMepXqDtU7caxQuR3FQ2901hGbIJRd4IlGk2_VuknOoa6NJSm6bdnrP5_QjDYdTB6QMfLpr7KAV4jAKsrK7LOFTYUycEytJ6T0BdBekJIW3mG4fTf0PHdSZtqLqY6qTBm2oVayfMt48wjQrKzTA6ObtXsv7YWpG6y40CPgcqEHC-ZatWyeaWBNm_Vk_uXL1msskwYZmY2zp0Gd9-CXFxtr2EH2KAA"
              alt="Assamese grandmother and smiling granddaughter laughing gently together with tea"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 text-[#00524d] dark:text-[#5eead4] px-3.5 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ঘৰৰ চোতাল · Family Home</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-[#F3EFEA] dark:bg-slate-700/60 rounded-xl border border-[#E2DCD5]/60 dark:border-slate-600">
            <p className="text-sm sm:text-base font-medium text-[#1E293B] dark:text-slate-200">
              "বাৰাণ্ডাৰ পুৱাৰ ৰʼদজাক, কলপাতৰ সেউজীয়া আৰু নাতিৰ লগত মিঠা কথা।"
            </p>
            <p className="text-xs text-[#475569] dark:text-slate-400 mt-0.5">
              Morning light, gentle laughter, and the warmth of fresh garden tea.
            </p>
          </div>
        </div>

        {/* Options List */}
        <div className="lg:col-span-6 flex flex-col gap-3.5">
          {photoOptions.map((opt) => {
            const isSelected = selectedId === opt.id;
            const isHighlighted = showHint && opt.isCorrect;

            let borderStyle = 'bg-white dark:bg-slate-800 border-[#E2DCD5] dark:border-slate-700';
            if (isSelected) {
              if (opt.isCorrect) {
                borderStyle = 'bg-[#E8F5E9] dark:bg-emerald-950/80 border-[#2D6A4F] dark:border-emerald-500 ring-2 ring-emerald-500/20';
              } else {
                borderStyle = 'bg-[#F3EFEA] dark:bg-amber-950/40 border-[#D97706] dark:border-amber-600';
              }
            } else if (isHighlighted) {
              borderStyle = 'bg-[#E8F5E9] dark:bg-emerald-950/60 border-[#2D6A4F] ring-2 ring-emerald-400 animate-pulse';
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id, opt.isCorrect)}
                type="button"
                className={`min-h-[76px] p-4 rounded-2xl shadow-sm active:scale-[0.99] transition-all flex items-center justify-between text-left cursor-pointer border ${borderStyle}`}
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                      isSelected && opt.isCorrect
                        ? 'bg-[#2D6A4F] text-white'
                        : isSelected && !opt.isCorrect
                        ? 'bg-[#D97706] text-white'
                        : 'bg-[#F3EFEA] dark:bg-slate-700 text-[#00524d] dark:text-[#5eead4]'
                    }`}
                  >
                    {isSelected && opt.isCorrect ? (
                      <Check className="w-5 h-5 stroke-[3]" />
                    ) : (
                      <UserCheck className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="font-bold text-base sm:text-lg text-[#1E293B] dark:text-slate-100 truncate">
                      {opt.titleAs}
                    </p>
                    <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-400 truncate">
                      {opt.titleEn}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  <span className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-500 flex items-center justify-center">
                    {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-[#00524d] dark:bg-[#5eead4]" />}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Gentle Reassurance Banner */}
      <div
        className={`w-full rounded-2xl p-4 mb-4 flex items-center gap-3.5 transition-colors border ${
          isMatched
            ? 'bg-[#E8F5E9] dark:bg-emerald-950/80 border-[#2D6A4F]/40 text-[#2D6A4F] dark:text-emerald-300'
            : selectedId && !isMatched
            ? 'bg-[#FEF3C7] dark:bg-amber-950/80 border-[#D97706]/40 text-[#92400e] dark:text-amber-300'
            : 'bg-[#F3EFEA] dark:bg-slate-800/80 border-[#E2DCD5] dark:border-slate-700 text-[#1E293B] dark:text-slate-200'
        }`}
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            isMatched ? 'bg-[#2D6A4F] text-white' : 'bg-white dark:bg-slate-700 text-[#00524d] dark:text-[#5eead4]'
          }`}
        >
          {isMatched ? <Check className="w-6 h-6 stroke-[3]" /> : <Heart className="w-6 h-6 fill-current" />}
        </div>
        <div className="flex-1">
          <p className="font-bold text-base sm:text-lg">
            {isMatched
              ? 'সুন্দৰ স্মৃতি! আইতা আৰু মৰমৰ নাতি মিনু একেলগে চাহ খাইছে।'
              : selectedId
              ? 'কোনো কথা নাই আইতা, ফটোখনত মৰমৰ নাতিৰ হাঁহিটো চাওঁক।'
              : 'আৰামেৰে ফটোখন চাওক, কোনো তাৰাহুৰা নাই।'}
          </p>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-400 mt-0.5">
            {isMatched
              ? 'Heartwarming memory! Sharing peaceful tea on the veranda.'
              : selectedId
              ? 'Take your time, look closely at the smiling granddaughter.'
              : 'Take your time and enjoy this gentle family memory.'}
          </p>
        </div>
        {isMatched && onDone && (
          <button
            onClick={() => {
              sound.playChime('gentle');
              onDone();
            }}
            className="px-4 py-2.5 rounded-xl bg-[#2D6A4F] text-white font-bold text-sm sm:text-base flex items-center gap-1.5 shadow-sm hover:bg-emerald-800 active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
            type="button"
          >
            <span>কাৰ্যসূচী শেষ হʼল / Finish & Check In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Hint & Navigation Buttons */}
      <div className="w-full flex flex-col gap-3">
        <button
          onClick={handleHint}
          className="w-full min-h-[58px] rounded-2xl bg-white dark:bg-slate-800 shadow-sm hover:bg-[#F3EFEA] dark:hover:bg-slate-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 text-[#00524d] dark:text-[#5eead4] border border-[#E2DCD5] dark:border-slate-700 cursor-pointer"
          type="button"
        >
          <Lightbulb className="w-6 h-6 text-amber-500" />
          <span className="font-bold text-lg sm:text-xl">
            মোক দেখুৱাওক / Show me (Hint)
          </span>
        </button>

        <div className="w-full grid grid-cols-2 gap-3 pt-1">
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
              onNotifyCaregiver();
            }}
            className="min-h-[58px] rounded-2xl bg-[#00524d] hover:bg-[#1e6b65] dark:bg-[#1e6b65] text-white shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            type="button"
          >
            <LifeBuoy className="w-5 h-5" />
            <span className="font-bold text-base sm:text-lg">সহায় / Help</span>
          </button>
        </div>
      </div>
    </div>
  );
};
