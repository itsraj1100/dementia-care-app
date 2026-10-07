import React, { useState } from 'react';
import { Plus, Check, Clock, Droplet, Coffee, Pill, Calendar, Activity, Edit3, Sparkles } from 'lucide-react';
import { PlanItem, MemoryItem, AppSettings } from '../../types.ts';
import { PlanItemEditorModal } from './PlanItemEditorModal.tsx';
import { sound } from '../../utils/audio.ts';

interface PlanScreenProps {
  planItems: PlanItem[];
  memories: MemoryItem[];
  settings: AppSettings;
  onSaveItem: (item: PlanItem) => void;
  onDeleteItem: (itemId: string) => void;
  onPublishPlan: () => void;
}

export const PlanScreen: React.FC<PlanScreenProps> = ({
  planItems,
  memories,
  settings,
  onSaveItem,
  onDeleteItem,
  onPublishPlan,
}) => {
  const [selectedDayView, setSelectedDayView] = useState<'today' | 'week'>('today');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PlanItem | null>(null);

  const hasDrafts = planItems.some((p) => p.isDraft);

  const morningItems = planItems.filter((p) => p.timePeriod === 'morning');
  const afternoonItems = planItems.filter((p) => p.timePeriod === 'afternoon');
  const eveningItems = planItems.filter((p) => p.timePeriod === 'evening');

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

  const handleEdit = (item: PlanItem) => {
    sound.playChime('gentle');
    setEditingItem(item);
    setIsEditorOpen(true);
  };

  const handleAddNew = () => {
    sound.playChime('gentle');
    setEditingItem(null);
    setIsEditorOpen(true);
  };

  return (
    <div className="w-full flex flex-col pb-28 animate-in fade-in duration-300">
      {/* Top Header & Day Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1E293B] dark:text-slate-100 tracking-tight">
              Daily Support Plan
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Applied v{settings.planVersion}
            </span>
            {hasDrafts ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                Draft v{settings.planVersion + 1} Pending
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                Published & Applied
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-400 mt-1">
            {hasDrafts
              ? `Unpublished draft edits saved locally. Version ${settings.planVersion} remains applied on Aita's tablet until published.`
              : `Version ${settings.planVersion} published snapshot is currently applied on Aita's tablet.`}
          </p>
        </div>

        {/* Today vs Week View tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
          <button
            onClick={() => setSelectedDayView('today')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedDayView === 'today'
                ? 'bg-white dark:bg-slate-700 text-[#00524d] dark:text-[#5eead4] shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            type="button"
          >
            Today's Schedule
          </button>
          <button
            onClick={() => setSelectedDayView('week')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedDayView === 'week'
                ? 'bg-white dark:bg-slate-700 text-[#00524d] dark:text-[#5eead4] shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            type="button"
          >
            Week Recurrence
          </button>
        </div>
      </div>

      {/* Draft Changes Banner (Section 6.1) */}
      {hasDrafts && (
        <div className="mb-5 p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-between gap-3 shadow-sm">
          <div>
            <h4 className="font-bold text-sm text-[#00524d] dark:text-[#5eead4]">
              Draft changes ready to publish
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Publishing will update Aita's tablet to Version {settings.planVersion + 1}
            </p>
          </div>

          <button
            onClick={() => {
              sound.playChime('success');
              onPublishPlan();
            }}
            className="px-4 py-2 rounded-xl bg-[#00524d] hover:bg-[#1e6b65] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer shrink-0"
            type="button"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Publish Plan v{settings.planVersion + 1}</span>
          </button>
        </div>
      )}

      {/* Plan Timeline Sections */}
      <div className="flex flex-col gap-6">
        {[
          { title: 'Morning (পুৱা)', items: morningItems },
          { title: 'Afternoon (দুপৰীয়া)', items: afternoonItems },
          { title: 'Evening (সন্ধিয়া)', items: eveningItems },
        ].map((section) => (
          <div key={section.title} className="flex flex-col gap-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pl-1">
              {section.title}
            </h3>

            <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm border border-[#E2DCD5] dark:border-slate-700/80 flex flex-col divide-y divide-slate-100 dark:divide-slate-700/60">
              {section.items.length === 0 ? (
                <p className="py-4 text-center text-xs text-slate-400 italic">
                  No routine items in this time window
                </p>
              ) : (
                section.items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleEdit(item)}
                    className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-750/80 px-2 rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                        {getItemIcon(item.type)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#00524d] dark:text-[#5eead4]">
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
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {item.titleAs} · {item.instructionEn}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="hidden sm:flex gap-1">
                        {item.repeatDays.slice(0, 3).map((d) => (
                          <span key={d} className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-500">
                            {d}
                          </span>
                        ))}
                      </div>
                      <Edit3 className="w-4 h-4 text-slate-400 group-hover:text-[#00524d] transition-colors" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Add Item FAB */}
      <div className="fixed bottom-20 right-6 sm:bottom-24 sm:right-8 z-30">
        <button
          onClick={handleAddNew}
          className="h-14 px-5 rounded-full bg-[#00524d] hover:bg-[#1e6b65] text-white font-bold text-sm flex items-center gap-2 shadow-xl active:scale-95 transition-all cursor-pointer"
          type="button"
          aria-label="Add routine item"
        >
          <Plus className="w-5 h-5" />
          <span>Add Routine Item</span>
        </button>
      </div>

      {/* Modal Editor */}
      {isEditorOpen && (
        <PlanItemEditorModal
          isOpen={isEditorOpen}
          initialItem={editingItem}
          memories={memories}
          onSave={onSaveItem}
          onDelete={onDeleteItem}
          onClose={() => setIsEditorOpen(false)}
        />
      )}
    </div>
  );
};
