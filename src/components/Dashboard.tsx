import { useGame } from "../state/store";
import { Button, Panel, Progress, Stars, Tag, toggleFullscreen } from "./ui";
import { GAME_INFO, ZONES } from "../game/content";
import { sound } from "../game/audio";

export default function Dashboard() {
  const profile = useGame((s) => s.profile);
  const progress = useGame((s) => s.progress);
  const setScreen = useGame((s) => s.setScreen);
  const setActive = useGame((s) => s.setActive);
  const setTabs = useGame((s) => s.setTabs);
  const setPanel = useGame((s) => s.setPanel);
  const notify = useGame((s) => s.notify);
  const resetProgress = useGame((s) => s.resetProgress);

  const totalTasks = ZONES.reduce((a, z) => a + z.tasks.length, 0);
  const pct = Math.round((progress.taskDone.length / totalTasks) * 100);
  const stars = Object.values(progress.stars).reduce((a, b) => a + b, 0);
  const nextZone = ZONES.find((z) => !progress.completedZones.includes(z.id)) ?? ZONES[ZONES.length - 1];
  const allDone = progress.completedZones.length === ZONES.length;

  const start = () => {
    sound.gate();
    setActive(nextZone.id, null);
    setScreen("game");
  };

  return (
    <div className="pointer-events-auto absolute inset-0 z-20 flex justify-center gap-5 overflow-y-auto overscroll-contain p-3 sm:p-6">
      <div className="m-auto grid w-full max-w-[1500px] gap-5 xl:grid-cols-[380px_1fr]">
        {/* -------------------- left: identity & stats -------------------- */}
        <div className="space-y-4">
          <Panel className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 shrink-0 rounded-2xl bg-gradient-to-br from-sky-400/30 to-indigo-600/30 ring-1 ring-white/20">
                <div className="absolute inset-0 grid place-items-center text-4xl">🧑‍🎓</div>
                <div className="absolute -bottom-2 -right-2 rounded-lg bg-amber-400 px-1.5 py-0.5 text-[9px] font-black text-[#2a1802]">
                  FASE F
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Selamat datang,</p>
                <h1 className="truncate text-2xl font-black text-white">{profile?.name ?? "Penjelajah"}</h1>
                <p className="text-xs text-slate-400">
                  Kelas {profile?.className ?? "-"} · Absen {profile?.absent ?? "-"}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <Stat label="Skor" value={progress.score} color="#fbbf24" icon="⭐" />
              <Stat label="Bintang" value={`${stars}/${ZONES.length * 3}`} color="#f472b6" icon="★" />
              <Stat label="Pecahan" value={`${progress.orbs.length}/8`} color="#38bdf8" icon="🔮" />
            </div>

            <div className="mt-5">
              <div className="mb-1.5 flex justify-between text-[11px] font-bold uppercase tracking-widest text-slate-400">
                <span>Progres Pembelajaran</span>
                <span className="text-amber-200">{pct}%</span>
              </div>
              <Progress value={pct} />
              <p className="mt-2 text-[11px] text-slate-400">
                {progress.taskDone.length}/{totalTasks} tantangan · {progress.completedZones.length}/{ZONES.length} zona selesai
              </p>
            </div>
          </Panel>

          <Panel className="p-5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Peta Zona</p>
            <div className="mt-3 space-y-2">
              {ZONES.map((z) => {
                const done = progress.completedZones.includes(z.id);
                const locked = z.index > progress.unlockedZone;
                const zoneTasks = z.tasks.length;
                const doneTasks = z.tasks.filter((t) => progress.taskDone.includes(t.id)).length;
                return (
                  <div
                    key={z.id}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-2.5"
                    style={{ borderColor: `${z.color}33` }}
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-lg" style={{ background: `${z.color}22` }}>
                      {locked ? "🔒" : z.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-white">{z.name}</p>
                      <p className="truncate text-[10px] text-slate-400">
                        {locked ? "Terkunci — selesaikan zona sebelumnya" : `${doneTasks}/${zoneTasks} tantangan`}
                      </p>
                    </div>
                    {done ? <Stars n={progress.stars[z.id] ?? 0} size={13} /> : locked ? <Tag color="#94a3b8">Terkunci</Tag> : <Tag color={z.color}>Aktif</Tag>}
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>

        {/* -------------------- right: menus -------------------- */}
        <div className="space-y-4">
          <Panel className="relative overflow-hidden p-6">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-amber-400/15 blur-3xl" />
            <div className="relative flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-amber-200/80">{GAME_INFO.curriculum}</p>
                <h2 className="mt-1 text-3xl font-black leading-tight text-white">
                  EKSPEDISI LITERASI: <span className="text-sky-300">KOTA INFORMASI</span>
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  {GAME_INFO.subject} · {GAME_INFO.grade} · {GAME_INFO.phase} · Semester {GAME_INFO.semester} · {GAME_INFO.year}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="soft" size="sm" onClick={toggleFullscreen}>
                  ⛶ Layar Penuh
                </Button>
                <Button variant="soft" size="sm" onClick={() => setPanel("help")}>
                  ？ Petunjuk
                </Button>
              </div>
            </div>

            <div className="relative mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <MenuButton
                title="MULAI PETUALANGAN"
                desc={allDone ? "Semua zona selesai — ulangi atau lihat hasil" : `Lanjut ke ${nextZone.name}`}
                icon="🎮"
                accent="#fbbf24"
                big
                onClick={start}
              />
              <MenuButton title="PENDAHULUAN & CP-TP" desc="Capaian & tujuan pembelajaran" icon="📜" accent="#38bdf8" onClick={() => setTabs("gerbang", "teori")} />
              <MenuButton title="TEORI PEMBELAJARAN" desc="Ringkasan materi tiap zona" icon="📚" accent="#a78bfa" onClick={() => setTabs(nextZone.id, "teori")} />
              <MenuButton title="PROSEDUR SIMULASI 3D" desc="Langkah & simulasi interaktif" icon="🧪" accent="#34d399" onClick={() => setTabs(nextZone.id, "prosedur")} />
              <MenuButton title="LKM DIGITAL" desc="Lembar kerja, cetak/PDF" icon="📝" accent="#f472b6" onClick={() => setTabs(nextZone.id, "lkm")} />
              <MenuButton title="PENGEMBANG" desc="Profil & teknologi" icon="🧑‍💻" accent="#94a3b8" onClick={() => setTabs("gerbang", "pengembang")} />
              <MenuButton title="JURNAL PETUNJUK" desc="Catatan pecahan informasi" icon="📔" accent="#fdba74" onClick={() => setPanel("journal")} />
              <MenuButton title="PENGATURAN" desc="Audio, grafis, kamera" icon="⚙️" accent="#cbd5e1" onClick={() => setPanel("settings")} />
              <MenuButton
                title={allDone ? "LIHAT HASIL AKHIR" : "RESET PROGRES"}
                desc={allDone ? "Skor, bintang, sertifikat" : "Mulai ekspedisi dari awal"}
                icon={allDone ? "🏆" : "♻️"}
                accent={allDone ? "#fbbf24" : "#fb7185"}
                onClick={() => {
                  if (allDone) setScreen("results");
                  else if (confirm("Reset seluruh progres game ini? Data LKM ikut terhapus (hanya data game, bukan data lain di browser).")) {
                    resetProgress();
                    notify("Progres direset. Ekspedisi dimulai dari awal.", "warn");
                  }
                }}
              />
            </div>
          </Panel>

          <Panel className="p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Tag color="#fbbf24">Misi Aktif</Tag>
              <p className="text-sm text-slate-300">
                <b className="text-white">{nextZone.levelLabel}</b> — {nextZone.mission}
              </p>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {nextZone.targets.map((t, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-300">
                  <span className="mr-1 text-amber-300">▸</span>
                  {t}
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-slate-500">
              Catatan: materi tambahan di luar poster/teks persuasif merupakan rancangan pembelajaran yang perlu diverifikasi guru
              terhadap ATP/modul ajar yang digunakan. Hasil permainan merupakan informasi latihan belajar, bukan nilai resmi sekolah.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color, icon }: { label: string; value: string | number; color: string; icon: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {icon} {label}
      </p>
      <p className="mt-0.5 text-xl font-black" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

function MenuButton({
  title,
  desc,
  icon,
  accent,
  onClick,
  big,
}: {
  title: string;
  desc: string;
  icon: string;
  accent: string;
  onClick: () => void;
  big?: boolean;
}) {
  return (
    <button
      onClick={() => {
        sound.init();
        sound.click();
        onClick();
      }}
      onMouseEnter={() => sound.hover()}
      className={`group relative overflow-hidden rounded-xl border border-white/12 bg-[#0b1324]/70 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-white/25 active:scale-[0.98] ${
        big ? "sm:col-span-2 lg:col-span-1" : ""
      }`}
      style={{ boxShadow: `inset 0 0 0 1px ${accent}22` }}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-25 blur-2xl transition-opacity group-hover:opacity-60"
        style={{ background: accent }}
      />
      <div className="relative flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-xl" style={{ background: `${accent}1f` }}>
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-black uppercase tracking-wide text-white" style={{ textShadow: `0 0 18px ${accent}55` }}>
            {title}
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-slate-400">{desc}</p>
        </div>
      </div>
    </button>
  );
}
