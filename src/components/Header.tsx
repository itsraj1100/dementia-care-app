import React from 'react';
import { ArrowLeft, Moon, Sun, User } from 'lucide-react';
import { sound } from '../utils/audio.ts';

interface HeaderProps {
  onBack: () => void;
  showBack?: boolean;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenCaregiverModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onBack,
  showBack = true,
  darkMode,
  onToggleDarkMode,
  onOpenCaregiverModal,
}) => {
  return (
    <header className="sticky top-0 w-full z-40 bg-[#FBF9F5]/90 dark:bg-[#0f172a]/90 backdrop-blur-xl border-b border-[#E2DCD5]/60 dark:border-slate-800 transition-colors">
      <div className="max-w-4xl mx-auto h-20 px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Back button + Connected Care Loop Logo + App Title */}
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => {
                sound.playChime('gentle');
                onBack();
              }}
              aria-label="উভতি যাওঁক / Go Back"
              className="w-13 h-13 min-w-[52px] min-h-[52px] rounded-xl flex items-center justify-center bg-white dark:bg-slate-800 text-[#0d1c2f] dark:text-slate-100 hover:bg-[#F3EFEA] dark:hover:bg-slate-700 active:scale-95 transition-all shadow-sm border border-[#E2DCD5] dark:border-slate-700 cursor-pointer"
              type="button"
            >
              <ArrowLeft className="w-6 h-6 text-[#00524d] dark:text-[#5eead4]" />
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <img
              alt="Connected Care Loop Logo"
              className="h-8 w-auto object-contain"
              src={`${import.meta.env.BASE_URL}favicon.svg`}
            />
            <h1 className="font-bold text-lg sm:text-xl text-[#00524d] dark:text-[#5eead4] tracking-tight">
              Patient Activity Prompt
            </h1>
          </div>
        </div>

        {/* Right: Dark Mode Toggle + Caregiver Profile */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              sound.playChime('gentle');
              onToggleDarkMode();
            }}
            aria-label={darkMode ? 'বগা মোডলৈ সলনি কৰক / Switch to Light Mode' : 'আঁউসী মোডলৈ সলনি কৰক / Switch to Dark Mode'}
            className="w-11 h-11 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 text-[#475569] dark:text-slate-200 hover:bg-[#F3EFEA] dark:hover:bg-slate-700 border border-[#E2DCD5] dark:border-slate-700 active:scale-95 transition-all shadow-sm cursor-pointer"
            type="button"
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-[#00524d]" />
            )}
          </button>

          <button
            onClick={() => {
              sound.playChime('gentle');
              onOpenCaregiverModal?.();
            }}
            aria-label="পৰিয়ালৰ সদস্য / Caregiver Profile"
            className="w-10 h-10 rounded-full bg-[#00524d] dark:bg-[#1e6b65] text-white flex items-center justify-center shadow-sm hover:ring-2 hover:ring-[#00524d]/30 active:scale-95 transition-all cursor-pointer"
            type="button"
            title="Caregiver Profile (Ananya)"
          >
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
