# Connected Care Loop — Data Model, Memory & Persistence Architecture

**Product**: Connected Care Loop: Dementia-Friendly Cognitive Adaptation & Family Care Orchestration  
**Status**: Authoritative Data Specification  
**Revision Date**: October 2026  

---

## 1. Data Model Overview & Firestore Schema Mapping

In the Web-First Hackathon Architecture, all PRD entities map cleanly to **Cloud Firestore** document collections scoped by `careCircles/{circleId}`. This preserves multi-tenant circle isolation and provides zero-friction offline caching.

```
careCircles/{circleId}
├── (Document: name, patientId, planVersion, lastSyncedTimestamp)
├── personProfiles/{personId}
│   └── (Name, primaryLanguage, audioSpeed, contrastMode, pinHash)
├── planItems/{planItemId}
│   └── (Title, time, category, icon, audioKey, days, isDraft, active)
├── planSnapshots/{snapshotId}
│   └── (Version, publishedAt, publishedBy, itemsSnapshotJson)
├── activityConfigs/{activityId}
│   └── (CurrentLevel [1-3], isLocked, suggestedLevel, rationale, lastUpdated)
├── activitySessions/{sessionId}
│   └── (ActivityId, completedAt, durationSeconds, hintsUsed, comfortRating)
├── reminderEvents/{eventId}
│   └── (PlanItemId, scheduledTime, action [done/later/missed], responseTimeMs)
├── helpEvents/{helpId}
│   └── (TriggeredAt, screenSource, resolved, resolvedAt, resolvedBy)
├── memoryItems/{memoryId}
│   └── (ImageUrl, titleAs, titleEn, personName, relationship, eligibleForRecall)
├── adaptationDecisions/{decisionId}
│   └── (ActivityId, previousLevel, newLevel, caregiverOverride, decidedAt)
├── alerts/{alertId}
│   └── (Type, severity, message, timestamp, acknowledged)
├── familyTasks/{taskId}
│   └── (Title, assignedToMemberId, dueDate, isCompleted)
└── syncOps/{opId}
    └── (Action, entity, payload, queuedAt, status [pending/synced/failed])
```

---

## 2. Core Entity Definitions & TypeScript Interfaces

### 2.1 Care Circle & Person Profile
```typescript
export interface CareCircle {
  id: string;                      // e.g. "circle-aita-family"
  name: string;                    // "Lakshmi Devi Care Circle"
  createdAt: string;               // ISO 8601 string
  primaryCaregiverUid: string;     // Caregiver user UID
  planVersion: number;             // Active published plan version (e.g. 8)
  hasDraftChanges: boolean;        // True if local drafts exist
  lastSyncedTimestamp: string;     // Display string (e.g. "Just now")
}

export interface PersonProfile {
  id: string;                      // e.g. "person-aita"
  circleId: string;
  name: string;                    // "Lakshmi Devi (Aita)"
  preferredName: string;           // "আইতা (Aita)"
  primaryLanguage: 'as' | 'en';    // 'as' (Assamese) or 'en' (English)
  fontScale: number;               // 0.9 to 1.4 multiplier
  highContrast: boolean;           // True for high contrast mode
  speechRate: number;              // 0.7 to 1.0 (default 0.82)
  caregiverPin: string;            // Default "1234"
}
```

### 2.2 Plan Items & Plan Snapshots
```typescript
export interface PlanItem {
  id: string;                      // e.g. "plan-tea-morning"
  circleId: string;
  time: string;                    // "07:30 AM"
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  titleAs: string;                 // "ৰাতিপুৱাৰ চাহ আৰু খোজকঢ়া"
  titleEn: string;                 // "Morning Tea & Veranda Walk"
  category: 'routine' | 'hydration' | 'medication' | 'activity' | 'social';
  icon: string;                    // Lucide icon identifier
  audioCuePrompt?: string;         // Spoken guidance text
  days: string[];                  // ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  isActive: boolean;               // Toggle enabled
  isDraft: boolean;                // True if uncommitted edit
}

export interface PlanSnapshot {
  id: string;
  circleId: string;
  version: number;
  publishedAt: string;
  publishedByUid: string;
  items: PlanItem[];               // Frozen snapshot array
}
```

### 2.3 Activity Configurations & Activity Sessions
```typescript
export interface ActivityConfig {
  id: 'object-match' | 'photo-recall' | 'routine-order' | 'music-moment';
  circleId: string;
  currentLevel: 1 | 2 | 3;        // 1 = Simplest (2 options), 3 = Advanced (4 options)
  isLocked: boolean;              // If true, algorithmic adaptation is frozen
  suggestedLevel: 1 | 2 | 3;      // Recommendation from AI-1 engine
  rationale: string;              // "High prompt dependence (8.2 hints/round)"
  lastEvaluatedAt: string;
}

export interface ActivitySession {
  id: string;
  circleId: string;
  activityId: string;
  completedAt: string;
  durationSeconds: number;
  hintsUsed: number;
  completedSuccessfully: boolean;
  comfortRating?: 'good' | 'ok' | 'uncomfortable';
}
```

### 2.4 Memories Bank
```typescript
export interface MemoryItem {
  id: string;                      // e.g. "mem-tea-veranda"
  circleId: string;
  imageUrl: string;                // Image URL or Firebase Storage reference
  titleAs: string;                 // "বাৰাণ্ডাত চাহ"
  titleEn: string;                 // "Tea on the Veranda"
  personName: string;              // "মিনু (Minu)"
  relationship: string;            // "Loving Granddaughter"
  yearOrEra: string;               // "2024"
  eligibleForPhotoRecall: boolean; // If true, eligible as choice candidate in P-04
  createdAt: string;
}
```

### 2.5 Alerts & Observations
```typescript
export interface CaregiverAlert {
  id: string;
  circleId: string;
  type: 'missed_routine' | 'distress' | 'sync_warning' | 'clinical_reminder';
  severity: 'info' | 'warning' | 'urgent';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  relatedEntityId?: string;
}
```

---

## 3. State Lifecycle & Synchronization Strategy

The system utilizes an optimistic, offline-first state pipeline:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        STATE LIFECYCLE PIPELINE                        │
│                                                                        │
│  [Step 1: Local In-Memory Mutation]                                    │
│  • Patient or caregiver taps an interactive element.                  │
│  • useCareStore updates React state immediately (0ms UI latency).      │
│                                                                        │
│  [Step 2: LocalStorage Serialization]                                  │
│  • Subscriber serializes modified domain state to browser storage.     │
│  • Ensures instant recovery if user refreshes or closes browser.       │
│                                                                        │
│  [Step 3: Outbox Queue Staging]                                        │
│  • An OutboxItem is generated with a unique ID and ISO timestamp.      │
│  • Staged in state.outbox array.                                       │
│                                                                        │
│  [Step 4: Network Dispatch / Cloud Sync]                               │
│  • If navigator.onLine is true AND Force Offline is disabled:          │
│    Outbox items batch-commit to Firestore; outbox clears on success.   │
│  • If offline: Outbox items remain safely stored until next reconnect. │
└────────────────────────────────────────────────────────────────────────┘
```

### Conflict Resolution Rules
- **Caregiver-Authoritative Plans**: If two devices edit a Care Plan simultaneously, the caregiver's explicit **"Publish Plan"** action with the highest monotonic version number is authoritative.
- **Patient Logs Append-Only**: Activity sessions, comfort ratings, and help requests are immutable event streams (`activitySessions`, `reminderEvents`). No historical event is ever overwritten; they append linearly.
- **No Complex CRDT Required**: Simple timestamped Last-Write-Wins (LWW) and append-only event logs eliminate the overhead of distributed CRDT libraries.
