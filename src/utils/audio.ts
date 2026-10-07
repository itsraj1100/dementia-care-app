/**
 * Soothing Audio Synthesizer and Web Speech Guidance Service
 * Designed for elderly and dementia-friendly cognitive therapy.
 */

class AudioService {
  private ctx: AudioContext | null = null;
  private isSpeaking = false;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Plays a calming harmonic chime using Web Audio sine synthesis
   * No harsh frequencies, gentle attack and long soothing decay.
   */
  public playChime(type: 'success' | 'gentle' | 'hint' | 'alert' | 'chime' = 'gentle') {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = {
        success: [523.25, 659.25, 783.99], // C5, E5, G5 peaceful chord
        gentle: [440.0, 554.37], // A4, C#5 warm interval
        hint: [392.0, 523.25], // G4, C5 open fifth
        alert: [493.88, 587.33], // B4, D5 calm bell
        chime: [587.33, 783.99, 880.0], // D5, G5, A5 soothing chime
      }[type];

      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.12);

        // Soft envelope: gentle fade in, slow exponential decay
        const startTime = now + index * 0.12;
        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.18, startTime + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 1.25);
      });
    } catch {
      // Audio autoplay may be muted by browser policy until gesture
    }
  }

  /**
   * Signature Cognitive Preparation Cues for Activities
   */

  /** 1. Object Match: Traditional Assamese bell-metal (Kahi Bati) singing bowl tone */
  public playObjectMatchCue() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Resonant harmonic pair: Fundamental G4 (392Hz) + overtone D5 (587.33Hz)
      const frequencies = [392.0, 587.33, 784.0];
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        // Soft singing bowl envelope: gentle 80ms attack and long, rich 1.8s decay
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.14 / (idx + 1), now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 1.85);
      });
    } catch {
      // Audio policy safe
    }
  }

  /** 2. Photo Recall: Uplifting crystalline familial bell chord */
  public playPhotoRecallCue() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Ascending C major triad: C5 (523.25) -> E5 (659.25) -> G5 (783.99)
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        const startTime = now + idx * 0.14;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.15, startTime + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 1.65);
      });
    } catch {
      // Audio policy safe
    }
  }

  /** 3. Routine Order: Warm copper hearth chime (A4 + C#5 + E5) */
  public playRoutineOrderCue() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const notes = [440.0, 554.37, 659.25];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        const startTime = now + idx * 0.12;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.12, startTime + 0.07);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 1.55);
      });
    } catch {
      // Audio policy safe
    }
  }

  /** 4. Music Moment: Serene bamboo flute overtone slide */
  public playMusicMomentCue() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Flute slide from E5 (659Hz) gently downward to B4 (493Hz)
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(493.88, now + 1.2);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.16, now + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.85);
    } catch {
      // Audio policy safe
    }
  }

  /**
   * Speaks the prompt text using browser Web Speech API
   * Paced slowly for elderly and cognitive care clarity
   */
  public speak(
    text: string,
    options?: {
      onStart?: () => void;
      onEnd?: () => void;
    }
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (options?.onStart) options.onStart();
      setTimeout(() => options?.onEnd?.(), 1500);
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const cleanText = text.replace(/[/·|]/g, ' ').replace(/\s+/g, ' ').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Slower rate and calm pitch for clear elderly listening
      utterance.rate = 0.82;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        this.isSpeaking = true;
        options?.onStart?.();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        options?.onEnd?.();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        options?.onEnd?.();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      this.isSpeaking = false;
      options?.onEnd?.();
    }
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }
}

export const sound = new AudioService();
