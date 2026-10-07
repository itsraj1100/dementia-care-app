import React, { useState } from 'react';
import { X, Wifi, WifiOff, RefreshCw, Smartphone, Tablet, CheckCircle, Clock } from 'lucide-react';
import { AppSettings, OutboxItem } from '../../types.ts';
import { sound } from '../../utils/audio.ts';

interface SyncModalProps {
  isOpen: boolean;
  settings: AppSettings;
  outbox: OutboxItem[];
  onTriggerSync: () => void;
  onToggleSimulatedOffline: (offline: boolean) => void;
  onClose: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  settings,
  outbox,
  onTriggerSync,
  onToggleSimulatedOffline,
  onClose,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isOpen) return null;

  const handleSyncNow = () => {
    sound.playChime('chime');
    setIsSyncing(true);
    setTimeout(() => {
      onTriggerSync();
      setIsSyncing(false);
      sound.playChime('success');
    }, 1200);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-[#E2DCD5] dark:border-slate-700 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#E2DCD5] dark:border-slate-700 flex items-center justify-between bg-[#FBF9F5] dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900 text-[#00524d] dark:text-[#5eead4] flex items-center justify-center">
              {settings.isSimulatedOffline ? <WifiOff className="w-5 h-5 text-amber-600" /> : <Wifi className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#1E293B] dark:text-slate-100">
                Sync & Device State (C-12)
              </h3>
              <p className="text-xs text-[#475569] dark:text-slate-400">
                Offline-honest background synchronization
              </p>
            </div>
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
        <div className="p-5 flex flex-col gap-4">
          {/* Status summary */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Cloud Connection Status
              </span>
              <span className="text-base font-bold text-[#1E293B] dark:text-slate-100 mt-0.5 block">
                {settings.isSimulatedOffline ? 'Simulated Offline' : 'Live & Synchronized'}
              </span>
              <span className="text-xs text-slate-500">
                Last checked: {settings.lastSyncedTimestamp}
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Pending Outbox
              </span>
              <span className="text-lg font-bold text-[#00524d] dark:text-[#5eead4]">
                {outbox.length} {outbox.length === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>

          {/* Connected Circle Devices */}
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Circle Devices
            </span>

            <div className="flex flex-col gap-2.5">
              {/* Device 1: Tablet */}
              <div className="p-3 bg-white dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Tablet className="w-5 h-5 text-[#00524d] dark:text-[#5eead4]" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                      Aita's Bedside Tablet
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Applied Plan: v{settings.planVersion} · Offline dot active
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Online
                </span>
              </div>

              {/* Device 2: Caregiver Phone */}
              <div className="p-3 bg-white dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-5 h-5 text-blue-500" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                      Ananya's Phone (This Device)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Primary Editor · Mode Gate PIN active
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  This Device
                </span>
              </div>
            </div>
          </div>

          {/* Simulated Offline Toggle */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-750 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Simulate Offline Mode
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Tests quiet offline dot on Aita's home screen
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.isSimulatedOffline}
              onChange={(e) => onToggleSimulatedOffline(e.target.checked)}
              className="w-5 h-5 accent-[#00524d] rounded cursor-pointer"
            />
          </div>

          {/* Sync Button */}
          <button
            onClick={handleSyncNow}
            disabled={isSyncing || settings.isSimulatedOffline}
            className={`w-full min-h-[52px] rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              settings.isSimulatedOffline
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-[#00524d] hover:bg-[#1e6b65] text-white shadow-sm active:scale-95'
            }`}
            type="button"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronizing...' : 'Sync Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
