import React from 'react';
import { Lock, Moon, Sun, Tablet } from 'lucide-react';
import { sound } from '../../utils/audio.ts';

interface PatientTopBarProps {
  isOffline: boolean;
  darkMode: boolean;
  isDevicePaired?: boolean;
  circleName?: string;
  onToggleDarkMode: () => void;
  onOpenModeGate: () => void;
  onOpenPairing?: () => void;
}

export const PatientTopBar: React.FC<PatientTopBarProps> = ({
  isOffline,
  darkMode,
  isDevicePaired,
  circleName,
  onToggleDarkMode,
  onOpenModeGate,
  onOpenPairing,
}) => {
  return (
    <header className="sticky top-0 w-full z-40 bg-[#FBF9F5]/90 dark:bg-[#0f172a]/90 backdrop-blur-xl border-b border-[#E2DCD5]/60 dark:border-slate-800 transition-colors">
      <div className="max-w-4xl mx-auto h-16 sm:h-20 px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Quiet offline dot + Brand + Paired Status */}
        <div className="flex items-center gap-3">
          {/* Quiet offline dot (Section 1 & Section 6.1) */}
          <div
            title={isOffline ? 'Offline (Syncing quietly)' : 'Connected'}
            className="flex items-center gap-1.5"
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isOffline ? 'bg-amber-400' : 'bg-emerald-500'
              }`}
            />
          </div>

          <div className="flex items-center gap-2.5">
            <img
              alt="Connected Care Loop Logo"
              className="h-7 sm:h-8 w-auto object-contain"
              src={`${import.meta.env.BASE_URL}favicon.svg`}
            />
            <span className="font-bold text-base sm:text-lg text-[#00524d] dark:text-[#5eead4] tracking-tight">
              Connected Care Loop
            </span>
          </div>

          {/* Pairing status badge */}
          {onOpenPairing && (
            <button
              onClick={() => {
                sound.playChime('gentle');
                onOpenPairing();
              }}
              type="button"
              title={isDevicePaired ? `Paired with ${circleName || 'Family Circle'}` : 'Pair this tablet with Caregiver code'}
              className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                isDevicePaired
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-teal-50 dark:bg-teal-950/60 text-[#00524d] dark:text-[#5eead4] border-teal-300 dark:border-teal-700 hover:border-[#00524d]'
              }`}
            >
              <Tablet className="w-3 h-3" />
              <span>{isDevicePaired ? 'Paired' : 'Pair Tablet'}</span>
            </button>
          )}
        </div>

        {/* Right: Dark mode + discreet caregiver PIN gate icon */}
        <div className="flex items-center gap-2">
          {/* Mobile pair button */}
          {onOpenPairing && !isDevicePaired && (
            <button
              onClick={() => {
                sound.playChime('gentle');
                onOpenPairing();
              }}
              type="button"
              className="sm:hidden px-2 py-1 rounded-lg text-xs font-bold text-[#00524d] bg-teal-50 border border-teal-200"
            >
              Pair
            </button>
          )}

          <button
            onClick={() => {
              sound.playChime('gentle');
              onToggleDarkMode();
            }}
            aria-label="Toggle dark mode"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 text-[#475569] dark:text-slate-200 border border-[#E2DCD5] dark:border-slate-700 active:scale-95 transition-all shadow-sm cursor-pointer"
            type="button"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#00524d]" />}
          </button>

          {/* Small mode switch icon in top corner as per design spec */}
          <button
            onClick={() => {
              sound.playChime('gentle');
              onOpenModeGate();
            }}
            aria-label="Caregiver Mode PIN Gate"
            title="Caregiver Access"
            className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-[#00524d] dark:hover:text-[#5eead4] border border-[#E2DCD5] dark:border-slate-700 flex items-center justify-center shadow-sm active:scale-95 transition-all cursor-pointer"
            type="button"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
