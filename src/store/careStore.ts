import { useState, useEffect, useCallback, useRef } from 'react';
import {
  PlanItem,
  AlertItem,
  MemoryItem,
  FamilyMember,
  FamilyTask,
  ActivityConfig,
  ActivitySession,
  AdaptationDecision,
  ObserveMetrics,
  AppSettings,
  OutboxItem,
  OutboxOpType,
  HelpEvent,
} from '../types.ts';
import { User as FirebaseUser } from 'firebase/auth';
import { authService } from '../services/firebase/authService.ts';
import { careRepository } from '../services/repository/careRepository.ts';
import { storageService } from '../services/firebase/storageService.ts';
import { evaluateAdaptation } from '../services/adaptation/adaptationEngine.ts';

const STORAGE_KEY = 'connected_care_loop_v2';

export interface CareStoreState {
  planItems: PlanItem[];
  publishedPlanItems: PlanItem[];
  alerts: AlertItem[];
  memories: MemoryItem[];
  familyMembers: FamilyMember[];
  familyTasks: FamilyTask[];
  activityConfigs: ActivityConfig[];
  activitySessions: ActivitySession[];
  adaptationDecisions: AdaptationDecision[];
  metrics: ObserveMetrics;
  settings: AppSettings;
  outbox: OutboxItem[];
}

const INITIAL_PLAN_ITEMS: PlanItem[] = [
  {
    id: 'p-1',
    type: 'meal',
    time: '08:00',
    timePeriod: 'morning',
    titleAs: 'পুৱাৰ চাহ আৰু জলপান',
    titleEn: 'Morning tea & light breakfast',
    instructionAs: 'ৰঙা চাহ আৰু ৰুটী আৰামেৰে খাওক',
    instructionEn: 'Enjoy warm red tea and roti with family',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvMT20wvk9EX9IzK5VSUcvCTvOHIK3trS_IMjdIa1n-29gM9DWhXWn6mglOMADC3hGn2R8fMjjmyNPofgiMPA_qSOTDJTbwBmzJmckctOYWuaXFhMur63wsE8Xt5j6RywBm2U0goWNxxHD27Z0hnXrFLrtMqh3jsg0OBte8rUYPYjnUr5H59Mds-9VGh1aP806TpSOcRU1DGsONtjPAQCFFaw0KDw61Ij-3Wq2_A1aRxDo3xm6o70MIw',
    repeatDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    status: 'done',
    active: true,
  },
  {
    id: 'p-2',
    type: 'hydration',
    time: '10:30',
    timePeriod: 'morning',
    titleAs: 'পানী খোৱা আৰু চোতালত ফুৰা',
    titleEn: 'Hydration & veranda stroll',
    instructionAs: 'এক গিলাচ কুহুমীয়া পানী খাওক আৰু অলপ খোজ কাঢ়ক',
    instructionEn: 'Sip a glass of warm water and enjoy the morning birds',
    repeatDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    status: 'done',
    active: true,
  },
  {
    id: 'p-3',
    type: 'meal',
    time: '01:00',
    timePeriod: 'afternoon',
    titleAs: 'দুপৰীয়াৰ আহাৰ',
    titleEn: 'Lunch & quiet rest',
    instructionAs: 'ভাত আৰু পাতল আঞ্জা খাই বিশ্ৰাম লওক',
    instructionEn: 'Wholesome rice, dal, and peaceful post-lunch rest',
    repeatDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    status: 'done',
    active: true,
  },
  {
    id: 'p-4',
    type: 'activity',
    time: '03:30',
    timePeriod: 'afternoon',
    titleAs: 'আবেলিৰ চাহ আৰু মনৰ সন্তোষ কাৰ্যসূচী',
    titleEn: 'Afternoon tea & calm activities',
    instructionAs: 'একাপ সোৱাদ চাহ খাই পুৰণি ফটো আৰু বাচনৰ খেল খেলক',
    instructionEn: 'Sip warm tea and explore familiar photos and memory objects',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHhF3l4uGI9Li0CiSCv_f9gzh9NxMepXqDtU7caxQuR3FQ2901hGbIJRd4IlGk2_VuknOoa6NJSm6bdnrP5_QjDYdTB6QMfLpr7KAV4jAKsrK7LOFTYUycEytJ6T0BdBekJIW3mG4fTf0PHdSZtqLqY6qTBm2oVayfMt48wjQrKzTA6ObtXsv7YWpG6y40CPgcqEHC-ZatWyeaWBNm_Vk_uXL1msskwYZmY2zp0Gd9-CXFxtr2EH2KAA',
    repeatDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    status: 'upcoming',
    active: true,
  },
  {
    id: 'p-5',
    type: 'medication',
    time: '06:00',
    timePeriod: 'evening',
    titleAs: 'সন্ধিয়াৰ কুহুমীয়া পানী আৰু প্ৰাৰ্থনা',
    titleEn: 'Evening hydration & namghor prayer',
    instructionAs: 'চাকি জ্বলাই বৰগীত শুনক আৰু পানী খাওক',
    instructionEn: 'Light the evening lamp and listen to soothing devotional flute',
    repeatDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    status: 'upcoming',
    active: true,
  },
  {
    id: 'p-6',
    type: 'hydration',
    time: '08:30',
    timePeriod: 'evening',
    titleAs: 'ৰাতিৰ গৰম গাখীৰ আৰু টোপনিৰ প্ৰস্তুতি',
    titleEn: 'Warm milk & calm bedtime routine',
    instructionAs: 'কুহুমীয়া গাখীৰ খাই জিৰণি লওক',
    instructionEn: 'Comforting cup of warm milk and peaceful night rest',
    repeatDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    status: 'upcoming',
    active: true,
  },
];

const INITIAL_STATE: CareStoreState = {
  planItems: INITIAL_PLAN_ITEMS,
  publishedPlanItems: INITIAL_PLAN_ITEMS.map((p) => ({ ...p, isDraft: false })),
  alerts: [
    {
      id: 'alt-1',
      severity: 'high',
      titleAs: 'আইতাই সহায় বাটন টিপিলে',
      titleEn: 'Help requested by Aita on Tablet',
      timeAgo: '১২ মিনিট আগতে · 12m ago',
      acknowledged: false,
      type: 'help',
    },
    {
      id: 'alt-2',
      severity: 'medium',
      titleAs: 'দুপৰীয়াৰ কুহুমীয়া পানী ৰিমাইণ্ডাৰ "পাছত" কৰা হʼল',
      titleEn: 'Hydration reminder deferred with "Later"',
      timeAgo: '১ ঘণ্টা আগতে · 1h ago',
      acknowledged: true,
      type: 'missed_reminders',
    },
  ],
  memories: [
    {
      id: 'mem-1',
      personName: 'মিনু (নাতি)',
      relationshipAs: 'মৰমৰ নাতিনী',
      relationshipEn: 'Loving Granddaughter Minu',
      captionAs: 'বাৰাণ্ডাত পুৱাৰ ৰʼদ পুৱাই চাহ খাই থকা দিন',
      captionEn: 'Enjoying hot morning tea on the front porch',
      photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHhF3l4uGI9Li0CiSCv_f9gzh9NxMepXqDtU7caxQuR3FQ2901hGbIJRd4IlGk2_VuknOoa6NJSm6bdnrP5_QjDYdTB6QMfLpr7KAV4jAKsrK7LOFTYUycEytJ6T0BdBekJIW3mG4fTf0PHdSZtqLqY6qTBm2oVayfMt48wjQrKzTA6ObtXsv7YWpG6y40CPgcqEHC-ZatWyeaWBNm_Vk_uXL1msskwYZmY2zp0Gd9-CXFxtr2EH2KAA',
      isEligibleForRecall: true,
    },
    {
      id: 'mem-2',
      personName: 'ৰাহুল (লʼৰা)',
      relationshipAs: 'কনিষ্ঠ পুত্ৰ',
      relationshipEn: 'Younger Son Rahul',
      captionAs: 'বিহুৰ দিনা নতুন ফুলাম গামোচা লোৱা সময়ত',
      captionEn: 'Bihu festival wearing new woven Phulam Gamosa',
      photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNr6u665tpmLQnz07FS1DcC1BfP_aZghar3sHq0Cvzw_1C5JIiXgQ9VfWKo4ZAAtOIbunm3SY4A0dX7mlFuqT9fBvhwC1_RusCLCiTZQcuwUGFDcOcoVabRCGQ06yZwqYIM8iddLUIJqusoGqVvUNd5oe0z_TzeFPxCwfH3xG6soXhZMzbif1_KElTSQgNsW-r4EJgSrlVRXjpD3Bkh7XnhcD1fIeF3UKqTHenDYy53Yj3LW4MPAC-zA',
      isEligibleForRecall: true,
    },
    {
      id: 'mem-3',
      personName: 'অনামিকা (বোৱাৰী)',
      relationshipAs: 'ঘৰৰ যত্নকৰ্তা',
      relationshipEn: 'Primary Caregiver Ananya',
      captionAs: 'ফুলনিত গোলাপৰ গুৰিত পানী দিয়া হাঁহিমুখীয়া সময়',
      captionEn: 'Watering roses in the front courtyard together',
      photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAKQsreXEz48tUQrjf9y5eoZMyvKw2OjPirK60sYJUWeeu8Esu7rwMEZytKHxtR5M7J5aRLjALoSj7jbC9mrg0EwyKv66nlUm71jh4-f318ctIPtbZBXQ0dXpWwIRrgymyjDSXrfSnwLxUQWe1ZqD5IXNcZm6kTQr3sKT2G4KqOjItApbRI7KtlOxLsOiQCU2uoQdMnAHfivxddeRVWKxn5ead43Helfq_d-nw-4LwHrJQ6yyQiNFunw',
      isEligibleForRecall: true,
    },
  ],
  familyMembers: [
    {
      id: 'fm-1',
      name: 'অনামিকা শৰ্মা (Ananya)',
      role: 'মুখ্য যত্নকৰ্তা · Primary Caregiver',
      phone: '+91 98765 43210',
      isPrimary: true,
      avatarColor: 'bg-[#00524d] text-white',
    },
    {
      id: 'fm-2',
      name: 'ৰাহুল শৰ্মা (Rahul)',
      role: 'পুত্ৰ · Son (Local backup)',
      phone: '+91 98765 12345',
      isPrimary: false,
      avatarColor: 'bg-[#9c4328] text-white',
    },
    {
      id: 'fm-3',
      name: 'ডাঃ বৰুৱা (Dr. Barua)',
      role: 'পৰামৰ্শদাতা চিকিৎসক · Family Physician',
      phone: '+91 98765 88899',
      isPrimary: false,
      avatarColor: 'bg-[#2D6A4F] text-white',
    },
  ],
  familyTasks: [
    {
      id: 'tsk-1',
      title: 'চেনীবিহীন লাল চাহৰ পাত আৰু আদা অনা (Get fresh tea leaves & ginger)',
      assignedTo: 'Rahul',
      dueDate: 'Today, 5 PM',
      completed: true,
    },
    {
      id: 'tsk-2',
      title: 'ডাঃ বৰুৱাৰ ক্লিনিকত নিয়মীয়া ৰুটিন পৰীক্ষা (Regular checkup consult)',
      assignedTo: 'Ananya',
      dueDate: 'Tomorrow, 11 AM',
      completed: false,
    },
  ],
  activityConfigs: [
    {
      id: 'photo-recall',
      nameAs: 'ঘৰৰ স্মৃতি',
      nameEn: 'Photo Recall',
      currentLevel: 1,
      suggestedAction: 'MAINTAIN',
      explanationSentence: 'Aita identifies granddaughter Minu with joyful recognition (92% completion, 0.6 hints).',
      avgHintsPerRound: 0.6,
      completionRate: 92,
      isLocked: false,
    },
    {
      id: 'routine-order',
      nameAs: 'দৈনন্দিন নিয়ম',
      nameEn: 'Routine Order',
      currentLevel: 1,
      suggestedAction: 'MAINTAIN',
      explanationSentence: 'Tea preparation steps arranged smoothly; maintain 3 steps for comfort.',
      avgHintsPerRound: 0.8,
      completionRate: 85,
      isLocked: false,
    },
    {
      id: 'object-match',
      nameAs: 'বস্তুৰ মিল',
      nameEn: 'Object Match',
      currentLevel: 2,
      suggestedAction: 'MAINTAIN',
      explanationSentence: 'Bell-metal cup and bamboo fan matched with 88% accuracy across 4 items.',
      avgHintsPerRound: 0.5,
      completionRate: 88,
      isLocked: true,
    },
    {
      id: 'music-moment',
      nameAs: 'সংগীতৰ পল',
      nameEn: 'Music Moment',
      currentLevel: 1,
      suggestedAction: 'MAINTAIN',
      explanationSentence: 'Listening to calming flute brings immediate relaxed comfort.',
      avgHintsPerRound: 0.0,
      completionRate: 100,
      isLocked: false,
    },
  ],
  activitySessions: [
    {
      id: 'sess-init-om-1',
      circleId: 'circle-demo-local',
      activityId: 'object-match',
      activityType: 'object-match',
      level: 2,
      roundsTotal: 3,
      roundsCompleted: 3,
      hintsUsed: 1,
      wrongTaps: 1,
      abandoned: false,
      comfort: 'good',
      comfortRating: 'good',
      startedAt: '2026-10-03T18:00:00.000Z',
      completedAt: '2026-10-03T18:01:05.000Z',
      durationSeconds: 65,
      completedSuccessfully: true,
    },
    {
      id: 'sess-init-om-2',
      circleId: 'circle-demo-local',
      activityId: 'object-match',
      activityType: 'object-match',
      level: 2,
      roundsTotal: 3,
      roundsCompleted: 3,
      hintsUsed: 2,
      wrongTaps: 1,
      abandoned: false,
      comfort: 'ok',
      comfortRating: 'ok',
      startedAt: '2026-10-03T14:30:00.000Z',
      completedAt: '2026-10-03T14:31:12.000Z',
      durationSeconds: 72,
      completedSuccessfully: true,
    },
    {
      id: 'sess-init-om-3',
      circleId: 'circle-demo-local',
      activityId: 'object-match',
      activityType: 'object-match',
      level: 2,
      roundsTotal: 3,
      roundsCompleted: 3,
      hintsUsed: 1,
      wrongTaps: 0,
      abandoned: false,
      comfort: 'good',
      comfortRating: 'good',
      startedAt: '2026-10-02T19:00:00.000Z',
      completedAt: '2026-10-02T19:00:48.000Z',
      durationSeconds: 48,
      completedSuccessfully: true,
    },
    {
      id: 'sess-init-pr-1',
      circleId: 'circle-demo-local',
      activityId: 'photo-recall',
      activityType: 'photo-recall',
      level: 1,
      roundsTotal: 3,
      roundsCompleted: 3,
      hintsUsed: 1,
      wrongTaps: 0,
      abandoned: false,
      comfort: 'good',
      comfortRating: 'good',
      startedAt: '2026-10-03T11:00:00.000Z',
      completedAt: '2026-10-03T11:00:42.000Z',
      durationSeconds: 42,
      completedSuccessfully: true,
    },
    {
      id: 'sess-init-ro-1',
      circleId: 'circle-demo-local',
      activityId: 'routine-order',
      activityType: 'routine-order',
      level: 1,
      roundsTotal: 3,
      roundsCompleted: 3,
      hintsUsed: 1,
      wrongTaps: 1,
      abandoned: false,
      comfort: 'good',
      comfortRating: 'good',
      startedAt: '2026-10-03T09:00:00.000Z',
      completedAt: '2026-10-03T09:01:10.000Z',
      durationSeconds: 70,
      completedSuccessfully: true,
    },
  ],
  adaptationDecisions: [],
  metrics: {
    completionRate: 84,
    avgHintsPerRound: 0.8,
    comfortSplit: {
      good: 70,
      ok: 22,
      uncomfortable: 8,
    },
    helpEventsCount: 1,
    remindersLaterCount: 2,
  },
  settings: {
    language: 'bilingual',
    fontScale: 1.0,
    highContrast: false,
    audioSpeed: 0.8,
    caregiverPin: '1234',
    isSimulatedOffline: false,
    planVersion: 7,
    lastSyncedTimestamp: '5m ago',
  },
  outbox: [],
};

export function useCareStore() {
  const [state, setState] = useState<CareStoreState>(() => {
    if (typeof window === 'undefined') return INITIAL_STATE;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!parsed.publishedPlanItems || parsed.publishedPlanItems.length === 0) {
          parsed.publishedPlanItems = (parsed.planItems || []).filter((p: PlanItem) => !p.isDraft);
        }
        if (!parsed.activitySessions || parsed.activitySessions.length === 0) {
          parsed.activitySessions = INITIAL_STATE.activitySessions;
        }
        if (!parsed.adaptationDecisions) {
          parsed.adaptationDecisions = INITIAL_STATE.adaptationDecisions;
        } else if (Array.isArray(parsed.adaptationDecisions)) {
          const seen = new Set<string>();
          parsed.adaptationDecisions = parsed.adaptationDecisions.filter((d: AdaptationDecision, idx: number) => {
            const key = d.id || `dec-${idx}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
        }
        return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_STATE;
  });

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota error
    }
  }, [state]);

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(authService.getCurrentUser());

  useEffect(() => {
    const unsub = authService.onAuthChange((user) => {
      setCurrentUser(user);
      if (user) {
        const circleId = `circle-${user.uid.slice(0, 8)}`;
        careRepository
          .getCareCircle(circleId)
          .then(async (existingCircle) => {
            if (!existingCircle) {
              await careRepository.createCareCircle(circleId, 'Aita Family Care Circle', user.uid);
            } else {
              // Restore Care Circle settings and caregiver session
              setState((prev) => ({
                ...prev,
                settings: {
                  ...prev.settings,
                  circleName: existingCircle.name || prev.settings.circleName,
                  patientPersonName: existingCircle.person?.name || prev.settings.patientPersonName,
                  caregiverPin: existingCircle.caregiverPin || prev.settings.caregiverPin,
                  activePairingCode: existingCircle.activePairingCode?.code || prev.settings.activePairingCode,
                  pairedCircleId: circleId,
                },
              }));
            }
          })
          .catch(async (err) => {
            console.warn('Initial circle fetch fallback, creating circle:', err);
            try {
              await careRepository.createCareCircle(circleId, 'Aita Family Care Circle', user.uid);
            } catch (createErr) {
              console.warn('Could not create care circle:', createErr);
            }
          });
      } else {
        // Clear caregiver active session
        setCurrentUser(null);
      }
    });
    return () => unsub();
  }, []);

  const activeCircleId = currentUser ? `circle-${currentUser.uid.slice(0, 8)}` : 'circle-demo-local';

  // Offline condition check
  const isOffline =
    state.settings.isSimulatedOffline ||
    (typeof navigator !== 'undefined' && !navigator.onLine);

  const isFlushingRef = useRef(false);

  /**
   * FIFO Flush of pending Outbox operations
   */
  const flushOutbox = useCallback(async () => {
    if (isFlushingRef.current) return;
    if (state.settings.isSimulatedOffline) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;
    if (!currentUser) return; // Retain in outbox until authenticated

    const pending = state.outbox.filter((op) => op.status === 'pending' || op.status === 'failed');
    if (pending.length === 0) return;

    isFlushingRef.current = true;
    try {
      for (const op of pending) {
        // Mark operation as syncing
        setState((prev) => ({
          ...prev,
          outbox: prev.outbox.map((o) => (o.id === op.id ? { ...o, status: 'syncing' } : o)),
        }));

        try {
          await careRepository.syncOutboxItem(activeCircleId, op);

          // Success: remove from pending queue (marked synced)
          setState((prev) => ({
            ...prev,
            outbox: prev.outbox.filter((o) => o.id !== op.id),
            settings: {
              ...prev.settings,
              lastSyncedTimestamp: 'Just now',
            },
          }));
        } catch (err: unknown) {
          console.warn('Sync failed for outbox op:', op.id, err);
          setState((prev) => ({
            ...prev,
            outbox: prev.outbox.map((o) =>
              o.id === op.id
                ? {
                    ...o,
                    status: 'failed',
                    retryCount: (o.retryCount || 0) + 1,
                    lastError: err instanceof Error ? err.message : String(err),
                  }
                : o
            ),
          }));
          // Stop FIFO iteration on network failure
          break;
        }
      }
    } finally {
      isFlushingRef.current = false;
    }
  }, [state.settings.isSimulatedOffline, state.outbox, currentUser, activeCircleId]);

  // When simulated offline is disabled, flush the queue
  useEffect(() => {
    if (!state.settings.isSimulatedOffline && (typeof navigator === 'undefined' || navigator.onLine)) {
      flushOutbox();
    }
  }, [state.settings.isSimulatedOffline, flushOutbox]);

  // When browser reconnects, flush the queue
  useEffect(() => {
    const handleOnline = () => {
      if (!state.settings.isSimulatedOffline) {
        flushOutbox();
      }
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [state.settings.isSimulatedOffline, flushOutbox]);

  // Real-time Caregiver sync listeners
  useEffect(() => {
    if (!currentUser || state.settings.isSimulatedOffline) return;

    const unsubAlerts = careRepository.listenToAlerts(activeCircleId, (remoteAlerts) => {
      if (remoteAlerts && remoteAlerts.length > 0) {
        setState((prev) => {
          const existingIds = new Set(prev.alerts.map((a) => a.id));
          const newAlerts = remoteAlerts.filter((a) => !existingIds.has(a.id));
          if (newAlerts.length === 0) return prev;
          return {
            ...prev,
            alerts: [...newAlerts, ...prev.alerts],
            settings: { ...prev.settings, lastSyncedTimestamp: 'Just now' },
          };
        });
      }
    });

    const unsubSessions = careRepository.listenToSessions(activeCircleId, (remoteSessions) => {
      if (remoteSessions && remoteSessions.length > 0) {
        setState((prev) => {
          const totalSessions = remoteSessions.length;
          const successful = remoteSessions.filter((s) => s.completedSuccessfully).length;
          const completionRate = totalSessions > 0 ? Math.round((successful / totalSessions) * 100) : prev.metrics.completionRate;
          return {
            ...prev,
            metrics: {
              ...prev.metrics,
              completionRate,
            },
            settings: { ...prev.settings, lastSyncedTimestamp: 'Just now' },
          };
        });
      }
    });

    return () => {
      unsubAlerts();
      unsubSessions();
    };
  }, [currentUser, activeCircleId, state.settings.isSimulatedOffline]);

  // Manual refresh from Firestore for Caregiver screens
  const refreshFromFirestore = useCallback(async () => {
    if (!currentUser || state.settings.isSimulatedOffline) return;
    try {
      const [remoteAlerts, remoteSessions] = await Promise.all([
        careRepository.getAlerts(activeCircleId),
        careRepository.getObservations(activeCircleId),
      ]);

      setState((prev) => {
        const updated = { ...prev };
        if (remoteAlerts && remoteAlerts.length > 0) {
          const map = new Map<string, AlertItem>();
          remoteAlerts.forEach((a) => map.set(a.id, a));
          prev.alerts.forEach((a) => {
            if (!map.has(a.id)) map.set(a.id, a);
          });
          updated.alerts = Array.from(map.values());
        }
        if (remoteSessions && remoteSessions.length > 0) {
          const total = remoteSessions.length;
          const successful = remoteSessions.filter((s) => s.completedSuccessfully).length;
          updated.metrics = {
            ...prev.metrics,
            completionRate: total > 0 ? Math.round((successful / total) * 100) : prev.metrics.completionRate,
          };
        }
        updated.settings = { ...prev.settings, lastSyncedTimestamp: 'Just now' };
        return updated;
      });
    } catch (err) {
      console.warn('Manual refresh failed:', err);
    }
  }, [currentUser, activeCircleId, state.settings.isSimulatedOffline]);

  const acknowledgeAlert = (alertId: string) => {
    setState((prev) => ({
      ...prev,
      alerts: prev.alerts.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)),
    }));
  };

  const markPlanItemDone = (itemId: string) => {
    const item = state.planItems.find((p) => p.id === itemId);
    const op: OutboxItem = {
      id: 'out-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      type: 'REMINDER_EVENT_RECORDED',
      entityId: itemId,
      payload: {
        itemId,
        status: 'done',
        item: item ? { ...item, status: 'done' } : undefined,
        timestamp: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      status: 'pending',
      retryCount: 0,
    };

    setState((prev) => ({
      ...prev,
      planItems: prev.planItems.map((p) => (p.id === itemId ? { ...p, status: 'done' } : p)),
      publishedPlanItems: prev.publishedPlanItems.map((p) => (p.id === itemId ? { ...p, status: 'done' } : p)),
      outbox: [...prev.outbox, op],
    }));
  };

  const markPlanItemLater = (itemId: string) => {
    const item = state.planItems.find((p) => p.id === itemId);
    const op: OutboxItem = {
      id: 'out-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      type: 'REMINDER_EVENT_RECORDED',
      entityId: itemId,
      payload: {
        itemId,
        status: 'later',
        item: item ? { ...item, status: 'missed' } : undefined,
        timestamp: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      status: 'pending',
      retryCount: 0,
    };

    setState((prev) => ({
      ...prev,
      planItems: prev.planItems.map((p) => (p.id === itemId ? { ...p, status: 'missed' } : p)),
      publishedPlanItems: prev.publishedPlanItems.map((p) => (p.id === itemId ? { ...p, status: 'missed' } : p)),
      metrics: {
        ...prev.metrics,
        remindersLaterCount: prev.metrics.remindersLaterCount + 1,
      },
      outbox: [...prev.outbox, op],
    }));
  };

  const markPlanItemMissed = (itemId: string) => {
    const item = state.planItems.find((p) => p.id === itemId);
    const op: OutboxItem = {
      id: 'out-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      type: 'REMINDER_EVENT_RECORDED',
      entityId: itemId,
      payload: {
        itemId,
        status: 'missed',
        item: item ? { ...item, status: 'missed' } : undefined,
        timestamp: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      status: 'pending',
      retryCount: 0,
    };

    setState((prev) => ({
      ...prev,
      planItems: prev.planItems.map((p) => (p.id === itemId ? { ...p, status: 'missed' } : p)),
      publishedPlanItems: prev.publishedPlanItems.map((p) => (p.id === itemId ? { ...p, status: 'missed' } : p)),
      outbox: [...prev.outbox, op],
    }));
  };

  const recordHelpEvent = (screenSource = 'tablet') => {
    const helpId = 'help-' + Date.now();
    const alertId = 'alt-' + Date.now();

    const newAlert: AlertItem = {
      id: alertId,
      severity: 'high',
      titleAs: 'আইতাই সহায় বাটন টিপিলে',
      titleEn: 'Help requested by Aita on tablet',
      timeAgo: 'Just now',
      acknowledged: false,
      type: 'help',
    };

    const helpEvent: HelpEvent = {
      id: helpId,
      circleId: activeCircleId,
      triggeredAt: new Date().toISOString(),
      screenSource,
      resolved: false,
    };

    const op: OutboxItem = {
      id: 'out-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      type: 'HELP_EVENT_RECORDED',
      entityId: helpId,
      payload: { helpEvent, alert: newAlert, timestamp: helpEvent.triggeredAt, screenSource },
      createdAt: new Date().toISOString(),
      status: 'pending',
      retryCount: 0,
    };

    setState((prev) => ({
      ...prev,
      alerts: [newAlert, ...prev.alerts],
      metrics: {
        ...prev.metrics,
        helpEventsCount: prev.metrics.helpEventsCount + 1,
      },
      outbox: [...prev.outbox, op],
    }));
  };

  const recordActivitySession = (sessionData: Partial<ActivitySession>): ActivitySession => {
    const fullSession: ActivitySession = {
      id: sessionData.id || `sess-${Date.now()}`,
      circleId: activeCircleId,
      activityId: sessionData.activityId || 'object-match',
      activityType: sessionData.activityType || sessionData.activityId || 'object-match',
      level: (sessionData.level || 1) as 1 | 2 | 3,
      roundsTotal: sessionData.roundsTotal || 3,
      roundsCompleted: sessionData.roundsCompleted !== undefined ? sessionData.roundsCompleted : 3,
      hintsUsed: sessionData.hintsUsed || 0,
      wrongTaps: sessionData.wrongTaps || 0,
      abandoned: sessionData.abandoned || false,
      comfort: sessionData.comfort || sessionData.comfortRating || 'good',
      comfortRating: sessionData.comfort || sessionData.comfortRating || 'good',
      startedAt: sessionData.startedAt || new Date(Date.now() - 45000).toISOString(),
      completedAt: sessionData.completedAt || new Date().toISOString(),
      durationSeconds: sessionData.durationSeconds || 45,
      completedSuccessfully: sessionData.completedSuccessfully !== false && !sessionData.abandoned,
    };

    const op: OutboxItem = {
      id: `out-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: 'SESSION_RECORDED',
      entityId: fullSession.id,
      payload: fullSession,
      createdAt: fullSession.completedAt,
      status: 'pending',
      retryCount: 0,
    };

    setState((prev) => {
      // 1. Prepend to session history (most recent first)
      const updatedSessions = [fullSession, ...(prev.activitySessions || [])];

      // 2. Re-evaluate adaptation engine for this activity using last 3 sessions
      const currentConfig = prev.activityConfigs.find((c) => c.id === fullSession.activityId);
      let updatedConfigs = prev.activityConfigs;

      if (currentConfig) {
        const actSessions = updatedSessions.filter((s) => s.activityId === fullSession.activityId);
        const recommendation = evaluateAdaptation(actSessions, currentConfig);

        updatedConfigs = prev.activityConfigs.map((c) =>
          c.id === fullSession.activityId
            ? {
                ...c,
                suggestedAction: recommendation.action,
                explanationSentence: recommendation.explanation,
                avgHintsPerRound: recommendation.metrics.hintsPerRound,
                completionRate: Math.round(recommendation.metrics.completionRate * 100),
              }
            : c
        );
      }

      // 3. Update aggregate metrics
      const comfort = fullSession.comfort;
      const split = { ...prev.metrics.comfortSplit };
      if (comfort === 'good') split.good = Math.min(100, split.good + 1);
      if (comfort === 'ok') split.ok = Math.max(0, split.ok + 1);
      if (comfort === 'uncomfortable') split.uncomfortable = Math.min(100, split.uncomfortable + 1);

      // Recalculate global completion and hints across all recent sessions
      const recentSessions = updatedSessions.slice(0, 20);
      let totalR = 0;
      let compR = 0;
      let totalH = 0;
      for (const s of recentSessions) {
        const r = s.roundsTotal || 3;
        totalR += r;
        compR += s.roundsCompleted !== undefined ? s.roundsCompleted : (s.completedSuccessfully ? r : 0);
        totalH += s.hintsUsed || 0;
      }
      const globalCompletion = totalR > 0 ? Math.round((compR / totalR) * 100) : prev.metrics.completionRate;
      const globalHints = totalR > 0 ? Math.round((totalH / totalR) * 10) / 10 : prev.metrics.avgHintsPerRound;

      return {
        ...prev,
        activitySessions: updatedSessions,
        activityConfigs: updatedConfigs,
        metrics: {
          ...prev.metrics,
          comfortSplit: split,
          completionRate: globalCompletion,
          avgHintsPerRound: globalHints,
        },
        outbox: [...prev.outbox, op],
      };
    });

    return fullSession;
  };

  const recordAdaptationDecision = (decision: AdaptationDecision) => {
    const decisionId = decision.id || `dec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const fullDecision: AdaptationDecision = {
      id: decisionId,
      activityId: decision.activityId,
      action: decision.action,
      decidedAt: decision.decidedAt || new Date().toISOString(),
      previousLevel: decision.previousLevel,
      newLevel: decision.newLevel,
      isLocked: decision.isLocked,
      notes: decision.notes,
    };

    const op: OutboxItem = {
      id: `out-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: 'ADAPTATION_DECISION_RECORDED',
      entityId: decisionId,
      payload: fullDecision,
      createdAt: fullDecision.decidedAt,
      status: 'pending',
      retryCount: 0,
    };

    setState((prev) => {
      // Deduplicate decisions by ID
      const seenIds = new Set<string>();
      const updatedDecisions = [fullDecision, ...(prev.adaptationDecisions || [])].filter((d) => {
        if (!d.id || seenIds.has(d.id)) return false;
        seenIds.add(d.id);
        return true;
      });

      // Update the target activity config with the new level and lock state
      const targetConfig = prev.activityConfigs.find((c) => c.id === decision.activityId);
      let updatedConfigs = prev.activityConfigs;

      if (targetConfig) {
        const newConfig: ActivityConfig = {
          ...targetConfig,
          currentLevel: decision.newLevel,
          isLocked: decision.isLocked,
        };

        // Re-evaluate adaptation recommendation with new level/lock
        const actSessions = (prev.activitySessions || []).filter((s) => s.activityId === decision.activityId);
        const recommendation = evaluateAdaptation(actSessions, newConfig);

        newConfig.suggestedAction = recommendation.action;
        newConfig.explanationSentence = recommendation.explanation;

        updatedConfigs = prev.activityConfigs.map((c) =>
          c.id === decision.activityId ? newConfig : c
        );
      }

      return {
        ...prev,
        adaptationDecisions: updatedDecisions,
        activityConfigs: updatedConfigs,
        outbox: [...prev.outbox, op],
      };
    });
  };

  const recordComfortRating = (feeling: 'good' | 'ok' | 'uncomfortable', activityId: string, sessionContext?: Partial<ActivitySession>) => {
    return recordActivitySession({
      activityId,
      comfort: feeling,
      comfortRating: feeling,
      ...sessionContext,
    });
  };

  const savePlanItem = (item: PlanItem) => {
    const updatedItem: PlanItem = {
      ...item,
      isDraft: item.isDraft !== undefined ? item.isDraft : true,
    };

    const op: OutboxItem = {
      id: 'out-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      type: 'PLAN_ITEM_UPSERT',
      entityId: item.id,
      payload: { item: updatedItem },
      createdAt: new Date().toISOString(),
      status: 'pending',
      retryCount: 0,
    };

    setState((prev) => {
      const existing = prev.planItems.find((p) => p.id === item.id);
      const updatedList = existing
        ? prev.planItems.map((p) => (p.id === item.id ? updatedItem : p))
        : [...prev.planItems, updatedItem];

      return {
        ...prev,
        planItems: updatedList,
        outbox: [...prev.outbox, op],
      };
    });
  };

  const deletePlanItem = (itemId: string) => {
    const op: OutboxItem = {
      id: 'out-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      type: 'PLAN_ITEM_DELETE',
      entityId: itemId,
      payload: { itemId },
      createdAt: new Date().toISOString(),
      status: 'pending',
      retryCount: 0,
    };

    setState((prev) => ({
      ...prev,
      planItems: prev.planItems.filter((p) => p.id !== itemId),
      outbox: [...prev.outbox, op],
    }));
  };

  const publishPlan = () => {
    const newVersion = state.settings.planVersion + 1;
    const publishedItems = state.planItems.map((p) => ({ ...p, isDraft: false }));

    const op: OutboxItem = {
      id: 'out-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      type: 'PLAN_PUBLISH',
      entityId: `v${newVersion}`,
      payload: { planItems: publishedItems, planVersion: newVersion },
      createdAt: new Date().toISOString(),
      status: 'pending',
      retryCount: 0,
    };

    setState((prev) => ({
      ...prev,
      planItems: publishedItems,
      publishedPlanItems: publishedItems, // Patient immediately receives updated plan
      settings: {
        ...prev.settings,
        planVersion: newVersion,
        lastSyncedTimestamp: 'Just now',
      },
      outbox: [...prev.outbox, op],
    }));
  };

  const updateActivityConfig = (
    activityId: string,
    level: 1 | 2 | 3,
    isLocked: boolean
  ) => {
    recordAdaptationDecision({
      activityId,
      action: isLocked ? 'LOCK' : 'SET_LEVEL',
      newLevel: level,
      isLocked,
      decidedAt: new Date().toISOString(),
    });
  };

  const saveMemory = (memory: MemoryItem) => {
    setState((prev) => {
      const exists = prev.memories.find((m) => m.id === memory.id);
      const list = exists
        ? prev.memories.map((m) => (m.id === memory.id ? memory : m))
        : [...prev.memories, memory];
      return { ...prev, memories: list };
    });

    if (currentUser && !state.settings.isSimulatedOffline) {
      careRepository.saveMemory(activeCircleId, memory).catch((err) => {
        console.warn('Firestore memory sync warning:', err);
      });
    }
  };

  const toggleTaskCompleted = (taskId: string) => {
    setState((prev) => ({
      ...prev,
      familyTasks: prev.familyTasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      ),
    }));
  };

  const updateSettings = (partial: Partial<AppSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...partial },
    }));
  };

  const triggerSyncNow = async () => {
    if (state.settings.isSimulatedOffline) return;
    await flushOutbox();
    await refreshFromFirestore();
  };

  const resetDemoData = () => {
    setState(INITIAL_STATE);
  };

  return {
    state,
    currentUser,
    activeCircleId,
    isOffline,
    repository: careRepository,
    storageService,
    authService,
    acknowledgeAlert,
    markPlanItemDone,
    markPlanItemLater,
    markPlanItemMissed,
    recordHelpEvent,
    recordComfortRating,
    recordActivitySession,
    recordAdaptationDecision,
    savePlanItem,
    deletePlanItem,
    publishPlan,
    updateActivityConfig,
    saveMemory,
    toggleTaskCompleted,
    updateSettings,
    triggerSyncNow,
    refreshFromFirestore,
    flushOutbox,
    resetDemoData,
  };
}
