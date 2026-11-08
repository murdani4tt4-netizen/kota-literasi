import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GameEngine } from "./game/engine";
import { attachKeyboard, attachLook, resetInput } from "./game/input";
import { sound } from "./game/audio";
import { NPCS, ORBS, POSTERS, ZONES, ZONE_BY_ID } from "./game/content";
import type { CutsceneDef, PromptInfo, ZoneDef } from "./game/types";
import { useGame } from "./state/store";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import HUD from "./components/HUD";
import Results from "./components/Results";
import LearningTabs from "./components/LearningTabs";
import ChallengePanel from "./components/ChallengePanel";
import { BriefPanel, HelpPanel, JournalPanel, NPCPanel, PauseMenu, PosterPanel, SettingsPanel } from "./components/Panels";

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [engine, setEngine] = useState<GameEngine | null>(null);
  const [npc, setNpc] = useState<{ name: string; role: string; lines: string[] } | null>(null);
  const [poster, setPoster] = useState<(typeof POSTERS)[number] | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const talked = useRef<Set<string>>(new Set());

  const screen = useGame((s) => s.screen);
  const panel = useGame((s) => s.panel);
  const profile = useGame((s) => s.profile);
  const settings = useGame((s) => s.settings);
  const progress = useGame((s) => s.progress);
  const activeZone = useGame((s) => s.activeZone);
  const setScreen = useGame((s) => s.setScreen);
  const setPanel = useGame((s) => s.setPanel);
  const setActive = useGame((s) => s.setActive);
  const collectOrb = useGame((s) => s.collectOrb);
  const notify = useGame((s) => s.notify);
  const setCutscene = useGame((s) => s.setCutscene);
  const finishGame = useGame((s) => s.finishGame);

  // keep a ref of state used inside engine callbacks (avoids stale closures)
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // ---------------------------------------------------------------- engine boot
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    canvas.style.touchAction = "none";
    container.appendChild(canvas);

    const events = {
      onPrompt: (p: PromptInfo | null) => {
        window.dispatchEvent(new CustomEvent("hud-prompt", { detail: p }));
      },
      onFootstep: () => sound.step(),
      onZoneEnter: () => {},
      onCutsceneTick: (p: number, subtitle: string) => setCutscene({ progress: p, subtitle, active: true, skippable: true }),
      onInteract: (id: string, kind: PromptInfo["kind"]) => handleInteract(id, kind),
      onCutsceneEnd: (id: string) => {
        setCutscene({ progress: 1, subtitle: "", active: false, skippable: false });
        if (id.startsWith("zone-")) {
          const zid = id.slice(5);
          setActive(zid, null);
          setPanel("brief");
        } else if (id === "final") {
          finishGame();
        } else if (id === "start-game") {
          sound.setTrack("explore");
          const z = ZONES.find((x) => x.index === 1)!;
          setActive(z.id, null);
          setPanel("brief");
        }
      },
    };

    const eng = new GameEngine(canvas, events, settingsRef.current);
    engineRef.current = eng;
    eng.start();
    setEngine(eng);

    const detachKeys = attachKeyboard(
      () => {
        const s = useGame.getState();
        if (s.screen !== "game") {
          if (s.panel) s.setPanel(null);
          return;
        }
        if (s.panel === "pause") s.setPanel(null);
        else if (s.panel === null) s.setPanel("pause");
        else s.setPanel(null);
      },
      () => {
        const s = useGame.getState();
        if (s.screen === "game") s.setPanel(s.panel === "journal" ? null : "journal");
      }
    );
    const detachLook = attachLook(canvas);
    const onResize = () => eng.resize();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    return () => {
      detachKeys();
      detachLook();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      eng.dispose();
      engineRef.current = null;
      resetInput();
      if (canvas.parentNode === container) container.removeChild(canvas);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------- interaction logic
  const openChallenge = useCallback((zoneId: string, taskId: string) => {
    setActive(zoneId, taskId);
    setChallengeId(taskId);
    setPanel("challenge");
  }, [setActive, setPanel]);

  const handleInteract = useCallback(
    (id: string, kind: PromptInfo["kind"]) => {
      const eng = engineRef.current;
      const st = useGame.getState();
      const p = st.progress;

      if (kind === "orb") {
        const orb = ORBS.find((o) => o.id === id);
        if (!orb) return;
        const isNew = collectOrb(id);
        if (isNew) {
          eng?.world.removeInteractable(id);
          const pos = new THREE.Vector3();
          eng?.world.interactables.get(id)?.obj.getWorldPosition(pos);
          eng?.burst(pos, "#ffd76a", 46, 5);
          sound.pickup();
          // explore task auto-open
          const zone = ZONE_BY_ID[orb.zone];
          const task = zone.tasks.find((t) => t.type === "explore" && t.targetKind === "clue-gerbang");
          if (task && !p.taskDone.includes(task.id)) {
            const collected = ORBS.filter((o) => o.zone === orb.zone).filter((o) => useGame.getState().progress.orbs.includes(o.id)).length;
            if (collected >= (task.targetCount ?? 1)) {
              notify("Semua petunjuk gerbang terkumpul! Buka papan misi untuk tantangan berikutnya.", "success");
            }
          }
        }
        return;
      }

      if (kind === "npc") {
        const n = NPCS.find((x) => x.id === id);
        if (!n) return;
        setNpc({ name: n.name, role: n.role, lines: n.lines });
        setPanel("npc");
        sound.interact();
        if (!talked.current.has(id)) {
          talked.current.add(id);
          // explore task: temui sumber kota
          const kotaTask = ZONE_BY_ID.kota.tasks.find((t) => t.type === "explore");
          const kotaTalks = Array.from(talked.current).filter((tid) => NPCS.find((n) => n.id === tid)?.zone === "kota").length;
          if (kotaTask && !p.taskDone.includes(kotaTask.id) && kotaTalks >= (kotaTask.targetCount ?? 1)) {
            openChallenge("kota", kotaTask.id);
          }
        }
        return;
      }

      if (kind === "zone") {
        const zid = id.replace("zone-", "");
        const z = ZONE_BY_ID[zid];
        if (!z) return;
        if (z.index > p.unlockedZone) {
          notify(`Zona ${z.index} masih terkunci. Selesaikan zona sebelumnya terlebih dahulu.`, "warn");
          sound.error();
          return;
        }
        sound.gate();
        setActive(zid, null);
        eng?.playCutscene(zoneCutscene(z, "enter"));
        return;
      }

      if (kind === "poster") {
        const idx = Number(id.replace("poster-", ""));
        const po = POSTERS[idx];
        if (po) {
          setPoster(po);
          setPanel("poster");
          sound.interact();
        }
        return;
      }

      if (kind === "element") {
        const ok = eng?.pickupElement(id);
        if (ok) {
          sound.pickup();
          notify("Unsur diangkat. Dekati slot di dinding lalu tekan E untuk memasang.", "info");
        }
        return;
      }

      if (kind === "slot") {
        if (!eng) return;
        const res = eng.placeElement(id);
        if (!res) return;
        if (res.correct) {
          sound.place();
          notify("Penempatan tepat! Unsur poster menempel pada fungsinya.", "success");
          const placed = eng.world.placedElements;
          if (placed >= 5) {
            const task = ZONE_BY_ID.studio.tasks.find((t) => t.type === "poster3d");
            if (task && !p.taskDone.includes(task.id)) openChallenge("studio", task.id);
          }
        } else {
          sound.error();
          notify("Belum tepat — unsur dikembalikan ke meja. Baca keterangan fungsi pada slot.", "warn");
        }
        return;
      }

      if (kind === "board") {
        const zone = ZONE_BY_ID[activeZone] ?? ZONES[0];
        if (id === "board-gerbang") {
          const task = ZONE_BY_ID.gerbang.tasks.find((t) => t.type === "sequence");
          if (task) openChallenge("gerbang", task.id);
        } else {
          setPanel("brief");
        }
        void zone;
        return;
      }

      if (kind === "object") {
        // mesin pemilah fakta di Kota Informasi
        const task = ZONE_BY_ID.kota.tasks.find((t) => t.type === "sort");
        if (task) openChallenge("kota", task.id);
        return;
      }
    },
    [activeZone, collectOrb, notify, openChallenge, setActive, setPanel]
  );

  // ---------------------------------------------------------------- first entry cinematic
  useEffect(() => {
    const eng = engineRef.current;
    if (!eng || screen !== "game" || gameIntroPlayed.has(eng) || !profile) return;
    gameIntroPlayed.add(eng);
    sound.setTrack("tense");
    eng.teleport(0, 88, Math.PI);
    eng.playCutscene({
      id: "start-game",
      title: "start",
      subtitle: `${profile.name} tiba di Gerbang Literasi. Kota Informasi menantimu — kumpulkan petunjuk, periksa bukti, dan sampaikan gagasanmu.`,
      keys: [
        { pos: [0, 22, 104], look: [0, 6, 74], t: 3 },
        { pos: [-14, 9, 92], look: [0, 5, 74], t: 2.8 },
        { pos: [0, 4.4, 94], look: [0, 2, 86], t: 2.2 },
      ],
      hold: 1,
    });
  }, [screen, engine, profile]);

  // ---------------------------------------------------------------- cinematic mode per screen
  useEffect(() => {
    const eng = engineRef.current;
    if (!eng) return;
    eng.setCinematic(screen !== "game");
    if (screen === "dashboard") {
      sound.setTrack("menu");
    } else if (screen === "game") {
      if (!gameIntroPlayed.has(eng)) sound.setTrack("tense");
      else sound.setTrack("explore");
    } else if (screen === "results") {
      sound.setTrack("victory");
    }
  }, [screen, engine]);

  // ---------------------------------------------------------------- pause while a panel is open
  useEffect(() => {
    const eng = engineRef.current;
    if (!eng) return;
    eng.setPaused(panel !== null || screen !== "game");
  }, [panel, screen, engine]);

  // ---------------------------------------------------------------- settings sync
  useEffect(() => {
    const eng = engineRef.current;
    if (eng) {
      eng.applyQuality(settings.quality);
      eng.setAutoCamera(settings.autoCamera);
    }
    sound.setMusic(settings.music);
    sound.setSfx(settings.sfx);
    sound.setVolume(settings.volume);
  }, [settings, engine]);

  // ---------------------------------------------------------------- objective beacon
  useEffect(() => {
    const eng = engineRef.current;
    if (!eng) return;
    const z = ZONE_BY_ID[activeZone];
    if (screen === "game" && z) eng.setWaypoint(z.position[0], z.position[1]);
    else eng.setWaypoint(null);
  }, [activeZone, screen, engine]);

  // ---------------------------------------------------------------- portal lock states
  useEffect(() => {
    const eng = engineRef.current;
    if (!eng) return;
    ZONES.forEach((z) => {
      const done = progress.completedZones.includes(z.id);
      const locked = z.index > progress.unlockedZone;
      eng.world.setPortalState(z.id, locked ? "locked" : done ? "done" : "active");
    });
  }, [progress.unlockedZone, progress.completedZones, engine]);

  // ---------------------------------------------------------------- zone completion cinematic
  const celebrated = useRef<Set<string>>(new Set());
  useEffect(() => {
    const eng = engineRef.current;
    if (!eng || !profile) return;
    for (const z of ZONES) {
      if (!progress.completedZones.includes(z.id) || celebrated.current.has(z.id)) continue;
      celebrated.current.add(z.id);
      const all = progress.completedZones.length === ZONES.length;
      if (all) {
        sound.setTrack("victory");
        eng.playCutscene(zoneCutscene(z, "final"));
      } else {
        eng.playCutscene(zoneCutscene(z, "complete"));
      }
    }
  }, [progress.completedZones, engine, profile]);

  // ---------------------------------------------------------------- first-time dashboard intro
  useEffect(() => {
    const eng = engineRef.current;
    if (!eng || screen !== "dashboard" || introPlayedFor.has(eng) || !profile) return;
    introPlayedFor.add(eng);
    sound.init();
    sound.setTrack("menu");
    eng.playCutscene({
      id: "intro-dashboard",
      title: "intro",
      subtitle: `${profile.name} — Penjelajah Literasi Kota Informasi. Jelajahi enam zona, evaluasi informasi, ciptakan karya, dan sampaikan gagasanmu.`,
      keys: [
        { pos: [-30, 16, 96], look: [0, 10, 14], t: 3.2 },
        { pos: [46, 26, 62], look: [0, 12, 14], t: 3.2 },
        { pos: [4, 34, 74], look: [0, 12, 14], t: 2.6 },
      ],
      hold: 1,
    });
  }, [screen, engine, profile]);

  // ---------------------------------------------------------------- render helpers
  const zone: ZoneDef = ZONE_BY_ID[activeZone] ?? ZONES[0];
  const challengeTask = challengeId ? zone.tasks.find((t) => t.id === challengeId) ?? ZONES.flatMap((z) => z.tasks).find((t) => t.id === challengeId) : null;
  const challengeZone = challengeTask ? ZONES.find((z) => z.tasks.some((t) => t.id === challengeTask.id))! : zone;

  const exploreCount = (zid: string, kind: string) => {
    const st = useGame.getState().progress;
    if (kind === "clue-gerbang") return ORBS.filter((o) => o.zone === zid && st.orbs.includes(o.id)).length;
    if (kind === "npc") return Array.from(talked.current).filter((id) => NPCS.find((n) => n.id === id)?.zone === zid).length;
    return 0;
  };

  return (
    <div className="relative h-dvh w-screen overflow-hidden bg-[#05080f] font-sans text-white">
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />

      {/* cinematic vignette + film grain (visual layer only) */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.55)_100%)]" />

      {screen === "login" && <Login />}
      {screen === "dashboard" && <Dashboard />}
      {screen === "results" && <Results onReplay={() => setScreen("dashboard")} onReview={() => useGame.getState().setTabs("gerbang", "teori")} />}
      {screen === "game" && (
        <>
          <HUD
            engine={engine}
            onCutsceneSkip={() => {
              engineRef.current?.skipCutscene();
              setCutscene({ progress: 1, subtitle: "", active: false, skippable: false });
            }}
          />
          {panel === "pause" && (
            <PauseMenu
              engine={engine}
              onResume={() => {
                setPanel(null);
                sound.click();
              }}
            />
          )}
          {panel === "brief" && (
            <BriefPanel
              zone={zone}
              onStart={(taskId) => {
                setPanel(null);
                if (taskId) {
                  openChallenge(zone.id, taskId);
                } else {
                  const t = zone.tasks[0];
                  openChallenge(zone.id, t.id);
                }
              }}
            />
          )}
          {panel === "challenge" && challengeTask && (
            <ChallengePanel
              zone={challengeZone}
              task={challengeTask}
              placed={engine?.world.placedElements ?? 0}
              explored={exploreCount(challengeZone.id, challengeTask.targetKind ?? "clue-gerbang")}
              onDone={() => {
                setPanel(null);
                setChallengeId(null);
              }}
              onNext={() => {
                const next = challengeZone.tasks.find((t) => !progress.taskDone.includes(t.id) && t.id !== challengeTask.id);
                if (next) {
                  setActive(challengeZone.id, next.id);
                  setChallengeId(next.id);
                } else {
                  setPanel(null);
                  setChallengeId(null);
                }
              }}
            />
          )}
        </>
      )}

      {/* shared overlays (available in every screen) */}
      {panel === "tabs" && <LearningTabs />}
      {panel === "settings" && <SettingsPanel />}
      {panel === "help" && <HelpPanel />}
      {panel === "journal" && <JournalPanel />}
      {panel === "npc" && npc && <NPCPanel npc={npc} onClose={() => setPanel(null)} />}
      {panel === "poster" && poster && <PosterPanel poster={poster} onClose={() => setPanel(null)} />}

      {/* small on-screen credit */}
      {screen === "login" && (
        <div className="pointer-events-none absolute bottom-2 left-1/2 z-20 -translate-x-1/2 text-[10px] text-white/40">
          Ekspedisi Literasi: Kota Informasi · dibuat oleh MURDANI · SMAN 10 PINRANG · 2026
        </div>
      )}
    </div>
  );
}

const introPlayedFor = new WeakSet<GameEngine>();
const gameIntroPlayed = new WeakSet<GameEngine>();

// ---------------------------------------------------------------- cutscene definitions
function zoneCutscene(z: ZoneDef, kind: "enter" | "complete" | "final"): CutsceneDef {
  const [x, zz] = z.position;
  if (kind === "enter") {
    return {
      id: `zone-${z.id}`,
      title: z.name,
      subtitle: `${z.levelLabel} — ${z.name}: ${z.subtitle}`,
      keys: [
        { pos: [x + 26, 10, zz + 30], look: [x, 4, zz], t: 2.6 },
        { pos: [x + 10, 5.5, zz + 14], look: [x, 4, zz], t: 2.4 },
        { pos: [x + 3, 3.4, zz + 8], look: [x, 3.6, zz], t: 1.8 },
      ],
      hold: 0.8,
    };
  }
  if (kind === "complete") {
    return {
      id: `done-${z.id}`,
      title: z.name,
      subtitle: `Zona ${z.index} selesai! Zona ${Math.min(z.index + 1, 6)} telah terbuka. Lanjutkan ekspedisi.`,
      keys: [
        { pos: [x + 8, 4, zz + 10], look: [x, 4, zz], t: 2.2 },
        { pos: [x, 12, zz + 26], look: [x, 6, zz], t: 2.6 },
      ],
      hold: 1,
    };
  }
  return {
    id: "final",
    title: "final",
    subtitle: "Seluruh zona telah pulih. Kota Informasi bersinar kembali — misi final berhasil!",
    keys: [
      { pos: [24, 10, 18], look: [0, 20, -16], t: 3 },
      { pos: [0, 46, 6], look: [0, 22, -16], t: 3.4 },
      { pos: [-18, 20, -2], look: [0, 24, -16], t: 3 },
    ],
    hold: 1.4,
  };
}
