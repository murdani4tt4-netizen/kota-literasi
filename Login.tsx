import { useState } from "react";
import { useGame } from "../state/store";
import { Button, Logo, Panel, toggleFullscreen } from "./ui";
import { sound } from "../game/audio";
import { GAME_INFO, ZONES } from "../game/content";

export default function Login() {
  const login = useGame((s) => s.login);
  const settings = useGame((s) => s.settings);
  const setSettings = useGame((s) => s.setSettings);
  const [name, setName] = useState("");
  const [className, setClassName] = useState("");
  const [absent, setAbsent] = useState("");
  const [err, setErr] = useState("");

  const submit = () => {
    if (name.trim().length < 3) {
      setErr("Nama lengkap minimal 3 huruf.");
      sound.error();
      return;
    }
    if (className.trim().length < 1) {
      setErr("Kelas wajib diisi (contoh: XII-1).");
      sound.error();
      return;
    }
    setErr("");
    sound.init();
    sound.gate();
    sound.setTrack("menu");
    login(name.trim(), className.trim(), absent.trim() || "-");
  };

  return (
    <div className="pointer-events-auto absolute inset-0 z-20 flex overflow-y-auto overscroll-contain p-4 sm:p-8">
      <div className="m-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* ---------------- title side ---------------- */}
        <Panel className="relative overflow-hidden p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-sky-500/20 blur-3xl" />
          <div className="relative flex items-start gap-5">
            <Logo size={96} />
            <div>
              <h1 className="text-3xl font-black leading-none tracking-tight text-white drop-shadow-[0_4px_20px_rgba(251,191,36,0.35)] sm:text-4xl">
                <span className="animate-[fadeSlide_1s_ease-out] inline-block">EKSPEDISI</span>{" "}
                <span className="bg-gradient-to-r from-amber-200 to-orange-400 bg-clip-text text-transparent">LITERASI</span>
              </h1>
              <p className="mt-2 text-lg font-bold uppercase tracking-[0.35em] text-sky-200/90">Kota Informasi</p>
              <p className="mt-3 text-xs leading-relaxed text-slate-300/80">
                Game edukasi 3D {GAME_INFO.subject} · {GAME_INFO.grade} · {GAME_INFO.phase} · Semester {GAME_INFO.semester}
              </p>
            </div>
          </div>

          <div className="relative mt-7 space-y-3 text-sm text-slate-300">
            <p className="rounded-xl border border-white/10 bg-white/5 p-3 leading-relaxed">
              Kota Informasi guncang: kabar bercampur, bukti jarang diperiksa, dan gagasan warga tidak tersampaikan dengan jelas.
              Kamu dipilih menjadi <b className="text-amber-200">Penjelajah Literasi</b>. Jelajahi 6 zona 3D, evaluasi informasi,
              ciptakan karya, dan sampaikan gagasanmu secara santun.
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
              <span>🎮 Eksplorasi dunia 3D bebas</span>
              <span>🧩 {ZONES.reduce((a, z) => a + z.tasks.length, 0)} tantangan interaktif</span>
              <span>📊 LKM digital &amp; laporan</span>
              <span>🏆 Skor, bintang, sertifikat</span>
            </div>
          </div>

          <div className="relative mt-6 flex flex-wrap items-center gap-2">
            <Button
              variant="soft"
              size="sm"
              onClick={() => {
                sound.init();
                setSettings({ music: !settings.music, sfx: !settings.music });
                sound.setMusic(!settings.music);
                sound.setSfx(!settings.music);
              }}
            >
              {settings.music ? "🔊 Suara: AKTIF" : "🔇 Suara: SENYAP"}
            </Button>
            <Button variant="soft" size="sm" onClick={toggleFullscreen}>
              ⛶ Layar Penuh
            </Button>
          </div>
        </Panel>

        {/* ---------------- form side ---------------- */}
        <Panel className="p-8">
          <h2 className="text-xl font-bold text-white">Identitas Penjelajah</h2>
          <p className="mt-1 text-xs text-slate-400">Data ini digunakan pada dashboard, LKM, dan laporan hasil belajar.</p>

          <div className="mt-6 space-y-4">
            <Field label="Nama Lengkap Siswa" value={name} onChange={setName} placeholder="cth: Andi Muhammad Ridwan" />
            <Field label="Kelas" value={className} onChange={setClassName} placeholder="cth: XII-1" />
            <Field label="Nomor Absen (opsional)" value={absent} onChange={setAbsent} placeholder="cth: 07" />
          </div>

          {err && <p className="mt-4 rounded-lg border border-rose-400/40 bg-rose-500/10 p-2 text-xs text-rose-200">{err}</p>}

          <Button variant="gold" size="lg" className="mt-6 w-full text-lg" onClick={submit}>
            MASUK KE GAME →
          </Button>

          <div className="mt-5 space-y-2 text-[11px] leading-relaxed text-slate-400">
            <p>
              <b className="text-slate-300">Kontrol:</b> W/A/S/D bergerak · Shift lari · Space lompat · E interaksi · seret layar
              untuk kamera · Esc jeda. Di Android/tablet tersedia joystick virtual dan tombol interaksi.
            </p>
            <p>
              Pengembang: <b className="text-slate-300">{GAME_INFO.developer}</b> — {GAME_INFO.school}, {GAME_INFO.year}.
            </p>
          </div>
        </Panel>
      </div>

      <style>{`
        @keyframes fadeSlide { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
      `}</style>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && document.getElementById("enter-game")?.click()}
        className="w-full rounded-xl border border-white/15 bg-[#070c17]/80 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/70 focus:ring-2 focus:ring-amber-300/25"
      />
    </label>
  );
}
