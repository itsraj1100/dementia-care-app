# Connected Care Loop — Web Hackathon Task Roadmap

**Product**: Connected Care Loop: Dementia-Friendly Cognitive Adaptation & Family Care Orchestration  
**Status**: Authoritative Execution Roadmap  
**Revision Date**: October 2026  

---

## Roadmap Overview

This task breakdown guides the incremental evolution of Connected Care Loop from the current high-fidelity React 19 frontend prototype to a fully cloud-backed, Gemini-enhanced hackathon submission.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DEVELOPMENT ROADMAP PHASES                      │
│                                                                        │
│  [PHASE 1: Domain Purity & Dynamic UI Bindings]                        │
│  • Task 01: Pure TypeScript Domain Extraction (AI-1, AI-5)             │
│  • Task 02: Dynamic Level Adaptation in Object Match (P-06)            │
│  • Task 03: Dynamic Memory Bank Integration in Photo Recall (P-04)     │
│                                                                        │
│  [PHASE 2: Server-Side AI Intelligence (Gemini 2.5 Flash)]             │
│  • Task 04: Express AI Proxy & Weekly Summary Polishing (AI-3)         │
│                                                                        │
│  [PHASE 3: Cloud Firestore & Firebase Auth Persistence]                │
│  • Task 05: Firestore Service Layer & Outbox Syncer                    │
│  • Task 06: Firebase Auth & Multi-Tenant Circle Rules                  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Task Specifications

### TASK-01: Pure TypeScript Domain Extraction
- **Task ID**: `TASK-01`
- **Title**: Extract Domain Logic into Pure TypeScript Modules
- **Priority**: P0 (Architectural Foundation)
- **Depends On**: None (Builds on existing code)
- **Affected Screens**: C-06 Observe, C-07 Adaptation Sheet
- **Affected Files**:
  - `src/domain/adaptation/adaptationEngine.ts` (New)
  - `src/domain/alerts/alertRules.ts` (New)
  - `src/store/careStore.ts`
- **Current State**: Algorithmic rules are embedded directly inside `careStore.ts`.
- **Required Implementation**:
  - Create `src/domain/adaptation/adaptationEngine.ts` with pure function `evaluateActivityAdaptation(history: ActivitySession[], currentConfig: ActivityConfig): AdaptationRecommendation`.
  - Create `src/domain/alerts/alertRules.ts` with pure function `evaluateCaregiverAlerts(events: ReminderEvent[], helpLogs: HelpEvent[]): CaregiverAlert[]`.
  - Refactor `careStore.ts` to call these pure functions without changing any state shape or UI behavior.
- **Acceptance Criteria**:
  - Adaptation suggestions and alert evaluations produce identical outputs.
  - Zero UI regressions; `npm run build` succeeds.
- **Validation**: Verify C-06 Observe screen displays identical metric cards and explanation suggestions.

---

### TASK-02: Dynamic Level Adaptation in Object Match (P-06)
- **Task ID**: `TASK-02`
- **Title**: Bind Activity Configuration Level to Candidate Grid Size
- **Priority**: P0 (Core Demo Feature)
- **Depends On**: None
- **Affected Screens**: P-06 Familiar Object Match (`/patient/activity/object-match`)
- **Affected Files**:
  - `src/components/ObjectMatchScreen.tsx`
  - `src/store/careStore.ts`
- **Current State**: Always renders 4 options regardless of whether the activity is set to Level 1, 2, or 3.
- **Required Implementation**:
  - In `ObjectMatchScreen.tsx`, read `state.activityConfigs['object-match'].currentLevel`.
  - Dynamically adjust the options array:
    - **Level 1**: Show 2 options (1 correct target + 1 distractor).
    - **Level 2**: Show 3 options (1 correct target + 2 distractors).
    - **Level 3**: Show 4 options (1 correct target + 3 distractors in a 2x2 grid).
- **Acceptance Criteria**:
  - When caregiver selects Level 1 in C-07 and locks it, P-06 immediately displays exactly 2 large touch cards.
  - When set to Level 3, it displays 4 cards.
- **Validation**: Open Caregiver Mode $\rightarrow$ Observe $\rightarrow$ Change Object Match to Level 1 $\rightarrow$ Switch to Patient Mode $\rightarrow$ Open Object Match $\rightarrow$ Confirm 2 choices appear.

---

### TASK-03: Dynamic Family Memory Integration in Photo Recall (P-04)
- **Task ID**: `TASK-03`
- **Title**: Dynamically Link Photo Recall to Family Memory Bank
- **Priority**: P1 (Dementia Personalization)
- **Depends On**: None
- **Affected Screens**: P-04 Photo Recall (`/patient/activity/photo-recall`), C-09 Family Memory Gallery
- **Affected Files**:
  - `src/components/PhotoRecallScreen.tsx`
  - `src/store/careStore.ts`
- **Current State**: P-04 uses a static hardcoded array of photo cards.
- **Required Implementation**:
  - In `PhotoRecallScreen.tsx`, filter memories from `state.memories` where `eligibleForPhotoRecall: true`.
  - Use the active memory's image, Assamese title, and relationship name as the correct candidate, with other family memories as distractors.
- **Acceptance Criteria**:
  - Adding a new photo in C-10 Memory Editor automatically makes it appear as an active choice in P-04 Photo Recall.
- **Validation**: Add a new family photo in Caregiver Mode $\rightarrow$ Open Photo Recall in Patient Mode $\rightarrow$ Verify the new photo is included.

---

### TASK-04: Server-Side Gemini API Proxy & Weekly Summary Polishing (AI-3)
- **Task ID**: `TASK-04`
- **Title**: Implement Server-Side Gemini 2.5 Flash Weekly Summary Narrative
- **Priority**: P1 (AI Intelligence Capability)
- **Depends On**: TASK-01
- **Affected Screens**: C-11 Weekly Summary Modal
- **Affected Files**:
  - `server/server.ts`
  - `server/routes/ai.ts`
  - `server/ai/geminiService.ts`
  - `src/components/caregiver/WeeklySummaryModal.tsx`
- **Current State**: C-11 Weekly Summary displays a static pre-formatted markdown template.
- **Required Implementation**:
  - Create a Node.js Express server route `POST /api/summary/polish` that takes the 7-day numerical metrics.
  - Call Gemini 2.5 Flash via `@google/genai` on the server using `process.env.GEMINI_API_KEY`.
  - Pass a strict system prompt instructing the model to generate a supportive, 3-paragraph caregiver review without inventing medical prescriptions or clinical diagnoses.
  - Implement a validator checking that all percentages match the input metrics before responding.
  - Add a **"Synthesize with Gemini"** button in `WeeklySummaryModal.tsx`.
- **Acceptance Criteria**:
  - Clicking the button produces empathetic narrative prose incorporating exact true stats.
  - If server is unreachable or API key is absent, gracefully falls back to the deterministic template.
  - Zero API keys exposed to browser client bundle.
- **Validation**: Trigger summary generation, verify network request to `/api/summary/polish`, and verify rendered text.

---

### TASK-05: Cloud Firestore Repository & Outbox Synchronizer
- **Task ID**: `TASK-05`
- **Title**: Provision Firestore Database & Connect Outbox Sync Service
- **Priority**: P0 (Cloud Persistence)
- **Depends On**: TASK-01
- **Affected Screens**: C-12 Sync & Conflicts Modal
- **Affected Files**:
  - `src/services/firebase/firebaseClient.ts`
  - `src/services/sync/syncManager.ts`
  - `src/store/careStore.ts`
- **Current State**: Outbox queue is simulated purely in `localStorage`.
- **Required Implementation**:
  - Set up Firestore collections (`careCircles/{circleId}/...`).
  - Implement `syncManager.ts` to listen for network online status and batch-commit pending `outbox` items.
  - Update `C-12 SyncModal` to display actual live Firestore synchronization status.
- **Acceptance Criteria**:
  - Completing an activity offline queues the session; switching offline mode off syncs the record to Firestore within 3 seconds.
- **Validation**: Check Firestore console or network tab to confirm batch writes upon reconnect.

---

### TASK-06: Firebase Authentication & Care Circle Security Rules
- **Task ID**: `TASK-06`
- **Title**: Connect Firebase Auth & Deploy Security Rules
- **Priority**: P1 (Multi-Device Security)
- **Depends On**: TASK-05
- **Affected Screens**: C-01 Login / Register, M-01 Mode Gate
- **Affected Files**:
  - `firestore.rules`
  - `src/components/caregiver/CaregiverLogin.tsx` (New)
  - `src/services/firebase/authService.ts`
- **Current State**: Caregiver access is authenticated purely via client-side PIN `1234`.
- **Required Implementation**:
  - Implement optional caregiver login with email/password or anonymous credentials.
  - Deploy `firestore.rules` enforcing circle membership checks on read and write.
  - Preserve M-01 Mode Gate PIN for in-household single-tablet switching.
- **Acceptance Criteria**:
  - Authenticated caregivers can only read and write data belonging to their own `circleId`.
- **Validation**: Execute Firestore security rules unit tests; verify unauthorized cross-circle reads are rejected.
