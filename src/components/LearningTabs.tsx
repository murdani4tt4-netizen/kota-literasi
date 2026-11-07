import { useMemo, useState } from "react";
import { useGame } from "../state/store";
import { GAME_INFO, POSTERS, ZONES, ZONE_BY_ID } from "../game/content";
import { posterDataURL } from "../game/textures";
import { Button, Panel, Progress, SectionTitle, Stars, Tag } from "./ui";
import { cn } from "../utils/cn";
import { sound } from "../game/audio";
import { printHTML } from "./print";

type Tab = "teori" | "prosedur" | "simulasi" | "lkm" | "pengembang";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "teori", label: "Teori", icon: "📚" },
  { id: "prosedur", label: "Prosedur", icon: "🧭" },
  { id: "simulasi", label: "Simulasi 3D", icon: "🧪" },
  { id: "lkm", label: "LKM Digital", icon: "📝" },
  { id: "pengembang", label: "Pengembang", icon: "🧑‍💻" },
];

export default function LearningTabs() {
  const tab = useGame((s) => s.tab);
  const setTab = useGame((s) => s.setTab);
  const setPanel = useGame((s) => s.setPanel);
  const tabsZone = useGame((s) => s.tabsZone);
  const setTabs = useGame((s) => s.setTabs);
  const profile = useGame((s) => s.profile);
  const zone = ZONE_BY_ID[tabsZone] ?? ZONES[0];

  return (
    <div className="pointer-events-auto absolute inset-0 z-50 flex flex-col bg-[#04070f]/88 p-2 backdrop-blur-md sm:p-4">
      <Panel className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* header */}
        <div className="flex flex-wrap items-center gap-3 border-b border-white/10 p-3 sm:p-4">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-200/80">Pusat Materi Pembelajaran</p>
            <h2 className="truncate text-lg font-black text-white sm:text-xl">
              {GAME_INFO.title}: {GAME_INFO.subtitle}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-slate-400 sm:inline">
              {profile?.name} · {profile?.className}
            </span>
            <Button variant="soft" size="sm" onClick={() => setPanel(null)}>
              ✕ Tutup
            </Button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
          {/* tab rail */}
          <div className="shrink-0 border-b border-white/10 p-2 lg:w-56 lg:border-b-0 lg:border-r">
            <div className="flex gap-1 overflow-x-auto lg:flex-col">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    sound.click();
                    setTab(t.id);
                  }}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-bold transition",
                    tab === t.id
                      ? "border-amber-300/50 bg-amber-300/15 text-amber-100"
                      : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.07]"
                  )}
                >
                  <span className="text-base">{t.icon}</span>
                  <span className="whitespace-nowrap">{t.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-3 hidden lg:block">
              <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Pilih Zona</p>
              <div className="mt-1.5 space-y-1">
                {ZONES.map((z) => (
                  <button
                    key={z.id}
                    onClick={() => {
                      sound.click();
                      setTabs(z.id, tab);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] transition",
                      tabsZone === z.id ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5"
                    )}
                  >
                    <span>{z.icon}</span>
                    <span className="truncate">{z.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* content */}
          <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5">
            {tab === "teori" && <Teori zoneId={zone.id} />}
            {tab === "prosedur" && <Prosedur zoneId={zone.id} />}
            {tab === "simulasi" && <Simulasi zoneId={zone.id} />}
            {tab === "lkm" && <LKM zoneId={zone.id} />}
            {tab === "pengembang" && <Pengembang />}
          </div>
        </div>
      </Panel>
    </div>
  );
}

// ================================================================ TAB 1
function Teori({ zoneId }: { zoneId: string }) {
  const zone = ZONE_BY_ID[zoneId];
  const progress = useGame((s) => s.progress);
  const [page, setPage] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const pages = ["Ringkasan", "Konsep Utama", "Istilah", "Contoh", "Refleksi", "Tantangan Singkat"];
  const doneTasks = zone.tasks.filter((t) => progress.taskDone.includes(t.id)).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Tag color={zone.color}>
          Zona {zone.index} · {zone.name}
        </Tag>
        <Tag color="#94a3b8">{zone.subtitle}</Tag>
        <span className="text-[11px] text-slate-400">
          Tantangan selesai {doneTasks}/{zone.tasks.length} <Stars n={progress.stars[zone.id] ?? 0} size={12} />
        </span>
      </div>

      <Progress value={((page + 1) / pages.length) * 100} color={zone.color} />

      {page === 0 && (
        <Section>
          <SectionTitle icon="📖">Ringkasan Materi</SectionTitle>
          <p className="text-sm leading-relaxed text-slate-200">{zone.theory.ringkasan}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {zone.targets.map((t, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-300">
                <span className="mr-1 text-amber-300">{i + 1}.</span>
                {t}
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-sky-400/25 bg-sky-500/10 p-3 text-xs leading-relaxed text-sky-100">
            <b>Kaitan dengan CP:</b> {GAME_INFO.cp}
          </div>
        </Section>
      )}

      {page === 1 && (
        <Section>
          <SectionTitle icon="🧠">Konsep Utama</SectionTitle>
          <div className="grid gap-3 md:grid-cols-2">
            {zone.theory.konsep.map((k, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-sm font-bold text-amber-200">{k.heading}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">{k.body}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {page === 2 && (
        <Section>
          <SectionTitle icon="🔤">Istilah Penting</SectionTitle>
          <div className="divide-y divide-white/8 overflow-hidden rounded-xl border border-white/10">
            {zone.theory.istilah.map((t, i) => (
              <div key={i} className="grid gap-1 p-3 sm:grid-cols-[180px_1fr]">
                <span className="text-sm font-bold text-sky-200">{t.term}</span>
                <span className="text-xs text-slate-300">{t.def}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {page === 3 && (
        <Section>
          <SectionTitle icon="💡">Contoh Penerapan</SectionTitle>
          <ul className="space-y-2">
            {zone.theory.contoh.map((c, i) => (
              <li key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-200">
                <span className="mr-2 text-emerald-300">▸</span>
                {c}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[11px] text-slate-500">Visual 3D contoh poster dapat diputar pada tab SIMULASI 3D.</p>
        </Section>
      )}

      {page === 4 && (
        <Section>
          <SectionTitle icon="🤔">Pertanyaan Refleksi</SectionTitle>
          <div className="space-y-2">
            {zone.theory.refleksi.map((r, i) => (
              <div key={i} className="rounded-xl border border-amber-300/25 bg-amber-300/10 p-3 text-sm text-amber-50">
                {i + 1}. {r}
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-slate-500">Tuliskan jawaban refleksimu pada tab LKM DIGITAL.</p>
        </Section>
      )}

      {page === 5 && (
        <Section>
          <SectionTitle icon="⚡">Tantangan Pemahaman Singkat</SectionTitle>
          <p className="text-sm text-slate-300">
            Manakah pernyataan yang <b>paling tepat</b> menggambarkan fokus zona {zone.name}?
          </p>
          <div className="mt-3 space-y-2">
            {[
              { t: zone.targets[0], ok: true },
              { t: "Menghafal semua istilah tanpa menerapkannya pada teks nyata.", ok: false },
              { t: "Menghindari teks visual karena hanya teks tulis yang penting.", ok: false },
            ]
              .sort((a, b) => a.t.localeCompare(b.t))
              .map((o, i) => (
                <button
                  key={i}
                  onClick={() => {
                    sound.click();
                    setAnswer(o.t);
                    if (o.ok) sound.success();
                    else sound.error();
                  }}
                  className={cn(
                    "block w-full rounded-xl border p-3 text-left text-xs transition",
                    answer === o.t
                      ? o.ok
                        ? "border-emerald-400/60 bg-emerald-400/15 text-emerald-50"
                        : "border-rose-400/60 bg-rose-400/15 text-rose-50"
                      : "border-white/12 bg-white/[0.03] text-slate-200 hover:bg-white/[0.07]"
                  )}
                >
                  {o.t}
                </button>
              ))}
          </div>
          {answer && (
            <p className="mt-3 rounded-xl border border-white/12 bg-white/5 p-3 text-xs text-slate-300">
              {answer === zone.targets[0]
                ? "Tepat! Fokus zona ini sesuai target tujuan pembelajaran."
                : "Belum tepat. Baca kembali ringkasan dan konsep utama pada halaman sebelumnya."}
            </p>
          )}
        </Section>
      )}

      <div className="flex items-center justify-between gap-2 pt-2">
        <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
          ← Sebelumnya
        </Button>
        <span className="text-[11px] text-slate-400">
          Halaman {page + 1}/{pages.length} · {pages[page]}
        </span>
        <Button variant="primary" size="sm" disabled={page === pages.length - 1} onClick={() => setPage((p) => p + 1)}>
          Berikutnya →
        </Button>
      </div>
    </div>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return <div className="animate-[fadeUp_.3s_ease-out]">{children}</div>;
}

// ================================================================ TAB 2
function Prosedur({ zoneId }: { zoneId: string }) {
  const zone = ZONE_BY_ID[zoneId];
  const [order, setOrder] = useState<number[]>(zone.prosedur.map((_, i) => i));
  const [checked, setChecked] = useState(false);
  const correct = order.every((v, i) => v === i);

  return (
    <div className="space-y-4">
      <Tag color={zone.color}>Prosedur Pembelajaran · Zona {zone.index}</Tag>
      <p className="text-sm leading-relaxed text-slate-200">
        Ikuti langkah berikut secara berurutan. Susun ulang kartu untuk menguji pemahamanmu tentang urutan proses, lalu tekan
        PERIKSA.
      </p>

      <div className="space-y-2">
        {order.map((oi, pos) => {
          const step = zone.prosedur[oi];
          return (
            <div
              key={oi}
              className="flex items-start gap-3 rounded-xl border border-white/12 bg-white/[0.04] p-3"
              draggable
              onDragStart={(e) => e.dataTransfer.setData("text/plain", String(pos))}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const from = Number(e.dataTransfer.getData("text/plain"));
                const next = [...order];
                const [m] = next.splice(from, 1);
                next.splice(pos, 0, m);
                setOrder(next);
                setChecked(false);
                sound.click();
              }}
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-300/15 text-sm font-black text-amber-200">
                {pos + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white">{step.step}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-300">{step.detail}</p>
              </div>
              <div className="ml-auto flex shrink-0 flex-col gap-1">
                <button
                  className="rounded border border-white/15 px-1.5 text-[10px] text-slate-300 hover:bg-white/10"
                  onClick={() => {
                    if (pos === 0) return;
                    const next = [...order];
                    [next[pos - 1], next[pos]] = [next[pos], next[pos - 1]];
                    setOrder(next);
                    setChecked(false);
                    sound.click();
                  }}
                >
                  ▲
                </button>
                <button
                  className="rounded border border-white/15 px-1.5 text-[10px] text-slate-300 hover:bg-white/10"
                  onClick={() => {
                    if (pos === order.length - 1) return;
                    const next = [...order];
                    [next[pos + 1], next[pos]] = [next[pos], next[pos + 1]];
                    setOrder(next);
                    setChecked(false);
                    sound.click();
                  }}
                >
                  ▼
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="primary"
          onClick={() => {
            setChecked(true);
            if (correct) sound.success();
            else sound.error();
          }}
        >
          ✅ Periksa
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setOrder(zone.prosedur.map((_, i) => i));
            setChecked(false);
          }}
        >
          ↺ Ulangi
        </Button>
      </div>

      {checked && (
        <div
          className={cn(
            "rounded-xl border p-3 text-xs leading-relaxed",
            correct ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-50" : "border-rose-400/40 bg-rose-400/10 text-rose-50"
          )}
        >
          {correct ? (
            <>
              <b>Urutan tepat!</b> Progres penyelesaian: 100%. Lanjutkan ke dunia 3D dan kerjakan misi zona ini.
            </>
          ) : (
            <>
              <b>Belum tepat.</b> Perhatikan tahap yang berpindah tempat: prosedur menuntut urutan logis dari orientasi → tindakan →
              penyimpulan.
            </>
          )}
        </div>
      )}

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
        <SectionTitle icon="🎬">Demonstrasi Visual</SectionTitle>
        <p className="text-xs leading-relaxed text-slate-300">
          Setiap langkah divisualisasikan di dunia 3D: papan misi, objek bercahaya, mesin pemilah, dinding poster, meja kerja
          studio, dan panggung auditorium. Amati perubahan yang terjadi setelah kamu melakukan tindakan — inilah umpan balik
          langsung dari simulasi.
        </p>
      </div>
      <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }`}</style>
    </div>
  );
}

// ================================================================ TAB 3
function Simulasi({ zoneId }: { zoneId: string }) {
  const zone = ZONE_BY_ID[zoneId];
  const setPanel = useGame((s) => s.setPanel);
  const progress = useGame((s) => s.progress);
  const notify = useGame((s) => s.notify);
  const addScore = useGame((s) => s.addScore);
  const [size, setSize] = useState(28);
  const [words, setWords] = useState(12);
  const [contrast, setContrast] = useState(60);
  const [rot, setRot] = useState({ x: -12, y: 24 });
  const [awarded, setAwarded] = useState(false);

  const readScore = useMemo(() => {
    const s = Math.round(
      Math.max(0, Math.min(100, size * 1.6 + (100 - contrast) * 0.35 + Math.max(0, 60 - words * 4) + (contrast > 45 ? 15 : 0)))
    );
    return s;
  }, [size, words, contrast]);

  const simTasks = zone.tasks.filter((t) => t.simulation);

  return (
    <div className="space-y-4">
      <Tag color={zone.color}>Simulasi 3D · Zona {zone.index}</Tag>
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
        <SectionTitle icon="🎬">Skenario</SectionTitle>
        <p className="text-xs leading-relaxed text-slate-300">{zone.story}</p>
      </div>

      {/* ---- rotating 3D learning object (CSS 3D, draggable) ---- */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-gradient-to-b from-[#0b1220] to-[#060a13] p-4">
          <SectionTitle icon="🔄">Objek Pembelajaran 3D — Poster (putar dengan drag)</SectionTitle>
          <div
            className="relative mx-auto h-56 w-56 touch-none [perspective:800px]"
            onPointerDown={(e) => {
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (e.buttons === 0 && e.pointerType !== "touch") return;
              setRot((r) => ({ x: Math.max(-70, Math.min(70, r.x - e.movementY * 0.4)), y: r.y + e.movementX * 0.5 }));
            }}
          >
            <div
              className="absolute inset-0 transition-transform duration-75 [transform-style:preserve-3d]"
              style={{ transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)` }}
            >
              <CubeFace url={POSTERS[0]} transform="translateZ(112px)" />
              <CubeFace url={POSTERS[1]} transform="rotateY(90deg) translateZ(112px)" />
              <CubeFace url={POSTERS[2]} transform="rotateY(180deg) translateZ(112px)" />
              <CubeFace url={POSTERS[3]} transform="rotateY(-90deg) translateZ(112px)" />
              <CubeFace solid transform="rotateX(90deg) translateZ(112px)" label="UNSUR POSTER" />
              <CubeFace solid transform="rotateX(-90deg) translateZ(112px)" label="JENIS POSTER" />
            </div>
          </div>
          <p className="mt-2 text-center text-[11px] text-slate-400">Empat sisi: poster kampanye, acara, edukasi, dan produk.</p>
        </div>

        {/* ---- readability simulator ---- */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <SectionTitle icon="🎚️">Simulator Keterbacaan Poster</SectionTitle>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Ubah parameter lalu amati akibatnya pada keterbacaan pesan. Simulasi ini melatih hubungan sebab-akibat antara keputusan
            desain dan pemahaman pembaca.
          </p>

          <div
            className="mt-3 overflow-hidden rounded-xl border border-white/15 p-3"
            style={{ background: `hsl(215 45% ${Math.max(6, 26 - contrast / 8)}%)` }}
          >
            <p
              className="font-black uppercase leading-tight text-white"
              style={{ fontSize: size, textShadow: contrast > 55 ? "0 2px 12px rgba(0,0,0,0.85)" : "none", color: contrast > 55 ? "#fff" : "#cfd6e4" }}
            >
              Selamatkan Sungai Kita
            </p>
            <p className="mt-1 text-xs" style={{ color: contrast > 55 ? "#ffe9a8" : "#8b95a8" }}>
              {words <= 4 ? "Sungai bersih, hidup sehat!" : "Ayo pilah sampah mulai hari ini demi kebersihan sungai bersama kita"}
            </p>
          </div>

          <div className="mt-3 space-y-2">
            <Slider label="Ukuran judul" value={size} min={12} max={54} onChange={setSize} unit="px" />
            <Slider label="Jumlah kata slogan" value={words} min={3} max={16} onChange={setWords} unit="kata" />
            <Slider label="Kontras warna &amp; bayangan" value={contrast} min={10} max={100} onChange={setContrast} unit="%" />
          </div>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1">
              <Progress value={readScore} color={readScore > 70 ? "#34d399" : readScore > 45 ? "#fbbf24" : "#fb7185"} />
            </div>
            <span className="w-24 text-right text-sm font-black text-white">{readScore}% terbaca</span>
          </div>

          <p className="mt-2 rounded-lg border border-white/10 bg-white/5 p-2 text-[11px] leading-relaxed text-slate-300">
            <b>Kesimpulan:</b>{" "}
            {readScore > 70
              ? "Poster mudah terbaca dari jauh: judul besar, slogan singkat, dan kontras tinggi. Pesan utama tertangkap dalam hitungan detik."
              : readScore > 45
              ? "Cukup terbaca, tetapi masih bisa ditingkatkan — perbesar judul atau persingkat slogan."
              : "Sulit terbaca. Judul terlalu kecil/slogan terlalu panjang/kontras rendah membuat pesan utama hilang."}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSize(28);
                setWords(12);
                setContrast(60);
                sound.click();
              }}
            >
              ↺ Reset Simulasi
            </Button>
            <Button
              size="sm"
              variant="primary"
              disabled={awarded}
              onClick={() => {
                setAwarded(true);
                addScore(30, "Simulasi keterbacaan dianalisis");
                sound.success();
                notify("Simulasi selesai: amati hubungan sebab-akibat desain poster.", "success");
              }}
            >
              {awarded ? "✔ Simulasi tercatat" : "Catat Hasil Simulasi (+30)"}
            </Button>
          </div>
        </div>
      </div>

      {/* ---- in-world simulations ---- */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <SectionTitle icon="🌐">Simulasi di Dunia 3D</SectionTitle>
        <div className="grid gap-2 md:grid-cols-2">
          {(simTasks.length ? simTasks : zone.tasks).map((t) => (
            <div key={t.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-white">{t.title}</p>
                {progress.taskDone.includes(t.id) ? <Tag color="#34d399">Selesai</Tag> : <Tag color="#fbbf24">Belum</Tag>}
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-300">{t.brief}</p>
            </div>
          ))}
        </div>
        <Button className="mt-3" variant="gold" onClick={() => setPanel(null)}>
          🎮 Masuk Dunia 3D
        </Button>
      </div>
    </div>
  );
}

function CubeFace({ url, transform, solid, label }: { url?: (typeof POSTERS)[number]; transform: string; solid?: boolean; label?: string }) {
  const src = useMemo(() => (url ? posterDataURL(url) : ""), [url]);
  return (
    <div
      className="absolute inset-0 grid place-items-center overflow-hidden rounded-md border border-white/15 [backface-visibility:hidden]"
      style={{
        transform,
        background: solid ? "linear-gradient(135deg,#132a52,#2a1240)" : undefined,
      }}
    >
      {solid ? (
        <p className="px-3 text-center text-[11px] font-black uppercase tracking-widest text-amber-200">{label}</p>
      ) : (
        src && <img src={src} alt="" className="h-full w-full object-cover" draggable={false} />
      )}
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  onChange,
  unit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  unit: string;
}) {
  return (
    <label className="block">
      <span className="flex justify-between text-[11px] font-bold text-slate-400">
        <span>{label}</span>
        <span className="text-slate-200">
          {value} {unit}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-amber-400"
      />
    </label>
  );
}

// ================================================================ TAB 4
function LKM({ zoneId }: { zoneId: string }) {
  const zone = ZONE_BY_ID[zoneId];
  const profile = useGame((s) => s.profile);
  const progress = useGame((s) => s.progress);
  const saveLkm = useGame((s) => s.saveLkm);
  const notify = useGame((s) => s.notify);
  const values = progress.lkm[zone.id] ?? {};
  const [check, setCheck] = useState(false);

  const filled = zone.lkm.fields.filter((f) => (values[f.id] ?? "").trim().length >= f.min).length;
  const complete = filled === zone.lkm.fields.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Tag color="#f472b6">Lembar Kerja Murid</Tag>
        <Tag color={zone.color}>{zone.name}</Tag>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h3 className="text-lg font-black text-white">{zone.lkm.judul}</h3>
        <div className="mt-2 grid gap-2 text-[11px] text-slate-300 sm:grid-cols-2">
          <p>
            <b className="text-slate-400">Nama:</b> {profile?.name}
          </p>
          <p>
            <b className="text-slate-400">Kelas/Absen:</b> {profile?.className} / {profile?.absent}
          </p>
          <p>
            <b className="text-slate-400">Mata Pelajaran:</b> {GAME_INFO.subject} — {GAME_INFO.grade}
          </p>
          <p>
            <b className="text-slate-400">Tanggal:</b> {new Date().toLocaleDateString("id-ID")}
          </p>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-300">
          <b className="text-amber-200">Tujuan:</b> {zone.lkm.tujuan}
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <SectionTitle icon="❓">Pertanyaan Pemantik</SectionTitle>
            <ul className="space-y-1 text-xs text-slate-300">
              {zone.lkm.pemantik.map((p, i) => (
                <li key={i}>• {p}</li>
              ))}
            </ul>
          </div>
          <div>
            <SectionTitle icon="🧾">Petunjuk Kegiatan</SectionTitle>
            <ol className="space-y-1 text-xs text-slate-300">
              {zone.lkm.petunjuk.map((p, i) => (
                <li key={i}>
                  {i + 1}. {p}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {zone.lkm.fields.map((f) => {
          const val = values[f.id] ?? "";
          const len = val.trim().length;
          const ok = len >= f.min;
          return (
            <div key={f.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-bold text-white">{f.label}</p>
                <span className={cn("shrink-0 text-[10px] font-bold", ok ? "text-emerald-300" : "text-slate-500")}>
                  {len}/{f.min} karakter
                </span>
              </div>
              <textarea
                value={val}
                rows={3}
                onChange={(e) => saveLkm(zone.id, f.id, e.target.value)}
                placeholder={f.hint}
                className="mt-2 w-full rounded-lg border border-white/12 bg-[#070c17]/80 p-2.5 text-xs text-slate-100 outline-none focus:border-amber-300/60"
              />
              {check && (
                <p className={cn("mt-1 text-[11px]", ok ? "text-emerald-300" : "text-rose-300")}>
                  {ok ? "✔ Lengkap." : "✖ Belum memenuhi ketuntasan minimal — kembangkan jawabanmu."}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
        <SectionTitle icon="📊">Hasil Observasi Simulasi</SectionTitle>
        <p className="text-xs text-slate-300">
          Tantangan zona ini yang sudah diselesaikan: {zone.tasks.filter((t) => progress.taskDone.includes(t.id)).length}/
          {zone.tasks.length} · Pecahan informasi terkumpur: {progress.orbs.length}/8 · Skor sementara: {progress.score}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="primary"
          onClick={() => {
            setCheck(true);
            if (complete) {
              sound.success();
              notify("LKM lengkap. Jangan lupa mencetak/ menyimpan.", "success");
            } else {
              sound.error();
              notify("Masih ada isian yang belum memenuhi ketuntasan minimal.", "warn");
            }
          }}
        >
          ✔ Periksa
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            zone.lkm.fields.forEach((f) => saveLkm(zone.id, f.id, values[f.id] ?? ""));
            notify("Jawaban tersimpan di penyimpanan lokal perangkat.", "info");
          }}
        >
          💾 Simpan
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            if (!confirm("Kosongkan seluruh isian LKM zona ini?")) return;
            zone.lkm.fields.forEach((f) => saveLkm(zone.id, f.id, ""));
            setCheck(false);
            notify("Isian LKM dikosongkan.", "warn");
          }}
        >
          ↺ Reset
        </Button>
        <Button
          variant="gold"
          onClick={() => {
            printHTML(
              `${zone.lkm.judul}`,
              `<h1>${zone.lkm.judul}</h1>
               <p><b>Nama:</b> ${profile?.name ?? "-"} &nbsp; <b>Kelas/Absen:</b> ${profile?.className ?? "-"} / ${profile?.absent ?? "-"}</p>
               <p><b>Mata Pelajaran:</b> ${GAME_INFO.subject} — ${GAME_INFO.grade} (${GAME_INFO.phase})</p>
               <p><b>Tujuan:</b> ${zone.lkm.tujuan}</p>
               <h2>Pertanyaan Pemantik</h2><ul>${zone.lkm.pemantik.map((p) => `<li>${p}</li>`).join("")}</ul>
               <h2>Jawaban Siswa</h2>
               ${zone.lkm.fields
                 .map(
                   (f) =>
                     `<div class="q"><p><b>${f.label}</b></p><p>${(values[f.id] ?? "").replace(/</g, "&lt;") || "<i>(belum diisi)</i>"}</p></div>`
                 )
                 .join("")}
               <h2>Catatan Guru</h2>
               <div class="q"><p>_______________________________________________</p><p>_______________________________________________</p></div>
               <p class="foot">${GAME_INFO.title}: ${GAME_INFO.subtitle} — ${GAME_INFO.developer}, ${GAME_INFO.school} (${GAME_INFO.year}). Hasil permainan merupakan informasi latihan belajar.</p>`
            );
          }}
        >
          🖨 Cetak / PDF
        </Button>
      </div>
    </div>
  );
}

// ================================================================ TAB 5
function Pengembang() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-[260px_1fr]">
        <Panel className="p-5 text-center">
          <div className="mx-auto grid h-28 w-28 place-items-center rounded-2xl bg-gradient-to-br from-amber-300/30 to-rose-500/30 text-5xl ring-1 ring-white/20">
            🧑‍🏫
          </div>
          <h3 className="mt-3 text-xl font-black text-white">{GAME_INFO.developer}</h3>
          <p className="text-xs text-slate-400">{GAME_INFO.school}</p>
          <p className="mt-2 text-[11px] text-slate-500">Tahun pembuatan {GAME_INFO.year}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-1">
            <Tag color="#fbbf24">{GAME_INFO.curriculum}</Tag>
            <Tag color="#38bdf8">{GAME_INFO.phase}</Tag>
          </div>
        </Panel>
        <div className="space-y-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <SectionTitle icon="🎯">Capaian Pembelajaran (CP)</SectionTitle>
            <p className="text-xs leading-relaxed text-slate-300">{GAME_INFO.cp}</p>
            <SectionTitle icon="📘">Tujuan Pembelajaran (TP)</SectionTitle>
            <p className="text-xs leading-relaxed text-slate-300">{GAME_INFO.tp}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <SectionTitle icon="📚">Materi Utama</SectionTitle>
              <p className="text-xs text-slate-300">{GAME_INFO.mainMaterial}</p>
              <ul className="mt-2 space-y-1 text-[11px] text-slate-400">
                {GAME_INFO.subMaterials.map((m, i) => (
                  <li key={i}>• {m}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <SectionTitle icon="🛠️">Teknologi</SectionTitle>
              <p className="text-xs text-slate-300">{GAME_INFO.tech}</p>
              <p className="mt-2 text-[11px] text-slate-500">
                Mode distribusi: satu berkas HTML offline (tanpa CDN, tanpa aset daring). Audio disintesis melalui Web Audio API.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-amber-300/25 bg-amber-300/10 p-4 text-xs leading-relaxed text-amber-50">
        <b>Catatan kejujuran akademik:</b> {GAME_INFO.disclaimer} CP/TP di atas disalin dari formulir permintaan dan perlu dicocokkan
        dengan dokumen resmi sekolah. Hasil permainan merupakan informasi latihan belajar, bukan nilai resmi sekolah.
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <SectionTitle icon="🗺️">Struktur Dunia</SectionTitle>
        <div className="grid gap-2 md:grid-cols-3">
          {ZONES.map((z) => (
            <div key={z.id} className="rounded-lg border border-white/10 p-2.5" style={{ borderColor: `${z.color}44` }}>
              <p className="text-xs font-bold text-white">
                {z.icon} Zona {z.index} — {z.name}
              </p>
              <p className="mt-0.5 text-[10px] leading-snug text-slate-400">{z.subtitle}</p>
              <p className="mt-1 text-[10px] text-slate-500">{z.tasks.length} tantangan</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
