import { useMemo, useState } from "react";
import type { GameEngine } from "../game/engine";
import type { PosterDef, ZoneDef } from "../game/types";
import { useGame } from "../state/store";
import { GAME_INFO, ORBS, ZONES, ZONE_BY_ID } from "../game/content";
import { Button, Panel, Progress, SectionTitle, Stars, Tag, toggleFullscreen } from "./ui";
import { cn } from "../utils/cn";
import { sound } from "../game/audio";
import { posterDataURL } from "../game/textures";
import { printHTML } from "./print";

export function Overlay({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="pointer-events-auto absolute inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#04070f]/85 p-2 backdrop-blur-md sm:items-center sm:p-4">
      <Panel className={cn("w-full overflow-hidden", wide ? "max-w-4xl" : "max-w-2xl")}>{children}</Panel>
    </div>
  );
}

// ============================================================ PAUSE
export function PauseMenu({ engine, onResume }: { engine: GameEngine | null; onResume: () => void }) {
  const setScreen = useGame((s) => s.setScreen);
  const setPanel = useGame((s) => s.setPanel);
  const setTabs = useGame((s) => s.setTabs);
  const resetProgress = useGame((s) => s.resetProgress);
  const notify = useGame((s) => s.notify);
  const activeZone = useGame((s) => s.activeZone);
  const zone = ZONE_BY_ID[activeZone] ?? ZONES[0];

  const restart = () => {
    if (zone.position) engine?.teleport(zone.position[0] + 4, zone.position[1] + 8, Math.PI);
    if (zone.id === "studio") engine?.world.resetStudio();
    engine?.dropCarried();
    notify(`Zona ${zone.name} dimulai ulang. Poin yang sudah diperoleh tetap tersimpan.`, "info");
    onResume();
  };

  return (
    <Overlay>
      <div className="border-b border-white/10 p-4">
        <h2 className="text-xl font-black text-white">⏸ Jeda Permainan</h2>
        <p className="text-xs text-slate-400">
          {GAME_INFO.title}: {GAME_INFO.subtitle} — Zona {zone.index}: {zone.name}
        </p>
      </div>
      <div className="grid gap-2 p-4 sm:grid-cols-2">
        <Button variant="primary" onClick={onResume}>
          ▶ Lanjutkan (Resume)
        </Button>
        <Button variant="ghost" onClick={restart}>
          ↺ Ulangi Zona Ini
        </Button>
        <Button variant="ghost" onClick={() => setTabs(zone.id, "teori")}>
          📚 Buka Materi Pembelajaran
        </Button>
        <Button variant="ghost" onClick={() => setPanel("settings")}>
          ⚙️ Pengaturan Audio &amp; Grafis
        </Button>
        <Button variant="ghost" onClick={() => setPanel("help")}>
          ？ Petunjuk Permainan
        </Button>
        <Button variant="ghost" onClick={() => setPanel("journal")}>
          📔 Jurnal &amp; Progres
        </Button>
        <Button variant="soft" onClick={toggleFullscreen}>
          ⛶ Layar Penuh
        </Button>
        <Button variant="soft" onClick={() => setScreen("dashboard")}>
          🏠 Kembali ke Dashboard
        </Button>
        <Button
          variant="danger"
          className="sm:col-span-2"
          onClick={() => {
            if (!confirm("Reset seluruh game? Skor, bintang, progres, dan isian LKM akan dihapus. Data lain di browser tidak tersentuh.")) return;
            resetProgress();
            setScreen("dashboard");
          }}
        >
          ⚠ Reset Seluruh Game
        </Button>
      </div>
    </Overlay>
  );
}

// ============================================================ SETTINGS
export function SettingsPanel() {
  const settings = useGame((s) => s.settings);
  const setSettings = useGame((s) => s.setSettings);
  return (
    <Overlay>
      <div className="border-b border-white/10 p-4">
        <h2 className="text-xl font-black text-white">⚙️ Pengaturan</h2>
        <p className="text-xs text-slate-400">Audio, kualitas grafis, dan kontrol kamera.</p>
      </div>
      <div className="space-y-5 p-4">
        <div>
          <SectionTitle icon="🔊">Audio</SectionTitle>
          <div className="space-y-2">
            <Toggle
              label="Musik latar"
              value={settings.music}
              onChange={(v) => {
                setSettings({ music: v });
                sound.setMusic(v);
              }}
            />
            <Toggle
              label="Efek suara"
              value={settings.sfx}
              onChange={(v) => {
                setSettings({ sfx: v });
                sound.setSfx(v);
              }}
            />
            <label className="block">
              <span className="flex justify-between text-[11px] font-bold text-slate-400">
                <span>Volume utama</span>
                <span className="text-slate-200">{Math.round(settings.volume * 100)}%</span>
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(settings.volume * 100)}
                onChange={(e) => {
                  const v = Number(e.target.value) / 100;
                  setSettings({ volume: v });
                  sound.setVolume(v);
                }}
                className="mt-1 w-full accent-amber-400"
              />
            </label>
          </div>
        </div>

        <div>
          <SectionTitle icon="🖥️">Kualitas Grafis</SectionTitle>
          <div className="grid gap-2 sm:grid-cols-3">
            {(["low", "medium", "high"] as const).map((q) => (
              <button
                key={q}
                onClick={() => {
                  sound.click();
                  setSettings({ quality: q });
                }}
                className={cn(
                  "rounded-xl border p-3 text-left text-xs transition",
                  settings.quality === q ? "border-amber-300/60 bg-amber-300/15 text-amber-50" : "border-white/12 bg-white/[0.03] text-slate-300 hover:bg-white/[0.07]"
                )}
              >
                <p className="font-black uppercase">{q === "low" ? "Rendah" : q === "medium" ? "Sedang" : "Tinggi"}</p>
                <p className="mt-1 text-[10px] leading-snug text-slate-400">
                  {q === "low"
                    ? "Render lebih ringan, bayangan sederhana, partikel minimal."
                    : q === "medium"
                    ? "Pencahayaan seimbang, bayangan sedang, detail menengah."
                    : "Bayangan halus, efek atmosfer, detail lingkungan penuh."}
                </p>
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Perubahan kualitas diterapkan segera pada renderer; jumlah detail geometri lingkungan diterapkan penuh saat dunia
            dimuat ulang.
          </p>
        </div>

        <div>
          <SectionTitle icon="🎥">Kamera</SectionTitle>
          <Toggle
            label="Kamera otomatis mengikuti arah gerak (berguna untuk papan interaktif)"
            value={settings.autoCamera}
            onChange={(v) => setSettings({ autoCamera: v })}
          />
        </div>
      </div>
      <div className="flex justify-end border-t border-white/10 p-3">
        <Button variant="primary" onClick={() => useGame.getState().setPanel(null)}>
          Selesai
        </Button>
      </div>
    </Overlay>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => {
        sound.click();
        onChange(!value);
      }}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/12 bg-white/[0.03] p-3 text-left text-xs text-slate-200 hover:bg-white/[0.06]"
    >
      <span>{label}</span>
      <span
        className={cn(
          "relative h-5 w-10 shrink-0 rounded-full transition",
          value ? "bg-emerald-400/80" : "bg-white/15"
        )}
      >
        <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all", value ? "left-5" : "left-0.5")} />
      </span>
    </button>
  );
}

// ============================================================ HELP
export function HelpPanel() {
  const setPanel = useGame((s) => s.setPanel);
  return (
    <Overlay wide>
      <div className="border-b border-white/10 p-4">
        <h2 className="text-xl font-black text-white">？ Petunjuk Permainan</h2>
        <p className="text-xs text-slate-400">Cara bermain di laptop, tablet/Android, dan papan interaktif digital.</p>
      </div>
      <div className="grid gap-4 p-4 md:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <SectionTitle icon="💻">Laptop / PC</SectionTitle>
          <ul className="space-y-1 text-xs text-slate-300">
            <li>
              <b>W / A / S / D</b> — bergerak
            </li>
            <li>
              <b>Shift</b> — berlari
            </li>
            <li>
              <b>Space</b> — melompat
            </li>
            <li>
              <b>E</b> — berinteraksi dengan objek
            </li>
            <li>
              <b>Seret mouse</b> — memutar kamera
            </li>
            <li>
              <b>Scroll</b> — zoom kamera
            </li>
            <li>
              <b>Esc</b> — jeda / menu · <b>M</b> — peta
            </li>
          </ul>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <SectionTitle icon="📱">Android / Tablet</SectionTitle>
          <ul className="space-y-1 text-xs text-slate-300">
            <li>Joystick virtual di kanan bawah — bergerak</li>
            <li>Seret sisi kanan layar — memutar kamera</li>
            <li>Tombol <b>E</b> besar — interaksi</li>
            <li>Tombol <b>LOMPAT</b> dan <b>LARI</b></li>
            <li>Tombol ⏸ di pojok — jeda</li>
          </ul>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <SectionTitle icon="📽️">Papan Interaktif</SectionTitle>
          <ul className="space-y-1 text-xs text-slate-300">
            <li>Aktifkan mode kamera otomatis di Pengaturan</li>
            <li>Gunakan tombol navigasi besar pada HUD</li>
            <li>Gunakan tombol panah untuk kamera</li>
            <li>Antarmuka menyesuaikan ukuran layar</li>
          </ul>
        </div>
      </div>
      <div className="space-y-3 border-t border-white/10 p-4">
        <SectionTitle icon="🎯">Alur Permainan</SectionTitle>
        <ol className="space-y-1 text-xs text-slate-300">
          <li>1. Isi identitas → masuk ke dashboard → pilih MULAI PETUALANGAN.</li>
          <li>2. Jelajahi Kota Informasi secara bebas: kumpulkan pecahan informasi (+10) dan bicara dengan NPC.</li>
          <li>3. Masuki portal zona untuk membuka misi. Selesaikan seluruh tantangan pada zona itu (+20/+30 per tantangan).</li>
          <li>4. Zona berikutnya terbuka otomatis setelah zona sebelumnya tuntas (+50).</li>
          <li>5. Selesaikan 6 zona untuk misi final dan bonus +100, lalu lihat hasil &amp; cetak laporan.</li>
        </ol>
        <div className="rounded-xl border border-amber-300/25 bg-amber-300/10 p-3 text-[11px] leading-relaxed text-amber-50">
          <b>Sistem bintang:</b> 3★ tanpa bantuan &amp; tanpa kesalahan · 2★ maksimal 2 bantuan dan 3 kesalahan · 1★ lainnya. Poin hanya
          diberikan sekali untuk setiap aktivitas.
        </div>
      </div>
      <div className="flex justify-end border-t border-white/10 p-3">
        <Button variant="primary" onClick={() => setPanel(null)}>
          Mengerti
        </Button>
      </div>
    </Overlay>
  );
}

// ============================================================ JOURNAL
export function JournalPanel() {
  const setPanel = useGame((s) => s.setPanel);
  const progress = useGame((s) => s.progress);
  const profile = useGame((s) => s.profile);
  const totalTasks = ZONES.reduce((a, z) => a + z.tasks.length, 0);
  const stars = Object.values(progress.stars).reduce((a, b) => a + b, 0);

  return (
    <Overlay wide>
      <div className="border-b border-white/10 p-4">
        <h2 className="text-xl font-black text-white">📔 Jurnal &amp; Progres Belajar</h2>
        <p className="text-xs text-slate-400">
          {profile?.name} · Kelas {profile?.className} · Skor {progress.score} · ⭐ {stars}
        </p>
      </div>
      <div className="space-y-4 p-4">
        <div className="grid gap-2 sm:grid-cols-3">
          <MiniStat label="Tantangan" value={`${progress.taskDone.length}/${totalTasks}`} />
          <MiniStat label="Pecahan informasi" value={`${progress.orbs.length}/${ORBS.length}`} />
          <MiniStat label="Zona selesai" value={`${progress.completedZones.length}/${ZONES.length}`} />
        </div>
        <Progress value={(progress.taskDone.length / totalTasks) * 100} />

        <div>
          <SectionTitle icon="🔮">Catatan Pecahan Informasi</SectionTitle>
          {progress.journal.length === 0 ? (
            <p className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-400">
              Belum ada catatan. Cari bola cahaya yang melayang di seluruh Kota Informasi.
            </p>
          ) : (
            <div className="space-y-1.5">
              {progress.journal.map((j, i) => (
                <p key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-[11px] leading-relaxed text-slate-300">
                  🔹 {j}
                </p>
              ))}
            </div>
          )}
        </div>

        <div>
          <SectionTitle icon="🗺️">Status Zona</SectionTitle>
          <div className="grid gap-2 sm:grid-cols-2">
            {ZONES.map((z) => {
              const done = progress.completedZones.includes(z.id);
              const locked = z.index > progress.unlockedZone;
              return (
                <div key={z.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                  <span className="text-lg">{locked ? "🔒" : z.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-white">{z.name}</p>
                    <p className="text-[10px] text-slate-400">
                      {z.tasks.filter((t) => progress.taskDone.includes(t.id)).length}/{z.tasks.length} tantangan
                    </p>
                  </div>
                  {done ? <Stars n={progress.stars[z.id] ?? 0} size={12} /> : <Tag color={locked ? "#94a3b8" : z.color}>{locked ? "Terkunci" : "Aktif"}</Tag>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-white/10 p-3">
        <Button
          variant="ghost"
          onClick={() =>
            printHTML(
              "Jurnal Ekspedisi Literasi",
              `<h1>Jurnal Ekspedisi Literasi: Kota Informasi</h1>
               <p><b>Nama:</b> ${profile?.name ?? "-"} · <b>Kelas:</b> ${profile?.className ?? "-"} / ${profile?.absent ?? "-"}</p>
               <p><b>Skor:</b> ${progress.score} · <b>Bintang:</b> ${stars} · <b>Tantangan:</b> ${progress.taskDone.length}/${totalTasks}</p>
               <h2>Catatan Pecahan Informasi</h2>
               ${progress.journal.map((j) => `<div class="q"><p>${j}</p></div>`).join("") || "<p><i>(belum ada)</i></p>"}
               <h2>Status Zona</h2>
               ${ZONES.map(
                 (z) =>
                   `<div class="q"><p><b>${z.name}</b> — ${
                     progress.completedZones.includes(z.id) ? "selesai" : z.index > progress.unlockedZone ? "terkunci" : "berjalan"
                   } (${z.tasks.filter((t) => progress.taskDone.includes(t.id)).length}/${z.tasks.length})</p></div>`
               ).join("")}
               <p class="foot">${GAME_INFO.title}: ${GAME_INFO.subtitle} — ${GAME_INFO.developer}, ${GAME_INFO.school} (${GAME_INFO.year}).</p>`
            )
          }
        >
          🖨 Cetak Jurnal
        </Button>
        <Button variant="primary" onClick={() => setPanel(null)}>
          Tutup
        </Button>
      </div>
    </Overlay>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-xl font-black text-white">{value}</p>
    </div>
  );
}

// ============================================================ BRIEF
export function BriefPanel({ zone, onStart }: { zone: ZoneDef; onStart: (taskId: string | null) => void }) {
  const progress = useGame((s) => s.progress);
  const setPanel = useGame((s) => s.setPanel);
  const setTabs = useGame((s) => s.setTabs);
  const nextTask = zone.tasks.find((t) => !progress.taskDone.includes(t.id)) ?? null;
  const done = progress.completedZones.includes(zone.id);

  return (
    <Overlay wide>
      <div className="relative border-b border-white/10 p-5" style={{ background: `linear-gradient(120deg, ${zone.color}18, transparent 60%)` }}>
        <div className="flex flex-wrap items-center gap-3">
          <span className="grid h-14 w-14 place-items-center rounded-2xl text-3xl" style={{ background: `${zone.color}22` }}>
            {zone.icon}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-200/80">{zone.levelLabel}</p>
            <h2 className="text-2xl font-black text-white">{zone.name}</h2>
            <p className="text-xs text-slate-400">{zone.subtitle}</p>
          </div>
          {done && <Tag color="#34d399">Zona selesai</Tag>}
        </div>
      </div>
      <div className="space-y-4 p-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <SectionTitle icon="📖">Cerita</SectionTitle>
          <p className="text-sm leading-relaxed text-slate-200">{zone.story}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <SectionTitle icon="🎯">Misi</SectionTitle>
          <p className="text-sm leading-relaxed text-slate-200">{zone.mission}</p>
          <ul className="mt-2 space-y-1 text-xs text-slate-300">
            {zone.targets.map((t, i) => (
              <li key={i}>▸ {t}</li>
            ))}
          </ul>
        </div>
        <div>
          <SectionTitle icon="🧩">Tantangan</SectionTitle>
          <div className="space-y-2">
            {zone.tasks.map((t, i) => {
              const isDone = progress.taskDone.includes(t.id);
              return (
                <div key={t.id} className={cn("rounded-xl border p-3", isDone ? "border-emerald-400/30 bg-emerald-400/10" : "border-white/10 bg-white/[0.03]")}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-white">
                      {i + 1}. {t.title}
                    </p>
                    <span className="flex items-center gap-2">
                      {t.simulation && <Tag color="#38bdf8">Simulasi</Tag>}
                      <Tag color={isDone ? "#34d399" : "#fbbf24"}>{isDone ? "Selesai" : `${t.points} poin`}</Tag>
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-300">{t.brief}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-white/10 p-3">
        <Button variant="gold" size="lg" onClick={() => onStart(nextTask ? nextTask.id : null)}>
          {nextTask ? "🎬 MULAI TANTANGAN" : "🔁 ULANGI TANTANGAN TERAKHIR"}
        </Button>
        <Button variant="ghost" onClick={() => setTabs(zone.id, "teori")}>
          📚 Pelajari Materi Dulu
        </Button>
        <Button variant="soft" className="ml-auto" onClick={() => setPanel(null)}>
          Jelajahi Dulu
        </Button>
      </div>
    </Overlay>
  );
}

// ============================================================ NPC
export function NPCPanel({ npc, onClose }: { npc: { name: string; role: string; lines: string[] }; onClose: () => void }) {
  const [i, setI] = useState(0);
  const last = i >= npc.lines.length - 1;
  return (
    <Overlay>
      <div className="flex items-center gap-4 border-b border-white/10 p-4">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sky-400/30 to-indigo-600/30 text-3xl ring-1 ring-white/20">
          🧑‍🏫
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-sky-300/80">{npc.role}</p>
          <h3 className="text-xl font-black text-white">{npc.name}</h3>
        </div>
      </div>
      <div className="p-5">
        <p className="min-h-[80px] rounded-2xl rounded-tl-sm border border-white/12 bg-white/[0.05] p-4 text-sm leading-relaxed text-slate-100">
          “{npc.lines[i]}”
        </p>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex flex-1 gap-1">
            {npc.lines.map((_, k) => (
              <span key={k} className={cn("h-1.5 flex-1 rounded-full", k <= i ? "bg-amber-300" : "bg-white/15")} />
            ))}
          </div>
          <Button
            variant="primary"
            onClick={() => {
              if (last) onClose();
              else setI(i + 1);
            }}
          >
            {last ? "Tutup Percakapan" : "Lanjut →"}
          </Button>
        </div>
      </div>
    </Overlay>
  );
}

// ============================================================ POSTER INSPECT
export function PosterPanel({ poster, onClose }: { poster: PosterDef; onClose: () => void }) {
  const url = useMemo(() => posterDataURL(poster), [poster]);
  return (
    <Overlay wide>
      <div className="border-b border-white/10 p-4">
        <h2 className="text-xl font-black text-white">🖼️ Analisis Poster: {poster.title}</h2>
        <p className="text-xs text-slate-400">Amati unsur, tujuan, dan makna tersurat–tersirat.</p>
      </div>
      <div className="grid gap-4 p-4 md:grid-cols-[280px_1fr]">
        <img src={url} alt={poster.title} className="mx-auto w-full max-w-[280px] rounded-xl border-2 border-white/20" />
        <div className="space-y-2 text-xs leading-relaxed text-slate-300">
          <Row label="Tujuan" value={poster.purpose} />
          <Row label="Makna tersurat" value={poster.explicitMeaning} />
          <Row label="Makna tersirat" value={poster.impliedMeaning} />
          <Row label="Catatan analisis" value={poster.analysis} />
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <SectionTitle icon="🧩">Unsur Poster</SectionTitle>
            <ul className="space-y-1">
              {poster.regions.map((r) => (
                <li key={r.id}>
                  <b className="text-white">{r.label}:</b> {r.note}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="flex justify-end border-t border-white/10 p-3">
        <Button variant="primary" onClick={onClose}>
          Kembali ke Galeri
        </Button>
      </div>
    </Overlay>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <p className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <b className="text-amber-200">{label}:</b> {value}
    </p>
  );
}
