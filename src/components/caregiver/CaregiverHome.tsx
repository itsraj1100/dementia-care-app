import React from 'react';
import { ShieldAlert, CheckCircle, Clock, XCircle, AlertTriangle, ArrowRight, Eye, Play, Sparkles, User, Coffee, Droplet, Pill, Calendar } from 'lucide-react';
import { PlanItem, AlertItem, AppSettings } from '../../types.ts';
import { sound } from '../../utils/audio.ts';

interface CaregiverHomeProps {
  planItems: PlanItem[];
  alerts: AlertItem[];
  settings: AppSettings;
  onAcknowledgeAlert: (id: string) => void;
  onPreviewAita: () => void;
  onFireReminder: (item: PlanItem) => void;
  onFireNextReminder?: () => void;
  onGoToPlan: () => void;
}

export const CaregiverHome: React.FC<CaregiverHomeProps> = ({
  planItems,
  alerts,
  settings,
  onAcknowledgeAlert,
  onPreviewAita,
  onFireReminder,
  onFireNextReminder,
  onGoToPlan,
}) => {
  const openAlerts = alerts.filter((a) => !a.acknowledged);
  const hasDrafts = planItems.some((p) => p.isDraft);

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'hydration':
        return <Droplet className="w-4 h-4 text-blue-500" />;
      case 'meal':
        return <Coffee className="w-4 h-4 text-amber-600" />;
      case 'medication':
        return <Pill className="w-4 h-4 text-emerald-600" />;
      default:
        return <Calendar className="w-4 h-4 text-[#00524d] dark:text-[#5eead4]" />;
    }
  };

  return (
    <div className="w-full flex flex-col pb-24 animate-in fade-in duration-300">
      {/* Greeting */}
      <div className="mb-5 text-left">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1E293B] dark:text-slate-100 tracking-tight">
          Good afternoon, Ananya
        </h2>
        <p className="text-sm text-[#475569] dark:text-slate-400 mt-0.5">
          Here is what is happening with Aita today.
        </p>
      </div>

      {/* PersonStatusCard (Section 6.1) */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm border border-[#E2DCD5] dark:border-slate-700/80 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-[#E8F5E9] dark:bg-emerald-950/80 text-[#2D6A4F] dark:text-emerald-400 flex items-center justify-center font-bold text-xl shadow-inner shrink-0">
            আইতা
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-lg sm:text-xl text-[#1E293B] dark:text-slate-100">
                Lakshmi Devi (Aita)
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
                Plan v{settings.planVersion} Applied
              </span>
              {hasDrafts && (
                <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-semibold border border-amber-200 dark:border-amber-800">
                  Draft v{settings.planVersion + 1} Pending
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-400 mt-0.5">
              Assamese · High contrast ready · Tablet online (last synced {settings.lastSyncedTimestamp})
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playChime('gentle');
            onPreviewAita();
          }}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#00524d] hover:bg-[#1e6b65] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shrink-0"
          type="button"
        >
          <Eye className="w-4 h-4" />
          <span>Switch to Patient Mode (Aita)</span>
        </button>
      </div>

      {/* AlertBanner List (Open alerts: HIGH red-tinted, ack button) */}
      {openAlerts.length > 0 && (
        <div className="flex flex-col gap-3 mb-5">
          {openAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-sm ${
                alert.severity === 'high'
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-950 dark:text-rose-200'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-950 dark:text-amber-200'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    alert.severity === 'high'
                      ? 'bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200'
                      : 'bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/60 dark:bg-black/40">
                      {alert.severity}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {alert.timeAgo}
                    </span>
                  </div>
                  <p className="font-bold text-sm sm:text-base truncate mt-0.5">
                    {alert.titleEn}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                    {alert.titleAs}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playChime('gentle');
                  onAcknowledgeAlert(alert.id);
                }}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all shrink-0 cursor-pointer shadow-sm"
                type="button"
              >
                Acknowledge
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Two Column Layout: Today's Support on Left, Quick Insights on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Today's Support Timeline */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm border border-[#E2DCD5] dark:border-slate-700/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-bold text-lg text-[#1E293B] dark:text-slate-100">
                Today's Support
              </h3>
              <p className="text-xs text-[#475569] dark:text-slate-400">
                Real-time tracking of Aita's planned daily rhythm
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sound.playChime('chime');
                  if (onFireNextReminder) {
                    onFireNextReminder();
                  } else {
                    const next = planItems.find((p) => p.active && p.status === 'upcoming') || planItems[0];
                    if (next) onFireReminder(next);
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/80 dark:hover:bg-teal-900 text-[#00524d] dark:text-[#5eead4] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                type="button"
                title="Fire the next upcoming reminder on Aita's screen"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Fire Next Reminder</span>
              </button>
              <button
                onClick={() => {
                  sound.playChime('gentle');
                  onGoToPlan();
                }}
                className="text-xs font-bold text-[#00524d] dark:text-[#5eead4] hover:underline flex items-center gap-1 cursor-pointer"
                type="button"
              >
                <span>Manage Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-700/60">
            {planItems.map((item) => (
              <div key={item.id} className="py-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                    {getItemIcon(item.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                        {item.time}
                      </span>
                      <span className="font-bold text-sm text-[#1E293B] dark:text-slate-100 truncate">
                        {item.titleEn}
                      </span>
                      {item.isDraft ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          Draft
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          Applied
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {item.titleAs} · {item.instructionEn}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Status Indicator */}
                  {item.status === 'done' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Done</span>
                    </span>
                  ) : item.status === 'missed' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-xs font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Later</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium">
                      <span>Upcoming</span>
                    </span>
                  )}

                  {/* Test Reminder Trigger button */}
                  <button
                    onClick={() => {
                      sound.playChime('chime');
                      onFireReminder(item);
                    }}
                    title="Simulate firing this reminder on Aita's screen"
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-[#E8F5E9] dark:hover:bg-teal-950 text-slate-600 hover:text-[#00524d] dark:text-slate-300 dark:hover:text-[#5eead4] transition-colors cursor-pointer"
                    type="button"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Insights & Safety Note */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-[#F3EFEA] dark:bg-slate-800/80 rounded-3xl p-5 border border-[#E2DCD5] dark:border-slate-700/80">
            <div className="flex items-center gap-2 mb-2 text-[#00524d] dark:text-[#5eead4]">
              <Sparkles className="w-5 h-5" />
              <h4 className="font-bold text-sm">Quiet Offline Honesty</h4>
            </div>
            <p className="text-xs text-[#475569] dark:text-slate-300 leading-relaxed">
              Caregivers see detailed sync state and outbox counts, while Aita sees only a calm, peaceful dot so she never feels technical distress.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-[#E2DCD5] dark:border-slate-700/80 shadow-sm">
            <h4 className="font-bold text-sm text-[#1E293B] dark:text-slate-100 mb-1">
              Safety Boundaries (Clinical Rule)
            </h4>
            <p className="text-xs text-[#475569] dark:text-slate-400 leading-relaxed">
              Every suggestion is labeled "Suggestion" and is overridable. The system never produces diagnostic or clinical certainty language.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
