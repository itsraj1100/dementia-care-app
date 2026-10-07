import React, { useState } from 'react';
import { X, Check, Share2, Printer, FileText, AlertCircle, Heart } from 'lucide-react';
import { ObserveMetrics, PlanItem } from '../../types.ts';
import { sound } from '../../utils/audio.ts';

interface WeeklySummaryModalProps {
  isOpen: boolean;
  metrics: ObserveMetrics;
  planItems: PlanItem[];
  onClose: () => void;
}

export const WeeklySummaryModal: React.FC<WeeklySummaryModalProps> = ({
  isOpen,
  metrics,
  planItems,
  onClose,
}) => {
  const [status, setStatus] = useState<'Draft' | 'Edited' | 'Approved'>('Draft');
  const [summaryText, setSummaryText] = useState(
    `CONNECTED CARE LOOP — 7-DAY SUMMARY DIGEST
Patient: Lakshmi Devi (Aita) | Primary Caregiver: Ananya Sharma
Period: Last 7 Days | Plan Version: v7

1. ENGAGEMENT & ROUTINE ADHERENCE
- Daily routine prompts completed: ${metrics.completionRate}%
- Average prompt hints needed: ${metrics.avgHintsPerRound} hints per round
- Reminders requiring deferral ("Later"): ${metrics.remindersLaterCount}

2. COGNITIVE & EMOTIONAL WELL-BEING
- Comfort ratings spread: ${metrics.comfortSplit.good}% Good 😊 | ${metrics.comfortSplit.ok}% OK 😐 | ${metrics.comfortSplit.uncomfortable}% Tired ☹
- Distress / immediate help requests: ${metrics.helpEventsCount} incident (resolved promptly with caregiver accompaniment)

3. FAVORITE ACTIVITIES
- Photo Recall: Joyful recognition of granddaughter Minu on the veranda.
- Familiar Object Match: High affinity for traditional bell-metal ware (Kahi Bati).
- Music Moments: Evening bamboo flute playing brings relaxed breathing.

4. CAREGIVER NOTES & NEXT WEEK PLAN
- Continue morning hydration reminders in warm earthenware cup.
- Maintain Level 1 on Photo Recall and Routine Order for comfort.`
  );

  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleApprove = () => {
    sound.playChime('success');
    setStatus('Approved');
  };

  const handleShare = () => {
    sound.playChime('gentle');
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    sound.playChime('gentle');
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-[#E2DCD5] dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#E2DCD5] dark:border-slate-700 flex items-center justify-between bg-[#FBF9F5] dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900 text-[#00524d] dark:text-[#5eead4] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-[#1E293B] dark:text-slate-100">
                  Weekly Caregiver Summary (C-11)
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    status === 'Approved'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {status}
                </span>
              </div>
              <p className="text-xs text-[#475569] dark:text-slate-400">
                Digest for family review or doctor visit consultation
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

        {/* Mandatory Safety Notice Banner (Section 6.2) */}
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/60 border-b border-amber-200 dark:border-amber-800 flex items-center gap-2 text-amber-900 dark:text-amber-200 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-700" />
          <span className="font-bold">
            Draft — please review before sharing. This is not medical advice.
          </span>
        </div>

        {/* Editable Summary Body */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-3">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Digest Content (Editable)
          </label>
          <textarea
            rows={12}
            value={summaryText}
            onChange={(e) => {
              setSummaryText(e.target.value);
              if (status === 'Approved') setStatus('Edited');
            }}
            className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#00524d]"
          />
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-[#E2DCD5] dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
              type="button"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Copy / Share'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
              type="button"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
              type="button"
            >
              Close
            </button>
            {status !== 'Approved' && (
              <button
                onClick={handleApprove}
                className="px-5 py-2 rounded-xl bg-[#2D6A4F] hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                type="button"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Approve Summary</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
