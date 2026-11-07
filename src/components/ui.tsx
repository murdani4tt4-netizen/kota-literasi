import type { ReactNode } from "react";
import { cn } from "../utils/cn";
import { sound } from "../game/audio";

export function Panel({ className, children, glow }: { className?: string; children: ReactNode; glow?: string }) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-white/12 bg-[#0a1020]/82 backdrop-blur-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)]",
        className
      )}
      style={glow ? { boxShadow: `0 0 0 1px ${glow}33, 0 24px 70px -28px ${glow}` } : undefined}
    >
      {children}
    </div>
  );
}

type BtnProps = {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger" | "gold" | "soft";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  title?: string;
};

export function Button({ children, onClick, variant = "ghost", size = "md", className, disabled, title }: BtnProps) {
  const base =
    "relative select-none inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-wide transition-all duration-200 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed border";
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2.5 text-sm", lg: "px-6 py-3.5 text-base" }[size];
  const variants = {
    primary: "bg-gradient-to-b from-sky-400/95 to-sky-600 text-white border-sky-300/40 hover:from-sky-300 hover:to-sky-500 shadow-[0_10px_30px_-10px_rgba(56,189,248,0.8)]",
    gold: "bg-gradient-to-b from-amber-300 to-amber-500 text-[#2a1a02] border-amber-200/50 hover:from-amber-200 hover:to-amber-400 shadow-[0_10px_30px_-10px_rgba(251,191,36,0.9)]",
    danger: "bg-gradient-to-b from-rose-500 to-rose-700 text-white border-rose-300/40 hover:from-rose-400",
    soft: "bg-white/10 text-slate-100 border-white/15 hover:bg-white/20",
    ghost: "bg-[#0d1526]/70 text-slate-200 border-white/12 hover:bg-[#16203a]/90 hover:text-white",
  }[variant];
  return (
    <button
      title={title}
      disabled={disabled}
      onClick={() => {
        sound.init();
        sound.click();
        onClick?.();
      }}
      onMouseEnter={() => sound.hover()}
      className={cn(base, sizes, variants, className)}
    >
      {children}
    </button>
  );
}

export function Stars({ n, size = 16, max = 3 }: { n: number; size?: number; max?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} style={{ fontSize: size, lineHeight: 1 }} className={i < n ? "text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]" : "text-white/18"}>
          ★
        </span>
      ))}
    </span>
  );
}

export function Progress({ value, className, color = "#38bdf8" }: { value: number; className?: string; color?: string }) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-white/10", className)}>
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: `linear-gradient(90deg, ${color}, #fbbf24)` }}
      />
    </div>
  );
}

export function Tag({ children, color = "#38bdf8" }: { children: ReactNode; color?: string }) {
  return (
    <span
      className="rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest"
      style={{ borderColor: `${color}66`, color, background: `${color}14` }}
    >
      {children}
    </span>
  );
}

export function SectionTitle({ children, icon }: { children: ReactNode; icon?: string }) {
  return (
    <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-amber-200/90">
      {icon && <span className="text-base">{icon}</span>}
      {children}
    </h3>
  );
}

export function toggleFullscreen() {
  const el = document.documentElement;
  if (!document.fullscreenElement) {
    void el.requestFullscreen?.().catch(() => {});
  } else {
    void document.exitFullscreen?.().catch(() => {});
  }
}

export function Logo({ size = 92 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="absolute inset-0 animate-[spin_18s_linear_infinite] rounded-full border-2 border-dashed border-amber-300/40" />
      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-amber-300/90 via-orange-500/80 to-rose-600/70 shadow-[0_0_50px_-6px_rgba(251,146,60,0.85)]" />
      <div className="absolute inset-0 grid place-items-center text-[10px] font-black uppercase tracking-[0.2em] text-[#2a1802]">
        <div className="text-center leading-tight">
          <div style={{ fontSize: size * 0.17 }}>EKSPEDISI</div>
          <div style={{ fontSize: size * 0.13 }}>LITERASI</div>
        </div>
      </div>
    </div>
  );
}
