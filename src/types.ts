export type AppMode = 'patient' | 'caregiver';

export type ScreenType = 'hub' | 'object-match' | 'photo-recall' | 'daily-routine';

export interface MatchOption {
  id: string;
  titleAs: string;
  titleEn: string;
  imageSrc: string;
  imageAlt: string;
  isCorrect: boolean;
}

export interface ObjectMatchQuestion {
  id: string;
  stepNumber: number;
  totalSteps: number;
  titleAs: string;
  titleEn: string;
  targetTitleAs: string;
  targetTitleEn: string;
  instructionAs: string;
  instructionEn: string;
  targetImageSrc: string;
  targetImageAlt: string;
  options: MatchOption[];
  successMessageAs: string;
  successMessageEn: string;
  gentleGuidanceAs: string;
  gentleGuidanceEn: string;
  hintAs: string;
  hintEn: string;
}

export interface RoutineStep {
  id: string;
  titleAs: string;
  titleEn: string;
  descAs: string;
  descEn: string;
  icon: string;
  correctPosition: number;
}

export interface ActivityCardData {
  id: ScreenType;
  titleAs: string;
  titleEn: string;
  subtitleAs: string;
  subtitleEn: string;
  badgeAs: string;
  badgeEn: string;
  badgeIcon: string;
  badgeColorClass: string;
  imageSrc: string;
  imageAlt: string;
}

export type PatientRoute =
  | 'home' // P-01
  | 'reminder' // P-02
  | 'activities' // P-03
  | 'photo-recall' // P-04
  | 'routine-order' // P-05
  | 'object-match' // P-06
  | 'comfort' // P-07
  | 'help' // P-08
  | 'music-moment' // P-09
  | 'mode-gate'; // M-01

export type CaregiverTab =
  | 'home' // C-03
  | 'plan' // C-04
  | 'observe' // C-06
  | 'guide' // C-08
  | 'family' // C-09
  | 'settings' // C-13
  | 'login'; // C-01

export type PlanItemType = 'hydration' | 'meal' | 'medication' | 'activity' | 'appointment';

export interface PlanItem {
  id: string;
  type: PlanItemType;
  time: string; // e.g. "08:30"
  timePeriod: 'morning' | 'afternoon' | 'evening';
  titleAs: string;
  titleEn: string;
  instructionAs: string;
  instructionEn: string;
  photoUrl?: string;
  repeatDays: string[]; // ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  status: 'done' | 'missed' | 'upcoming';
  active: boolean;
  isDraft?: boolean;
}

export interface AlertItem {
  id: string;
  severity: 'high' | 'medium';
  titleAs: string;
  titleEn: string;
  timeAgo: string;
  acknowledged: boolean;
  type: 'help' | 'missed_reminders' | 'comfort_drop' | 'sync';
}

export interface MemoryItem {
  id: string;
  personName: string;
  relationshipAs: string;
  relationshipEn: string;
  captionAs: string;
  captionEn: string;
  photoUrl: string;
  isEligibleForRecall: boolean;
}

export interface FamilyMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  isPrimary: boolean;
  avatarColor: string;
}

export interface FamilyTask {
  id: string;
  title: string;
  assignedTo: string;
  dueDate: string;
  completed: boolean;
}

export interface ActivityConfig {
  id: 'photo-recall' | 'routine-order' | 'object-match' | 'music-moment';
  nameAs: string;
  nameEn: string;
  currentLevel: 1 | 2 | 3;
  suggestedAction: 'REDUCE' | 'MAINTAIN' | 'INCREASE' | 'SWITCH';
  explanationSentence: string;
  avgHintsPerRound: number;
  completionRate: number;
  isLocked: boolean;
}

export interface ObserveMetrics {
  completionRate: number; // e.g. 84
  avgHintsPerRound: number; // e.g. 0.8
  comfortSplit: {
    good: number; // %
    ok: number; // %
    uncomfortable: number; // %
  };
  helpEventsCount: number;
  remindersLaterCount: number;
}

export interface ComfortLog {
  id: string;
  activityId: string;
  timestamp: string;
  feeling: 'good' | 'ok' | 'uncomfortable';
}

export type OutboxOpType =
  | 'PLAN_ITEM_UPSERT'
  | 'PLAN_ITEM_DELETE'
  | 'PLAN_PUBLISH'
  | 'SESSION_RECORDED'
  | 'REMINDER_EVENT_RECORDED'
  | 'HELP_EVENT_RECORDED'
  | 'ADAPTATION_DECISION_RECORDED'
  | 'ACTIVITY_CONFIG_SET'
  | string;

export interface OutboxItem {
  id: string;
  type: OutboxOpType;
  entityId: string;
  payload: Record<string, any>;
  createdAt: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
  lastError?: string;
}

export interface AppSettings {
  language: 'as' | 'en' | 'bilingual';
  fontScale: 0.9 | 1.0 | 1.2 | 1.4;
  highContrast: boolean;
  audioSpeed: 0.8 | 1.0;
  caregiverPin: string;
  isSimulatedOffline: boolean;
  planVersion: number;
  lastSyncedTimestamp: string;
  pairedCircleId?: string;
  patientPersonName?: string;
  circleName?: string;
  isDevicePaired?: boolean;
  activePairingCode?: string;
}

export interface CaregiverUserProfile {
  uid: string;
  email: string;
  displayName: string;
  circleId: string;
  role?: string;
  createdAt: string;
}

export interface CareCirclePerson {
  name: string;
  callingName?: string;
  likesTags?: string;
  updatedAt?: string;
}

export interface CareCircleConsent {
  hasConsent: boolean;
  consentedAt: string;
  consentedByUid: string;
  consentedByEmail?: string;
  statement: string;
}

export interface ActivePairingCode {
  code: string;
  expiresAt: string;
  createdAt: string;
  used: boolean;
}

export interface PatientDeviceRecord {
  deviceId: string;
  circleId: string;
  deviceType: 'tablet' | 'phone';
  pairedAt: string;
  lastActiveAt?: string;
}

export interface PairingCodeDoc {
  id: string;
  circleId: string;
  circleName: string;
  personName: string;
  caregiverPin: string;
  expiresAt: string;
  createdAt: string;
  createdByUid: string;
  used: boolean;
}

export interface CareCircleDoc {
  id: string;
  name: string;
  primaryCaregiverUid: string;
  memberUids: string[];
  planVersion: number;
  createdAt: string;
  person?: CareCirclePerson;
  consent?: CareCircleConsent;
  caregiverPin?: string;
  activePairingCode?: ActivePairingCode;
}

export interface WeeklySummaryDoc {
  id: string;
  circleId: string;
  weekLabel: string;
  contentMarkdown: string;
  approved: boolean;
  createdAt: string;
}

export interface ActivitySession {
  id: string;
  circleId: string;
  activityId: string; // 'photo-recall' | 'routine-order' | 'object-match' | 'music-moment'
  activityType?: string;
  level: 1 | 2 | 3;
  roundsTotal: number;
  roundsCompleted: number;
  hintsUsed: number;
  wrongTaps: number;
  abandoned: boolean;
  comfort?: 'good' | 'ok' | 'uncomfortable';
  comfortRating?: 'good' | 'ok' | 'uncomfortable';
  startedAt?: string;
  completedAt: string;
  durationSeconds: number;
  completedSuccessfully: boolean;
}

export interface AdaptationDecision {
  id?: string;
  activityId: string;
  action: 'KEEP' | 'REVERT' | 'SET_LEVEL' | 'LOCK' | 'UNLOCK';
  decidedAt: string;
  previousLevel?: 1 | 2 | 3;
  newLevel: 1 | 2 | 3;
  isLocked: boolean;
  notes?: string;
}

export interface AdaptationRecommendation {
  action: 'REDUCE' | 'MAINTAIN' | 'INCREASE' | 'SWITCH';
  fromLevel: 1 | 2 | 3;
  toLevel: 1 | 2 | 3;
  explanation: string;
  metrics: {
    completionRate: number;
    hintsPerRound: number;
    uncomfortableCount: number;
    abandonedCount: number;
  };
}

export interface HelpEvent {
  id: string;
  circleId: string;
  triggeredAt: string;
  screenSource: string;
  resolved: boolean;
}

export type CaregiverAlert = AlertItem;

