import React from 'react';
import { Eye, Moon, Sun, Settings, RefreshCw, Wifi, WifiOff, User } from 'lucide-react';
import { sound } from '../../utils/audio.ts';

interface CaregiverTopBarProps {
  title: string;
  isOffline: boolean;
  outboxCount: number;
  lastSynced: string;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onPreviewAita: () => void;
  onOpenSyncModal: () => void;
  onOpenSettings: () => void;
  onOpenLogin: () => void;
}

export const CaregiverTopBar: React.FC<CaregiverTopBarProps> = ({
  title,
  isOffline,
  outboxCount,
  lastSynced,
  darkMode,
  onToggleDarkMode,
  onPreviewAita,
  onOpenSyncModal,
  onOpenSettings,
  onOpenLogin,
}) => {
  return (
    <header className="sticky top-0 w-full z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-[#E2DCD5] dark:border-slate-800 transition-colors">
      <div className="max-w-4xl mx-auto h-16 sm:h-20 px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Caregiver Mode Title + Sync Status Chip */}
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-[#1E293B] dark:text-slate-100 tracking-tight">
              {title}
            </h1>
            <p className="text-xs text-[#00524d] dark:text-[#5eead4] font-medium hidden sm:block">
              Connected Care Loop · Caregiver Ananya
            </p>
          </div>

          {/* SyncStatusChip (Section 4 & Section 6.1) */}
          <button
            onClick={() => {
              sound.playChime('gentle');
              onOpenSyncModal();
            }}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              isOffline
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            }`}
            type="button"
            title="Click to view sync & outbox status"
          >
            {isOffline ? (
              <WifiOff className="w-3.5 h-3.5" />
            ) : (
              <Wifi className="w-3.5 h-3.5" />
            )}
            <span>{isOffline ? 'Offline' : `Synced ${lastSynced}`}</span>
            {outboxCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                {outboxCount}
              </span>
            )}
          </button>
        </div>

        {/* Right: Preview Aita's View + Dark Mode + Settings Gear */}
        <div className="flex items-center gap-2">
          {/* Shortcut: Switch to Patient Mode */}
          <button
            onClick={() => {
              sound.playChime('gentle');
              onPreviewAita();
            }}
            className="h-9 px-3.5 rounded-full bg-[#00524d] hover:bg-[#1e6b65] text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-sm"
            type="button"
            title="Switch back to Patient Mode (Aita's View)"
            aria-label="Switch back to Patient Mode (Aita's View)"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Patient Mode (Aita)</span>
          </button>

          {/* Dark mode switch */}
          <button
            onClick={() => {
              sound.playChime('gentle');
              onToggleDarkMode();
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
            type="button"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#00524d]" />}
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              sound.playChime('gentle');
              onOpenSettings();
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
            type="button"
            aria-label="Caregiver settings and demo panel"
            title="Settings & Demo Panel"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Caregiver Account / Login (C-01) */}
          <button
            onClick={() => {
              sound.playChime('gentle');
              onOpenLogin();
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-[#E8F5E9] dark:bg-emerald-950/80 text-[#2D6A4F] dark:text-emerald-400 hover:bg-[#d4edd8] active:scale-95 transition-all cursor-pointer"
            type="button"
            aria-label="Caregiver Account & Cloud Sync (C-01)"
            title="Caregiver Account & Cloud Sync"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
