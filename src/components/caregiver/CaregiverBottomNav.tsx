import React from 'react';
import { Home, Calendar, LineChart, Compass, Users } from 'lucide-react';
import { CaregiverTab } from '../../types.ts';
import { sound } from '../../utils/audio.ts';

interface CaregiverBottomNavProps {
  activeTab: CaregiverTab;
  onSelectTab: (tab: CaregiverTab) => void;
}

export const CaregiverBottomNav: React.FC<CaregiverBottomNavProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const tabs = [
    { id: 'home' as CaregiverTab, label: 'Home', icon: Home },
    { id: 'plan' as CaregiverTab, label: 'Plan', icon: Calendar },
    { id: 'observe' as CaregiverTab, label: 'Observe', icon: LineChart },
    { id: 'guide' as CaregiverTab, label: 'Guide', icon: Compass },
    { id: 'family' as CaregiverTab, label: 'Family', icon: Users },
  ];

  return (
    <nav
      aria-label="Caregiver main navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-[#E2DCD5] dark:border-slate-800 shadow-lg"
    >
      <div className="max-w-4xl mx-auto grid grid-cols-5 items-center h-16 sm:h-18 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playChime('gentle');
                onSelectTab(tab.id);
              }}
              className={`min-h-[48px] py-1 flex flex-col items-center justify-center transition-all cursor-pointer ${
                isActive
                  ? 'text-[#00524d] dark:text-[#5eead4]'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              type="button"
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-[#E8F5E9] dark:bg-teal-950/80 scale-105' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              </div>
              <span className={`text-[11px] font-semibold mt-0.5 tracking-tight ${isActive ? 'font-bold' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
