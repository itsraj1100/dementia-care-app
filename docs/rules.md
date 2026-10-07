# Connected Care Loop — Operational Rules & Safety Guardrails

**Product**: Connected Care Loop: Dementia-Friendly Cognitive Adaptation & Family Care Orchestration  
**Status**: Authoritative Rules Baseline  
**Revision Date**: October 2026  

---

## 1. Non-Negotiable Clinical & Safety Guardrails

Because Connected Care Loop is designed for vulnerable individuals living with cognitive impairment or dementia and their family caregivers, strict ethical and safety rules govern every interaction:

### 1.1 Non-Diagnostic Disclaimer
- All caregiver-facing metrics, trends, and cognitive observation screens (**C-03**, **C-06**) must display an explicit, unremovable disclaimer:  
  > *"This information supports your daily care observations and is not a medical diagnosis. Consult healthcare professionals for clinical assessments."*
- The software must never label a patient with clinical stages (e.g., "Moderate Stage Alzheimer's", "Severe Decline") or assign diagnostic risk scores.

### 1.2 Medication Safety Boundary
- Caregivers may schedule routine medication reminders (e.g., "Morning Heart Pill", "Amlodipine") to prompt the patient to take their prescribed medication.
- **Strict Prohibition**: The Care Plan Editor (**C-05**) strictly scans and rejects dosage numbers, titration instructions, and clinical pill counts (e.g., "5mg", "10 ml", "take 2 tablets").
- If a dosage pattern is entered, the form displays:  
  > *"For safety, specific dosages cannot be modified here. Consult Dr. Borah or your physician."*

### 1.3 Crisis & Emergency Protocol
- The system is an assistive daily routine organizer, **not an emergency call system or life-support device**.
- The Knowledge Guide (**C-08**) features an immovable top banner directing immediate escalation to national emergency services (`tel:112`) for sudden physical trauma, chest pain, unresponsiveness, or severe acute agitation.
- If the patient activates the Patient Help button (**P-08**), an immediate high-priority reassurance card is logged on the caregiver's dashboard, accompanied by gentle audio reassurance on the patient's tablet.

---

## 2. Patient Mode Interaction Rules (Anti-Agitation Ergonomics)

The patient experience (**P-01 to P-09**) is designed specifically around the sensory and cognitive capabilities of an elderly person living with memory loss:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PATIENT INTERACTION RULES                       │
│                                                                        │
│  [RULE-P01: Tap-Only Interface]                                        │
│  • Strictly tap-only navigation. No double-taps, drags, or pinches.   │
│  • Minimum touch target: 56px x 56px (preferred 64px+).                │
│                                                                        │
│  [RULE-P02: Zero-Score Discipline]                                     │
│  • NO percentages, scores, points, leaderboards, or timer countdowns. │
│  • Activities conclude with celebration ("বৰ ধুনীয়া! Wonderful!").     │
│                                                                        │
│  [RULE-P03: Non-Punitive Feedback]                                     │
│  • Incorrect choices produce zero buzzers, red X marks, or alarms.     │
│  • Gentle supportive audio: "কোনো কথা নাই আইতা (Take your time)".      │
│                                                                        │
│  [RULE-P04: Audio Pre-Cueing & Dual Sensory Channel]                   │
│  • 1.8s breath pulse halo + signature acoustic chime before task.      │
│  • All instructions visible in high contrast AND spoken in Assamese.   │
│                                                                        │
│  [RULE-P05: Ubiquitous Help Reachability]                              │
│  • Floating or fixed Help button reachable on every patient screen.    │
└────────────────────────────────────────────────────────────────────────┘
```

1. **RULE-P01 (Tap-Only Interaction)**:
   - All gestures are simple single taps.
   - Drag-and-drop, sliders, swiping carousels, and complex scrolling are forbidden in Patient Mode.
   - In Routine Order (**P-05**), steps are moved via large direct tap buttons (Up/Down arrows or slot selection), never drag-to-reorder.

2. **RULE-P02 (Zero-Score Discipline)**:
   - No scores, grades, completion percentages, or performance comparisons may ever be displayed in Patient Mode.
   - Cognitive activities are therapeutic engagement moments, not examinations.
   - At the end of every activity session, the patient is presented with sincere appreciation and routed to the 3-face Comfort Check (**P-07**).

3. **RULE-P03 (Calm Guidance on Missteps)**:
   - When a patient selects an incorrect option in Object Match (**P-06**) or Photo Recall (**P-04**), the system must never produce buzzer sounds, vibration shakes, or red failure indicators.
   - Instead, the card softly dims and warm audio plays: *"কোনো কথা নাই আইতা, ফটোখনত মৰমৰ নাতিৰ হাঁহিটো চাওঁক (No problem Aita, look closely at your loving grandchild's smile)"*.

4. **RULE-P04 (Dual Sensory Channels & Audio Pre-Cueing)**:
   - Every patient screen provides both a large high-contrast visual cue and spoken voice narration in Assamese and English.
   - Each activity begins with an automatic $1.8$-second visual breath-pulse halo paired with a signature Web Audio acoustic chime to prepare cognitive attention before the question cards appear.

5. **RULE-P05 (Help Always Reachable)**:
   - The large green Help button (**P-08**) is persistently visible on the Home Screen, Reminder Prompts, and Activity Hub. It can be tapped with a single hand without navigation depth.

---

## 3. Caregiver Mode Interaction & Orchestration Rules

Caregivers operate in a high-density, multi-tasking environment where clarity, explainability, and peace of mind are paramount:

1. **RULE-C01 (Draft vs. Published Distinction)**:
   - Any modifications made to the Care Plan (**C-04**, **C-05**) remain in a local `draft` state marked by an orange review banner.
   - Changes do not take effect on the patient's tablet until the caregiver explicitly clicks **"Publish Changes"**, which increments the plan version and creates a clean audit snapshot.

2. **RULE-C02 (Explainable Suggestions & Caregiver Authority)**:
   - All system-generated adaptation suggestions (**C-06**, **C-07**) must provide human-readable justification (e.g., *"MAINTAIN Level 1 · High prompt dependence (8.2 hints/round) across past 7 days"*).
   - Suggestions are never applied silently or automatically.
   - The caregiver retains complete authority to accept, decline, or **"Lock at this level"**, preventing automated adjustments until unlocked.

3. **RULE-C03 (Accredited Guidance & Non-Prescriptive Advice)**:
   - Articles in the Caregiver Knowledge Guide (**C-08**) must carry verifiable SourceBadges (e.g., *"WHO Dementia Care Guidelines"*, *"Alzheimer's Society Best Practices"*).
   - Guidance provides behavioral de-escalation tips (validation therapy, redirection, lighting), never pharmacological recommendations.

---

## 4. Intelligence Rules (AI-1, AI-2, AI-3, AI-5)

To guarantee 100% deterministic safety in health-adjacent software, intelligence features are partitioned into four strict engines:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        INTELLIGENCE ENGINE RULES                       │
│                                                                        │
│  [AI-1: Adaptation Engine]                                             │
│  • Pure TypeScript heuristics in src/domain/adaptation/                │
│  • Inputs: 7-day completion rate, hints per session, comfort score    │
│  • Output: Level 1 (2 options), Level 2 (3 options), Level 3 (4 options│
│  • Locked flag overrides all algorithmic calculations.                 │
│                                                                        │
│  [AI-2: Curated Guidance Retrieval]                                    │
│  • Static, verified evidence catalog in src/data/activities.ts         │
│  • Keyword / tag search. Zero generative text for medical guidance.    │
│                                                                        │
│  [AI-3: Weekly Summary Synthesizer]                                    │
│  • Base: Deterministic template computing true mathematical stats.     │
│  • Polish: Optional server-side Gemini 2.5 Flash via /api/summary      │
│  • Guardrail: Server validator checks for hallucinated medications or  │
│    contradictory percentages before returning response.                │
│                                                                        │
│  [AI-5: Deterministic Alerts]                                          │
│  • Pure threshold checks in src/domain/alerts/                         │
│  • 2+ missed hydration prompts = Amber Alert                           │
│  • Patient help tap = High Priority Red Alert                          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Firebase Security Rules Strategy

When Cloud Firestore is connected, the following security rules enforce strict circle-based multi-tenancy:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function: Check if user is a member of the Care Circle
    function isCircleMember(circleId) {
      return request.auth != null && 
        exists(/databases/$(database)/documents/careCircles/$(circleId)/members/$(request.auth.uid));
    }

    // Care Circles: Only members can read/write their circle
    match /careCircles/{circleId} {
      allow read, write: if isCircleMember(circleId);
      
      // Subcollections inherit circle authorization
      match /{subcollection}/{document=**} {
        allow read, write: if isCircleMember(circleId);
      }
    }

    // User profiles: Users can only read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Default deny for all other collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```
