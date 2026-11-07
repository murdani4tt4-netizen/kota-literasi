import * as THREE from "three";

// ============================================================
// Procedural PBR-ish textures generated on <canvas>.
// Zero external assets -> fully offline single-file build.
// ============================================================

const cache = new Map<string, THREE.Texture>();

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return { c, ctx: c.getContext("2d")! };
}

function finish(c: HTMLCanvasElement, repeat = 1, key?: string) {
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.anisotropy = 4;
  if (key) cache.set(key, tex);
  return tex;
}

function noise(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number, alpha = 0.08) {
  for (let i = 0; i < amount; i++) {
    ctx.fillStyle = `rgba(${Math.random() > 0.5 ? 255 : 0},${Math.random() > 0.5 ? 255 : 0},${
      Math.random() > 0.5 ? 255 : 0
    },${alpha})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
  }
}

/** Facade with glass windows; returns map + emissive (some windows lit). */
export function facadeTextures(base: string, trim: string, cols: number, rows: number, key: string) {
  const ck = key + "-m";
  const ek = key + "-e";
  if (cache.has(ck)) return { map: cache.get(ck)!, emissive: cache.get(ek)! };
  const W = 512;
  const H = 512;
  const a = canvas(W, H);
  const b = canvas(W, H);
  a.ctx.fillStyle = base;
  a.ctx.fillRect(0, 0, W, H);
  // subtle concrete grain
  for (let i = 0; i < 2400; i++) {
    a.ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.05})`;
    a.ctx.fillRect(Math.random() * W, Math.random() * H, 3, 3);
  }
  b.ctx.fillStyle = "#000";
  b.ctx.fillRect(0, 0, W, H);

  const cw = W / cols;
  const ch = H / rows;
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      const px = x * cw + cw * 0.18;
      const py = y * ch + ch * 0.18;
      const pw = cw * 0.64;
      const ph = ch * 0.58;
      // frame
      a.ctx.fillStyle = trim;
      a.ctx.fillRect(px - 3, py - 3, pw + 6, ph + 6);
      const g = a.ctx.createLinearGradient(px, py, px + pw, py + ph);
      g.addColorStop(0, "#9fd0e8");
      g.addColorStop(0.5, "#4a7f9c");
      g.addColorStop(1, "#1d3d52");
      a.ctx.fillStyle = g;
      a.ctx.fillRect(px, py, pw, ph);
      // reflection streak
      a.ctx.fillStyle = "rgba(255,255,255,0.18)";
      a.ctx.beginPath();
      a.ctx.moveTo(px, py + ph);
      a.ctx.lineTo(px + pw * 0.55, py);
      a.ctx.lineTo(px + pw * 0.8, py);
      a.ctx.lineTo(px + pw * 0.25, py + ph);
      a.ctx.closePath();
      a.ctx.fill();
      // randomly lit windows (emissive)
      if (Math.random() < 0.28) {
        b.ctx.fillStyle = Math.random() < 0.5 ? "#ffd9a0" : "#bfe6ff";
        b.ctx.fillRect(px, py, pw, ph);
      }
    }
  }
  a.ctx.fillStyle = trim;
  a.ctx.fillRect(0, 0, W, 6);
  return {
    map: finish(a.c, 1, ck),
    emissive: (() => {
      const t = finish(b.c, 1, ek);
      return t;
    })(),
  };
}

export function groundTexture(kind: "asphalt" | "grass" | "plaza" | "wood" | "marble", repeat = 8) {
  const key = `g-${kind}-${repeat}`;
  if (cache.has(key)) return cache.get(key)!;
  const W = 512;
  const H = 512;
  const { c, ctx } = canvas(W, H);
  if (kind === "asphalt") {
    ctx.fillStyle = "#3a3d42";
    ctx.fillRect(0, 0, W, H);
    noise(ctx, W, H, 6000, 0.07);
    ctx.strokeStyle = "rgba(240,225,150,0.85)";
    ctx.lineWidth = 10;
    ctx.setLineDash([46, 40]);
    ctx.beginPath();
    ctx.moveTo(W / 2, 0);
    ctx.lineTo(W / 2, H);
    ctx.stroke();
  } else if (kind === "grass") {
    ctx.fillStyle = "#3f6b34";
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 9000; i++) {
      const g = Math.random();
      ctx.fillStyle = `rgba(${40 + g * 60},${90 + g * 70},${40 + g * 40},0.55)`;
      ctx.fillRect(Math.random() * W, Math.random() * H, 3, 5);
    }
  } else if (kind === "plaza") {
    ctx.fillStyle = "#b9b2a5";
    ctx.fillRect(0, 0, W, H);
    const n = 4;
    for (let x = 0; x < n; x++)
      for (let y = 0; y < n; y++) {
        ctx.fillStyle = `rgba(${150 + Math.random() * 40},${145 + Math.random() * 35},${135 + Math.random() * 30},1)`;
        ctx.fillRect(x * (W / n) + 3, y * (H / n) + 3, W / n - 6, H / n - 6);
      }
    noise(ctx, W, H, 3000, 0.05);
  } else if (kind === "wood") {
    ctx.fillStyle = "#6b4a2f";
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 60; i++) {
      ctx.strokeStyle = `rgba(${30 + Math.random() * 40},${20 + Math.random() * 20},10,0.35)`;
      ctx.lineWidth = 1 + Math.random() * 3;
      ctx.beginPath();
      ctx.moveTo(0, (i / 60) * H);
      ctx.bezierCurveTo(W / 3, (i / 60) * H + 10, (2 * W) / 3, (i / 60) * H - 10, W, (i / 60) * H);
      ctx.stroke();
    }
  } else {
    ctx.fillStyle = "#e7e3dc";
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 40; i++) {
      ctx.strokeStyle = `rgba(${120 + Math.random() * 60},${120 + Math.random() * 60},${120 + Math.random() * 60},0.25)`;
      ctx.lineWidth = 1 + Math.random() * 8;
      ctx.beginPath();
      ctx.moveTo(Math.random() * W, 0);
      ctx.bezierCurveTo(Math.random() * W, H / 3, Math.random() * W, (2 * H) / 3, Math.random() * W, H);
      ctx.stroke();
    }
  }
  return finish(c, repeat, key);
}

/** Text sign / board texture with title + optional lines. */
export function signTexture(title: string, lines: string[], accent = "#f5b32a", bg = "#101726") {
  const W = 512;
  const H = 512;
  const { c, ctx } = canvas(W, H);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, bg);
  g.addColorStop(1, "#05080f");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 14;
  ctx.strokeRect(14, 14, W - 28, H - 28);
  ctx.fillStyle = accent;
  ctx.fillRect(40, 70, 90, 10);
  ctx.fillStyle = "#f4f7ff";
  ctx.font = "bold 46px Georgia, serif";
  ctx.textAlign = "center";
  const words = title.toUpperCase().split(" ");
  let line = "";
  let y = 140;
  const draw = () => {
    ctx.fillText(line, W / 2, y);
    y += 54;
  };
  for (const w of words) {
    if ((line + " " + w).trim().length > 14) {
      draw();
      line = w;
    } else line = (line + " " + w).trim();
  }
  if (line) draw();
  ctx.font = "26px Georgia, serif";
  ctx.fillStyle = "#c8d4e8";
  y += 6;
  for (const l of lines) {
    const sub = l.match(/.{1,34}(\s|$)/g) || [];
    for (const s of sub) {
      ctx.fillText(s.trim(), W / 2, y);
      y += 34;
    }
    y += 4;
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Poster artwork used both in the 3D gallery and in the 2D inspector. */
export function posterTexture(p: {
  headline: string;
  slogan: string;
  body: string;
  footer: string;
  palette: [string, string, string];
  emblem: string;
}) {
  const W = 640;
  const H = 900;
  const { c, ctx } = canvas(W, H);
  const [c1, c2, c3] = p.palette;
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // radiating decoration
  ctx.save();
  ctx.translate(W / 2, H * 0.34);
  for (let i = 0; i < 18; i++) {
    ctx.rotate((Math.PI * 2) / 18);
    ctx.fillStyle = "rgba(255,255,255,0.07)";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(W, -30);
    ctx.lineTo(W, 30);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  ctx.fillStyle = c3;
  ctx.beginPath();
  ctx.arc(W / 2, H * 0.3, 128, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = "120px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fillText(p.emblem, W / 2, H * 0.3);
  // headline
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 64px Georgia, serif";
  const hw = p.headline.toUpperCase().match(/.{1,13}(\s|$)/g) || [];
  hw.forEach((l, i) => ctx.fillText(l.trim(), W / 2, H * 0.5 + i * 70));
  // slogan
  ctx.font = "italic 40px Georgia, serif";
  ctx.fillStyle = "#ffe9a8";
  const sw = p.slogan.match(/.{1,30}(\s|$)/g) || [];
  sw.forEach((l, i) => ctx.fillText(l.trim(), W / 2, H * 0.66 + i * 46));
  // body
  ctx.font = "28px Georgia, serif";
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  const bw = p.body.match(/.{1,42}(\s|$)/g) || [];
  bw.forEach((l, i) => ctx.fillText(l.trim(), W / 2, H * 0.77 + i * 36));
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(0, H - 80, W, 80);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 26px Georgia, serif";
  ctx.fillText(p.footer, W / 2, H - 40);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Poster canvas as a data URL (for the 2D DOM inspector / hotspots). */
export function posterDataURL(p: {
  headline: string;
  slogan: string;
  body: string;
  footer: string;
  palette: [string, string, string];
  emblem: string;
}) {
  const t = posterTexture(p);
  const url = t.image.toDataURL("image/png");
  t.dispose();
  return url;
}

/** Soft radial sprite for glow, particles and light shafts. */
export function glowTexture(color = "#ffffff") {
  const key = `glow-${color}`;
  if (cache.has(key)) return cache.get(key)!;
  const { c, ctx } = canvas(128, 128);
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, color);
  g.addColorStop(0.35, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.globalAlpha = 1;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(64, 64, 64, 0, Math.PI * 2);
  ctx.fill();
  return finish(c, 1, key);
}

export function screenTexture(lines: string[], accent = "#4fd1ff") {
  const W = 512;
  const H = 256;
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = "#04121c";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, W - 12, H - 12);
  ctx.fillStyle = accent;
  ctx.font = "bold 30px monospace";
  let y = 52;
  for (const l of lines) {
    ctx.fillText(l.length > 26 ? l.slice(0, 26) : l, 26, y);
    y += 38;
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function cloudTexture() {
  const key = "cloud";
  if (cache.has(key)) return cache.get(key)!;
  const { c, ctx } = canvas(256, 128);
  ctx.clearRect(0, 0, 256, 128);
  for (let i = 0; i < 26; i++) {
    const x = 40 + Math.random() * 176;
    const y = 40 + Math.random() * 48;
    const r = 18 + Math.random() * 30;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(255,255,255,0.85)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
