import { useEffect, useRef } from "react";
import { useGame } from "../state/store";
import { COMPETENCIES, GAME_INFO, RECOMMENDATIONS, ZONES } from "../game/content";
import { Button, Panel, Progress, Stars, Tag } from "./ui";
import { sound } from "../game/audio";
import { printHTML } from "./print";

export default function Results({ onReplay, onReview }: { onReplay: () => void; onReview: () => void }) {
  const profile = useGame((s) => s.profile);
  const progress = useGame((s) => s.progress);
  const setScreen = useGame((s) => s.setScreen);
  const totalTasks = ZONES.reduce((a, z) => a + z.tasks.length, 0);
  const stars = Object.values(progress.stars).reduce((a, b) => a + b, 0);
  const maxStars = ZONES.length * 3;
  const pct = Math.round((progress.taskDone.length / totalTasks) * 100);
  const played = useRef(false);

  useEffect(() => {
    if (played.current) return;
    played.current = true;
    sound.setTrack("victory");
    sound.victory();
  }, []);

  return (
    <div className="pointer-events-auto absolute inset-0 z-20 w-full overflow-y-auto overscroll-contain p-3 sm:p-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/70 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-5xl space-y-4">
        <Panel className="overflow-hidden p-6 text-center">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 text-5xl shadow-[0_0_70px_-8px_rgba(251,191,36,0.9)]">
            🏆
          </div>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.35em] text-amber-200/90">Misi Selesai</p>
          <h1 className="mt-1 text-3xl font-black text-white sm:text-4xl">KOTA INFORMASI PULIH!</h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
            Selamat, {profile?.name}. Kamu telah menelusuri informasi, menimbang bukti, menciptakan karya, dan menyampaikan gagasan
            secara santun. Kota Informasi kembali terang karena penjelajah literasi sepertimu.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Tag color="#fbbf24">{GAME_INFO.subject}</Tag>
            <Tag color="#38bdf8">{GAME_INFO.grade} · {GAME_INFO.phase}</Tag>
            <Tag color="#34d399">Semester {GAME_INFO.semester}</Tag>
          </div>
        </Panel>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <Panel className="p-5">
            <h2 className="text-lg font-black text-white">📊 Hasil Belajar</h2>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Cell label="Skor Akhir" value={progress.score} color="#fbbf24" />
              <Cell label="Zona Selesai" value={`${progress.completedZones.length}/${ZONES.length}`} color="#38bdf8" />
              <Cell label="Bintang" value={`${stars}/${maxStars}`} color="#f472b6" />
              <Cell label="Pencapaian" value={`${pct}%`} color="#34d399" />
            </div>
            <div className="mt-4">
              <div className="mb-1.5 flex justify-between text-[11px] font-bold uppercase tracking-widest text-slate-400">
                <span>Pencapaian keseluruhan</span>
                <span className="text-amber-200">{pct}%</span>
              </div>
              <Progress value={pct} />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {ZONES.map((z) => (
                <div key={z.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                  <span>{z.icon}</span>
                  <div>
                    <p className="text-[11px] font-bold text-white">{z.name}</p>
                    <Stars n={progress.stars[z.id] ?? 0} size={11} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="p-5">
            <h2 className="text-lg font-black text-white">🧠 Ringkasan Kompetensi</h2>
            <ul className="mt-3 space-y-1.5">
              {COMPETENCIES.map((c, i) => (
                <li key={i} className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-[11px] leading-snug text-slate-300">
                  <span className="text-emerald-300">✔</span>
                  {c}
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <Panel className="p-5">
          <h2 className="text-lg font-black text-white">🌱 Rekomendasi Pembelajaran Lanjutan</h2>
          <ul className="mt-3 grid gap-2 md:grid-cols-2">
            {RECOMMENDATIONS.map((r, i) => (
              <li key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs leading-relaxed text-slate-300">
                <span className="mr-2 text-amber-300">{i + 1}.</span>
                {r}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
            Hasil permainan merupakan informasi latihan belajar, bukan otomatis menjadi nilai resmi sekolah. Penilaian akhir tetap
            menjadi kewenangan guru berdasarkan rubrik dan dokumen pembelajaran yang digunakan.
          </p>
        </Panel>

        <Panel className="flex flex-wrap items-center gap-2 p-4">
          <Button variant="gold" size="lg" onClick={onReplay}>
            🎮 Main Lagi
          </Button>
          <Button variant="primary" size="lg" onClick={onReview}>
            📚 Lihat Pembahasan Materi
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={() =>
              printHTML(
                "Laporan Hasil Belajar — Ekspedisi Literasi: Kota Informasi",
                `<h1>Laporan Hasil Belajar</h1>
                 <h2 style="margin-top:0">EKSPEDISI LITERASI: KOTA INFORMASI</h2>
                 <p><b>Nama Siswa:</b> ${profile?.name ?? "-"} &nbsp; <b>Kelas/Absen:</b> ${profile?.className ?? "-"} / ${profile?.absent ?? "-"}</p>
                 <p><b>Mata Pelajaran:</b> ${GAME_INFO.subject} — ${GAME_INFO.grade} (${GAME_INFO.phase}, Semester ${GAME_INFO.semester}, ${GAME_INFO.curriculum})</p>
                 <p><b>Materi:</b> ${GAME_INFO.mainMaterial}</p>
                 <h2>Ringkasan Skor</h2>
                 <div class="q">
                   <p><b>Skor akhir:</b> ${progress.score} poin</p>
                   <p><b>Zona selesai:</b> ${progress.completedZones.length} dari ${ZONES.length} zona</p>
                   <p><b>Tantangan selesai:</b> ${progress.taskDone.length} dari ${totalTasks} (${pct}%)</p>
                   <p><b>Total bintang:</b> ${stars} dari ${maxStars}</p>
                   <p><b>Pecahan informasi terkumpulkan:</b> ${progress.orbs.length} dari 8</p>
                 </div>
                 <h2>Rincian Zona</h2>
                 ${ZONES.map(
                   (z) => `<div class="q"><p><b>${z.name}</b> — ${"★".repeat(progress.stars[z.id] ?? 0)}${"☆".repeat(
                     3 - (progress.stars[z.id] ?? 0)
                   )}<br/>Tantangan selesai ${z.tasks.filter((t) => progress.taskDone.includes(t.id)).length}/${z.tasks.length}</p></div>`
                 ).join("")}
                 <h2>Kompetensi yang Dilatih</h2>
                 <ul>${COMPETENCIES.map((c) => `<li>${c}</li>`).join("")}</ul>
                 <h2>Rekomendasi Tindak Lanjut</h2>
                 <ul>${RECOMMENDATIONS.map((r) => `<li>${r}</li>`).join("")}</ul>
                 <h2>Catatan</h2>
                 <div class="q"><p>Hasil permainan merupakan informasi latihan belajar, bukan otomatis menjadi nilai resmi sekolah.</p></div>
                 <p class="foot">${GAME_INFO.title}: ${GAME_INFO.subtitle} — dikembangkan oleh ${GAME_INFO.developer}, ${GAME_INFO.school}, ${GAME_INFO.year}.<br/>${GAME_INFO.tech}</p>`
              )
            }
          >
            🖨 Cetak Hasil / PDF
          </Button>
          <Button variant="soft" size="lg" className="ml-auto" onClick={() => setScreen("dashboard")}>
            🏠 Dashboard
          </Button>
        </Panel>
      </div>
    </div>
  );
}

function Cell({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-center">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-2xl font-black" style={{ color }}>
        {value}
      </p>
    </div>
  );
}
