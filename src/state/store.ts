import { create } from "zustand";
import type { EngineSettings, PlayerProfile, ProgressState } from "../game/types";
import { ORBS, SCORE_RULES, ZONES, ZONE_BY_ID } from "../game/content";

const STORAGE_KEY = "ekspedisi-literasi-kota-informasi:v1";

export type Screen = "login" | "dashboard" | "game" | "results";

export interface Toast {
  id: number;
  text: string;
  kind: "info" | "success" | "warn" | "score";
}

interface SaveData {
  profile: PlayerProfile | null;
  progress: ProgressState;
  settings: EngineSettings;
}

const defaultSettings: EngineSettings = {
  quality: "medium",
  music: true,
  sfx: true,
  volume: 0.75,
  autoCamera: false,
};

const defaultProgress: ProgressState = {
  score: 0,
  unlockedZone: 1,
  completedZones: [],
  stars: {},
  taskDone: [],
  orbs: [],
  hints: 0,
  mistakes: 0,
  journal: [],
  lkm: {},
  finishedAt: null,
};

function load(): SaveData {
  const fallback: SaveData = { profile: null, progress: { ...defaultProgress }, settings: { ...defaultSettings } };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    return {
      profile: parsed.profile ?? null,
      progress: { ...defaultProgress, ...(parsed.progress || {}) },
      settings: { ...defaultSettings, ...(parsed.settings || {}) },
    };
  } catch {
    return fallback;
  }
}

function save(d: SaveData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  } catch {
    /* storage unavailable — game stays playable in-session */
  }
}

export interface GameStore extends SaveData {
  screen: Screen;
  activeZone: string;
  activeTask: string | null;
  panel: null | "pause" | "tabs" | "challenge" | "brief" | "info" | "npc" | "poster" | "settings" | "map" | "journal" | "help";
  tab: "teori" | "prosedur" | "simulasi" | "lkm" | "pengembang";
  tabsZone: string;
  toasts: Toast[];
  cutscene: { title: string; subtitle: string; progress: number; active: boolean; skippable: boolean };
  loaded: boolean;

  // actions
  login: (name: string, className: string, absent: string) => void;
  setCutscene: (c: Partial<GameStore["cutscene"]>) => void;
  setScreen: (s: Screen) => void;
  setPanel: (p: GameStore["panel"]) => void;
  setTab: (t: GameStore["tab"]) => void;
  setTabs: (zone: string, tab: GameStore["tab"]) => void;
  setActive: (zone: string, task: string | null) => void;
  notify: (text: string, kind?: Toast["kind"]) => void;
  dismissToast: (id: number) => void;
  addScore: (n: number, label?: string) => void;
  collectOrb: (id: string) => boolean;
  completeTask: (taskId: string, zoneId: string, mistakes?: number, hints?: number) => void;
  registerMistake: () => void;
  registerHint: () => void;
  saveLkm: (zoneId: string, fieldId: string, value: string) => void;
  setSettings: (s: Partial<EngineSettings>) => void;
  resetProgress: () => void;
  finishGame: () => void;
  persist: () => void;
}

const initial = load();

export const useGame = create<GameStore>((set, get) => ({
  profile: initial.profile,
  progress: initial.progress,
  settings: initial.settings,
  screen: "login",
  activeZone: "gerbang",
  activeTask: null,
  panel: null,
  tab: "teori",
  tabsZone: "gerbang",
  toasts: [],
  cutscene: { title: "", subtitle: "", progress: 0, active: false, skippable: true },
  loaded: true,

  setCutscene: (c) => set((s) => ({ cutscene: { ...s.cutscene, ...c } })),

  login: (name, className, absent) => {
    const prev = get().profile;
    const sameStudent = !!prev && prev.name.toLowerCase() === name.toLowerCase() && prev.className.toLowerCase() === className.toLowerCase();
    const profile: PlayerProfile = { name, className, absent, createdAt: prev?.createdAt ?? new Date().toISOString() };
    set({ profile, screen: "dashboard", progress: sameStudent ? get().progress : { ...defaultProgress } });
    if (!sameStudent) get().notify("Progres baru dimulai untuk siswa ini.", "info");
    get().persist();
  },

  setScreen: (s) => set({ screen: s, panel: null, activeTask: null }),
  setPanel: (p) => set({ panel: p }),
  setTab: (t) => set({ tab: t }),
  setTabs: (zone, tab) => set({ tabsZone: zone, tab, panel: "tabs" }),
  setActive: (zone, task) => set({ activeZone: zone, activeTask: task }),

  notify: (text, kind = "info") => {
    const id = Date.now() + Math.floor(Math.random() * 999);
    set((s) => ({ toasts: [...s.toasts, { id, text, kind }].slice(-4) }));
    setTimeout(() => get().dismissToast(id), 4200);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  addScore: (n, label) => {
    set((s) => ({ progress: { ...s.progress, score: s.progress.score + n } }));
    if (label) get().notify(`${label} +${n} poin`, "score");
    get().persist();
  },

  collectOrb: (id) => {
    const p = get().progress;
    if (p.orbs.includes(id)) return false;
    const orb = ORBS.find((o) => o.id === id);
    set({
      progress: {
        ...p,
        orbs: [...p.orbs, id],
        score: p.score + SCORE_RULES.orb,
        journal: orb ? [...p.journal, `${orb.title} — ${orb.note}`] : p.journal,
      },
    });
    get().notify(`Pecahan ditemukan: ${orb?.title ?? id} (+${SCORE_RULES.orb})`, "success");
    get().persist();
    return true;
  },

  registerMistake: () => set((s) => ({ progress: { ...s.progress, mistakes: s.progress.mistakes + 1 } })),
  registerHint: () => set((s) => ({ progress: { ...s.progress, hints: s.progress.hints + 1 } })),

  completeTask: (taskId, zoneId, mistakes = 0, hints = 0) => {
    const p = get().progress;
    if (p.taskDone.includes(taskId)) {
      get().notify("Tantangan ini sudah selesai. Poin tidak diberikan dua kali.", "warn");
      return;
    }
    const zone = ZONE_BY_ID[zoneId];
    const pts = zone?.tasks.find((t) => t.id === taskId)?.points ?? SCORE_RULES.task;
    const allZoneTasks = zone ? zone.tasks.map((t) => t.id) : [];
    const taskDone = [...p.taskDone, taskId];
    const zoneComplete = zone && allZoneTasks.every((id) => taskDone.includes(id));
    const completedZones = zoneComplete && !p.completedZones.includes(zoneId) ? [...p.completedZones, zoneId] : p.completedZones;
    const nextIndex = zone ? Math.min(ZONES.length, Math.max(p.unlockedZone, zone.index + 1)) : p.unlockedZone;

    const totalMist = p.mistakes + mistakes;
    const totalHints = p.hints + hints;
    const stars = totalHints === 0 && totalMist === 0 ? 3 : totalHints <= 2 && totalMist <= 3 ? 2 : 1;
    const prevStars = p.stars[zoneId] ?? 0;
    const starMap = { ...p.stars };
    if (zoneComplete) starMap[zoneId] = Math.max(prevStars, stars);

    let bonus = 0;
    if (zoneComplete && !p.completedZones.includes(zoneId)) bonus = SCORE_RULES.level;
    if (completedZones.length === ZONES.length && !p.finishedAt) bonus += SCORE_RULES.allMissions;

    set({
      progress: {
        ...p,
        taskDone,
        completedZones,
        unlockedZone: nextIndex,
        stars: starMap,
        score: p.score + pts + bonus,
        // mistakes/hints accumulate across the tasks of one zone and reset
        // when that zone is finished -> the star rating reflects the whole zone
        mistakes: zoneComplete ? 0 : p.mistakes + mistakes,
        hints: zoneComplete ? 0 : p.hints + hints,
      },
    });
    get().notify(`Tantangan selesai +${pts} poin`, "success");
    if (bonus > 0) get().notify(`Level selesai! +${bonus} poin`, "score");
    get().persist();
  },

  saveLkm: (zoneId, fieldId, value) => {
    const p = get().progress;
    const z = { ...(p.lkm[zoneId] || {}) };
    z[fieldId] = value;
    set({ progress: { ...p, lkm: { ...p.lkm, [zoneId]: z } } });
    get().persist();
  },

  setSettings: (s) => {
    set((st) => ({ settings: { ...st.settings, ...s } }));
    get().persist();
  },

  resetProgress: () => {
    set({ progress: { ...defaultProgress }, activeTask: null, panel: null });
    get().persist();
  },

  finishGame: () => {
    set((s) => ({ progress: { ...s.progress, finishedAt: new Date().toISOString() }, screen: "results" }));
    get().persist();
  },

  persist: () => {
    const s = get();
    save({ profile: s.profile, progress: s.progress, settings: s.settings });
  },
}));

export function totalStars() {
  const p = useGame.getState().progress;
  return Object.values(p.stars).reduce((a, b) => a + b, 0);
}

export function completionPercent() {
  const p = useGame.getState().progress;
  const totalTasks = ZONES.reduce((a, z) => a + z.tasks.length, 0);
  return Math.round((p.taskDone.length / totalTasks) * 100);
}
