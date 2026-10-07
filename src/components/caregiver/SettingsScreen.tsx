import React, { useState } from 'react';
import { Settings, Volume2, Type, Lock, Smartphone, RefreshCw, Play, RotateCcw, ShieldCheck, Eye, Sparkles } from 'lucide-react';
import { AppSettings, PlanItem } from '../../types.ts';
import { sound } from '../../utils/audio.ts';

interface SettingsScreenProps {
  settings: AppSettings;
  planItems: PlanItem[];
  onUpdateSettings: (partial: Partial<AppSettings>) => void;
  onFireReminder: (item: PlanItem) => void;
  onResetDemoData: () => void;
  onSwitchToPatientMode: () => void;
  onOpenSetupWizard: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  planItems,
  onUpdateSettings,
  onFireReminder,
  onResetDemoData,
  onSwitchToPatientMode,
  onOpenSetupWizard,
}) => {
  const [pinInput, setPinInput] = useState(settings.caregiverPin);
  const [pinSaved, setPinSaved] = useState(false);

  const handleSavePin = () => {
    if (pinInput.length === 4) {
      sound.playChime('success');
      onUpdateSettings({ caregiverPin: pinInput });
      setPinSaved(true);
      setTimeout(() => setPinSaved(false), 2000);
    }
  };

  const nextUpcomingItem = planItems.find((p) => p.status === 'upcoming') || planItems[0];

  return (
    <div className="w-full flex flex-col pb-28 animate-in fade-in duration-300">
      {/* Header */}
      <div className="mb-5 text-left">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1E293B] dark:text-slate-100 tracking-tight">
          Settings & Accessibility
        </h2>
        <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-400 mt-0.5">
          Caregiver parameters, elder ergonomics, and demonstration controls
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Section 1: Accessibility & Elderly Ergonomics */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border border-[#E2DCD5] dark:border-slate-700/80 shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Elderly Accessibility
          </h3>

          {/* Font Scale */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Font Scale (Dementia Floor & Legibility)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[0.9, 1.0, 1.2, 1.4].map((scale) => (
                <button
                  key={scale}
                  type="button"
                  onClick={() => {
                    sound.playChime('gentle');
                    onUpdateSettings({ fontScale: scale as 0.9 | 1.0 | 1.2 | 1.4 });
                  }}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    settings.fontScale === scale
                      ? 'bg-[#00524d] text-white border-[#00524d] shadow-sm'
                      : 'bg-white dark:bg-slate-750 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {scale}×
                </button>
              ))}
            </div>
          </div>

          {/* Audio Speed */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Spoken Audio Pace
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { val: 0.8 as const, label: '0.8× (Gentle & Deliberate for Elders)' },
                { val: 1.0 as const, label: '1.0× (Standard Pace)' },
              ].map((s) => (
                <button
                  key={s.val}
                  type="button"
                  onClick={() => {
                    sound.playChime('gentle');
                    onUpdateSettings({ audioSpeed: s.val });
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    settings.audioSpeed === s.val
                      ? 'bg-[#00524d] text-white border-[#00524d] shadow-sm'
                      : 'bg-white dark:bg-slate-750 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: Caregiver Security (PIN) */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border border-[#E2DCD5] dark:border-slate-700/80 shadow-sm flex flex-col gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Caregiver Access Security
          </h3>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                4-Digit Caregiver Mode PIN
              </label>
              <input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full max-w-[200px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-750 font-mono text-lg tracking-widest text-center"
              />
            </div>

            <button
              onClick={handleSavePin}
              className="px-4 py-2.5 rounded-xl bg-[#00524d] hover:bg-[#1e6b65] text-white text-xs font-bold shadow-sm mt-5 cursor-pointer"
              type="button"
            >
              {pinSaved ? 'Saved!' : 'Update PIN'}
            </button>
          </div>
        </div>

        {/* Section 3: Interactive Demo Panel (Mandatory per Section 6.1) */}
        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-slate-800 dark:to-teal-950/40 rounded-3xl p-5 sm:p-6 border border-teal-200 dark:border-teal-800/60 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 text-[#00524d] dark:text-[#5eead4]">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-bold text-base">
              Interactive Demo & Simulation Panel
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Easily trigger any design state or test flow live:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Action 1: Switch to Patient Mode */}
            <button
              onClick={() => {
                sound.playChime('gentle');
                onSwitchToPatientMode();
              }}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-teal-300 dark:border-teal-700 hover:border-[#00524d] text-left flex items-center justify-between gap-2 shadow-sm cursor-pointer"
              type="button"
            >
              <div>
                <span className="font-bold text-xs sm:text-sm text-[#1E293B] dark:text-slate-100 block">
                  Switch to Patient Mode
                </span>
                <span className="text-[11px] text-slate-500">
                  Open Aita's peaceful home screen (P-01)
                </span>
              </div>
              <Eye className="w-4 h-4 text-[#00524d] dark:text-[#5eead4] shrink-0" />
            </button>

            {/* Action 2: Fire Next Scheduled Reminder */}
            <button
              onClick={() => {
                if (nextUpcomingItem) {
                  sound.playChime('chime');
                  onFireReminder(nextUpcomingItem);
                }
              }}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-teal-300 dark:border-teal-700 hover:border-[#00524d] text-left flex items-center justify-between gap-2 shadow-sm cursor-pointer"
              type="button"
            >
              <div>
                <span className="font-bold text-xs sm:text-sm text-[#1E293B] dark:text-slate-100 block">
                  Fire Next Reminder Prompt
                </span>
                <span className="text-[11px] text-slate-500">
                  Launches P-02 prompt with Done/Later
                </span>
              </div>
              <Play className="w-4 h-4 text-[#00524d] dark:text-[#5eead4] shrink-0" />
            </button>

            {/* Action 3: Launch Setup Wizard */}
            <button
              onClick={() => {
                sound.playChime('gentle');
                onOpenSetupWizard();
              }}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-teal-300 dark:border-teal-700 hover:border-[#00524d] text-left flex items-center justify-between gap-2 shadow-sm cursor-pointer"
              type="button"
            >
              <div>
                <span className="font-bold text-xs sm:text-sm text-[#1E293B] dark:text-slate-100 block">
                  Run Setup Wizard (C-02)
                </span>
                <span className="text-[11px] text-slate-500">
                  5-step onboarding, consent & pairing code
                </span>
              </div>
              <Settings className="w-4 h-4 text-[#00524d] dark:text-[#5eead4] shrink-0" />
            </button>

            {/* Action 4: Reset Demo Data */}
            <button
              onClick={() => {
                sound.playChime('alert');
                onResetDemoData();
              }}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/60 hover:border-rose-400 text-left flex items-center justify-between gap-2 shadow-sm cursor-pointer"
              type="button"
            >
              <div>
                <span className="font-bold text-xs sm:text-sm text-rose-700 dark:text-rose-400 block">
                  Reset 7-Day Demo Data
                </span>
                <span className="text-[11px] text-slate-500">
                  Re-seeds routines, metrics & memories
                </span>
              </div>
              <RotateCcw className="w-4 h-4 text-rose-600 shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
