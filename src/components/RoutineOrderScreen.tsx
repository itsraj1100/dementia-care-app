import React, { useState, useRef } from 'react';
import { Volume2, Lightbulb, Home, LifeBuoy, Check, Sparkles, Coffee, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';
import { ROUTINE_STEPS_TEA } from '../data/activities.ts';
import { sound } from '../utils/audio.ts';
import { RoutineStep, ActivitySession } from '../types.ts';
import { CognitivePrepOverlay } from './patient/CognitivePrepOverlay.tsx';

interface RoutineOrderScreenProps {
  level?: 1 | 2 | 3;
  onBackToHome: () => void;
  onNotifyCaregiver: () => void;
  onDone?: (sessionData?: Partial<ActivitySession>) => void;
}

const FOURTH_STEP_STRAIN: RoutineStep = {
  id: 'step-strain',
  titleAs: '৩. সুগন্ধি চাহ চালনীৰে চেকি লোৱা',
  titleEn: '3. Strain brewed tea through strainer',
  descAs: 'সুগন্ধি চাহখিনি পৰিষ্কাৰ চালনীৰে চেকি লওক',
  descEn: 'Strain the warm fragrant tea before serving',
  icon: 'local_cafe',
  correctPosition: 3,
};

export const RoutineOrderScreen: React.FC<RoutineOrderScreenProps> = ({
  level = 1,
  onBackToHome,
  onNotifyCaregiver,
  onDone,
}) => {
  const currentLevel = (Math.min(3, Math.max(1, level))) as 1 | 2 | 3;
  const [isPreparing, setIsPreparing] = useState(true);

  // Configure steps based on level:
  // Level 1: 2 steps (boil water, pour cup)
  // Level 2: 3 steps (boil water, tea leaves, pour cup)
  // Level 3: 4 steps (boil water, tea leaves, strain, pour cup)
  const fullLevelSteps: RoutineStep[] = currentLevel === 1
    ? [ROUTINE_STEPS_TEA[0], ROUTINE_STEPS_TEA[2]]
    : currentLevel === 2
    ? [...ROUTINE_STEPS_TEA]
    : [ROUTINE_STEPS_TEA[0], ROUTINE_STEPS_TEA[1], FOURTH_STEP_STRAIN, ROUTINE_STEPS_TEA[2]];

  const getScrambledInitial = () => {
    if (currentLevel === 1) {
      return [ROUTINE_STEPS_TEA[2], ROUTINE_STEPS_TEA[0]];
    }
    if (currentLevel === 2) {
      return [ROUTINE_STEPS_TEA[1], ROUTINE_STEPS_TEA[0], ROUTINE_STEPS_TEA[2]];
    }
    return [ROUTINE_STEPS_TEA[1], ROUTINE_STEPS_TEA[2], ROUTINE_STEPS_TEA[0], FOURTH_STEP_STRAIN];
  };

  const [steps, setSteps] = useState<RoutineStep[]>(getScrambledInitial());
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Session tracking refs
  const startedAtRef = useRef<string>(new Date().toISOString());
  const hintsUsedRef = useRef<number>(0);
  const wrongTapsRef = useRef<number>(0);
  const roundsCompletedRef = useRef<number>(0);

  const checkOrderIsCorrect = (currentSteps: RoutineStep[]) => {
    return currentSteps.every((s, idx) => s.id === fullLevelSteps[idx].id);
  };

  const isOrderCorrect = checkOrderIsCorrect(steps);

  const moveStep = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= steps.length) return;
    sound.playChime('gentle');
    const newSteps = [...steps];
    const [movedItem] = newSteps.splice(fromIndex, 1);
    newSteps.splice(toIndex, 0, movedItem);
    setSteps(newSteps);

    // If new arrangement is correct
    if (checkOrderIsCorrect(newSteps)) {
      roundsCompletedRef.current = 1;
      sound.playChime('success');
      sound.speak('সুন্দৰ! পুৱাৰ চাহ বনোৱাৰ নিয়ম একেবাৰে নিখুঁত হʼল। Wonderful! The tea brewing routine is in perfect harmony.');
    } else {
      wrongTapsRef.current++;
    }
  };

  const handleReset = () => {
    sound.playChime('gentle');
    setSteps(getScrambledInitial());
    setShowHint(false);
  };

  const handlePlayVoice = () => {
    sound.playChime('chime');
    setIsPlayingAudio(true);
    const text = 'দৈনন্দিন নিয়ম। পুৱাৰ চাহ বনোৱাৰ নিয়মবোৰ ওপৰ-তল কৰি সঠিক ক্ৰমত সজাওক। Arrange the steps of making morning tea in order.';
    sound.speak(text, {
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
    });
  };

  const handleHint = () => {
    hintsUsedRef.current++;
    setShowHint(true);
    sound.playChime('hint');
    // Align into proper order directly when asking for hint
    setSteps([...fullLevelSteps]);
    roundsCompletedRef.current = 1;
    sound.speak('ইঙ্গিত: প্ৰথমে পানী উতলোৱা, তাৰ পাছত চাহ পাত দিয়া, আৰু শেষত কাঁহৰ বাটিত বাকি লোৱা। First boil water, then add tea leaves, then pour into the cup.');
  };

  const handleAbandon = () => {
    sound.stopSpeaking();
    const duration = Math.max(5, Math.round((Date.now() - new Date(startedAtRef.current).getTime()) / 1000));
    if (onDone) {
      onDone({
        activityId: 'routine-order',
        activityType: 'routine-order',
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
        activityId: 'routine-order',
        activityType: 'routine-order',
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

  return (
    <div className="w-full flex flex-col pb-12 animate-in fade-in duration-300">
      {isPreparing && (
        <CognitivePrepOverlay
          activityId="routine-order"
          activityNameAs="দৈনন্দিন নিয়ম"
          activityNameEn="Routine Order"
          icon={<Coffee className="w-10 h-10" />}
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
          <span className="w-3 h-3 rounded-full bg-[#9c4328] dark:text-[#f87171]"></span>
          <span className="text-sm font-semibold text-[#475569] dark:text-slate-400">
            দৈনন্দিন নিয়ম · Daily Routine Order (Level {currentLevel}: {fullLevelSteps.length} steps)
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
          পুৱাৰ চাহ বনোৱাৰ নিয়ম সজাওক
        </h2>
        <p className="text-base sm:text-lg text-[#475569] dark:text-slate-400 mt-0.5">
          Arrange the steps of making traditional tea in daily order
        </p>
      </div>

      {/* Split layout: Visual Hearth on left, interactive reorder on right for laptop */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5 items-start">
        {/* Hearth Banner Card */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-[#E2DCD5] dark:border-slate-700 p-4 sm:p-5 flex flex-col">
          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvMT20wvk9EX9IzK5VSUcvCTvOHIK3trS_IMjdIa1n-29gM9DWhXWn6mglOMADC3hGn2R8fMjjmyNPofgiMPA_qSOTDJTbwBmzJmckctOYWuaXFhMur63wsE8Xt5j6RywBm2U0goWNxxHD27Z0hnXrFLrtMqh3jsg0OBte8rUYPYjnUr5H59Mds-9VGh1aP806TpSOcRU1DGsONtjPAQCFFaw0KDw61Ij-3Wq2_A1aRxDo3xm6o70MIw"
              alt="Clay kettle on traditional Assamese hearth"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 text-[#9c4328] dark:text-amber-400 px-3 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur-md flex items-center gap-1.5">
              <Coffee className="w-3.5 h-3.5" />
              <span>চাহৰ আখল · Clay Stove</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-[#F3EFEA] dark:bg-slate-700/60 rounded-xl border border-[#E2DCD5]/60 dark:border-slate-600">
            <p className="text-sm font-semibold text-[#1E293B] dark:text-slate-100">
              সুগন্ধি চাহৰ প্ৰতিটো খোজ
            </p>
            <p className="text-xs text-[#475569] dark:text-slate-400 mt-0.5">
              বাটনত টিপি খোজে খোজে ওপৰ-তল কৰক। Tap the arrows to place each peaceful step.
            </p>
          </div>
        </div>

        {/* Routine Steps Interactive Reorder Area */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          {steps.map((step, index) => {
            const isTargetPos = step.correctPosition === index + 1;
            return (
              <div
                key={step.id}
                className={`p-4 rounded-2xl shadow-sm border transition-all flex items-center justify-between gap-3 ${
                  isOrderCorrect
                    ? 'bg-[#E8F5E9] dark:bg-emerald-950/80 border-[#2D6A4F] ring-2 ring-emerald-500/20'
                    : 'bg-white dark:bg-slate-800 border-[#E2DCD5] dark:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg shrink-0 shadow-inner ${
                      isOrderCorrect
                        ? 'bg-[#2D6A4F] text-white'
                        : isTargetPos
                        ? 'bg-[#a8f0e8] text-[#00524d] dark:bg-teal-900 dark:text-teal-300'
                        : 'bg-[#F3EFEA] dark:bg-slate-700 text-[#475569] dark:text-slate-300'
                    }`}
                  >
                    {isOrderCorrect ? <Check className="w-5 h-5 stroke-[3]" /> : index + 1}
                  </div>

                  <div className="min-w-0">
                    <p className="font-bold text-base sm:text-lg text-[#1E293B] dark:text-slate-100 leading-snug">
                      {step.titleAs}
                    </p>
                    <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-400 mt-0.5">
                      {step.titleEn}
                    </p>
                  </div>
                </div>

                {/* Arrow up/down controls with generous 44px hitboxes */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    disabled={index === 0}
                    onClick={() => moveStep(index, index - 1)}
                    aria-label={`ওপৰলৈ নিয়ক / Move step ${index + 1} up`}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all ${
                      index === 0
                        ? 'opacity-30 cursor-not-allowed border-slate-200 dark:border-slate-700'
                        : 'bg-[#F3EFEA] dark:bg-slate-700 hover:bg-[#E7E2DA] dark:hover:bg-slate-600 border-[#E2DCD5] dark:border-slate-600 cursor-pointer active:scale-95'
                    }`}
                    type="button"
                  >
                    <ArrowUp className="w-5 h-5 text-[#00524d] dark:text-[#5eead4]" />
                  </button>

                  <button
                    disabled={index === steps.length - 1}
                    onClick={() => moveStep(index, index + 1)}
                    aria-label={`তললৈ নিয়ক / Move step ${index + 1} down`}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all ${
                      index === steps.length - 1
                        ? 'opacity-30 cursor-not-allowed border-slate-200 dark:border-slate-700'
                        : 'bg-[#F3EFEA] dark:bg-slate-700 hover:bg-[#E7E2DA] dark:hover:bg-slate-600 border-[#E2DCD5] dark:border-slate-600 cursor-pointer active:scale-95'
                    }`}
                    type="button"
                  >
                    <ArrowDown className="w-5 h-5 text-[#00524d] dark:text-[#5eead4]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reassurance Banner */}
      <div
        className={`w-full rounded-2xl p-4 mb-4 flex items-center gap-3.5 transition-colors border ${
          isOrderCorrect
            ? 'bg-[#E8F5E9] dark:bg-emerald-950/80 border-[#2D6A4F]/40 text-[#2D6A4F] dark:text-emerald-300'
            : 'bg-[#F3EFEA] dark:bg-slate-800/80 border-[#E2DCD5] dark:border-slate-700 text-[#1E293B] dark:text-slate-200'
        }`}
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
            isOrderCorrect ? 'bg-[#2D6A4F] text-white' : 'bg-white dark:bg-slate-700 text-[#00524d] dark:text-[#5eead4]'
          }`}
        >
          {isOrderCorrect ? <Check className="w-6 h-6 stroke-[3]" /> : <Sparkles className="w-6 h-6" />}
        </div>
        <div className="flex-1">
          <p className="font-bold text-base sm:text-lg">
            {isOrderCorrect
              ? 'চাহৰ নিয়ম মিলি গʼল! পানী উতলাই, চাহ পাত দি, বাটিত বাকি লোৱা।'
              : 'আৰামেৰে খোজবোৰ ওপৰ-তল কৰক। সকলো মন ভাল লগাৰ বাবে।'}
          </p>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-400 mt-0.5">
            {isOrderCorrect
              ? 'Traditional tea routine arranged gracefully! Boil water, steep tea leaves, pour into the cup.'
              : 'Tap up or down arrows to comfortably align the routine. There is no rush.'}
          </p>
        </div>

        {isOrderCorrect && (
          <div className="flex items-center gap-1.5 shrink-0">
            {onDone && (
              <button
                onClick={handleFinish}
                className="px-3.5 py-2 rounded-xl bg-[#2D6A4F] text-white font-bold text-xs flex items-center gap-1 shadow-sm hover:bg-emerald-800 active:scale-95 transition-all cursor-pointer"
                type="button"
              >
                <span>কাৰ্যসূচী শেষ হʼল / Finish</span>
              </button>
            )}
            <button
              onClick={handleReset}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 text-[#2D6A4F] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 active:scale-95 transition-all flex items-center gap-1 text-xs font-bold cursor-pointer"
              type="button"
              title="পুনৰ আৰম্ভ কৰক / Play Again"
            >
              <RotateCcw className="w-4 h-4" />
              <span>পুনৰ</span>
            </button>
          </div>
        )}
      </div>

      {/* Buttons */}
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
            onClick={handleAbandon}
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
