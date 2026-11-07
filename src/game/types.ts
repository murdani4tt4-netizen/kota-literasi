// ============================================================
// EKSPEDISI LITERASI: KOTA INFORMASI
// Shared types — engine <-> content <-> react
// ============================================================

export type Quality = "low" | "medium" | "high";

export interface EngineSettings {
  quality: Quality;
  music: boolean;
  sfx: boolean;
  volume: number;
  autoCamera: boolean;
}

export interface PromptInfo {
  id: string;
  label: string;
  kind: "zone" | "orb" | "npc" | "board" | "element" | "slot" | "poster" | "object";
  distance: number;
  locked?: boolean;
}

export interface CutsceneKey {
  pos: [number, number, number];
  look: [number, number, number];
  t: number;
}

export interface CutsceneDef {
  id: string;
  title: string;
  subtitle: string;
  keys: CutsceneKey[];
  hold?: number;
}

export interface EngineEvents {
  onPrompt: (p: PromptInfo | null) => void;
  onInteract: (id: string, kind: PromptInfo["kind"]) => void;
  onCutsceneEnd: (id: string) => void;
  onCutsceneTick: (progress: number, subtitle: string) => void;
  onFootstep: () => void;
  onZoneEnter: (zoneId: string) => void;
}

export interface MinimapBlip {
  x: number;
  z: number;
  color: string;
  label: string;
}

/** Live state exposed by the engine for HUD/minimap polling. */
export interface EngineLiveState {
  px: number;
  pz: number;
  pyaw: number;
  zone: string;
  blips: MinimapBlip[];
  fps: number;
}

// ---------------- Content types ----------------

export interface SortBin {
  id: string;
  label: string;
  desc: string;
  accent: string;
}

export interface SortItem {
  id: string;
  text: string;
  bin: string;
  note: string;
}

export interface MatchPair {
  left: { id: string; text: string };
  right: { id: string; text: string };
}

export interface SequenceStep {
  id: string;
  text: string;
  hint: string;
}

export interface DialogueOption {
  text: string;
  feedback: string;
  score: number;
  good: boolean;
}

export interface DialogueTurn {
  speaker: string;
  role: string;
  line: string;
  options: DialogueOption[];
}

export interface PosterRegion {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  note: string;
}

export interface PosterDef {
  id: string;
  title: string;
  purpose: string;
  headline: string;
  slogan: string;
  body: string;
  footer: string;
  palette: [string, string, string];
  emblem: string;
  regions: PosterRegion[];
  analysis: string;
  impliedMeaning: string;
  explicitMeaning: string;
}

export type TaskType =
  | "explore"
  | "sort"
  | "match"
  | "sequence"
  | "dialogue"
  | "spot"
  | "poster3d"
  | "compose";

export interface TaskDef {
  id: string;
  type: TaskType;
  title: string;
  brief: string;
  instruction: string;
  points: number;
  simulation?: boolean;
  // explore
  targetCount?: number;
  targetKind?: string;
  // sort
  bins?: SortBin[];
  items?: SortItem[];
  // match
  pairs?: MatchPair[];
  // sequence
  steps?: SequenceStep[];
  // dialogue
  situation?: string;
  turns?: DialogueTurn[];
  // spot
  posters?: PosterDef[];
  ask?: string;
  // compose
  fields?: { id: string; label: string; min: number; hint: string }[];
}

export interface TheoryBlock {
  heading: string;
  body: string;
}

export interface ZoneDef {
  id: string;
  index: number;
  name: string;
  levelLabel: string;
  subtitle: string;
  position: [number, number];
  color: string;
  icon: string;
  story: string;
  mission: string;
  targets: string[];
  tasks: TaskDef[];
  theory: {
    ringkasan: string;
    konsep: TheoryBlock[];
    istilah: { term: string; def: string }[];
    contoh: string[];
    refleksi: string[];
  };
  prosedur: { step: string; detail: string }[];
  lkm: {
    judul: string;
    tujuan: string;
    pemantik: string[];
    petunjuk: string[];
    fields: { id: string; label: string; min: number; hint: string }[];
  };
}

export interface PlayerProfile {
  name: string;
  className: string;
  absent: string;
  createdAt: string;
}

export interface ProgressState {
  score: number;
  unlockedZone: number;
  completedZones: string[];
  stars: Record<string, number>;
  taskDone: string[];
  orbs: string[];
  hints: number;
  mistakes: number;
  journal: string[];
  lkm: Record<string, Record<string, string>>;
  finishedAt: string | null;
}
