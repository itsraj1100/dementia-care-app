import React from 'react';
import { X, Heart, Phone, ShieldCheck, User } from 'lucide-react';
import { sound } from '../utils/audio.ts';

interface CaregiverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotifyCaregiver: () => void;
}

export const CaregiverModal: React.FC<CaregiverModalProps> = ({
  isOpen,
  onClose,
  onNotifyCaregiver,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-[#E2DCD5] dark:border-slate-700 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#E2DCD5] dark:border-slate-700 flex items-center justify-between bg-[#FBF9F5] dark:bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#00524d] text-white flex items-center justify-center shadow-md">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg sm:text-xl text-[#1E293B] dark:text-slate-100">
                অনামিকা শৰ্মা (Caregiver Ananya)
              </h3>
              <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-400">
                পৰিয়ালৰ যত্নকৰ্তা · Accompanying Caregiver
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playChime('gentle');
              onClose();
            }}
            aria-label="বন্ধ কৰক / Close"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-slate-700 text-[#475569] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors border border-slate-200 dark:border-slate-600 cursor-pointer"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-4">
          <div className="p-3.5 bg-[#E8F5E9] dark:bg-emerald-950/60 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-[#2D6A4F] dark:text-emerald-300">
            <ShieldCheck className="w-6 h-6 shrink-0" />
            <div className="text-xs sm:text-sm">
              <span className="font-bold">সক্ৰিয় যত্ন সংলগ্ন · Connected Loop Active</span>
              <p className="text-xs text-slate-600 dark:text-emerald-400 mt-0.5">
                অনামিকা ওচৰতে উপস্থিত আছে। কোনো ভয় বা চিন্তা নকৰিব।
              </p>
            </div>
          </div>

          <div className="bg-[#F3EFEA] dark:bg-slate-700/60 p-4 rounded-2xl border border-[#E2DCD5]/60 dark:border-slate-600">
            <h4 className="font-bold text-sm text-[#1E293B] dark:text-slate-200 mb-1">
              আইতাৰ বাবে শান্ত পৰামৰ্শ (Gentle Note):
            </h4>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-300 leading-relaxed">
              যিকোনো মুহূৰ্তত পানী খাব পাৰে বা অলপ জিৰাব পাৰে। সকলো কাৰ্যসূচী কেৱল আনন্দ আৰু পুৰণি স্মৃতি মনত পেলাবলৈ সজোৱা হৈছে।
            </p>
          </div>

          {/* Trigger Alert Button */}
          <button
            onClick={() => {
              sound.playChime('alert');
              onNotifyCaregiver();
              onClose();
            }}
            className="w-full min-h-[58px] rounded-2xl bg-[#ffdbd1] hover:bg-[#ffb59f] dark:bg-[#7d2c13] dark:hover:bg-[#9c4328] text-[#3a0a00] dark:text-[#ffdbd1] font-bold text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-sm active:scale-95 transition-all cursor-pointer border border-[#ffb59f] dark:border-amber-900"
            type="button"
          >
            <Phone className="w-5 h-5 text-[#9c4328] dark:text-[#ffdbd1]" />
            <span>অনামিকাক মাতি দিয়ক / Call Ananya to sit together</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-[#E2DCD5] dark:border-slate-700 flex justify-center">
          <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 fill-current text-rose-400" />
            Connected Care Loop · Gentle Dementia Support
          </p>
        </div>
      </div>
    </div>
  );
};
