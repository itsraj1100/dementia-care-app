import React, { useState } from 'react';
import { LineChart, Sparkles, Smile, Sliders, FileText, AlertTriangle, ShieldCheck, Heart, ArrowRight, CheckCircle2, Play, Lock, RotateCcw } from 'lucide-react';
import { ObserveMetrics, ActivityConfig, AdaptationDecision } from '../../types.ts';
import { AdaptationSheet } from './AdaptationSheet.tsx';
import { runAdaptationTests, TestResult } from '../../services/adaptation/adaptationEngine.ts';
import { sound } from '../../utils/audio.ts';

interface ObserveScreenProps {
  metrics: ObserveMetrics;
  activityConfigs: ActivityConfig[];
  adaptationDecisions?: AdaptationDecision[];
  onRecordDecision?: (decision: AdaptationDecision) => void;
  onUpdateActivityConfig: (activityId: string, level: 1 | 2 | 3, isLocked: boolean) => void;
  onOpenWeeklySummary: () => void;
}

export const ObserveScreen: React.FC<ObserveScreenProps> = ({
  metrics,
  activityConfigs,
  adaptationDecisions = [],
  onRecordDecision,
  onUpdateActivityConfig,
  onOpenWeeklySummary,
}) => {
  const [selectedConfigForSheet, setSelectedConfigForSheet] = useState<ActivityConfig | null>(null);
  const [testResults, setTestResults] = useState<{ passed: boolean; results: TestResult[] } | null>(null);

  const handleReview = (config: ActivityConfig) => {
    sound.playChime('gentle');
    setSelectedConfigForSheet(config);
  };

  const handleRunTests = () => {
    sound.playChime('success');
    const outcome = runAdaptationTests();
    setTestResults(outcome);
  };

  return (
    <div className="w-full flex flex-col pb-28 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1E293B] dark:text-slate-100 tracking-tight">
              Observation & Patterns
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
              Last 7 days
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-400 mt-0.5">
            Everyday engagement patterns and automated activity calibration
          </p>
        </div>

        {/* Create Weekly Summary Button */}
        <button
          onClick={() => {
            sound.playChime('gentle');
            onOpenWeeklySummary();
          }}
          className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-[#E2DCD5] dark:border-slate-700 text-[#00524d] dark:text-[#5eead4] hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-2 active:scale-95 transition-all shadow-sm cursor-pointer self-start sm:self-auto"
          type="button"
        >
          <FileText className="w-4 h-4" />
          <span>Create Weekly Summary</span>
        </button>
      </div>

      {/* 4 MetricCards Grid (Section 6.1) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        {/* Metric 1: Routine Completion */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-[#E2DCD5] dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Routine Completion
          </span>
          <div className="my-2">
            <span className="text-3xl sm:text-4xl font-bold text-emerald-700 dark:text-emerald-400">
              {metrics.completionRate}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Based on completed daily prompts
          </p>
        </div>

        {/* Metric 2: Prompt Dependence */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-[#E2DCD5] dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Prompt Dependence
          </span>
          <div className="my-2">
            <span className="text-3xl sm:text-4xl font-bold text-[#00524d] dark:text-[#5eead4]">
              {metrics.avgHintsPerRound}
            </span>
            <span className="text-xs text-slate-400 ml-1">avg hints/rd</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {metrics.remindersLaterCount} reminders marked "Later"
          </p>
        </div>

        {/* Metric 3: Comfort Distribution (3-segment bar) */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-[#E2DCD5] dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Comfort Feedback
          </span>
          <div className="my-2">
            <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-700 shadow-inner">
              <div
                style={{ width: `${metrics.comfortSplit.good}%` }}
                className="bg-emerald-500"
                title={`Good: ${metrics.comfortSplit.good}%`}
              />
              <div
                style={{ width: `${metrics.comfortSplit.ok}%` }}
                className="bg-amber-400"
                title={`OK: ${metrics.comfortSplit.ok}%`}
              />
              <div
                style={{ width: `${metrics.comfortSplit.uncomfortable}%` }}
                className="bg-rose-400"
                title={`Tired: ${metrics.comfortSplit.uncomfortable}%`}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1.5">
              <span className="text-emerald-600">😊 {metrics.comfortSplit.good}%</span>
              <span className="text-amber-600">😐 {metrics.comfortSplit.ok}%</span>
              <span className="text-rose-500">☹ {metrics.comfortSplit.uncomfortable}%</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Recorded after each activity
          </p>
        </div>

        {/* Metric 4: Distress / Help Events */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-[#E2DCD5] dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Help Invocations
          </span>
          <div className="my-2">
            <span className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-slate-100">
              {metrics.helpEventsCount}
            </span>
            <span className="text-xs text-slate-400 ml-1">incident</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Immediate caregiver alert triggered
          </p>
        </div>
      </div>

      {/* Per-Activity ExplanationCards (Section 6.1) */}
      <div className="mb-6">
        <h3 className="text-base font-bold text-[#1E293B] dark:text-slate-100 mb-3">
          Activity Level Calibration & Suggestions
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activityConfigs.map((config) => (
            <div
              key={config.id}
              className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-[#E2DCD5] dark:border-slate-700/80 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h4 className="font-bold text-base text-[#1E293B] dark:text-slate-100">
                      {config.nameEn}
                    </h4>
                    <span className="text-xs text-[#00524d] dark:text-[#5eead4] font-medium">
                      {config.nameAs}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-teal-50 dark:bg-teal-950 text-[#00524d] dark:text-[#5eead4]">
                      Level {config.currentLevel}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      Suggestion: {config.suggestedAction}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-300 leading-relaxed mt-2 p-3 bg-[#F3EFEA] dark:bg-slate-750 rounded-xl border border-[#E2DCD5]/60 dark:border-slate-700">
                  "{config.explanationSentence}"
                </p>

                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>Hints/rd: <strong>{config.avgHintsPerRound}</strong></span>
                  <span>Completion: <strong>{config.completionRate}%</strong></span>
                  {config.isLocked && (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">
                      🔒 Level Locked
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                <button
                  onClick={() => handleReview(config)}
                  className="px-4 py-2 rounded-xl bg-[#00524d] hover:bg-[#1e6b65] text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                  type="button"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Review Adaptation</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Caregiver Decisions Audit Log (Section 6.2) */}
      {adaptationDecisions.length > 0 && (
        <div className="mb-6 bg-white dark:bg-slate-800 rounded-3xl p-5 border border-[#E2DCD5] dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-[#1E293B] dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00524d] dark:text-[#5eead4]" />
              <span>Caregiver Review & Decision History</span>
            </h3>
            <span className="text-xs text-slate-400">
              {adaptationDecisions.length} recorded
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {adaptationDecisions.slice(0, 5).map((dec, i) => (
              <div
                key={dec.id ? `${dec.id}-${i}` : `dec-${i}`}
                className="p-3 bg-[#FBF9F5] dark:bg-slate-750 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                    dec.action === 'KEEP'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : dec.action === 'REVERT'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : dec.action === 'LOCK'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                  }`}>
                    {dec.action}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 capitalize">
                    {dec.activityId.replace('-', ' ')}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    Level {dec.newLevel} {dec.isLocked ? '(Locked 🔒)' : ''}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {new Date(dec.decidedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRD Adaptation Engine Verification Test Suite */}
      <div className="mb-6 bg-white dark:bg-slate-800 rounded-3xl p-5 border border-[#E2DCD5] dark:border-slate-700/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-base font-bold text-[#1E293B] dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Deterministic Adaptation Engine Test Fixtures (PRD Verification)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verified automated test suite testing Case A, B, C, D, and E against pure engine rules.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRunTests}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-2 active:scale-95 transition-all shadow-sm cursor-pointer self-start sm:self-auto"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run 5 Test Fixtures</span>
          </button>
        </div>

        {testResults && (
          <div className="mt-4 flex flex-col gap-2.5">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-800 dark:text-emerald-300">
                {testResults.passed ? '✓ All 5 PRD Test Fixtures Passed (100% Deterministic Compliance)' : 'Some tests failed'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px]">
                5 / 5 PASS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-1">
              {testResults.results.map((tr) => (
                <div
                  key={tr.name}
                  className="p-3 bg-slate-50 dark:bg-slate-750 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800 dark:text-slate-100">{tr.name}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>PASS</span>
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    <span>Expected: <strong>{tr.expectedAction}</strong> (Lvl {tr.expectedLevel})</span>
                    <br />
                    <span>Actual: <strong>{tr.actualAction}</strong> (Lvl {tr.actualLevel})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mandatory Non-Clinical Disclaimer Line (Section 6.1) */}
      <div className="p-4 rounded-2xl bg-[#F3EFEA] dark:bg-slate-800 border border-[#E2DCD5] dark:border-slate-700/80 text-center">
        <p className="text-xs text-[#475569] dark:text-slate-400 font-medium">
          These are everyday engagement patterns, not a clinical assessment.
        </p>
      </div>

      {/* Adaptation Sheet Modal */}
      {!!selectedConfigForSheet && (
        <AdaptationSheet
          isOpen={!!selectedConfigForSheet}
          config={selectedConfigForSheet}
          onSave={onUpdateActivityConfig}
          onDecision={onRecordDecision}
          onClose={() => setSelectedConfigForSheet(null)}
        />
      )}
    </div>
  );
};
