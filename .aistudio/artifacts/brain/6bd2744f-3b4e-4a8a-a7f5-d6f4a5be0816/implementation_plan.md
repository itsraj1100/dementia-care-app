# Cognitive Audio Chime Cues & Preparatory Breath Pulse Implementation Plan

A targeted sensory enhancement designed for dementia care ergonomics, introducing **activity-specific harmonic audio cues** and a **gentle visual breath-pulse transition** before each activity commences. This settles sensory overload and prepares the patient's cognitive focus in a calm, non-demanding manner.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Based on your confirmed choices in Phase 1:

- **Confirmed Decision 1 (Distinct Melodic Harmonics)**: Each of the 4 cognitive activities will feature its own signature Web Audio synthesized harmonic cue:
  1. **বস্তুৰ মিল / Familiar Object Match**: Traditional Assamese bell-metal (*Kahi Bati*) singing bowl tone with metallic resonance ($392\,\text{Hz} \rightarrow 587\,\text{Hz}$ overtone and soft reverberation).
  2. **ঘৰৰ স্মৃতি / Photo Recall**: Uplifting familial bell chime ($523\,\text{Hz} \rightarrow 659\,\text{Hz} \rightarrow 784\,\text{Hz}$ ascending triad), conveying warmth and affectionate recognition.
  3. **দৈনন্দিন নিয়ম / Routine Order**: Rhythmic copper hearth chime ($440\,\text{Hz} \rightarrow 554\,\text{Hz}$ resonant dual-sine), preparing sequential logic without pressure.
  4. **সংগীতৰ পল / Music Moment**: Soothing bamboo flute overtone with subtle vibrato ($659\,\text{Hz}$ to $493\,\text{Hz}$ downward slide), invoking peaceful Namghor serenity.
- **Confirmed Decision 2 (Preparatory Transition Overlay)**: When an activity is selected, a brief $1.8$-second serene breathing overlay (*"মন শান্ত কৰক · Take a calm breath"*) displays with a slow radial expanding halo before revealing the question cards.
- **Confirmed Decision 3 (Acoustic Pacing)**: The preparatory chime plays on entry during the breath expansion; the spoken bilingual voice instruction begins smoothly $400\,\text{ms}$ after the overlay dissolves, preventing auditory collision.

---

## 1. Technical Architecture & Synthesis Engine

```
                          Activity Hub (P-03)
                                  │ (User taps activity tile)
                                  ▼
                    ┌────────────────────────────┐
                    │    CognitivePrepOverlay    │
                    │  • 1.8s Gentle Breath Halo │
                    │  • "মন শান্ত কৰক" Subtitle │
                    └─────────────┬──────────────┘
                                  │
                  ┌───────────────┴───────────────┐
                  ▼                               ▼
       [Web Audio Synthesizer]          [Visual Breath Pulse]
       • Activity-specific harmonic     • 60fps soft CSS scale (0.9 -> 1.15)
       • Pure sine waves + soft decay   • Sage & Deep Teal soothing ring
                  │                               │
                  └───────────────┬───────────────┘
                                  ▼ (1.8s completes)
                     Active Activity Screen
              (Photo Recall / Routine Order / Object Match)
                                  │
                                  ▼ (+400ms delay)
                     Spoken Voice Instruction
```

### 1.1 Synthesizer Enhancements in `src/utils/audio.ts`
- Implement 4 dedicated synthesis methods with zero external audio assets:
  - `playObjectMatchCue()`: Resonant bell-metal bowl sound with high Q bandpass filter and slow exponential decay.
  - `playPhotoRecallCue()`: Triad harmonic arpeggio (C5-E5-G5) with crystalline sine envelope.
  - `playRoutineOrderCue()`: Dual-tone warm hearth chime (A4-C#5) with mellow attack.
  - `playMusicMomentCue()`: Smooth flute overtone slide with LFO vibrato.

### 1.2 Dedicated `CognitivePrepOverlay` Component
- Located in `src/components/patient/CognitivePrepOverlay.tsx`.
- Visual features:
  - Full-screen soft scrim (`bg-[#FBF9F5]/95 dark:bg-[#0f172a]/95`).
  - Expanding concentric rings animating in a slow 4-second breath cycle.
  - Reassuring bilingual typography:
    - *"মন শান্ত কৰক"* (Calm your mind)
    - *"Take a gentle breath · আপোনাৰ নিজৰ গতিত"*
  - Non-blocking skip button in case the caregiver or elder wants to jump in immediately.

### 1.3 Integration Points
- `src/components/ObjectMatchScreen.tsx`: Mounts prep overlay on question 1; plays `playObjectMatchCue()`.
- `src/components/PhotoRecallScreen.tsx`: Mounts prep overlay on session start; plays `playPhotoRecallCue()`.
- `src/components/RoutineOrderScreen.tsx`: Mounts prep overlay on session start; plays `playRoutineOrderCue()`.
- `src/components/patient/MusicMoment.tsx`: Mounts prep overlay before flute player starts; plays `playMusicMomentCue()`.

---

## 2. Verification Plan

1. **Audio Synthesis Verification**:
   - Verify that all 4 chimes play cleanly via the Web Audio API without clicks or audio popping.
   - Test in Chrome/Edge/Safari audio contexts (resumes suspended context on first user gesture).
2. **Transition Timing**:
   - Verify the $1.8$-second overlay dissolves smoothly into the task.
   - Verify spoken voice narration begins $400\,\text{ms}$ after the chime fades, avoiding audio clash.
3. **Build & Lint Verification**:
   - Run `compile_applet` and `lint_applet` to ensure zero compilation or TypeScript errors.
