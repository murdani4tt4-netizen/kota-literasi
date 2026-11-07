// ============================================================
// Cinematic audio engine — 100% procedural (Web Audio API)
// No external asset, no network. Suitable for offline build.
// ============================================================

type TrackName = "menu" | "explore" | "tense" | "victory" | "none";

const NOTE: Record<string, number> = {
  C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.0, A2: 110.0, B2: 123.47,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, B5: 987.77,
  C6: 1046.5, E6: 1318.5,
};

interface Pattern {
  chord: string[];
  bpm: number;
  arp: string[];
  bass: string[];
  padGain: number;
  arpGain: number;
  drums: boolean;
}

const TRACKS: Record<Exclude<TrackName, "none">, Pattern> = {
  menu: {
    chord: ["C3", "G3", "E4"],
    bpm: 76,
    arp: ["C4", "E4", "G4", "B4", "G4", "E4"],
    bass: ["C2", "C2", "G2", "G2"],
    padGain: 0.16,
    arpGain: 0.075,
    drums: false,
  },
  explore: {
    chord: ["A2", "E3", "C4"],
    bpm: 92,
    arp: ["A3", "C4", "E4", "G4", "E4", "C4"],
    bass: ["A2", "A2", "F2", "G2"],
    padGain: 0.13,
    arpGain: 0.06,
    drums: true,
  },
  tense: {
    chord: ["D2", "A2", "F3"],
    bpm: 84,
    arp: ["D4", "F4", "A4", "C5", "A4", "F4"],
    bass: ["D2", "D2", "A2", "B2"],
    padGain: 0.15,
    arpGain: 0.07,
    drums: true,
  },
  victory: {
    chord: ["F2", "C3", "A3"],
    bpm: 104,
    arp: ["F4", "A4", "C5", "F5", "C5", "A4"],
    bass: ["F2", "F2", "C2", "C2"],
    padGain: 0.17,
    arpGain: 0.085,
    drums: true,
  },
};

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private convolver: ConvolverNode | null = null;

  musicOn = true;
  sfxOn = true;
  volume = 0.8;

  private track: TrackName = "none";
  private seqStep = 0;
  private nextTime = 0;
  private timer: number | null = null;

  /** Must be called from a user gesture (browser autoplay policy). */
  init() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") void this.ctx.resume();
      return;
    }
    const AC: typeof AudioContext =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.volume;
    this.master.connect(this.ctx.destination);

    // simple algorithmic reverb (noise impulse response) for cinematic space
    this.convolver = this.ctx.createConvolver();
    this.convolver.buffer = this.makeImpulse(2.1, 2.4);
    const wet = this.ctx.createGain();
    wet.gain.value = 0.28;
    this.convolver.connect(wet);
    wet.connect(this.master);

    this.musicBus = this.ctx.createGain();
    this.musicBus.gain.value = this.musicOn ? 0.9 : 0;
    this.musicBus.connect(this.master);
    this.musicBus.connect(this.convolver);

    this.sfxBus = this.ctx.createGain();
    this.sfxBus.gain.value = this.sfxOn ? 0.95 : 0;
    this.sfxBus.connect(this.master);
    this.sfxBus.connect(this.convolver);
  }

  private makeImpulse(seconds: number, decay: number) {
    const ctx = this.ctx!;
    const rate = ctx.sampleRate;
    const len = Math.floor(rate * seconds);
    const buf = ctx.createBuffer(2, len, rate);
    for (let c = 0; c < 2; c++) {
      const data = buf.getChannelData(c);
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    return buf;
  }

  setVolume(v: number) {
    this.volume = v;
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05);
  }
  setMusic(on: boolean) {
    this.musicOn = on;
    if (this.musicBus && this.ctx) this.musicBus.gain.setTargetAtTime(on ? 0.9 : 0, this.ctx.currentTime, 0.08);
  }
  setSfx(on: boolean) {
    this.sfxOn = on;
    if (this.sfxBus && this.ctx) this.sfxBus.gain.setTargetAtTime(on ? 0.95 : 0, this.ctx.currentTime, 0.05);
  }

  private tone(
    freq: number,
    dur: number,
    type: OscillatorType,
    gain: number,
    when = 0,
    bus: "music" | "sfx" = "sfx",
    glideTo?: number
  ) {
    if (!this.ctx) return;
    const dest = bus === "music" ? this.musicBus : this.sfxBus;
    if (!dest) return;
    const t0 = (when || this.ctx.currentTime) + 0;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const f = this.ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = Math.min(9000, freq * 6 + 400);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(30, glideTo), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t0 + Math.min(0.06, dur * 0.25));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(f);
    f.connect(g);
    g.connect(dest);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  private noise(dur: number, gain: number, freq: number, type: BiquadFilterType = "bandpass") {
    if (!this.ctx || !this.sfxBus) return;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const f = this.ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = 0.9;
    const g = this.ctx.createGain();
    g.gain.value = gain;
    src.connect(f);
    f.connect(g);
    g.connect(this.sfxBus);
    src.start();
  }

  // ------- SFX library -------
  click() { this.tone(660, 0.06, "square", 0.05); this.tone(1320, 0.05, "sine", 0.03); }
  hover() { this.tone(880, 0.035, "sine", 0.02); }
  interact() { this.tone(520, 0.1, "triangle", 0.07, 0, "sfx", 780); this.noise(0.08, 0.05, 2200); }
  pickup() { this.tone(440, 0.09, "triangle", 0.07, 0, "sfx", 880); this.tone(660, 0.12, "sine", 0.05); }
  place() { this.tone(300, 0.12, "sine", 0.08, 0, "sfx", 180); this.noise(0.12, 0.06, 700); }
  step() { this.noise(0.07, 0.028, 320 + Math.random() * 180, "lowpass"); }
  jump() { this.tone(330, 0.16, "sine", 0.06, 0, "sfx", 620); }
  land() { this.noise(0.1, 0.05, 260, "lowpass"); }
  success() {
    [0, 0.09, 0.18, 0.3].forEach((d, i) => this.tone(NOTE[["C5", "E5", "G5", "C6"][i]], 0.36, "triangle", 0.075, this.ctx ? this.ctx.currentTime + d : 0));
  }
  error() { this.tone(220, 0.22, "sawtooth", 0.06, 0, "sfx", 120); this.noise(0.18, 0.04, 500); }
  gate() {
    this.tone(140, 0.7, "sine", 0.1, 0, "sfx", 420);
    this.noise(0.8, 0.05, 900, "highpass");
  }
  levelUp() {
    [0, 0.12, 0.24, 0.4, 0.56].forEach((d, i) =>
      this.tone(NOTE[["C4", "E4", "G4", "C5", "E5"][i]], 0.5, "triangle", 0.08, this.ctx ? this.ctx.currentTime + d : 0)
    );
  }
  victory() {
    const seq = ["C4", "E4", "G4", "C5", "G4", "C5", "E5", "G5"];
    seq.forEach((n, i) => this.tone(NOTE[n], 0.6, "triangle", 0.085, this.ctx ? this.ctx.currentTime + i * 0.16 : 0));
  }
  notification() { this.tone(1046, 0.1, "sine", 0.045); this.tone(1568, 0.14, "sine", 0.03); }

  // ------- adaptive music -------
  setTrack(name: TrackName) {
    if (this.track === name) return;
    this.track = name;
    this.seqStep = 0;
    this.nextTime = this.ctx ? this.ctx.currentTime + 0.1 : 0;
    if (this.timer === null) this.startScheduler();
  }

  private startScheduler() {
    this.timer = window.setInterval(() => this.schedule(), 90);
  }

  private schedule() {
    if (!this.ctx || this.track === "none" || !this.musicOn) return;
    const p = TRACKS[this.track];
    const beat = 60 / p.bpm / 2;
    if (this.nextTime < this.ctx.currentTime) this.nextTime = this.ctx.currentTime + 0.08;
    while (this.nextTime < this.ctx.currentTime + 0.6) {
      const t = this.nextTime;
      const s = this.seqStep;
      // pad chord every 8 half-beats
      if (s % 8 === 0) {
        p.chord.forEach((n) => this.tone(NOTE[n], beat * 8.4, "sine", p.padGain, t, "music"));
        p.bass[(s / 8) % p.bass.length] &&
          this.tone(NOTE[p.bass[(s / 8) % p.bass.length]], beat * 4, "triangle", p.padGain * 1.1, t, "music");
      }
      // arpeggio
      const arpNote = p.arp[s % p.arp.length];
      if (s % 2 === 0) this.tone(NOTE[arpNote], beat * 1.8, "triangle", p.arpGain, t, "music");
      // light percussion
      if (p.drums && s % 4 === 2) {
        this.tone(70, 0.14, "sine", 0.05, t, "music", 45);
      }
      if (p.drums && s % 8 === 4) {
        this.tone(1200, 0.05, "square", 0.012, t, "music");
      }
      this.nextTime += beat;
      this.seqStep++;
    }
  }

  dispose() {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    this.track = "none";
    if (this.ctx) void this.ctx.close();
    this.ctx = null;
  }
}

export const sound = new SoundEngine();
