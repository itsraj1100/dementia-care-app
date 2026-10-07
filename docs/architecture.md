# Connected Care Loop — System Architecture Specification

**Product**: Connected Care Loop: Dementia-Friendly Cognitive Adaptation & Family Care Orchestration  
**Status**: Active Architecture Baseline  
**Revision Date**: October 2026  

---

## WEB-HACKATHON-ARCHITECTURE

This document defines the **Web-First Hackathon Architecture** for Connected Care Loop. This architecture formally supersedes all prior multi-platform, native mobile (Flutter/Riverpod/sqflite), and legacy enterprise backend (MySQL/Prisma/Docker/Kubernetes/Redis) concepts for this prototype.

The system is architected as a high-fidelity, responsive web application optimized for a household touchscreen tablet (Patient Mode) and caregiver desktop/mobile browser (Caregiver Mode), with offline-first local persistence and server-side Google AI Studio capabilities.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER (Vite + React 19)                  │
│                                                                        │
│  ┌───────────────────────────────┐  ┌───────────────────────────────┐  │
│  │     Patient Mode (Aita)       │  │     Caregiver Mode (Ananya)   │  │
│  │  • P-01 to P-09 UI Screens    │  │  • C-02 to C-13 UI Screens    │  │
│  │  • Tap-only, 56px+ targets    │  │  • Dashboard, Plan, Observe   │  │
│  │  • Zero-score cognitive loop  │  │  • Adaptation Sheet, Family   │  │
│  │  • Web Audio harmonic chimes  │  │  • Settings & Demo Simulation │  │
│  │  • Web Speech bilingual voice │  │  • Mode Gate (M-01 PIN 1234)  │  │
│  └───────────────┬───────────────┘  └───────────────┬───────────────┘  │
│                  │                                  │                  │
│                  ▼                                  ▼                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │               Client State & Local Storage Layer                 │  │
│  │  • useCareStore reactive subscriber hook                         │  │
│  │  • localStorage structured persistence (instant hydration)       │  │
│  │  • Local Outbox Mutation Queue (syncOps, offline-first)          │  │
│  │  • Force-Offline demo simulation override                        │  │
│  └───────────────────────────────┬──────────────────────────────────┘  │
└──────────────────────────────────┼─────────────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
   ┌────────────────────────────────┐   ┌────────────────────────────────┐
   │    PERSISTENCE LAYER           │   │    BACKEND & AI LAYER          │
   │    (Firebase Platform)         │   │    (Server-Side Node.js / AI)  │
   │                                │   │                                │
   │  • Cloud Firestore             │   │  • AI Studio Node.js Express   │
   │    (Circle-scoped collections) │   │    Server (server.ts /api/*)   │
   │  • Firebase Authentication     │   │  • Gemini 2.5 Flash Proxy      │
   │    (Caregiver credentials)     │   │    (Private GEMINI_API_KEY)    │
   │  • Firebase Storage            │   │  • Deterministic Validators    │
   │    (Family memory photos)      │   │  • Zero client-side API keys   │
   └────────────────────────────────┘   └────────────────────────────────┘
```

---

## 1. Technology Stack Decisions

### 1.1 Frontend
- **Framework**: React 19 SPA (Single Page Application).
- **Language**: TypeScript (strict compiler settings, `noImplicitAny`).
- **Build Tooling**: Vite 8.
- **Styling**: Tailwind CSS v4 (`@import "tailwindcss"` in `src/index.css`), responsive layouts, mobile-tablet-first touch targets.
- **Iconography**: Lucide React.
- **Audio Synthesizer**: Procedural Web Audio API for harmonic sine/triangle chimes (Object Match singing bowl, Photo Recall bell chord, Routine Order hearth chime, Music Moment bamboo flute).
- **Speech Engine**: Browser Web Speech API (`SpeechSynthesisUtterance`) with dementia-appropriate cadence ($0.82\times$ rate).

### 1.2 State & Storage
- **Primary State**: `src/store/careStore.ts` using reactive React subscriber pattern with optimistic local updates.
- **Client Persistence**: Browser `localStorage` for immediate hydration of profiles, care plans, metrics, memories, and outbox mutations.
- **Binary Media**: IndexedDB / Firebase Storage for memory bank images.

### 1.3 Persistence (Firebase replaces MySQL)
- **Cloud Firestore**: Document database partitioned by `careCircles/{circleId}` with subcollections for `planItems`, `activitySessions`, `memoryItems`, `alerts`, and `adaptationDecisions`.
- **Firebase Authentication**: Caregiver identity (email/password or anonymous demo credentials).
- **Firebase Storage**: Family photos and memory media.
- **Firebase Security Rules**: Role-based access control ensuring caregivers can only access their designated Care Circle.

### 1.4 Backend Runtime
- **Server Environment**: Google AI Studio Node.js runtime (`server.ts` running Express).
- **Purpose**: Server-side proxying for Gemini AI APIs where `GEMINI_API_KEY` must remain strictly private and never exposed to the client bundle.
- **Client-to-Server Communication**: Clean `/api/*` REST endpoints.

---

## 2. Prohibited Technologies & Architectures

The following technologies from prior theoretical iterations are **explicitly prohibited and omitted**:

| Removed / Prohibited Technology | Replacement in Web Hackathon Architecture | Rationale |
|---|---|---|
| **MySQL / Postgres / Prisma** | Cloud Firestore + `localStorage` | Cloud Firestore provides near-instant document synchronization, circle scoping, and offline caching without heavy relational migrations. |
| **Docker / Kubernetes** | Standard Vite + Node.js runtime | AI Studio provides native containerized Node execution on port 3000. |
| **Flutter / Riverpod / sqflite** | React 19 + TypeScript + Vite | Unified web stack runs directly on tablet and desktop browsers with zero compilation bridges. |
| **Custom JWT Service** | Firebase Authentication + Mode Gate PIN | Built-in secure authentication without rolling custom crypto or session servers. |
| **CRDT (Yjs / Automerge)** | Caregiver-Authoritative Outbox Sync | Care plans are caregiver-authoritative; simple timestamped outbox operations eliminate complex distributed conflict resolution. |
| **Redis / BullMQ** | In-memory outbox + client timers | Background queues add unnecessary infrastructure dependencies for a prototype. |
| **Vector DBs / Custom ML** | Deterministic TypeScript heuristics | Clinical predictability and explainability are paramount in dementia care; rule-based heuristics ensure 100% predictable suggestions. |

---

## 3. Intelligence Architecture (AI Rules)

All algorithmic and intelligent features follow strict safety and determinism boundaries:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        INTELLIGENCE ARCHITECTURE                       │
│                                                                        │
│  ┌───────────────────────────────┐  ┌───────────────────────────────┐  │
│  │ AI-1: Adaptation Engine       │  │ AI-2: Knowledge Retrieval     │  │
│  │ • Deterministic TypeScript    │  │ • Pre-curated guideline cards │  │
│  │ • Evaluates prompt dependency │  │ • WHO / Alzheimer's Society   │  │
│  │ • Generates explainable badge │  │ • Deterministic keyword match │  │
│  │ • Caregiver level lock        │  │ • Immovable 112 emergency card│  │
│  └───────────────────────────────┘  └───────────────────────────────┘  │
│                                                                        │
│  ┌───────────────────────────────┐  ┌───────────────────────────────┐  │
│  │ AI-3: Weekly Summary Engine   │  │ AI-5: Alert & Safety Engine   │  │
│  │ • Deterministic data template │  │ • Deterministic event rules   │  │
│  │ • Optional Gemini 2.5 Flash   │  │ • 2+ missed routines = alert  │  │
│  │   polishing via server route  │  │ • Help button = instant alert │  │
│  │ • Strict validator rejects any│  │ • Medication dosage blocking │  │
│  │   hallucinated medical advice │  │ • Non-clinical disclaimers    │  │
│  └───────────────────────────────┘  └───────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

1. **AI-1 (Algorithmic Activity Adaptation)**:
   - **Engine**: Pure deterministic TypeScript (`src/domain/adaptation/adaptationEngine.ts`).
   - **Behavior**: Evaluates 7-day rolling window of activity completion, prompt dependence (hints/round), and comfort ratings.
   - **Output**: Explainable suggestion chips (*"MAINTAIN Level 1"*, *"ADVANCE to Level 2"*, *"SIMPLIFY to Level 1"*) with human-readable rationale.
   - **Control**: Caregiver maintains ultimate override and can lock any activity to a specific level via the Adaptation Sheet (C-07).
   - **No Black-Box ML**: Zero unexplainable neural models.

2. **AI-2 (Caregiver Knowledge Retrieval)**:
   - **Engine**: Curated evidence-based guidance library (`src/data/activities.ts`).
   - **Behavior**: Deterministic tag/keyword matching for caregiver questions on sun-downing, communication, and mealtime agitation.
   - **Safety Boundary**: All cards display accredited SourceBadges (WHO, Alzheimer's Society). Fixed emergency card automatically surfaced for crisis terms.
   - **No Generative Medical Advice**: LLMs are strictly prohibited from prescribing treatments or diagnosing symptoms.

3. **AI-3 (Weekly Caregiver Summary Digest)**:
   - **Engine**: Hybrid deterministic template + optional Gemini 2.5 Flash polishing.
   - **Behavior**: Computes exact statistics (completion %, hint rate, comfort distribution) into a structured markdown digest.
   - **Optional AI Polish**: Caregiver can tap "Synthesize with Gemini" to produce warm, empathetic narrative prose through a server-side proxy (`/api/summary/polish`).
   - **Validation**: Strict server-side validator parses the output to guarantee zero hallucinated data or medical prescriptions before returning to the UI.

4. **AI-5 (Clinical Safety & Escalation Rules)**:
   - **Engine**: Deterministic event filters.
   - **Behavior**:
     - $\ge 2$ consecutive missed hydration or medication reminders $\rightarrow$ Warning alert.
     - Patient taps Help button (P-08) $\rightarrow$ Immediate priority alert logged to Caregiver Home (C-03).
     - Plan editor blocks any attempt to input specific dosage numbers (e.g. "5mg", "take 2 pills") and instructs the caregiver to consult the physician.

---

## 4. Web Offline Strategy & Synchronization

The system strictly enforces an **offline-first paradigm** to guarantee that patient-facing interactions never stutter, freeze, or fail due to network instability:

1. **Patient Mode Zero Network Dependency**:
   - All assets, procedural chimes, speech templates, questions, and daily routine schedules are cached locally.
   - Patient actions (completing a routine, answering an activity, rating comfort, requesting help) write immediately to local state and the `outbox` queue.

2. **Sync Outbox Lifecycle**:
   $$\text{Patient Action} \longrightarrow \text{Optimistic Local Update} \longrightarrow \text{Outbox Mutation Item} \longrightarrow \text{Background Flush to Firestore}$$
   - When online, the outbox flushes pending operations to Firestore via batched writes.
   - When offline, mutations accumulate safely in `localStorage`.

3. **Force-Offline Simulation Control**:
   - Caregiver Settings (C-13) and Sync Modal (C-12) include a **"Simulate Offline Mode"** switch.
   - This toggle overrides the browser's `navigator.onLine` status, forcing all network requests into the outbox so offline resilience can be demonstrated reliably during presentations.

4. **Web Reminder Strategy**:
   - Because web browsers cannot guarantee Android native `AlarmManager` wakeups when closed, web reminders are handled via:
     1. Foreground reactive scheduling while the app is active on the kiosk tablet.
     2. Standard Web Notification API when supported and permitted.
     3. Deterministic **"Fire Next Reminder"** simulation trigger on Caregiver Home (C-03) and Settings (C-13) for demo reliability.

---

## 5. Simplified vs. Unchanged Requirements

| Specification Area | Original Mobile/Enterprise Spec | Web Hackathon Specification | Rationale for Simplification | Impact on User Experience |
|---|---|---|---|---|
| **Platform Target** | Native Android tablet app + Flutter caregiver app | Responsive React 19 Web SPA | Eliminates dual-codebase maintenance; allows tablet kiosk and caregiver phone on single build. | Identical visual design and touch-friendly interface. |
| **Database** | MySQL / Prisma ORM | Cloud Firestore + `localStorage` | Serverless document storage natively supports offline caching, real-time listeners, and circle partitioning. | Faster setup, zero database migrations required. |
| **Authentication** | OAuth2 / Custom JWT Auth | Mode Gate PIN (`1234`) + Firebase Auth | Focuses on household tablet kiosk where Aita uses the screen and Ananya unlocks via PIN. | Seamless switching between Aita and Ananya on one device. |
| **Reminders** | Android Exact Alarm Manager | Foreground timers + Web Notifications + Demo Trigger | Web sandbox cannot wake backgrounded tablets without native OS wrappers. | 100% reliable for live demonstrations via instant test triggers. |
| **Adaptation Engine** | Complex multi-variate statistical model | Deterministic TypeScript rule engine | Eliminates unpredictable edge cases; provides 100% explainable reasons to caregivers. | Higher trust for caregivers; zero black-box confusion. |
| **Activity Gameplay** | Procedural 3D / complex physics | Clean 2D illustrated tap-only cards | Dementia patients experience disorientation from fast moving 3D graphics; 2D cards reduce cognitive agitation. | Calmer, accessible, dementia-ergonomic interaction. |

---

## 6. Target Code Organization

The codebase is evolving into the following structured directory layout:

```
src/
├── components/
│   ├── patient/            # P-01 to P-09 Patient-facing screens & overlays
│   │   ├── PatientHome.tsx
│   │   ├── ReminderPrompt.tsx
│   │   ├── ActivityHub.tsx
│   │   ├── CognitivePrepOverlay.tsx
│   │   ├── ComfortCheck.tsx
│   │   ├── PatientHelp.tsx
│   │   ├── MusicMoment.tsx
│   │   ├── PatientTopBar.tsx
│   │   └── ModeGate.tsx
│   ├── caregiver/          # C-02 to C-13 Caregiver dashboard, planning & review
│   │   ├── CaregiverHome.tsx
│   │   ├── CaregiverTopBar.tsx
│   │   ├── CaregiverBottomNav.tsx
│   │   ├── PlanScreen.tsx
│   │   ├── PlanItemEditorModal.tsx
│   │   ├── ObserveScreen.tsx
│   │   ├── AdaptationSheet.tsx
│   │   ├── GuideScreen.tsx
│   │   ├── FamilyScreen.tsx
│   │   ├── MemoryEditorModal.tsx
│   │   ├── WeeklySummaryModal.tsx
│   │   ├── SyncModal.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── SetupWizardModal.tsx
│   └── shared/             # Common UI primitives
│       ├── Toast.tsx
│       └── Dialog.tsx
├── domain/                 # Pure TypeScript business logic (zero React dependencies)
│   ├── adaptation/         # AI-1 rule engine and level calculators
│   │   └── adaptationEngine.ts
│   ├── alerts/             # AI-5 threshold evaluators
│   │   └── alertRules.ts
│   ├── guidance/           # AI-2 evidence-based guidance catalog
│   │   └── guidanceCatalog.ts
│   └── summaries/          # AI-3 deterministic digest generators
│       └── summaryTemplate.ts
├── services/               # External boundaries & integrations
│   ├── firebase/           # Firestore & Auth initializers
│   │   └── firebaseClient.ts
│   ├── repository/         # Data access interfaces
│   │   └── careRepository.ts
│   ├── sync/               # Outbox flush and network listener
│   │   └── syncManager.ts
│   └── ai/                 # Client client for server-side AI endpoints
│       └── aiServiceClient.ts
├── store/                  # State management
│   └── careStore.ts        # Central reactive state subscriber
├── data/                   # Pre-seeded dementia care questions & demo data
│   └── activities.ts
├── utils/                  # Procedural audio synthesis & speech utilities
│   └── audio.ts
├── server/                 # Server-side runtime (Node.js / Express)
│   ├── server.ts           # Express application entry point
│   ├── routes/
│   │   └── ai.ts           # Gemini proxy endpoints (/api/summary/polish)
│   └── ai/
│       └── geminiService.ts # Private GEMINI_API_KEY integration
└── types.ts                # Domain models, routes, enums & entity interfaces
```
