import React, { useState } from 'react';
import { Users, Image, CheckSquare, Plus, Phone, Check, ShieldCheck, Heart } from 'lucide-react';
import { MemoryItem, FamilyMember, FamilyTask } from '../../types.ts';
import { MemoryEditorModal } from './MemoryEditorModal.tsx';
import { sound } from '../../utils/audio.ts';

interface FamilyScreenProps {
  memories: MemoryItem[];
  members: FamilyMember[];
  tasks: FamilyTask[];
  onSaveMemory: (memory: MemoryItem) => void;
  onToggleTask: (taskId: string) => void;
}

export const FamilyScreen: React.FC<FamilyScreenProps> = ({
  memories,
  members,
  tasks,
  onSaveMemory,
  onToggleTask,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'memories' | 'members' | 'tasks'>('memories');
  const [isMemoryEditorOpen, setIsMemoryEditorOpen] = useState(false);

  return (
    <div className="w-full flex flex-col pb-28 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1E293B] dark:text-slate-100 tracking-tight">
            Family Circle & Memories
          </h2>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-400 mt-0.5">
            Manage familiar domestic photos, support team, and shared tasks
          </p>
        </div>

        {activeSubTab === 'memories' && (
          <button
            onClick={() => {
              sound.playChime('gentle');
              setIsMemoryEditorOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#00524d] hover:bg-[#1e6b65] text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm cursor-pointer self-start sm:self-auto"
            type="button"
          >
            <Plus className="w-4 h-4" />
            <span>Add Photo</span>
          </button>
        )}
      </div>

      {/* Sub-Tabs: Memories, Members, Tasks */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit mb-6">
        {[
          { id: 'memories' as const, label: 'Memories (ফটো)', icon: Image },
          { id: 'members' as const, label: 'Members (দল)', icon: Users },
          { id: 'tasks' as const, label: 'Care Tasks (কাম)', icon: CheckSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playChime('gentle');
                setActiveSubTab(tab.id);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-slate-700 text-[#00524d] dark:text-[#5eead4] shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              type="button"
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Memories Grid */}
      {activeSubTab === 'memories' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {memories.map((mem) => (
            <div
              key={mem.id}
              className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-[#E2DCD5] dark:border-slate-700/80 shadow-sm flex flex-col group"
            >
              <div className="relative w-full h-48 bg-slate-100 dark:bg-slate-700">
                <img
                  src={mem.photoUrl}
                  alt={mem.captionEn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                {mem.isEligibleForRecall && (
                  <div className="absolute top-2.5 right-2.5 bg-emerald-700/90 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md backdrop-blur-sm flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>Eligible for Recall</span>
                  </div>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-base text-[#1E293B] dark:text-slate-100">
                    {mem.personName}
                  </h4>
                  <p className="text-xs font-semibold text-[#00524d] dark:text-[#5eead4] mt-0.5">
                    {mem.relationshipAs} · {mem.relationshipEn}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    "{mem.captionEn}"
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Family Members List */}
      {activeSubTab === 'members' && (
        <div className="flex flex-col gap-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-3xl border border-[#E2DCD5] dark:border-slate-700/80 shadow-sm flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shrink-0 shadow-sm ${member.avatarColor}`}
                >
                  {member.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base text-[#1E293B] dark:text-slate-100">
                      {member.name}
                    </h4>
                    {member.isPrimary && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#2D6A4F] dark:bg-teal-950 dark:text-[#5eead4]">
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {member.role}
                  </p>
                </div>
              </div>

              <a
                href={`tel:${member.phone}`}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#00524d]" />
                <span className="hidden sm:inline">{member.phone}</span>
                <span className="sm:hidden">Call</span>
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Care Tasks List */}
      {activeSubTab === 'tasks' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-[#E2DCD5] dark:border-slate-700/80 shadow-sm flex flex-col divide-y divide-slate-100 dark:divide-slate-700/60">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => {
                sound.playChime('gentle');
                onToggleTask(task.id);
              }}
              className="py-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/60 dark:hover:bg-slate-750 px-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => {}} // handled by row click
                  className="w-5 h-5 accent-[#00524d] rounded cursor-pointer"
                />
                <div>
                  <p
                    className={`text-sm font-semibold text-[#1E293B] dark:text-slate-100 ${
                      task.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                    }`}
                  >
                    {task.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Assigned to: <strong>{task.assignedTo}</strong> · Due: {task.dueDate}
                  </p>
                </div>
              </div>

              {task.completed && (
                <span className="text-xs text-emerald-600 font-bold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 rounded">
                  Completed
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Memory Editor Modal */}
      {isMemoryEditorOpen && (
        <MemoryEditorModal
          isOpen={isMemoryEditorOpen}
          onSave={onSaveMemory}
          onClose={() => setIsMemoryEditorOpen(false)}
        />
      )}
    </div>
  );
};
