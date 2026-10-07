import React, { useState } from 'react';
import { X, Droplet, Coffee, Pill, Calendar, Activity, AlertCircle, Trash2, Check } from 'lucide-react';
import { PlanItem, PlanItemType, MemoryItem } from '../../types.ts';
import { sound } from '../../utils/audio.ts';

interface PlanItemEditorModalProps {
  isOpen: boolean;
  initialItem?: PlanItem | null;
  memories: MemoryItem[];
  onSave: (item: PlanItem) => void;
  onDelete?: (itemId: string) => void;
  onClose: () => void;
}

export const PlanItemEditorModal: React.FC<PlanItemEditorModalProps> = ({
  isOpen,
  initialItem,
  memories,
  onSave,
  onDelete,
  onClose,
}) => {
  const [type, setType] = useState<PlanItemType>(initialItem?.type || 'hydration');
  const [time, setTime] = useState(initialItem?.time || '09:00');
  const [titleAs, setTitleAs] = useState(initialItem?.titleAs || '');
  const [titleEn, setTitleEn] = useState(initialItem?.titleEn || '');
  const [instructionAs, setInstructionAs] = useState(initialItem?.instructionAs || '');
  const [instructionEn, setInstructionEn] = useState(initialItem?.instructionEn || '');
  const [photoUrl, setPhotoUrl] = useState(initialItem?.photoUrl || '');
  const [repeatDays, setRepeatDays] = useState<string[]>(
    initialItem?.repeatDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  );
  const [active, setActive] = useState(initialItem ? initialItem.active : true);
  const [dosageWarning, setDosageWarning] = useState<string | null>(null);

  if (!isOpen) return null;

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handleTitleChange = (val: string) => {
    setTitleEn(val);
    // Medication dosage guard as per Section 5
    if (type === 'medication' && /\b(\d+\s*(mg|ml|tablets?|pills?|doses?))\b/i.test(val)) {
      setDosageWarning('Notice: Please keep medication labels simple (e.g. "Morning prescription"). Do not write medical dosages.');
    } else {
      setDosageWarning(null);
    }
  };

  const toggleDay = (day: string) => {
    if (repeatDays.includes(day)) {
      setRepeatDays(repeatDays.filter((d) => d !== day));
    } else {
      setRepeatDays([...repeatDays, day]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn && !titleAs) return;

    sound.playChime('success');

    const hour = parseInt(time.split(':')[0] || '12', 10);
    const timePeriod: 'morning' | 'afternoon' | 'evening' =
      hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

    const newItem: PlanItem = {
      id: initialItem?.id || 'item-' + Date.now(),
      type,
      time,
      timePeriod,
      titleAs: titleAs || titleEn,
      titleEn: titleEn || titleAs,
      instructionAs: instructionAs || 'শান্তিৰে কৰক',
      instructionEn: instructionEn || 'Follow peacefully with family',
      photoUrl: photoUrl || undefined,
      repeatDays,
      status: initialItem?.status || 'upcoming',
      active,
      isDraft: true,
    };

    onSave(newItem);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-[#E2DCD5] dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#E2DCD5] dark:border-slate-700 flex items-center justify-between bg-[#FBF9F5] dark:bg-slate-850">
          <div>
            <h3 className="font-bold text-lg text-[#1E293B] dark:text-slate-100">
              {initialItem ? 'Edit Routine Item (C-05)' : 'Add New Routine Item (C-05)'}
            </h3>
            <p className="text-xs text-[#475569] dark:text-slate-400">
              Saves as Draft · Changes will only apply to Aita's tablet when published
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

        {/* Scrollable Form */}
        <form onSubmit={handleSave} className="p-5 overflow-y-auto flex flex-col gap-4">
          {/* Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Routine Type
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { id: 'hydration' as PlanItemType, label: 'Water', icon: Droplet },
                { id: 'meal' as PlanItemType, label: 'Meal/Tea', icon: Coffee },
                { id: 'medication' as PlanItemType, label: 'Medicine', icon: Pill },
                { id: 'activity' as PlanItemType, label: 'Activity', icon: Activity },
                { id: 'appointment' as PlanItemType, label: 'Visit', icon: Calendar },
              ].map((t) => {
                const Icon = t.icon;
                const isSelected = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    className={`py-2 px-1 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#E8F5E9] dark:bg-teal-950/80 border-[#2D6A4F] text-[#2D6A4F] dark:text-[#5eead4] font-bold shadow-sm'
                        : 'bg-white dark:bg-slate-750 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px] truncate">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Medicine helper warning (Section 5) */}
          {type === 'medication' && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/60 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Medication Safety Rule:</span> Add a simple label only (e.g., "Morning tablets"). Ask the doctor or pharmacist about specific dosages.
              </div>
            </div>
          )}

          {/* Time Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Scheduled Time
            </label>
            <input
              type="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-750 text-slate-900 dark:text-slate-100 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#00524d]"
            />
          </div>

          {/* Bilingual Titles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Title (English)
              </label>
              <input
                type="text"
                required
                maxLength={60}
                placeholder="e.g. Afternoon tea & biscuit"
                value={titleEn}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-750 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#00524d]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Title (অসমীয়া Assamese)
              </label>
              <input
                type="text"
                placeholder="e.g. আবেলিৰ চাহ আৰু বিস্কুট"
                value={titleAs}
                onChange={(e) => setTitleAs(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#00524d]"
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Instruction (English)
              </label>
              <textarea
                rows={2}
                maxLength={240}
                placeholder="Short gentle guidance for Aita..."
                value={instructionEn}
                onChange={(e) => setInstructionEn(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-750 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-[#00524d]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Instruction (অসমীয়া)
              </label>
              <textarea
                rows={2}
                placeholder="আইতাৰ বাবে সহজ নিৰ্দেশনা..."
                value={instructionAs}
                onChange={(e) => setInstructionAs(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-750 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-[#00524d]"
              />
            </div>
          </div>

          {/* Repeat Days Chips */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Repeat Days
            </label>
            <div className="flex flex-wrap gap-1.5">
              {daysOfWeek.map((day) => {
                const isSelected = repeatDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#00524d] text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Photo Cue Picker from Memories */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Visual Photo Cue (Optional)
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPhotoUrl('')}
                className={`h-16 rounded-xl border flex items-center justify-center text-xs font-semibold cursor-pointer ${
                  !photoUrl
                    ? 'border-[#00524d] bg-teal-50 dark:bg-teal-950/40 text-[#00524d]'
                    : 'border-slate-200 dark:border-slate-700 text-slate-400'
                }`}
              >
                No Photo
              </button>
              {memories.slice(0, 3).map((mem) => (
                <button
                  key={mem.id}
                  type="button"
                  onClick={() => setPhotoUrl(mem.photoUrl)}
                  className={`h-16 rounded-xl overflow-hidden border relative cursor-pointer ${
                    photoUrl === mem.photoUrl
                      ? 'border-[#00524d] ring-2 ring-[#00524d]'
                      : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={mem.photoUrl}
                    alt={mem.captionEn}
                    className="w-full h-full object-cover"
                  />
                  {photoUrl === mem.photoUrl && (
                    <div className="absolute inset-0 bg-[#00524d]/30 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Active switch */}
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-750 rounded-xl">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Active Support Schedule
            </span>
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-5 h-5 accent-[#00524d] rounded cursor-pointer"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-700">
            {initialItem && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  sound.playChime('gentle');
                  onDelete(initialItem.id);
                  onClose();
                }}
                className="px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#00524d] hover:bg-[#1e6b65] text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                Save as Draft
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
