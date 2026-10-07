import React, { useState, useRef } from 'react';
import { Volume2, Lightbulb, Home, LifeBuoy, Check, HelpCircle, Heart, Eye, CheckCircle2, ArrowRight, Award } from 'lucide-react';
import { OBJECT_MATCH_QUESTIONS } from '../data/activities.ts';
import { MatchOption, ActivitySession } from '../types.ts';
import { sound } from '../utils/audio.ts';
import { CognitivePrepOverlay } from './patient/CognitivePrepOverlay.tsx';

interface ObjectMatchScreenProps {
  level?: 1 | 2 | 3;
  onBackToHome: () => void;
  onNotifyCaregiver: () => void;
  onDone?: (sessionData?: Partial<ActivitySession>) => void;
}

export const ObjectMatchScreen: React.FC<ObjectMatchScreenProps> = ({
  level = 2,
  onBackToHome,
  onNotifyCaregiver,
  onDone,
}) => {
  const currentLevel = (Math.min(3, Math.max(1, level))) as 1 | 2 | 3;
  // Level 1 -> 2 options, Level 2 -> 3 options, Level 3 -> 4 options
  const optionCount = currentLevel === 1 ? 2 : currentLevel === 2 ? 3 : 4;

  const [isPreparing, setIsPreparing] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isCorrectMatch, setIsCorrectMatch] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Session recording refs
  const startedAtRef = useRef<string>(new Date().toISOString());
  const hintsUsedRef = useRef<number>(0);
  const wrongTapsRef = useRef<number>(0);
  const roundsCompletedRef = useRef<number>(0);

  const question = OBJECT_MATCH_QUESTIONS[currentQuestionIndex];
  const correctOpt = question.options.find((o) => o.isCorrect) || question.options[0];
  const distractorOpts = question.options.filter((o) => o.id !== correctOpt.id);
  const chosenIds = new Set([correctOpt.id, ...distractorOpts.slice(0, optionCount - 1).map((o) => o.id)]);
  const candidateOptions = question.options.filter((o) => chosenIds.has(o.id));

  const handleSelectOption = (optionId: string, isCorrect: boolean) => {
    setSelectedOptionId(optionId);
    setHasInteracted(true);
    setIsCorrectMatch(isCorrect);

    if (isCorrect) {
      sound.playChime('success');
      sound.speak(question.successMessageAs + ' ' + question.successMessageEn);
    } else {
      wrongTapsRef.current++;
      sound.playChime('gentle');
      sound.speak(question.gentleGuidanceAs + ' ' + question.gentleGuidanceEn);
    }
  };

  const handlePlayVoice = () => {
    sound.playChime('chime');
    setIsPlayingAudio(true);
    const speechText = `${question.titleAs}. ${question.titleEn}. ${question.instructionAs}.`;

    sound.speak(speechText, {
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
    });
  };

  const handleTriggerHint = () => {
    hintsUsedRef.current++;
    setShowHint(true);
    sound.playChime('hint');
    sound.speak(question.hintAs + ' ' + question.hintEn);
  };

  const handleAbandon = () => {
    sound.stopSpeaking();
    const duration = Math.max(5, Math.round((Date.now() - new Date(startedAtRef.current).getTime()) / 1000));
    if (onDone) {
      onDone({
        activityId: 'object-match',
        activityType: 'object-match',
        level: currentLevel,
        roundsTotal: OBJECT_MATCH_QUESTIONS.length,
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

  const handleNextQuestion = () => {
    sound.playChime('gentle');
    if (isCorrectMatch) {
      roundsCompletedRef.current++;
    }

    if (currentQuestionIndex < OBJECT_MATCH_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setHasInteracted(false);
      setIsCorrectMatch(null);
      setShowHint(false);
    } else {
      // Completed all steps peacefully
      const duration = Math.max(10, Math.round((Date.now() - new Date(startedAtRef.current).getTime()) / 1000));
      if (onDone) {
        onDone({
          activityId: 'object-match',
          activityType: 'object-match',
          level: currentLevel,
          roundsTotal: OBJECT_MATCH_QUESTIONS.length,
          roundsCompleted: OBJECT_MATCH_QUESTIONS.length,
          hintsUsed: hintsUsedRef.current,
          wrongTaps: wrongTapsRef.current,
          abandoned: false,
          completedSuccessfully: true,
          durationSeconds: duration,
          startedAt: startedAtRef.current,
          completedAt: new Date().toISOString(),
        });
      } else {
        setCurrentQuestionIndex(0);
        setSelectedOptionId(null);
        setHasInteracted(false);
        setIsCorrectMatch(null);
        setShowHint(false);
      }
    }
  };

  return (
    <div className="w-full flex flex-col pb-12 animate-in fade-in duration-300">
      {isPreparing && (
        <CognitivePrepOverlay
          activityId="object-match"
          activityNameAs="বস্তুৰ মিল"
          activityNameEn="Familiar Object Match"
          icon={<Award className="w-10 h-10" />}
          onComplete={() => {
            setIsPreparing(false);
            setTimeout(() => {
              handlePlayVoice();
            }, 400);
          }}
        />
      )}

      {/* Subtle Context Header / Calming Progress Indicator */}
      <div className="w-full flex items-center justify-between py-2 mb-3">
        <div className="flex items-center gap-2">
          {/* Progress dots */}
          <div aria-label={`Progress: Step ${question.stepNumber} of ${question.totalSteps}`} className="flex items-center gap-1.5">
            {OBJECT_MATCH_QUESTIONS.map((q, idx) => (
              <span
                key={q.id}
                className={`w-3 h-3 rounded-full transition-colors ${
                  idx <= currentQuestionIndex
                    ? 'bg-[#00524d] dark:bg-[#5eead4]'
                    : 'bg-[#E7E2DA] dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-[#475569] dark:text-slate-400 ml-1">
            বস্তু মিলোৱা · Match the object (Level {currentLevel}: {optionCount} choices)
          </span>
        </div>

        {/* Audio Prompt Trigger */}
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

      {/* Primary Prompt Headline */}
      <div className="w-full mb-4 text-left">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1E293B] dark:text-slate-100 tracking-tight leading-snug">
          {question.titleAs}
        </h2>
        <p className="text-base sm:text-lg text-[#475569] dark:text-slate-400 mt-0.5">
          {question.titleEn}
        </p>
      </div>

      {/* Responsive layout: In tablet/laptop, split Target card on left and options on right */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 mb-4 items-start">
        {/* Target Showcase Card */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-[#E2DCD5] dark:border-slate-700 p-4 sm:p-5 flex flex-col items-center">
          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#F3EFEA] dark:bg-slate-700 flex items-center justify-center">
            <img
              src={question.targetImageSrc}
              alt={question.targetImageAlt}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute bottom-3 left-3 bg-[#1E293B]/80 dark:bg-black/70 backdrop-blur-md rounded-full px-3.5 py-1 flex items-center gap-1.5 text-white shadow-sm">
              <Eye className="w-4 h-4" />
              <span className="text-xs font-semibold">নিৰ্দেশক বস্তু / Target</span>
            </div>
          </div>

          <div className="w-full mt-3.5 flex flex-col text-center">
            <span className="text-xl sm:text-2xl font-bold text-[#1E293B] dark:text-slate-100">
              {question.targetTitleAs}
            </span>
            <span className="text-sm sm:text-base text-[#475569] dark:text-slate-400">
              {question.targetTitleEn}
            </span>
            <p className="text-xs sm:text-sm font-medium text-[#00524d] dark:text-[#5eead4] mt-2 bg-[#F3EFEA] dark:bg-slate-700/60 py-2 px-3 rounded-xl border border-[#E2DCD5]/60 dark:border-slate-600">
              {question.instructionAs} · {question.instructionEn}
            </p>
          </div>
        </div>

        {/* Candidate Selection Grid (Dynamic optionCount) */}
        <div
          role="radiogroup"
          aria-label="বিকল্প বাছক / Select matching option"
          className={`lg:col-span-7 grid ${optionCount === 2 ? 'grid-cols-2' : optionCount === 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2'} gap-3.5 sm:gap-4`}
        >
          {candidateOptions.map((option: MatchOption) => {
            const isSelected = selectedOptionId === option.id;
            const isHighlightedHint = showHint && option.isCorrect;

            let cardBg = 'bg-white dark:bg-slate-800 border-[#E2DCD5] dark:border-slate-700';
            if (isSelected) {
              if (option.isCorrect) {
                cardBg = 'bg-[#E8F5E9] dark:bg-emerald-950/80 border-[#2D6A4F] dark:border-emerald-500 ring-2 ring-[#2D6A4F]/20';
              } else {
                cardBg = 'bg-[#F3EFEA] dark:bg-amber-950/40 border-[#D97706] dark:border-amber-600';
              }
            } else if (isHighlightedHint) {
              cardBg = 'bg-[#E8F5E9]/80 dark:bg-emerald-950/60 border-[#2D6A4F] dark:border-emerald-500 ring-2 ring-emerald-400 animate-pulse';
            }

            return (
              <button
                key={option.id}
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleSelectOption(option.id, option.isCorrect)}
                type="button"
                className={`min-h-[160px] p-3 rounded-2xl shadow-sm active:scale-[0.98] transition-all flex flex-col items-center text-left relative cursor-pointer border ${cardBg}`}
              >
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#F3EFEA] dark:bg-slate-700 mb-2.5 relative">
                  <img
                    src={option.imageSrc}
                    alt={option.imageAlt}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  {/* Status Indicator Icon */}
                  <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 dark:bg-slate-900/90 shadow-md flex items-center justify-center backdrop-blur-sm">
                    {isSelected && option.isCorrect ? (
                      <Check className="w-4 h-4 text-[#2D6A4F] dark:text-emerald-400 stroke-[3]" />
                    ) : isSelected && !option.isCorrect ? (
                      <HelpCircle className="w-4 h-4 text-[#D97706] dark:text-amber-400 stroke-[2.5]" />
                    ) : isHighlightedHint ? (
                      <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] dark:text-emerald-400 stroke-[2.5]" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 dark:border-slate-500" />
                    )}
                  </div>
                </div>

                <div className="w-full px-1">
                  <div className="font-bold text-base sm:text-lg text-[#1E293B] dark:text-slate-100 truncate">
                    {option.titleAs}
                  </div>
                  <div className="text-xs sm:text-sm text-[#475569] dark:text-slate-400 truncate">
                    {option.titleEn}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reassuring Feedback Area */}
      <div
        className={`w-full rounded-2xl p-4 sm:p-4.5 mb-4 flex items-center gap-3.5 transition-colors border ${
          hasInteracted && isCorrectMatch
            ? 'bg-[#E8F5E9] dark:bg-emerald-950/80 border-[#2D6A4F]/40 text-[#2D6A4F] dark:text-emerald-300'
            : hasInteracted && isCorrectMatch === false
            ? 'bg-[#FEF3C7] dark:bg-amber-950/80 border-[#D97706]/40 text-[#92400e] dark:text-amber-300'
            : 'bg-[#F3EFEA] dark:bg-slate-800/80 border-[#E2DCD5] dark:border-slate-700 text-[#1E293B] dark:text-slate-200'
        }`}
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
            hasInteracted && isCorrectMatch
              ? 'bg-[#2D6A4F] text-white'
              : hasInteracted && isCorrectMatch === false
              ? 'bg-[#D97706] text-white'
              : 'bg-white dark:bg-slate-700 text-[#00524d] dark:text-[#5eead4]'
          }`}
        >
          {hasInteracted && isCorrectMatch ? (
            <Check className="w-6 h-6 stroke-[3]" />
          ) : hasInteracted && isCorrectMatch === false ? (
            <HelpCircle className="w-6 h-6" />
          ) : (
            <Heart className="w-6 h-6 fill-current" />
          )}
        </div>

        <div className="flex-1">
          <p className="font-bold text-base sm:text-lg leading-snug">
            {hasInteracted && isCorrectMatch
              ? question.successMessageAs
              : hasInteracted && isCorrectMatch === false
              ? question.gentleGuidanceAs
              : 'উত্তৰ ভুল হʼলেও চিন্তা নাই, আমি একেলগে চাম।'}
          </p>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-400 mt-0.5">
            {hasInteracted && isCorrectMatch
              ? question.successMessageEn
              : hasInteracted && isCorrectMatch === false
              ? question.gentleGuidanceEn
              : 'Take your time, there is no rush.'}
          </p>
        </div>

        {/* If correct, offer peaceful Next button right inside the banner */}
        {hasInteracted && isCorrectMatch && (
          <button
            onClick={handleNextQuestion}
            className="px-4 py-2.5 rounded-xl bg-[#2D6A4F] text-white font-bold text-sm sm:text-base flex items-center gap-1.5 shadow-sm hover:bg-emerald-800 active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
            type="button"
          >
            <span>পৰৱৰ্তী / Next</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Action Helpers and Caregiver Trigger */}
      <div className="w-full flex flex-col gap-3">
        {/* Gentle Hint Button */}
        <button
          onClick={handleTriggerHint}
          className="w-full min-h-[58px] rounded-2xl bg-white dark:bg-slate-800 shadow-sm hover:bg-[#F3EFEA] dark:hover:bg-slate-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 text-[#00524d] dark:text-[#5eead4] border border-[#E2DCD5] dark:border-slate-700 cursor-pointer"
          type="button"
        >
          <Lightbulb className="w-6 h-6 text-amber-500" />
          <span className="font-bold text-lg sm:text-xl">
            মোক দেখুৱাওক / Show me (Hint)
          </span>
        </button>

        {/* Navigation & Calm Human Help Trigger */}
        <div className="w-full grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => {
              sound.playChime('gentle');
              handleAbandon();
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
            className="min-h-[58px] rounded-2xl bg-[#00524d] hover:bg-[#1e6b65] dark:bg-[#1e6b65] dark:hover:bg-[#288f87] text-white shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
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
