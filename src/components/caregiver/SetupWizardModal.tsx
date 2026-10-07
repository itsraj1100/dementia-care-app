import React, { useState, useEffect } from 'react';
import { X, Check, ShieldCheck, Heart, ArrowRight, ArrowLeft, KeyRound, QrCode, Tablet, Sparkles, CheckCircle2 } from 'lucide-react';
import { sound } from '../../utils/audio.ts';
import { careRepository } from '../../services/repository/careRepository.ts';
import { authService } from '../../services/firebase/authService.ts';
import { firebaseEnabled } from '../../services/firebase/firebaseClient.ts';
import { CareCircleConsent, CareCirclePerson, ActivePairingCode } from '../../types.ts';

interface SetupWizardModalProps {
  isOpen: boolean;
  circleId: string;
  initialPin?: string;
  onComplete: (setupData: {
    circleName: string;
    personName: string;
    pin: string;
    pairingCode: string;
  }) => void;
  onPairPatientAndLaunch?: (
    code: string,
    setupData: {
      circleName: string;
      personName: string;
      pin: string;
    }
  ) => void;
  onClose: () => void;
}

export const SetupWizardModal: React.FC<SetupWizardModalProps> = ({
  isOpen,
  circleId,
  initialPin = '1234',
  onComplete,
  onPairPatientAndLaunch,
  onClose,
}) => {
  const [step, setStep] = useState(1);
  const [circleName, setCircleName] = useState('Devi Family Care Circle');
  const [personName, setPersonName] = useState('Lakshmi Devi (Aita)');
  const [likesTags, setLikesTags] = useState('ৰঙা চাহ (Red tea), বৰগীত (Borgeet), ফুলনি (Garden)');
  const [hasConsent, setHasConsent] = useState(true);
  const [pin, setPin] = useState(initialPin);
  const [pairingCode, setPairingCode] = useState('492817');
  const [isSaving, setIsSaving] = useState(false);
  const [isSavedToFirestore, setIsSavedToFirestore] = useState(false);

  // Generate deterministic 6-digit code on mount if needed
  useEffect(() => {
    if (!pairingCode) {
      const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
      setPairingCode(randomCode);
    }
  }, [pairingCode]);

  if (!isOpen) return null;

  const saveToFirestore = async (overridePairingCode?: string) => {
    if (!firebaseEnabled || !authService.getCurrentUser()) return;
    setIsSaving(true);
    const codeToUse = overridePairingCode || pairingCode;

    const consentDoc: CareCircleConsent = {
      hasConsent,
      consentedAt: new Date().toISOString(),
      consentedByUid: authService.getCurrentUser()?.uid || 'primary-caregiver',
      consentedByEmail: authService.getCurrentUser()?.email || 'caregiver@family.org',
      statement: "I have the person's and family's agreement to use this app and share daily summaries with the family.",
    };

    const personDoc: CareCirclePerson = {
      name: personName.trim() || 'Lakshmi Devi (Aita)',
      callingName: 'Aita',
      likesTags: likesTags.trim(),
      updatedAt: new Date().toISOString(),
    };

    const activeCodeDoc: ActivePairingCode = {
      code: codeToUse,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      used: false,
    };

    try {
      await careRepository.saveSetupWizardData(circleId, {
        circleName: circleName.trim() || 'Family Care Circle',
        person: personDoc,
        consent: consentDoc,
        caregiverPin: pin || '1234',
        pairingCode: activeCodeDoc,
      });
      setIsSavedToFirestore(true);
    } catch (err) {
      console.warn('Could not persist setup wizard to Firestore:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    sound.playChime('gentle');
    if (step === 4) {
      // Transitioning to Step 5: persist setup data & generate pairing code in Firestore
      await saveToFirestore();
      setStep(5);
    } else if (step < 5) {
      setStep((prev) => prev + 1);
    } else {
      sound.playChime('success');
      onComplete({
        circleName: circleName.trim(),
        personName: personName.trim(),
        pin,
        pairingCode,
      });
    }
  };

  const handleDirectPair = async () => {
    sound.playChime('success');
    if (!isSavedToFirestore) {
      await saveToFirestore();
    }
    const setupData = {
      circleName: circleName.trim(),
      personName: personName.trim(),
      pin,
    };
    if (onPairPatientAndLaunch) {
      onPairPatientAndLaunch(pairingCode, setupData);
    } else {
      onComplete({
        ...setupData,
        pairingCode,
      });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-[#E2DCD5] dark:border-slate-700 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#E2DCD5] dark:border-slate-700 flex items-center justify-between bg-[#FBF9F5] dark:bg-slate-850">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#00524d] dark:text-[#5eead4]">
              Setup Wizard · Step {step} of 5
            </span>
            <h3 className="font-bold text-lg text-[#1E293B] dark:text-slate-100">
              {step === 1 && '1. Circle Name (C-02)'}
              {step === 2 && '2. Person Details'}
              {step === 3 && '3. Explicit Consent'}
              {step === 4 && '4. Caregiver PIN'}
              {step === 5 && '5. Device Pairing Code'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center cursor-pointer"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress */}
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 flex">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`flex-1 h-full transition-colors ${
                s <= step ? 'bg-[#00524d] dark:bg-[#5eead4]' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="p-6 flex flex-col gap-4">
          {/* STEP 1: Circle */}
          {step === 1 && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Name the collaborative care group supporting your loved one.
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Circle Name
                </label>
                <input
                  type="text"
                  required
                  value={circleName}
                  onChange={(e) => setCircleName(e.target.value)}
                  placeholder="e.g. Devi Family Care Circle"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-750 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#00524d]"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Person */}
          {step === 2 && (
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Preferred Calling Name
                </label>
                <input
                  type="text"
                  required
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="e.g. Lakshmi Devi (Aita)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-750 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#00524d]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Comforting Likes & Familiar Items
                </label>
                <input
                  type="text"
                  value={likesTags}
                  onChange={(e) => setLikesTags(e.target.value)}
                  placeholder="Red tea, devotional flute, morning garden..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-750 text-sm focus:outline-none focus:ring-2 focus:ring-[#00524d]"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Used by activities to weave recognizable cultural familiarity into daily routines.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: Consent */}
          {step === 3 && (
            <div className="flex flex-col gap-3">
              <div className="p-4 bg-teal-50 dark:bg-teal-950/60 rounded-2xl border border-teal-200 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200">
                <ShieldCheck className="w-6 h-6 text-[#00524d] dark:text-[#5eead4] mb-2" />
                <p className="font-semibold leading-relaxed">
                  Caregiving requires mutual trust and dignity. Confirm explicit agreement before saving care information.
                </p>
              </div>

              {/* Explicit stored consent */}
              <label className="flex items-start gap-3 p-3.5 rounded-2xl border-2 border-teal-300 dark:border-teal-800 bg-white dark:bg-slate-800 cursor-pointer shadow-xs">
                <input
                  type="checkbox"
                  checked={hasConsent}
                  onChange={(e) => setHasConsent(e.target.checked)}
                  className="w-5 h-5 accent-[#00524d] mt-0.5 rounded shrink-0 cursor-pointer"
                />
                <div className="flex-1">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                    Explicit Family & Patient Consent
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-300 leading-snug mt-0.5 block">
                    I have the person's and family's agreement to use this app and share daily summaries with the family circle.
                  </span>
                  <span className="text-[10px] text-teal-700 dark:text-teal-400 mt-1 block font-mono">
                    {firebaseEnabled && authService.getCurrentUser()
                      ? 'Consent will be recorded in Firestore with a timestamp.'
                      : 'Consent is saved on this device in local demo mode.'}
                  </span>
                </div>
              </label>
            </div>
          )}

          {/* STEP 4: PIN */}
          {step === 4 && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Set the 4-digit caregiver PIN used at M-01 to switch from Patient Mode to Caregiver Mode.
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Caregiver PIN (4 digits)
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-750 text-center font-mono text-2xl font-bold tracking-widest text-[#00524d] dark:text-[#5eead4] focus:outline-none focus:ring-2 focus:ring-[#00524d]"
                />
                <p className="text-[11px] text-slate-400 text-center mt-1">
                  Default: 1234 · Protects caregiver dashboards from accidental elder disruption
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: Pairing Code */}
          {step === 5 && (
            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-4 bg-slate-100 dark:bg-slate-750 rounded-2xl shadow-inner">
                <QrCode className="w-14 h-14 text-slate-700 dark:text-slate-200" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                6-Digit Device Pairing Code (15 min expiry)
              </span>
              <div className="font-mono text-4xl font-bold tracking-widest text-[#00524d] dark:text-[#5eead4] bg-teal-50 dark:bg-teal-950/60 px-6 py-2 rounded-2xl border border-teal-200 dark:border-teal-800">
                {pairingCode.slice(0, 3)} {pairingCode.slice(3, 6)}
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center gap-2 text-left w-full">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>
                  {isSavedToFirestore
                    ? 'Setup saved to Firestore. Patient device record ready.'
                    : 'Local demo only. Complete setup to save on this device; sign in with your Firebase project for cloud pairing.'}
                </span>
              </div>

              {/* Instant Hackathon Test Pairing Button */}
              <button
                type="button"
                onClick={handleDirectPair}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#00524d] to-[#1e6b65] hover:opacity-95 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 mt-1"
              >
                <Tablet className="w-4 h-4" />
                <span>Pair Patient Device Now & Launch Patient Home (P-01)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Stepper Buttons */}
          <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-700">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => prev - 1)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-750"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : <div />}

            <button
              type="button"
              disabled={(step === 3 && !hasConsent) || (step === 4 && pin.length !== 4) || isSaving}
              onClick={handleNext}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                (step === 3 && !hasConsent) || (step === 4 && pin.length !== 4) || isSaving
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-[#00524d] hover:bg-[#1e6b65] text-white active:scale-95'
              }`}
            >
              <span>{isSaving ? 'Persisting...' : step === 5 ? "Complete Setup" : "Next Step"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
