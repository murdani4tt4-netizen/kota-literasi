import { useMemo, useState } from "react";
import type { TaskDef, ZoneDef } from "../game/types";
import { useGame } from "../state/store";
import { Button, Panel, Progress, SectionTitle, Stars, Tag } from "./ui";
import { cn } from "../utils/cn";
import { sound } from "../game/audio";
import { posterDataURL } from "../game/textures";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ChallengePanel({
  zone,
  task,
  placed,
  explored,
  onDone,
  onNext,
}: {
  zone: ZoneDef;
  task: TaskDef;
  placed: number;
  explored: number;
  onDone: () => void;
  onNext: () => void;
}) {
  const [mistakes, setMistakes] = useState(0);
  const [hints, setHints] = useState(0);
  const [solved, setSolved] = useState(false);
  const registerMistake = useGame((s) => s.registerMistake);
  const registerHint = useGame((s) => s.registerHint);
  const completeTask = useGame((s) => s.completeTask);

  const finish = (m = mistakes, h = hints) => {
    if (solved) return;
    setSolved(true);
    sound.success();
    completeTask(task.id, zone.id, m, h);
    setTimeout(() => sound.levelUp(), 420);
  };

  return (
    <div className="pointer-events-auto absolute inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#04070f]/88 p-2 backdrop-blur-md dsk:items-center sm:p-4">
      <Panel className="w-full max-w-5xl overflow-hidden" glow={zone.color}>
        {/* header */}
        <div className="flex flex-wrap items-center gap-3 border-b border-white/10 p-4">
          <span className="grid h-11 w-11 place-items-center rounded-xl text-2xl" style={{ background: `${zone.color}22` }}>
            {zone.icon}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-200/80">
              {zone.levelLabel} · {zone.name}
            </p>
            <h2 className="truncate text-lg font-black text-white sm:text-xl">{task.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Tag color="#fbbf24">{task.points} poin</Tag>
            {task.simulation && <Tag color="#38bdf8">Simulasi</Tag>}
            <Tag color={mistakes ? "#fb7185" : "#34d399"}>Kesalahan: {mistakes}</Tag>
          </div>
        </div>

        {/* body */}
        <div className="max-h-[62dvh] overflow-y-auto p-4">
          <p className="mb-1 text-sm font-bold text-slate-200">{task.brief}</p>
          <p className="mb-4 rounded-xl border border-sky-400/25 bg-sky-500/10 p-3 text-xs leading-relaxed text-sky-100">
            🎯 {task.instruction}
          </p>

          {task.type === "sort" && <SortChallenge task={task} solved={solved} onMistake={() => { setMistakes((m) => m + 1); registerMistake(); }} onFinish={() => finish()} />}
          {task.type === "match" && <MatchChallenge task={task} solved={solved} onMistake={() => { setMistakes((m) => m + 1); registerMistake(); }} onFinish={() => finish()} />}
          {task.type === "sequence" && <SequenceChallenge task={task} solved={solved} onMistake={() => { setMistakes((m) => m + 1); registerMistake(); }} onFinish={() => finish()} />}
          {task.type === "dialogue" && <DialogueChallenge task={task} onMistake={() => { setMistakes((m) => m + 1); registerMistake(); }} onFinish={(h) => finish(mistakes, h)} />}
          {task.type === "spot" && <SpotChallenge task={task} onMistake={() => { setMistakes((m) => m + 1); registerMistake(); }} onFinish={() => finish()} />}
          {task.type === "compose" && <ComposeChallenge task={task} onFinish={() => finish()} />}
          {(task.type === "explore" || task.type === "poster3d") && (
            <div className="space-y-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <SectionTitle icon="🧭">Progres Misi</SectionTitle>
                {task.type === "explore" ? (
                  <>
                    <Progress value={(explored / (task.targetCount ?? 1)) * 100} color={zone.color} />
                    <p className="mt-2 text-sm text-slate-300">
                      Target terpenuhi: <b className="text-white">{explored}</b> / {task.targetCount}
                    </p>
                    {explored >= (task.targetCount ?? 1) ? (
                      <Button className="mt-3" variant="gold" onClick={() => finish()}>
                        ✔ Tuntaskan Misi Ini
                      </Button>
                    ) : (
                      <p className="mt-2 text-xs text-slate-400">
                        Tutup panel ini lalu jelajahi dunia 3D. Dekati objek bercahaya dan tekan <b>E</b> untuk berinteraksi.
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <Progress value={(placed / 5) * 100} color={zone.color} />
                    <p className="mt-2 text-sm text-slate-300">
                      Unsur poster terpasang benar: <b className="text-white">{placed}</b> / 5
                    </p>
                    {placed >= 5 ? (
                      <Button className="mt-3" variant="gold" onClick={() => finish()}>
                        ✔ Poster Selesai Dirakit
                      </Button>
                    ) : (
                      <p className="mt-2 text-xs text-slate-400">
                        Tutup panel ini. Tekan <b>E</b> pada unsur di meja kerja untuk mengangkat, lalu tekan <b>E</b> di depan slot
                        dinding untuk memasang. Penempatan salah akan dikembalikan ke meja.
                      </p>
                    )}
                  </>
                )}
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs leading-relaxed text-slate-300">
                <SectionTitle icon="🎯">Target Pembelajaran</SectionTitle>
                <ul className="space-y-1">
                  {zone.targets.map((t, i) => (
                    <li key={i}>• {t}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* footer */}
        <div className="flex flex-wrap items-center gap-2 border-t border-white/10 p-3">
          {!solved ? (
            <>
              <Button
                variant="soft"
                size="sm"
                onClick={() => {
                  setHints((h) => h + 1);
                  registerHint();
                  sound.notification();
                }}
              >
                💡 Minta Bantuan ({hints})
              </Button>
              <span className="text-[11px] text-slate-500">
                Bantuan memengaruhi jumlah bintang: 3★ tanpa bantuan &amp; tanpa kesalahan.
              </span>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Stars n={hints === 0 && mistakes === 0 ? 3 : hints <= 2 && mistakes <= 3 ? 2 : 1} />
              <span className="text-xs font-bold text-emerald-300">Tantangan selesai!</span>
            </div>
          )}
          <div className="ml-auto flex gap-2">
            <Button variant="ghost" size="sm" onClick={onDone}>
              {solved ? "Tutup" : "Kembali ke Dunia 3D"}
            </Button>
            {solved && (
              <Button variant="primary" size="sm" onClick={onNext}>
                Tantangan Berikutnya →
              </Button>
            )}
          </div>
        </div>
      </Panel>
    </div>
  );
}

// ==================================================================== SORT
function SortChallenge({ task, solved, onMistake, onFinish }: { task: TaskDef; solved: boolean; onMistake: () => void; onFinish: () => void }) {
  const bins = task.bins ?? [];
  const items = task.items ?? [];
  const [assign, setAssign] = useState<Record<string, string>>({});
  const [sel, setSel] = useState<string | null>(null);
  const [checked, setChecked] = useState<null | { correct: number; notes: { text: string; note: string }[] }>(null);
  const pool = items.filter((i) => !assign[i.id]);
  const allPlaced = pool.length === 0;

  const place = (item: string, bin: string) => {
    setAssign((a) => ({ ...a, [item]: bin }));
    setSel(null);
    sound.place();
  };

  const check = () => {
    const wrong = items.filter((i) => assign[i.id] !== i.bin);
    if (wrong.length === 0) {
      setChecked({ correct: items.length, notes: [] });
      onFinish();
      return;
    }
    onMistake();
    sound.error();
    setChecked({
      correct: items.length - wrong.length,
      notes: wrong.map((w) => ({ text: w.text, note: `${w.text} → seharusnya ${bins.find((b) => b.id === w.bin)?.label}. ${w.note}` })),
    });
    // return wrong items to the pool so the player can retry
    setAssign((a) => {
      const n = { ...a };
      wrong.forEach((w) => delete n[w.id]);
      return n;
    });
  };

  return (
    <div className="space-y-3">
      {pool.length > 0 && (
        <div className="rounded-xl border border-white/12 bg-white/[0.03] p-3">
          <SectionTitle icon="🃏">Kartu Belum Ditempatkan ({pool.length})</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {pool.map((it) => (
              <button
                key={it.id}
                draggable={!solved}
                onDragStart={(e) => e.dataTransfer.setData("text/plain", it.id)}
                onClick={() => {
                  setSel(sel === it.id ? null : it.id);
                  sound.click();
                }}
                className={cn(
                  "max-w-full rounded-lg border px-3 py-2 text-left text-[11px] leading-snug transition",
                  sel === it.id ? "border-amber-300/70 bg-amber-300/20 text-amber-50" : "border-white/15 bg-[#0b1324]/80 text-slate-200 hover:bg-white/10"
                )}
              >
                {it.text}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-slate-500">
            Cara 1: seret kartu ke wadah. Cara 2: klik kartu lalu klik wadah (ramah layar sentuh).
          </p>
        </div>
      )}

      <div className={cn("grid gap-2", bins.length > 2 ? "md:grid-cols-3 lg:grid-cols-4" : "md:grid-cols-2")}>
        {bins.map((b) => {
          const inside = items.filter((i) => assign[i.id] === b.id);
          return (
            <div
              key={b.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData("text/plain");
                if (id) place(id, b.id);
              }}
              onClick={() => {
                if (sel) place(sel, b.id);
              }}
              className="min-h-[150px] rounded-xl border-2 border-dashed p-2 transition"
              style={{ borderColor: `${b.accent}55`, background: `${b.accent}0d` }}
            >
              <p className="text-xs font-black uppercase tracking-wide" style={{ color: b.accent }}>
                {b.label}
              </p>
              <p className="mb-2 text-[10px] text-slate-400">{b.desc}</p>
              <div className="space-y-1.5">
                {inside.map((i) => (
                  <button
                    key={i.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setAssign((a) => {
                        const n = { ...a };
                        delete n[i.id];
                        return n;
                      });
                      sound.click();
                    }}
                    className="block w-full rounded-lg border border-white/15 bg-[#0b1324]/90 p-2 text-left text-[11px] text-slate-200 hover:border-rose-300/50"
                    title="Klik untuk mengembalikan ke tumpukan"
                  >
                    {i.text}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="primary" disabled={!allPlaced || solved} onClick={check}>
          ✅ Periksa Jawaban
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setAssign({});
            setChecked(null);
          }}
        >
          ↺ Kosongkan
        </Button>
      </div>

      {checked && (
        <div className={cn("rounded-xl border p-3 text-xs leading-relaxed", checked.notes.length ? "border-rose-400/40 bg-rose-400/10 text-rose-50" : "border-emerald-400/40 bg-emerald-400/10 text-emerald-50")}>
          {checked.notes.length ? (
            <>
              <b>Belum semua tepat.</b> Benar: {checked.correct}/{items.length}. Perhatikan catatan berikut, lalu coba lagi:
              <ul className="mt-1.5 list-disc space-y-1 pl-5">
                {checked.notes.map((n, i) => (
                  <li key={i}>{n.note}</li>
                ))}
              </ul>
            </>
          ) : (
            <b>Sempurna! Semua pernyataan berhasil dipilah dengan tepat.</b>
          )}
        </div>
      )}
    </div>
  );
}

// ==================================================================== MATCH
function MatchChallenge({ task, solved, onMistake, onFinish }: { task: TaskDef; solved: boolean; onMistake: () => void; onFinish: () => void }) {
  const pairs = task.pairs ?? [];
  const rights = useMemo(() => shuffle(pairs.map((p) => p.right)), [pairs]);
  const [leftSel, setLeftSel] = useState<string | null>(null);
  const [locked, setLocked] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");
  const doneCount = Object.keys(locked).length;

  const tryPair = (rightId: string) => {
    if (!leftSel) {
      setMsg("Pilih dulu satu kartu di kolom kiri.");
      return;
    }
    const pair = pairs.find((p) => p.left.id === leftSel)!;
    if (pair.right.id === rightId) {
      setLocked((l) => ({ ...l, [leftSel]: rightId }));
      setMsg("");
      sound.success();
      if (doneCount + 1 === pairs.length) onFinish();
    } else {
      onMistake();
      sound.error();
      setMsg("Belum cocok. Perhatikan jenis bukti yang dibutuhkan klaim tersebut.");
    }
    setLeftSel(null);
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <SectionTitle icon="❓">Klaim / Poster / Pertanyaan</SectionTitle>
          {pairs.map((p) => {
            const isLocked = !!locked[p.left.id];
            return (
              <button
                key={p.left.id}
                disabled={isLocked || solved}
                onClick={() => {
                  setLeftSel(p.left.id);
                  sound.click();
                }}
                className={cn(
                  "block w-full rounded-xl border p-3 text-left text-xs transition",
                  isLocked
                    ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-50"
                    : leftSel === p.left.id
                    ? "border-amber-300/70 bg-amber-300/20 text-amber-50"
                    : "border-white/12 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"
                )}
              >
                {isLocked ? "✅ " : ""}
                {p.left.text}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          <SectionTitle icon="🔎">Bukti / Tujuan / Jawaban</SectionTitle>
          {rights.map((r) => {
            const usedBy = Object.entries(locked).find(([, v]) => v === r.id);
            return (
              <button
                key={r.id}
                disabled={!!usedBy || solved}
                onClick={() => tryPair(r.id)}
                className={cn(
                  "block w-full rounded-xl border p-3 text-left text-xs transition",
                  usedBy ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-50" : "border-white/12 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"
                )}
              >
                {usedBy ? "🔗 " : ""}
                {r.text}
              </button>
            );
          })}
        </div>
      </div>
      <Progress value={(doneCount / pairs.length) * 100} color="#34d399" />
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-400">
          Terpasangkan {doneCount}/{pairs.length}
        </span>
        {msg && <span className="text-xs text-amber-200">{msg}</span>}
      </div>
    </div>
  );
}

// ==================================================================== SEQUENCE
function SequenceChallenge({ task, solved, onMistake, onFinish }: { task: TaskDef; solved: boolean; onMistake: () => void; onFinish: () => void }) {
  const steps = task.steps ?? [];
  const [order, setOrder] = useState(() => shuffle(steps.map((s) => s.id)));
  const [checked, setChecked] = useState<null | { ok: boolean; hint?: string }>(null);

  const move = (from: number, to: number) => {
    const next = [...order];
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    setOrder(next);
    setChecked(null);
    sound.click();
  };

  const check = () => {
    const firstWrong = order.findIndex((id, i) => steps[i].id !== id);
    if (firstWrong === -1) {
      setChecked({ ok: true });
      onFinish();
      return;
    }
    onMistake();
    sound.error();
    setChecked({ ok: false, hint: `Perhatikan langkah ke-${firstWrong + 1}: ${steps[firstWrong].hint}` });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {order.map((id, pos) => {
          const s = steps.find((x) => x.id === id)!;
          return (
            <div
              key={id}
              draggable={!solved}
              onDragStart={(e) => e.dataTransfer.setData("text/plain", String(pos))}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const from = Number(e.dataTransfer.getData("text/plain"));
                if (!Number.isNaN(from)) move(from, pos);
              }}
              className="flex items-start gap-3 rounded-xl border border-white/12 bg-white/[0.04] p-3"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-300/15 text-sm font-black text-amber-200">
                {pos + 1}
              </span>
              <p className="min-w-0 flex-1 text-xs leading-relaxed text-slate-200">{s.text}</p>
              <div className="flex shrink-0 flex-col gap-1">
                <button className="rounded border border-white/15 px-1.5 text-[10px] text-slate-300 hover:bg-white/10" onClick={() => pos > 0 && move(pos, pos - 1)}>
                  ▲
                </button>
                <button className="rounded border border-white/15 px-1.5 text-[10px] text-slate-300 hover:bg-white/10" onClick={() => pos < order.length - 1 && move(pos, pos + 1)}>
                  ▼
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" disabled={solved} onClick={check}>
          ✅ Periksa Urutan
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setOrder(shuffle(steps.map((s) => s.id)));
            setChecked(null);
          }}
        >
          🔀 Acak Ulang
        </Button>
      </div>
      {checked && (
        <div className={cn("rounded-xl border p-3 text-xs leading-relaxed", checked.ok ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-50" : "border-rose-400/40 bg-rose-400/10 text-rose-50")}>
          {checked.ok ? <b>Urutan tepat! Alur berpikirmu logis dan sistematis.</b> : <><b>Belum tepat.</b> {checked.hint}</>}
        </div>
      )}
    </div>
  );
}

// ==================================================================== DIALOGUE
function DialogueChallenge({ task, onMistake, onFinish }: { task: TaskDef; onMistake: () => void; onFinish: (hints: number) => void }) {
  const turns = task.turns ?? [];
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [log, setLog] = useState<{ line: string; text: string; feedback: string; good: boolean }[]>([]);
  const turn = turns[i];
  const finished = i >= turns.length;

  const choose = (idx: number) => {
    if (picked !== null) return;
    const o = turn.options[idx];
    setPicked(idx);
    setScore((s) => s + o.score);
    setLog((l) => [...l, { line: turn.speaker, text: o.text, feedback: o.feedback, good: o.good }]);
    if (o.good) sound.success();
    else {
      onMistake();
      sound.error();
    }
  };

  const next = () => {
    setPicked(null);
    const ni = i + 1;
    setI(ni);
    if (ni >= turns.length) {
      const finalScore = score;
      onFinish(finalScore < 9 ? 1 : 0);
      sound.levelUp();
    }
  };

  if (finished) {
    const max = turns.length * 3;
    const pct = Math.round((score / max) * 100);
    return (
      <div className="space-y-3">
        <SectionTitle icon="🎬">Ringkasan Simulasi</SectionTitle>
        <Progress value={pct} color={pct > 70 ? "#34d399" : pct > 45 ? "#fbbf24" : "#fb7185"} />
        <p className="text-sm text-slate-200">
          Skor kesantunan &amp; ketepatan isi: <b className="text-white">{score}</b>/{max} ({pct}%)
        </p>
        <div className="space-y-2">
          {log.map((l, k) => (
            <div key={k} className={cn("rounded-xl border p-3 text-xs", l.good ? "border-emerald-400/40 bg-emerald-400/10" : "border-rose-400/40 bg-rose-400/10")}>
              <p className="font-bold text-white">{l.text}</p>
              <p className="mt-1 text-slate-200">{l.feedback}</p>
            </div>
          ))}
        </div>
        <p className="rounded-xl border border-white/12 bg-white/5 p-3 text-xs leading-relaxed text-slate-300">
          <b>Kesimpulan:</b> gagasan yang kuat tetap perlu disampaikan dengan santun. Salam, sapaan, ucapan terima kasih, dan
          penghargaan pada lawan bicara membuat audiens terbuka pada gagasanmu.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-white/12 bg-gradient-to-b from-[#0d1626] to-[#080d18] p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-200/80">
          {turn.role} · {turn.speaker}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-white">“{turn.line}”</p>
      </div>
      <p className="text-[11px] text-slate-400">Giliran {i + 1}/{turns.length} · Pilih tanggapan terbaik:</p>
      <div className="space-y-2">
        {turn.options.map((o, idx) => (
          <button
            key={idx}
            disabled={picked !== null}
            onClick={() => choose(idx)}
            className={cn(
              "block w-full rounded-xl border p-3 text-left text-xs leading-relaxed transition",
              picked === idx
                ? o.good
                  ? "border-emerald-400/60 bg-emerald-400/15 text-emerald-50"
                  : "border-rose-400/60 bg-rose-400/15 text-rose-50"
                : "border-white/12 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"
            )}
          >
            {o.text}
          </button>
        ))}
      </div>
      {picked !== null && (
        <div className="rounded-xl border border-white/12 bg-white/5 p-3">
          <p className="text-xs text-slate-200">
            <b>Umpan balik:</b> {turn.options[picked].feedback}
          </p>
          <p className="mt-1 text-[11px] text-amber-200">Skor pilihan: +{turn.options[picked].score}</p>
          <Button className="mt-2" variant="primary" size="sm" onClick={next}>
            {i + 1 >= turns.length ? "Lihat Ringkasan" : "Lanjutkan Percakapan →"}
          </Button>
        </div>
      )}
      {task.situation && <p className="text-[11px] italic leading-relaxed text-slate-500">{task.situation}</p>}
    </div>
  );
}

// ==================================================================== SPOT (poster hotspot)
function SpotChallenge({ task, onMistake, onFinish }: { task: TaskDef; onMistake: () => void; onFinish: () => void }) {
  const posters = task.posters ?? [];
  const questions = useMemo(
    () =>
      posters.map((p) => {
        const r = p.regions[Math.floor(Math.random() * p.regions.length)];
        return { poster: p, region: r };
      }),
    [posters]
  );
  const [qi, setQi] = useState(0);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [answered, setAnswered] = useState(false);
  const q = questions[qi];
  const url = useMemo(() => (q ? posterDataURL(q.poster) : ""), [q]);
  if (!q) return null;
  const done = qi >= questions.length;

  const clickRegion = (id: string) => {
    if (answered) return;
    const ok = id === q.region.id;
    setAnswered(true);
    if (ok) {
      sound.success();
      setFeedback({ ok, text: `Tepat! Itu adalah ${q.region.label} — ${q.region.note}` });
    } else {
      onMistake();
      sound.error();
      const r = q.poster.regions.find((x) => x.id === id)!;
      setFeedback({ ok, text: `Itu bagian ${r.label}. Coba cari: ${q.region.note}` });
      setTimeout(() => setAnswered(false), 700);
    }
  };

  if (done) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-emerald-400/40 bg-emerald-400/10 p-4 text-sm text-emerald-50">
          <b>Semua poster berhasil dianalisis!</b> Kamu telah mengenali unsur-unsur poster dan fungsinya.
        </div>
        <Button variant="gold" onClick={onFinish}>
          ✔ Selesaikan Tantangan
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Tag color="#c77dff">
          Poster {qi + 1}/{questions.length}
        </Tag>
        <span className="text-xs text-slate-300">{q.poster.title}</span>
      </div>
      <div className="grid gap-4 md:grid-cols-[300px_1fr]">
        <div className="relative mx-auto w-full max-w-[300px] overflow-hidden rounded-xl border-2 border-white/20">
          <img src={url} alt={q.poster.title} className="block w-full select-none" draggable={false} />
          {q.poster.regions.map((r) => (
            <button
              key={r.id}
              onClick={() => clickRegion(r.id)}
              className="absolute border-2 border-transparent transition hover:border-amber-300 hover:bg-amber-300/25"
              style={{
                left: `${r.x - r.w / 2}%`,
                top: `${r.y - r.h / 2}%`,
                width: `${r.w}%`,
                height: `${r.h}%`,
              }}
              title={r.label}
            />
          ))}
        </div>
        <div className="space-y-2">
          <div className="rounded-xl border border-amber-300/30 bg-amber-300/10 p-3">
            <SectionTitle icon="🎯">Tugas</SectionTitle>
            <p className="text-sm leading-relaxed text-amber-50">
              Klik bagian poster yang <b>{q.region.note}</b>
            </p>
          </div>
          {feedback && (
            <div className={cn("rounded-xl border p-3 text-xs leading-relaxed", feedback.ok ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-50" : "border-rose-400/50 bg-rose-400/10 text-rose-50")}>
              {feedback.text}
            </div>
          )}
          {answered && feedback?.ok && (
            <div className="space-y-2 rounded-xl border border-white/12 bg-white/5 p-3 text-[11px] leading-relaxed text-slate-300">
              <p>
                <b className="text-white">Tujuan poster:</b> {q.poster.purpose}
              </p>
              <p>
                <b className="text-white">Makna tersurat:</b> {q.poster.explicitMeaning}
              </p>
              <p>
                <b className="text-white">Makna tersirat:</b> {q.poster.impliedMeaning}
              </p>
              <p>
                <b className="text-white">Catatan analis:</b> {q.poster.analysis}
              </p>
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  setFeedback(null);
                  setAnswered(false);
                  setQi((v) => v + 1);
                }}
              >
                {qi + 1 >= questions.length ? "Selesai" : "Poster Berikutnya →"}
              </Button>
            </div>
          )}
          <p className="text-[11px] text-slate-500">
            Arahkan kursor ke poster untuk melihat area yang dapat diklik. Setiap kesalahan akan diberi catatan perbaikan, bukan
            hukuman.
          </p>
        </div>
      </div>
    </div>
  );
}

// ==================================================================== COMPOSE
function ComposeChallenge({ task, onFinish }: { task: TaskDef; onFinish: () => void }) {
  const fields = task.fields ?? [];
  const [vals, setVals] = useState<Record<string, string>>({});
  const [check, setCheck] = useState(false);
  const complete = fields.every((f) => (vals[f.id] ?? "").trim().length >= f.min);

  return (
    <div className="space-y-3">
      <div className="space-y-3">
        {fields.map((f) => {
          const v = vals[f.id] ?? "";
          const ok = v.trim().length >= f.min;
          return (
            <div key={f.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-bold text-white">{f.label}</p>
                <span className={cn("shrink-0 text-[10px] font-bold", ok ? "text-emerald-300" : "text-slate-500")}>
                  {v.trim().length}/{f.min}
                </span>
              </div>
              <textarea
                rows={2}
                value={v}
                onChange={(e) => setVals((s) => ({ ...s, [f.id]: e.target.value }))}
                placeholder={f.hint}
                className="mt-2 w-full rounded-lg border border-white/12 bg-[#070c17]/80 p-2.5 text-xs text-slate-100 outline-none focus:border-amber-300/60"
              />
              {check && <p className={cn("mt-1 text-[11px]", ok ? "text-emerald-300" : "text-rose-300")}>{ok ? "✔ Memadai." : "✖ Kembangkan lebih lanjut."}</p>}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="primary"
          onClick={() => {
            setCheck(true);
            if (complete) {
              onFinish();
            } else {
              sound.error();
            }
          }}
        >
          ✅ Periksa &amp; Simpan Karya
        </Button>
        <Button variant="ghost" onClick={() => setVals({})}>
          ↺ Kosongkan
        </Button>
      </div>
      <p className="text-[11px] leading-relaxed text-slate-500">
        Sistem memeriksa <b>kelengkapan</b> isian (bukan kualitas bahasa). Kualitas diksi, keorisinalan, dan kesantunan tetap dinilai
        gurumu — salin karya ini ke tab LKM DIGITAL untuk dilaporkan.
      </p>
    </div>
  );
}
