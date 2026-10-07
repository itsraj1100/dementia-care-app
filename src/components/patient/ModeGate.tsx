import React, { useState } from 'react';
import { Lock, Delete, X, KeyRound, ShieldAlert } from 'lucide-react';
import { sound } from '../../utils/audio.ts';

interface ModeGateProps {
  correctPin: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ModeGate: React.FC<ModeGateProps> = ({
  correctPin,
  onSuccess,
  onCancel,
}) => {
  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    sound.playChime('gentle');
    const newPin = pin + digit;
    setPin(newPin);
    setErrorMessage(null);

    if (newPin.length === 4) {
      if (newPin === correctPin) {
        sound.playChime('success');
        onSuccess();
      } else {
        sound.playChime('alert');
        setErrorMessage('ভুল পিন, পুনৰ চেষ্টা কৰক / Incorrect PIN, please try again');
        setTimeout(() => {
          setPin('');
        }, 500);
      }
    }
  };

  const handleDelete = () => {
    sound.playChime('gentle');
    setPin((prev) => prev.slice(0, -1));
    setErrorMessage(null);
  };

  const handleDemoUnlock = () => {
    sound.playChime('success');
    onSuccess();
  };

  return (
    <div className="w-full min-h-[75vh] flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-[360px] bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-[#E2DCD5] dark:border-slate-700 p-6 flex flex-col items-center text-center">
        {/* Top Cancel button */}
        <div className="w-full flex justify-end mb-2">
          <button
            onClick={() => {
              sound.playChime('gentle');
              onCancel();
            }}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center cursor-pointer"
            type="button"
            aria-label="Cancel and return to patient view"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lock Icon */}
        <div className="w-16 h-16 rounded-full bg-[#F3EFEA] dark:bg-slate-700 text-[#00524d] dark:text-[#5eead4] flex items-center justify-center mb-3 shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-bold text-[#1E293B] dark:text-slate-100">
          যত্নকৰ্তাৰ প্ৰৱেশদ্বাৰ
        </h2>
        <p className="text-sm font-semibold text-[#00524d] dark:text-[#5eead4]">
          Caregiver Mode PIN Gate
        </p>
        <p className="text-xs text-[#475569] dark:text-slate-400 mt-1">
          অনুগ্ৰহ কৰি ৪-অংকৰ পিন দিয়ক (Default: 1234)
        </p>

        {/* 4-dot indicator */}
        <div className="flex items-center gap-4 my-6">
          {[0, 1, 2, 3].map((idx) => (
            <span
              key={idx}
              className={`w-4 h-4 rounded-full transition-all duration-150 ${
                idx < pin.length
                  ? 'bg-[#00524d] dark:bg-[#5eead4] scale-110'
                  : 'border-2 border-slate-300 dark:border-slate-600 bg-transparent'
              }`}
            />
          ))}
        </div>

        {errorMessage && (
          <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 mb-4 animate-in fade-in">
            {errorMessage}
          </p>
        )}

        {/* Numeric Keypad: 1 to 9, Cancel, 0, Backspace */}
        <div className="grid grid-cols-3 gap-3 w-full mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              className="h-14 rounded-2xl bg-[#FBF9F5] dark:bg-slate-750 hover:bg-[#F3EFEA] dark:hover:bg-slate-700 border border-[#E2DCD5] dark:border-slate-700 font-bold text-2xl text-[#1E293B] dark:text-slate-100 active:scale-95 transition-all shadow-sm flex items-center justify-center cursor-pointer"
              type="button"
            >
              {digit}
            </button>
          ))}

          {/* Cancel */}
          <button
            onClick={() => {
              sound.playChime('gentle');
              onCancel();
            }}
            className="h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold text-sm active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            type="button"
          >
            বাতিল
          </button>

          {/* 0 */}
          <button
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-[#FBF9F5] dark:bg-slate-750 hover:bg-[#F3EFEA] dark:hover:bg-slate-700 border border-[#E2DCD5] dark:border-slate-700 font-bold text-2xl text-[#1E293B] dark:text-slate-100 active:scale-95 transition-all shadow-sm flex items-center justify-center cursor-pointer"
            type="button"
          >
            0
          </button>

          {/* Backspace */}
          <button
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            type="button"
            aria-label="Delete last digit"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        {/* Demo instant bypass shortcut */}
        <button
          onClick={handleDemoUnlock}
          className="mt-2 text-xs font-semibold text-[#00524d] dark:text-[#5eead4] hover:underline flex items-center gap-1.5 py-2 cursor-pointer"
          type="button"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Demo Unlock (Bypass PIN)</span>
        </button>
      </div>
    </div>
  );
};
