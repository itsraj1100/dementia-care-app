import React from 'react';
import { Heart } from 'lucide-react';

interface ToastProps {
  visible: boolean;
  titleAs: string;
  subtitleEn: string;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  titleAs,
  subtitleEn,
  onDismiss,
}) => {
  if (!visible) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-white dark:bg-slate-800 text-[#0d1c2f] dark:text-slate-100 p-4 rounded-2xl shadow-xl border-2 border-[#E2DCD5] dark:border-slate-700 flex items-center gap-3.5 transition-all transform animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="w-12 h-12 rounded-full bg-[#E8F5E9] dark:bg-emerald-950/80 text-[#2D6A4F] dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
        <Heart className="w-6 h-6 fill-current" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-base text-[#1E293B] dark:text-slate-100 leading-snug">
          {titleAs}
        </p>
        <p className="text-sm text-[#475569] dark:text-slate-400 mt-0.5">
          {subtitleEn}
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="text-xs font-semibold px-2.5 py-1.5 rounded-lg text-[#00524d] dark:text-[#5eead4] hover:bg-[#F3EFEA] dark:hover:bg-slate-700 transition-colors"
      >
        ঠিক আছে
      </button>
    </div>
  );
};
