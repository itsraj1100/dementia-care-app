import React, { useState } from 'react';
import { X, Sliders, Lock, Unlock, Check, RotateCcw, ShieldCheck, ArrowRight } from 'lucide-react';
import { ActivityConfig, AdaptationDecision } from '../../types.ts';
import { sound } from '../../utils/audio.ts';

interface AdaptationSheetProps {
  isOpen: boolean;
  config: ActivityConfig | null;
  onSave: (activityId: string, level: 1 | 2 | 3, isLocked: boolean) => void;
  onDecision?: (decision: AdaptationDecision) => void;
  onClose: () => void;
}

export const AdaptationSheet: React.FC<AdaptationSheetProps> = ({
  isOpen,
  config,
  onSave,
  onDecision,
  onClose,
}) => {
  const [level, setLevel] = useState<1 | 2 | 3>(config?.currentLevel || 1);
  const [isLocked, setIsLocked] = useState<boolean>(config?.isLocked || false);

  if (!isOpen || !config) return null;

  const getActionColor = (action: string) => {
    switch (action) {
      case 'MAINTAIN':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'REDUCE':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
      case 'INCREASE':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
      default:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300';
    }
  };

  const handleKeep = () => {
    sound.playChime('gentle');
    const decision: AdaptationDecision = {
      id: `dec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      activityId: config.id,
      action: 'KEEP',
      previousLevel: config.currentLevel,
      newLevel: config.currentLevel,
      isLocked: isLocked,
      decidedAt: new Date().toISOString(),
      notes: `Caregiver confirmed and kept Level ${config.currentLevel}.`,
    };
    if (onDecision) {
      onDecision(decision);
    } else {
      onSave(config.id, config.currentLevel, isLocked);
    }
    onClose();
  };

  const handleRevert = () => {
    sound.playChime('gentle');
    // Revert to level 1 baseline
    const revertLevel: 1 | 2 | 3 = 1;
    const decision: AdaptationDecision = {
      id: `dec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      activityId: config.id,
      action: 'REVERT',
      previousLevel: config.currentLevel,
      newLevel: revertLevel,
      isLocked: false,
      decidedAt: new Date().toISOString(),
      notes: `Caregiver reverted Level ${config.currentLevel} to baseline Level ${revertLevel}.`,
    };
    if (onDecision) {
      onDecision(decision);
    } else {
      onSave(config.id, revertLevel, false);
    }
    setLevel(revertLevel);
    setIsLocked(false);
    onClose();
  };

  const handleToggleLock = () => {
    const nextLocked = !isLocked;
    setIsLocked(nextLocked);
    sound.playChime('gentle');
    const decision: AdaptationDecision = {
      id: `dec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      activityId: config.id,
      action: nextLocked ? 'LOCK' : 'UNLOCK',
      previousLevel: config.currentLevel,
      newLevel: level,
      isLocked: nextLocked,
      decidedAt: new Date().toISOString(),
      notes: nextLocked ? 'Caregiver locked activity difficulty level.' : 'Caregiver unlocked activity difficulty level.',
    };
    if (onDecision) {
      onDecision(decision);
    } else {
      onSave(config.id, level, nextLocked);
    }
  };

  const handleApplySave = () => {
    sound.playChime('success');
    const decision: AdaptationDecision = {
      id: `dec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      activityId: config.id,
      action: isLocked !== config.isLocked && isLocked ? 'LOCK' : 'SET_LEVEL',
      previousLevel: config.currentLevel,
      newLevel: level,
      isLocked: isLocked,
      decidedAt: new Date().toISOString(),
      notes: `Caregiver set Level to ${level} (locked: ${isLocked}).`,
    };
    if (onDecision) {
      onDecision(decision);
    } else {
      onSave(config.id, level, isLocked);
    }
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#E2DCD5] dark:border-slate-700 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Grab Handle for Mobile */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-3 sm:hidden" />

        {/* Header */}
        <div className="p-5 border-b border-[#E2DCD5] dark:border-slate-700 flex items-center justify-between bg-[#FBF9F5] dark:bg-slate-850">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-[#1E293B] dark:text-slate-100">
                Adaptation Review: {config.nameEn}
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getActionColor(config.suggestedAction)}`}>
                {config.suggestedAction}
              </span>
            </div>
            <p className="text-xs text-[#475569] dark:text-slate-400 mt-0.5">
              {config.nameAs} · C-07 Caregiver Adaptation Calibration
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center cursor-pointer"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex flex-col gap-4">
          {/* Explanation Sentence */}
          <div className="p-4 bg-[#F3EFEA] dark:bg-slate-750 rounded-2xl border border-[#E2DCD5] dark:border-slate-700">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00524d] dark:text-[#5eead4] block mb-1">
              Engine Reasoning
            </span>
            <p className="text-sm font-semibold text-[#1E293B] dark:text-slate-100 leading-relaxed">
              "{config.explanationSentence}"
            </p>
          </div>

          {/* Metrics Used */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center">
              <span className="text-xs text-slate-500 dark:text-slate-400 block">Avg Hints / Round</span>
              <span className="text-xl font-bold text-[#1E293B] dark:text-slate-100 mt-0.5 block">
                {config.avgHintsPerRound}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center">
              <span className="text-xs text-slate-500 dark:text-slate-400 block">Completion Rate</span>
              <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-0.5 block">
                {config.completionRate}%
              </span>
            </div>
          </div>

          {/* Segmented Control for Difficulty Level (1 to 3) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Set Difficulty Level
              </label>
              <span className="text-xs font-bold text-[#00524d] dark:text-[#5eead4]">
                Active: Level {level}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { lvl: 1 as const, label: 'Level 1', desc: '2 choices (Gentle)' },
                { lvl: 2 as const, label: 'Level 2', desc: '3 choices (Standard)' },
                { lvl: 3 as const, label: 'Level 3', desc: '4 choices (Engaged)' },
              ].map((opt) => (
                <button
                  key={opt.lvl}
                  type="button"
                  onClick={() => setLevel(opt.lvl)}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    level === opt.lvl
                      ? 'bg-[#E8F5E9] dark:bg-teal-950/80 border-[#2D6A4F] text-[#2D6A4F] dark:text-[#5eead4] ring-2 ring-emerald-500 shadow-sm'
                      : 'bg-white dark:bg-slate-750 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span className="font-bold text-sm block">{opt.label}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Lock Level Switch */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-750 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {isLocked ? (
                <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              ) : (
                <Unlock className="w-5 h-5 text-slate-400" />
              )}
              <div>
                <span className="font-bold text-sm text-[#1E293B] dark:text-slate-100 block">
                  Lock Level ({isLocked ? 'Locked' : 'Unlocked'})
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Prevents automated adaptation engine from changing level
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleLock}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isLocked
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                  : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
              }`}
            >
              {isLocked ? 'Locked 🔒' : 'Unlocked 🔓'}
            </button>
          </div>

          {/* Review Actions: Keep, Revert, Set Level / Apply & Save */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Keep */}
              <button
                type="button"
                onClick={handleKeep}
                title="Keep current level"
                className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-center"
              >
                Keep Current
              </button>
              {/* Revert */}
              <button
                type="button"
                onClick={handleRevert}
                title="Revert to baseline Level 1"
                className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-xs font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Revert (Lvl 1)</span>
              </button>
            </div>

            {/* Set Level / Apply & Save */}
            <button
              type="button"
              onClick={handleApplySave}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#00524d] hover:bg-[#1e6b65] text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Apply Level {level} {isLocked ? '(Locked)' : ''}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

