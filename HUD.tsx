import { useEffect, useRef, useState } from "react";
import type { GameEngine } from "../game/engine";
import { input, pressInteract, pressJump } from "../game/input";
import { useGame } from "../state/store";
import { ZONES, ZONE_BY_ID } from "../game/content";
import { Button, Panel, Progress, Tag } from "./ui";
import { cn } from "../utils/cn";

export default function HUD({ engine, onCutsceneSkip }: { engine: GameEngine | null; onCutsceneSkip: () => void }) {
  const profile = useGame((s) => s.profile);
  const progress = useGame((s) => s.progress);
  const activeZone = useGame((s) => s.activeZone);
  const setPanel = useGame((s) => s.setPanel);
  const setScreen = useGame((s) => s.setScreen);
  const toasts = useGame((s) => s.toasts);
  const prompt = useGame((s) => s.panel);
  const cs = useGame((s) => s.cutscene);
  const carried = engine?.carriedElement ?? null;
  const [missionOpen, setMissionOpen] = useState(() => (typeof window === "undefined" ? true : window.innerWidth >= 640));
  const [near, setNear] = useState<{ id: string; label: string; kind: string } | null>(null);

  const zone = ZONE_BY_ID[activeZone] ?? ZONES[0];
  const totalTasks = ZONES.reduce((a, z) => a + z.tasks.length, 0);
  const pct = Math.round((progress.taskDone.length / totalTasks) * 100);
  const stars = Object.values(progress.stars).reduce((a, b) => a + b, 0);
  const zoneTasks = zone.tasks;
  const currentTask = zoneTasks.find((t) => !progress.taskDone.includes(t.id)) ?? null;

  // mission panel follows the zone the player is currently exploring
  useEffect(() => {
    if (!engine) return;
    const t = window.setInterval(() => {
      const st = useGame.getState();
      if (st.panel !== null) return;
      const near = engine.live.zone;
      const z = ZONES.find((x) => x.id === near);
      if (z && z.id !== st.activeZone && z.index <= st.progress.unlockedZone) st.setActive(z.id, null);
    }, 600);
    return () => window.clearInterval(t);
  }, [engine]);

  // prompt comes from the engine events -> lightweight local mirror
  useEffect(() => {
    if (!engine) return;
    const h = (e: Event) => {
      const d = (e as CustomEvent).detail;
      setNear(d ? { id: d.id, label: d.label, kind: d.kind } : null);
    };
    window.addEventListener("hud-prompt", h);
    return () => window.removeEventListener("hud-prompt", h);
  }, [engine]);

  const inPanel = prompt !== null;

  return (
    <>
      {/* ------------------- cinematic bars + subtitle during cutscene ------------------- */}
      {cs.active && (
        <div className="pointer-events-none absolute inset-0 z-40">
          <div className="absolute inset-x-0 top-0 h-[11vh] bg-black" />
          <div className="absolute inset-x-0 bottom-0 h-[11vh] bg-black" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/55" />
          <div className="absolute inset-x-0 bottom-[13vh] px-8 text-center">
            <p className="mx-auto max-w-4xl text-lg font-bold text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.9)] sm:text-2xl">
              {cs.subtitle}
            </p>
            <div className="mx-auto mt-3 h-1 w-64 overflow-hidden rounded-full bg-white/20">
              <div className="h-full bg-amber-300 transition-[width] duration-200" style={{ width: `${cs.progress * 100}%` }} />
            </div>
          </div>
          {cs.skippable && (
            <div className="pointer-events-auto absolute bottom-4 right-4">
              <Button variant="soft" size="sm" onClick={onCutsceneSkip}>
                LEWATI ⏭
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ------------------- top bar ------------------- */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 p-2 sm:p-3">
        <Panel className="pointer-events-auto flex flex-wrap items-center gap-x-4 gap-y-2 px-3 py-2 sm:px-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-amber-400/20 text-lg">{zone.icon}</span>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-bold uppercase tracking-widest text-amber-200/90">
                {zone.levelLabel} · {zone.name}
              </p>
              <p className="hidden truncate text-xs text-slate-300 sm:block">
                {profile?.name} · {profile?.className}
              </p>
            </div>
          </div>
          <div className="hidden h-8 w-px bg-white/10 sm:block" />
          <div className="flex items-center gap-4 text-xs">
            <span className="font-black text-amber-300">⭐ {progress.score}</span>
            <span className="font-bold text-rose-200">★ {stars}</span>
            <span className="hidden text-slate-300 sm:inline">🔮 {progress.orbs.length}/8</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden w-36 md:block">
              <Progress value={pct} />
              <p className="mt-1 text-right text-[10px] text-slate-400">{pct}% tersaikan</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setPanel("tabs")}>
              📚 Belajar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setPanel("journal")}>
              📔
            </Button>
            <Button size="sm" variant="danger" onClick={() => setPanel("pause")}>
              ⏸ ESC
            </Button>
          </div>
        </Panel>
      </div>

      {/* ------------------- mission side panel ------------------- */}
      {!missionOpen && (
        <button
          onClick={() => setMissionOpen(true)}
          className="pointer-events-auto absolute right-2 top-[104px] z-20 flex max-w-[62vw] items-center gap-2 rounded-xl border border-white/20 bg-[#0a1020]/85 px-3 py-2 text-left text-[11px] font-bold text-amber-100 backdrop-blur-xl sm:right-3 sm:top-28"
        >
          <span>📋 MISI {zone.index}/6</span>
          <span className="truncate font-medium text-slate-300">{currentTask ? currentTask.title : "Selesai"}</span>
          <span className="text-slate-400">▾</span>
        </button>
      )}
      <div
        className={cn(
          "pointer-events-none absolute right-2 top-[104px] z-20 w-[min(280px,calc(100vw-1rem))] sm:right-3 sm:top-28 sm:w-[280px]",
          !missionOpen && "hidden"
        )}
      >
        <Panel className="pointer-events-auto max-h-[calc(100dvh-200px)] overflow-y-auto p-3 sm:max-h-[calc(100dvh-8rem)] sm:p-4" glow={zone.color}>
          <div className="flex items-center justify-between gap-2">
            <Tag color={zone.color}>MISI {zone.index}/6</Tag>
            <span className="text-[10px] text-slate-400">{progress.completedZones.includes(zone.id) ? "SELESAI" : "BERJALAN"}</span>
            <button
              onClick={() => setMissionOpen(false)}
              aria-label="Ciutkan misi"
              className="rounded-md border border-white/15 px-2 py-0.5 text-[11px] font-bold text-slate-300"
            >
              ▴
            </button>
          </div>
          <p className="mt-2 text-sm font-bold leading-snug text-white">{zone.mission}</p>
          <div className="mt-3 space-y-1.5">
            {zoneTasks.map((t) => {
              const done = progress.taskDone.includes(t.id);
              const active = currentTask?.id === t.id;
              return (
                <div
                  key={t.id}
                  className={cn(
                    "flex items-start gap-2 rounded-lg border p-2 text-[11px] leading-snug",
                    done ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100" : active ? "border-white/25 bg-white/10 text-white" : "border-white/10 bg-white/[0.03] text-slate-400"
                  )}
                >
                  <span>{done ? "✅" : active ? "▶️" : "⬜"}</span>
                  <span className="flex-1">{t.title}</span>
                  {t.simulation && <span className="text-[9px] font-bold text-sky-300">SIM</span>}
                </div>
              );
            })}
          </div>
          {currentTask && (
            <p className="mt-3 rounded-lg border border-amber-300/25 bg-amber-300/10 p-2 text-[11px] leading-snug text-amber-100">
              💡 {currentTask.instruction}
            </p>
          )}
          {zone.id === "studio" && (
            <p className="mt-2 text-[11px] text-slate-300">
              Unsur terpasang: <b className="text-emerald-300">{engine?.world.placedElements ?? 0}/5</b>
            </p>
          )}
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="gold" className="flex-1" onClick={() => setPanel("brief")}>
              Detail Misi
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setScreen("dashboard")}>
              🏠
            </Button>
          </div>
        </Panel>
      </div>

      {/* ------------------- minimap ------------------- */}
      <Minimap engine={engine} />

      {/* ------------------- carried element indicator ------------------- */}
      {carried && (
        <div className="pointer-events-none absolute left-1/2 top-24 z-20 -translate-x-1/2 sm:top-28">
          <div className="rounded-full border border-emerald-300/40 bg-emerald-500/20 px-4 py-1.5 text-xs font-bold text-emerald-100 backdrop-blur">
            🎒 Membawa unsur poster — dekati slot lalu tekan E
          </div>
        </div>
      )}

      {/* ------------------- interaction prompt ------------------- */}
      {near && !cs.active && !inPanel && (
        <div className="pointer-events-none absolute bottom-44 left-1/2 z-20 -translate-x-1/2 sm:bottom-28">
          <div className="flex items-center gap-3 rounded-2xl border border-amber-300/40 bg-[#0a1020]/85 px-4 py-2.5 backdrop-blur-xl">
            <span className="grid h-9 w-9 place-items-center rounded-lg border border-amber-300/50 bg-amber-300/15 text-sm font-black text-amber-200">
              E
            </span>
            <span className="max-w-[54vw] truncate text-sm font-bold text-white">{near.label}</span>
          </div>
        </div>
      )}

      {/* ------------------- touch controls ------------------- */}
      <TouchControls engine={engine} hidden={cs.active || inPanel} />

      {/* ------------------- toasts ------------------- */}
      <div className="pointer-events-none absolute inset-x-2 top-[104px] z-40 flex flex-col items-center gap-2 sm:inset-x-auto sm:bottom-4 sm:right-3 sm:top-auto sm:w-[260px] sm:items-stretch">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "animate-[toastIn_.35s_ease-out] rounded-xl border px-3 py-2 text-xs font-semibold backdrop-blur-xl",
              t.kind === "success" && "border-emerald-400/40 bg-emerald-500/20 text-emerald-50",
              t.kind === "score" && "border-amber-300/50 bg-amber-400/20 text-amber-50",
              t.kind === "warn" && "border-orange-400/40 bg-orange-500/20 text-orange-50",
              t.kind === "info" && "border-sky-400/40 bg-sky-500/20 text-sky-50"
            )}
          >
            {t.text}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes toastIn { from { opacity: 0; transform: translateX(20px) } to { opacity: 1; transform: none } }
      `}</style>
    </>
  );
}

// ============================================================== minimap
function Minimap({ engine }: { engine: GameEngine | null }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [open, setOpen] = useState(() => (typeof window === "undefined" ? true : window.innerWidth >= 640));

  useEffect(() => {
    if (!engine || !ref.current) return;
    const cvs = ref.current;
    const ctx = cvs.getContext("2d")!;
    let raf = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const W = cvs.width;
      const H = cvs.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "rgba(6,12,24,0.78)";
      ctx.fillRect(0, 0, W, H);
      const toX = (x: number) => ((x + 130) / 260) * W;
      const toY = (z: number) => ((z + 110) / 230) * H;
      // roads
      ctx.strokeStyle = "rgba(148,163,184,0.28)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(toX(-130), toY(0));
      ctx.lineTo(toX(130), toY(0));
      ctx.moveTo(toX(0), toY(-110));
      ctx.lineTo(toX(0), toY(118));
      ctx.stroke();
      // plaza
      ctx.beginPath();
      ctx.arc(toX(0), toY(14), 10, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(148,163,184,0.18)";
      ctx.fill();
      // zone blips
      for (const b of engine.live.blips) {
        ctx.beginPath();
        ctx.arc(toX(b.x), toY(b.z), 5, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.font = "8px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(b.label.split(" ")[0].slice(0, 9), toX(b.x), toY(b.z) - 8);
      }
      // player
      const px = toX(engine.live.px);
      const py = toY(engine.live.pz);
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(-engine.live.pyaw + Math.PI);
      ctx.beginPath();
      ctx.moveTo(0, -7);
      ctx.lineTo(5, 6);
      ctx.lineTo(0, 3);
      ctx.lineTo(-5, 6);
      ctx.closePath();
      ctx.fillStyle = "#fbbf24";
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [engine]);

  return (
    <div className="absolute left-2 top-[104px] z-20 sm:bottom-3 sm:left-3 sm:top-auto">
      <div className="flex items-center gap-2">
        <canvas
          ref={ref}
          width={168}
          height={150}
          className="h-[110px] w-[123px] rounded-xl border border-white/15 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.9)] sm:h-[150px] sm:w-[168px]"
          style={{ display: open ? "block" : "none" }}
        />
      </div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="mt-1 rounded-lg border border-white/15 bg-[#0a1020]/80 px-2 py-1 text-[10px] font-bold text-slate-300"
      >
        {open ? "✕ PETA" : "🗺 PETA"}
      </button>
    </div>
  );
}

// ============================================================== touch controls
function TouchControls({ engine, hidden }: { engine: GameEngine | null; hidden: boolean }) {
  const [run, setRun] = useState(false);

  useEffect(() => {
    input.joyRun = run;
  }, [run]);

  if (hidden) return null;
  return (
    <>
      {/* joystick */}
      <div
        className="absolute bottom-6 left-4 z-30 h-28 w-28 touch-none rounded-full sm:h-32 sm:w-32 border border-white/20 bg-[#0a1020]/45 backdrop-blur-md sm:left-auto sm:right-56"
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          handleJoy(e.clientX, e.clientY, e.currentTarget as HTMLElement);
        }}
        onPointerMove={(e) => {
          if (e.buttons || e.pointerType === "touch") handleJoy(e.clientX, e.clientY, e.currentTarget as HTMLElement);
        }}
        onPointerUp={() => {
          input.joyX = 0;
          input.joyY = 0;
        }}
        onPointerCancel={() => {
          input.joyX = 0;
          input.joyY = 0;
        }}
      >
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-[10px] font-bold uppercase tracking-widest text-white/40">
          gerak
        </div>
      </div>

      {/* action buttons */}
      <div className="absolute bottom-6 right-4 z-30 flex flex-col items-end gap-2">
        <button
          onClick={() => setRun((r) => !r)}
          className={cn(
            "h-11 w-11 rounded-full border text-[10px] font-black backdrop-blur-md sm:h-12 sm:w-12 sm:text-[11px]",
            run ? "border-amber-300/70 bg-amber-400/30 text-amber-100" : "border-white/25 bg-[#0a1020]/60 text-white/70"
          )}
        >
          LARI
        </button>
        <button
          onClick={() => {
            pressJump();
          }}
          className="h-12 w-12 rounded-full border border-white/25 bg-[#0a1020]/60 text-[9px] sm:h-14 sm:w-14 sm:text-[11px] font-black text-white/80 backdrop-blur-md"
        >
          LOMPAT
        </button>
        <button
          onClick={() => {
            if (engine) engine.tryInteract();
            else pressInteract();
          }}
          className="h-16 w-16 rounded-full border-2 border-amber-300/70 sm:h-20 sm:w-20 bg-amber-400/25 text-sm font-black text-amber-50 shadow-[0_0_40px_-8px_rgba(251,191,36,0.9)] backdrop-blur-md"
        >
          E
          <span className="block text-[9px] font-bold">INTERAKSI</span>
        </button>
      </div>
    </>
  );
}

function handleJoy(cx: number, cy: number, el: HTMLElement) {
  const r = el.getBoundingClientRect();
  const dx = (cx - (r.left + r.width / 2)) / (r.width / 2);
  const dy = (cy - (r.top + r.height / 2)) / (r.height / 2);
  const len = Math.hypot(dx, dy) || 1;
  const cl = Math.min(1, len);
  input.joyX = (dx / len) * cl;
  input.joyY = (-dy / len) * cl;
}
