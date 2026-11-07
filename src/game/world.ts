import * as THREE from "three";
import { createCharacter, animateCharacter, type CharacterParts } from "./player";
import { facadeTextures, groundTexture, signTexture, posterTexture, glowTexture, screenTexture, cloudTexture } from "./textures";
import type { Quality } from "./types";
import { ORBS, NPCS, POSTERS } from "./content";

export interface Interactable {
  id: string;
  kind: "zone" | "orb" | "npc" | "board" | "element" | "slot" | "poster" | "object";
  label: string;
  obj: THREE.Object3D;
  radius: number;
  zone?: string;
  locked?: boolean;
  hidden?: boolean;
  data?: Record<string, unknown>;
}

export interface ZonePortal {
  id: string;
  color: number;
  position: THREE.Vector3;
  ring: THREE.Mesh;
  disc: THREE.Mesh;
  light: THREE.PointLight;
  state: "locked" | "active" | "done";
  beacon: THREE.Sprite;
}

const ZONE_DEFS: { id: string; x: number; z: number; color: number; name: string }[] = [
  { id: "gerbang", x: 0, z: 74, color: 0xf5b32a, name: "GERBANG LITERASI" },
  { id: "kota", x: -72, z: 30, color: 0x5ec8ff, name: "KOTA INFORMASI" },
  { id: "galeri", x: 72, z: 30, color: 0xc77dff, name: "GALERI TEKS" },
  { id: "studio", x: -72, z: -44, color: 0x39d98a, name: "STUDIO KREASI" },
  { id: "arena", x: 72, z: -44, color: 0xffb64d, name: "ARENA KOMUNIKASI" },
  { id: "pusat", x: 0, z: -14, color: 0xff6b6b, name: "PUSAT KENDALI" },
];

export const STUDIO_ELEMENTS = [
  { id: "el-judul", label: "JUDUL", slot: "slot-judul", color: "#e8f0ff" },
  { id: "el-ilustrasi", label: "ILUSTRASI", slot: "slot-ilustrasi", color: "#ffd76a" },
  { id: "el-slogan", label: "SLOGAN", slot: "slot-slogan", color: "#8affc1" },
  { id: "el-info", label: "INFO PENTING", slot: "slot-info", color: "#9fd0ff" },
  { id: "el-penerbit", label: "IDENTITAS PENERBIT", slot: "slot-penerbit", color: "#ffb3d1" },
];

export const STUDIO_SLOTS = [
  { id: "slot-judul", label: "Bagian paling mencolok berisi inti pesan", el: "el-judul" },
  { id: "slot-ilustrasi", label: "Gambar yang membangkitkan perasaan pembaca", el: "el-ilustrasi" },
  { id: "slot-slogan", label: "Kalimat pendek yang menggugah dan mudah diingat", el: "el-slogan" },
  { id: "slot-info", label: "Tanggal, tempat, langkah, atau rincian kegiatan", el: "el-info" },
  { id: "slot-penerbit", label: "Nama lembaga penanggung jawab pesan", el: "el-penerbit" },
];

export class World {
  root = new THREE.Group();
  colliders: THREE.Box3[] = [];
  interactables = new Map<string, Interactable>();
  portals = new Map<string, ZonePortal>();
  npcs: { parts: CharacterParts; t: number; base: number }[] = [];
  private spinners: { obj: THREE.Object3D; speed: number; axis: "x" | "y" | "z" }[] = [];
  private bobbers: { obj: THREE.Object3D; amp: number; speed: number; base: number }[] = [];
  private clouds: { mesh: THREE.Mesh; speed: number }[] = [];
  private screens: THREE.Mesh[] = [];
  private fountain: THREE.Points | null = null;
  private fountainDrops: { v: THREE.Vector3 }[] = [];
  private studioEls = new Map<string, { mesh: THREE.Object3D; home: THREE.Vector3; placed: boolean }>();
  private studioSlots = new Map<string, { pos: THREE.Vector3; mesh: THREE.Object3D }>();
  private zoneColorMaterials: THREE.MeshStandardMaterial[] = [];
  quality: Quality;

  constructor(quality: Quality) {
    this.quality = quality;
    this.buildSky();
    this.buildGround();
    this.buildRoads();
    this.buildPlaza();
    this.buildCityBlocks();
    this.buildZones();
    this.buildProps();
    this.buildNPCs();
    this.buildOrbs();
  }

  // ---------------------------------------------------------- helpers
  private mat(color: number, rough = 0.8, metal = 0.05, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) {
    return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });
  }

  private addCollider(x: number, y: number, z: number, w: number, h: number, d: number) {
    this.colliders.push(new THREE.Box3(new THREE.Vector3(x - w / 2, y, z - d / 2), new THREE.Vector3(x + w / 2, y + h, z + d / 2)));
  }

  private box(
    w: number,
    h: number,
    d: number,
    material: THREE.Material,
    x: number,
    y: number,
    z: number,
    ry = 0,
    collide = true,
    parent: THREE.Object3D = this.root
  ) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    m.position.set(x, y + h / 2, z);
    m.rotation.y = ry;
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    if (collide) this.addCollider(x, y, z, Math.abs(Math.cos(ry)) * w + Math.abs(Math.sin(ry)) * d, h, Math.abs(Math.cos(ry)) * d + Math.abs(Math.sin(ry)) * w);
    return m;
  }

  // ---------------------------------------------------------- sky & light friendly geometry
  private buildSky() {
    const geo = new THREE.SphereGeometry(600, 32, 20);
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        top: { value: new THREE.Color(0x2f6fb5) },
        mid: { value: new THREE.Color(0x9cc6e8) },
        bot: { value: new THREE.Color(0xf3d9b1) },
      },
      vertexShader: `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `
        varying vec3 vP; uniform vec3 top; uniform vec3 mid; uniform vec3 bot;
        void main(){
          float h = normalize(vP).y;
          vec3 c = mix(bot, mid, smoothstep(-0.15, 0.25, h));
          c = mix(c, top, smoothstep(0.2, 0.75, h));
          gl_FragColor = vec4(c, 1.0);
        }`,
    });
    const sky = new THREE.Mesh(geo, mat);
    sky.frustumCulled = false;
    this.root.add(sky);

    if (this.quality !== "low") {
      const tex = cloudTexture();
      for (let i = 0; i < (this.quality === "high" ? 22 : 12); i++) {
        const m = new THREE.Mesh(
          new THREE.PlaneGeometry(60 + Math.random() * 70, 30 + Math.random() * 30),
          new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.55, depthWrite: false })
        );
        m.position.set((Math.random() - 0.5) * 420, 70 + Math.random() * 45, (Math.random() - 0.5) * 420);
        m.rotation.x = -Math.PI / 2.05;
        this.root.add(m);
        this.clouds.push({ mesh: m, speed: 0.4 + Math.random() * 0.7 });
      }
    }
  }

  private buildGround() {
    const grass = groundTexture("grass", 60);
    const g = new THREE.Mesh(new THREE.PlaneGeometry(700, 700), this.mat(0xffffff, 0.95, 0, { map: grass }));
    g.rotation.x = -Math.PI / 2;
    g.receiveShadow = true;
    this.root.add(g);
  }

  private buildRoads() {
    const asphalt = groundTexture("asphalt", 12);
    const mk = (w: number, d: number, x: number, z: number) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), this.mat(0xffffff, 0.9, 0.02, { map: asphalt }));
      m.rotation.x = -Math.PI / 2;
      m.position.set(x, 0.02, z);
      m.receiveShadow = true;
      this.root.add(m);
      // sidewalk
      const walk = this.mat(0xc9c6bd, 0.9);
      const s = new THREE.Mesh(new THREE.BoxGeometry(w + 5, 0.16, d + 5), walk);
      s.position.set(x, 0.02, z);
      s.receiveShadow = true;
      this.root.add(s);
    };
    mk(260, 14, 0, 0);
    mk(14, 260, 0, 0);
    mk(190, 12, 0, 58);
    mk(190, 12, 0, -58);
    mk(12, 190, 58, 0);
    mk(12, 190, -58, 0);
  }

  private buildPlaza() {
    const plazaTex = groundTexture("plaza", 18);
    const p = new THREE.Mesh(new THREE.CircleGeometry(30, 48), this.mat(0xffffff, 0.85, 0.05, { map: plazaTex }));
    p.rotation.x = -Math.PI / 2;
    p.position.set(0, 0.18, 14);
    p.receiveShadow = true;
    this.root.add(p);

    // central fountain
    const stone = this.mat(0xbfb8a8, 0.7);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(6, 6.6, 1, 32), stone);
    base.position.set(0, 0.68, 14);
    base.castShadow = true;
    base.receiveShadow = true;
    this.root.add(base);
    this.addCollider(0, 0, 14, 12, 1.4, 12);
    const water = new THREE.Mesh(
      new THREE.CylinderGeometry(5.4, 5.4, 0.6, 32),
      new THREE.MeshStandardMaterial({ color: 0x2f7fa8, roughness: 0.08, metalness: 0.35, transparent: true, opacity: 0.85 })
    );
    water.position.set(0, 1.1, 14);
    this.root.add(water);
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.1, 3.4, 20), stone);
    pillar.position.set(0, 2.4, 14);
    pillar.castShadow = true;
    this.root.add(pillar);

    // fountain particles
    const N = this.quality === "low" ? 90 : 240;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = 0;
      pos[i * 3 + 1] = 4.2;
      pos[i * 3 + 2] = 14;
      this.fountainDrops.push({
        v: new THREE.Vector3((Math.random() - 0.5) * 3.2, Math.random() * 2 + 1.5, (Math.random() - 0.5) * 3.2),
      });
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    this.fountain = new THREE.Points(
      geo,
      new THREE.PointsMaterial({ color: 0xbfe8ff, size: 0.28, map: glowTexture("#bfe8ff"), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
    );
    this.root.add(this.fountain);

    // benches + lamps around plaza
    const wood = this.mat(0x7b5133, 0.85);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const x = Math.cos(a) * 22;
      const z = 14 + Math.sin(a) * 22;
      const bench = new THREE.Group();
      const seat = new THREE.Mesh(new THREE.BoxGeometry(3, 0.18, 0.9), wood);
      seat.position.y = 0.55;
      seat.castShadow = true;
      bench.add(seat);
      const back = new THREE.Mesh(new THREE.BoxGeometry(3, 0.5, 0.14), wood);
      back.position.set(0, 0.85, -0.38);
      bench.add(back);
      bench.position.set(x, 0.2, z);
      bench.rotation.y = -a + Math.PI / 2;
      this.root.add(bench);
      this.addCollider(x, 0.2, z, 2, 1, 1.4);
    }
  }

  private makeLamp(x: number, z: number) {
    const g = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.18, 6, 10), this.mat(0x2b3242, 0.5, 0.6));
    pole.position.y = 3;
    pole.castShadow = true;
    g.add(pole);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.14, 0.14), this.mat(0x2b3242, 0.5, 0.6));
    arm.position.set(0.7, 5.9, 0);
    g.add(arm);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), new THREE.MeshStandardMaterial({ color: 0xfff1c9, emissive: 0xffdca0, emissiveIntensity: 1.6 }));
    bulb.position.set(1.4, 5.8, 0);
    g.add(bulb);
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture("#ffe6b0"), transparent: true, blending: THREE.AdditiveBlending, opacity: 0.75, depthWrite: false }));
    spr.scale.set(4.5, 4.5, 1);
    spr.position.copy(bulb.position);
    g.add(spr);
    g.position.set(x, 0.2, z);
    this.root.add(g);
    this.addCollider(x, 0, z, 0.6, 6, 0.6);
    return g;
  }

  private makeTree(x: number, z: number, scale = 1) {
    const g = new THREE.Group();
    const trunkMat = this.mat(0x5b4126, 0.9);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.24 * scale, 0.36 * scale, 3.2 * scale, 8), trunkMat);
    trunk.position.y = 1.6 * scale;
    trunk.castShadow = true;
    g.add(trunk);
    const shades = [0x2f6b34, 0x3a7c3c, 0x27592c];
    for (let i = 0; i < 3; i++) {
      const blob = new THREE.Mesh(new THREE.IcosahedronGeometry((1.5 - i * 0.25) * scale, 1), this.mat(shades[i], 0.85));
      blob.position.set((Math.random() - 0.5) * 0.8 * scale, (3.4 + i * 0.9) * scale, (Math.random() - 0.5) * 0.8 * scale);
      blob.castShadow = true;
      g.add(blob);
    }
    g.position.set(x, 0.2, z);
    this.root.add(g);
    this.addCollider(x, 0, z, 0.9 * scale, 4 * scale, 0.9 * scale);
    return g;
  }

  private makeBuilding(x: number, z: number, w: number, d: number, h: number, seed: number, ry = 0) {
    const palettes: [string, string][] = [
      ["#8c8f96", "#5d6169"],
      ["#a4907a", "#6d5b4b"],
      ["#7e8ea0", "#4f5c6b"],
      ["#9a9284", "#6a6459"],
      ["#6f7f8c", "#46525c"],
    ];
    const [base, trim] = palettes[seed % palettes.length];
    const { map, emissive } = facadeTextures(base, trim, Math.max(2, Math.round(w / 3)), Math.max(2, Math.round(h / 3)), `b${seed}-${Math.round(w)}-${Math.round(h)}`);
    const material = new THREE.MeshStandardMaterial({
      map,
      emissiveMap: emissive,
      emissive: new THREE.Color(0xffe0a8),
      emissiveIntensity: this.quality === "low" ? 0.12 : 0.35,
      roughness: 0.72,
      metalness: 0.18,
    });
    const b = this.box(w, h, d, material, x, 0.2, z, ry);
    // roof cap
    const cap = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, 0.5, d + 0.6), this.mat(0x3c4148, 0.8));
    cap.position.set(x, 0.2 + h + 0.25, z);
    cap.castShadow = true;
    this.root.add(cap);
    if (this.quality !== "low" && h > 16) {
      const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 4, 6), this.mat(0x2b3242, 0.5, 0.6));
      ant.position.set(x + w * 0.2, 0.2 + h + 2.2, z);
      this.root.add(ant);
      const blink = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 10, 8),
        new THREE.MeshStandardMaterial({ color: 0xff5a5a, emissive: 0xff2020, emissiveIntensity: 2.2 })
      );
      blink.position.set(x + w * 0.2, 0.2 + h + 4.3, z);
      this.root.add(blink);
      this.spinners.push({ obj: blink, speed: 2, axis: "y" });
    }
    return b;
  }

  private buildCityBlocks() {
    const count = this.quality === "low" ? 16 : this.quality === "medium" ? 26 : 34;
    const spots: [number, number][] = [];
    const rand = mulberry32(20260214);
    for (let i = 0; i < count; i++) {
      let x = 0;
      let z = 0;
      let ok = false;
      for (let tries = 0; tries < 40 && !ok; tries++) {
        x = (rand() - 0.5) * 220;
        z = (rand() - 0.5) * 200;
        ok =
          Math.abs(x) > 22 &&
          Math.abs(z) > 22 &&
          Math.abs(z) > 20 &&
          ZONE_DEFS.every((zd) => Math.hypot(x - zd.x, z - zd.z) > 34) &&
          spots.every((s) => Math.hypot(x - s[0], z - s[1]) > 22);
      }
      if (!ok) continue;
      spots.push([x, z]);
      const w = 12 + rand() * 12;
      const d = 12 + rand() * 12;
      const h = 10 + rand() * 30;
      this.makeBuilding(x, z, w, d, h, Math.floor(rand() * 100));
    }
    // tree line along the roads & park
    const treeCount = this.quality === "low" ? 24 : this.quality === "medium" ? 46 : 70;
    for (let i = 0; i < treeCount; i++) {
      const t = i / treeCount;
      let x: number;
      let z: number;
      if (i % 3 === 0) {
        x = (rand() - 0.5) * 240;
        z = 22 + (rand() - 0.5) * 6;
      } else if (i % 3 === 1) {
        x = (rand() - 0.5) * 240;
        z = -22 + (rand() - 0.5) * 6;
      } else {
        x = 26 + (rand() - 0.5) * 6 + (rand() < 0.5 ? 0 : 90);
        z = (rand() - 0.5) * 200;
      }
      if (Math.abs(t) > 2 && ZONE_DEFS.some((zd) => Math.hypot(x - zd.x, z - zd.z) < 16)) continue;
      if (Math.hypot(x, z - 14) < 32) continue;
      this.makeTree(x, z, 0.8 + rand() * 0.7);
    }
  }

  // ---------------------------------------------------------- zones
  private makePortal(x: number, z: number, color: number, name: string, id: string) {
    const g = new THREE.Group();
    g.position.set(x, 0.2, z);
    // frame pillars
    const pillarMat = this.mat(0x39404f, 0.6, 0.35);
    [-3.4, 3.4].forEach((sx) => {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.7, 7, 0.7), pillarMat);
      p.position.set(sx, 3.5, 0);
      p.castShadow = true;
      g.add(p);
    });
    const top = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.9, 1), pillarMat);
    top.position.set(0, 7.3, 0);
    top.castShadow = true;
    g.add(top);
    // glowing ring
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.9, 0.22, 10, 40),
      new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 2.4, roughness: 0.3, metalness: 0.4 })
    );
    ring.position.set(0, 3.4, 0);
    g.add(ring);
    // swirling disc
    const discTex = swirlTexture(color);
    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(2.8, 40),
      new THREE.MeshBasicMaterial({ map: discTex, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false })
    );
    disc.position.set(0, 3.4, 0);
    g.add(disc);
    const light = new THREE.PointLight(color, 26, 24, 2);
    light.position.set(0, 3.6, 0);
    g.add(light);
    const beacon = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: glowTexture("#" + new THREE.Color(color).getHexString()), transparent: true, blending: THREE.AdditiveBlending, opacity: 0.55, depthWrite: false })
    );
    beacon.scale.set(13, 13, 1);
    beacon.position.set(0, 3.4, 0);
    g.add(beacon);
    // sign
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 1.4),
      new THREE.MeshStandardMaterial({ map: signTexture(name, ["ZONA " + id.toUpperCase()], "#" + new THREE.Color(color).getHexString()), roughness: 0.6, emissive: 0x222222 })
    );
    sign.position.set(0, 5.9, 0.6);
    g.add(sign);
    this.root.add(g);
    // only the pillars block movement — the gate opening stays walkable
    this.addCollider(x - 3.4, 0, z, 1.1, 7, 1.2);
    this.addCollider(x + 3.4, 0, z, 1.1, 7, 1.2);

    const portal: ZonePortal = { id, color, position: new THREE.Vector3(x, 3.4, z), ring, disc, light, state: "active", beacon };
    this.portals.set(id, portal);
    this.interactables.set("zone-" + id, {
      id: "zone-" + id,
      kind: "zone",
      label: `Masuki ${name}`,
      obj: g,
      radius: 6.5,
      zone: id,
    });
    this.spinners.push({ obj: ring, speed: 0.5, axis: "z" });
    this.zoneColorMaterials.push(ring.material as THREE.MeshStandardMaterial);
    return g;
  }

  private makeZoneBuilding(zd: (typeof ZONE_DEFS)[number], w: number, d: number, h: number) {
    const { map, emissive } = facadeTextures("#cfd6df", "#7d8794", 5, 4, `zone-${zd.id}`);
    const mat = new THREE.MeshStandardMaterial({ map, emissiveMap: emissive, emissive: 0xffe0a8, emissiveIntensity: 0.3, roughness: 0.6, metalness: 0.25 });
    const b = this.box(w, h, d, mat, zd.x, 0.2, zd.z - 14, 0);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 1, 0.6, d + 1), this.mat(0x39404f, 0.7));
    roof.position.set(zd.x, 0.2 + h + 0.3, zd.z - 14);
    roof.castShadow = true;
    this.root.add(roof);
    // sign with zone name
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(Math.min(14, w * 0.9), 3.2),
      new THREE.MeshStandardMaterial({ map: signTexture(zd.name, [], "#" + new THREE.Color(zd.color).getHexString()), roughness: 0.5, emissive: 0x444444 })
    );
    sign.position.set(zd.x, h * 0.62, zd.z - 14 + d / 2 + 0.1);
    this.root.add(sign);
    return b;
  }

  private buildZones() {
    for (const zd of ZONE_DEFS) {
      this.makePortal(zd.x, zd.z, zd.color, zd.name, zd.id);
    }

    // ---- Zona 1: Gerbang Literasi
    {
      const zd = ZONE_DEFS[0];
      const wallMat = this.mat(0xd8d2c4, 0.85);
      // two side wings forming a gate corridor
      this.box(26, 9, 3, wallMat, zd.x - 18, 0.2, zd.z - 6);
      this.box(26, 9, 3, wallMat, zd.x + 18, 0.2, zd.z - 6);
      const arch = this.box(38, 2.4, 3.4, this.mat(0xbfb8a8, 0.8), zd.x, 9.2, zd.z - 6);
      this.spinners.push({ obj: arch, speed: 0, axis: "y" });
      // welcome board (interactive)
      const board = new THREE.Group();
      const frame = this.box(9, 5, 0.5, this.mat(0x4a3b2a, 0.85), 0, 0, 0, 0, false, board);
      frame.position.set(0, 2.6, 0);
      const panel = new THREE.Mesh(
        new THREE.PlaneGeometry(8.4, 4.4),
        new THREE.MeshStandardMaterial({ map: signTexture("PAPAN MISI", ["1. Kumpulkan 3 petunjuk", "2. Susun tahapan", "literasi informasi"], "#f5b32a"), roughness: 0.55, emissive: 0x333333 })
      );
      panel.position.set(0, 2.6, 0.3);
      board.add(panel);
      board.position.set(zd.x - 12, 0.2, zd.z + 6);
      board.rotation.y = 0.4;
      this.root.add(board);
      this.interactables.set("board-gerbang", { id: "board-gerbang", kind: "board", label: "Baca Papan Misi", obj: board, radius: 5, zone: "gerbang" });
      this.addCollider(zd.x - 12, 0, zd.z + 6, 9, 5, 1);
      // flower pots
      for (let i = 0; i < 10; i++) {
        const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.5, 0.8, 10), this.mat(0xa9613f, 0.9));
        const px = zd.x - 20 + i * 4.4;
        pot.position.set(px, 0.6, zd.z + 2);
        pot.castShadow = true;
        this.root.add(pot);
        const flower = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 0), this.mat(i % 2 ? 0xe8618c : 0xf5b32a, 0.7));
        flower.position.set(px, 1.3, zd.z + 2);
        this.root.add(flower);
        this.bobbers.push({ obj: flower, amp: 0.08, speed: 1.4 + i * 0.1, base: 1.3 });
      }
    }

    // ---- Zona 2: Kota Informasi (news office + screens)
    {
      const zd = ZONE_DEFS[1];
      this.makeZoneBuilding(zd, 26, 18, 26);
      const screenMat = new THREE.MeshStandardMaterial({
        map: screenTexture(["BREAKING: AIR SUNGAI", "DIPERSOALKAN", "DATA UJI: 3 TITIK", "SUMBER: DINAS"], "#5ec8ff"),
        emissive: 0x226688,
        emissiveIntensity: 0.8,
        roughness: 0.4,
      });
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(12, 6), screenMat);
      scr.position.set(zd.x, 15, zd.z - 14 + 9.2);
      this.root.add(scr);
      this.screens.push(scr);
      // sorting machine (decorative interactable object)
      const mach = new THREE.Group();
      const bodyM = this.mat(0x4a5566, 0.55, 0.4);
      const b1 = new THREE.Mesh(new THREE.BoxGeometry(5, 3, 3), bodyM);
      b1.position.y = 1.6;
      b1.castShadow = true;
      mach.add(b1);
      const hopper = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 2, 1.6, 12), this.mat(0x2f3a48, 0.5, 0.4));
      hopper.position.y = 3.8;
      mach.add(hopper);
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 10), new THREE.MeshStandardMaterial({ color: 0x39d98a, emissive: 0x1ec27a, emissiveIntensity: 2 }));
      lamp.position.set(0, 3.9, 0);
      mach.add(lamp);
      this.bobbers.push({ obj: lamp, amp: 0.1, speed: 3, base: 3.9 });
      mach.position.set(zd.x + 10, 0.2, zd.z + 4);
      this.root.add(mach);
      this.addCollider(zd.x + 10, 0, zd.z + 4, 5, 3, 3);
      this.interactables.set("object-mesin", {
        id: "object-mesin",
        kind: "object",
        label: "Periksa Mesin Pemilah Fakta",
        obj: mach,
        radius: 5,
        zone: "kota",
      });
    }

    // ---- Zona 3: Galeri (posters on wall)
    {
      const zd = ZONE_DEFS[2];
      this.makeZoneBuilding(zd, 30, 20, 14);
      POSTERS.forEach((p, i) => {
        const px = zd.x - 12 + i * 8;
        const tex = posterTexture(p);
        const mesh = new THREE.Mesh(
          new THREE.PlaneGeometry(3.2, 4.5),
          new THREE.MeshStandardMaterial({ map: tex, roughness: 0.65, emissive: 0x1a1a1a })
        );
        mesh.position.set(px, 4.2, zd.z - 14 + 10.2);
        mesh.castShadow = true;
        this.root.add(mesh);
        const glow = new THREE.Sprite(
          new THREE.SpriteMaterial({ map: glowTexture("#c77dff"), transparent: true, blending: THREE.AdditiveBlending, opacity: 0.28, depthWrite: false })
        );
        glow.scale.set(6, 8, 1);
        glow.position.set(px, 4.2, zd.z - 14 + 10.4);
        this.root.add(glow);
        this.interactables.set("poster-" + i, {
          id: "poster-" + i,
          kind: "poster",
          label: "Amati Poster: " + p.title,
          obj: mesh,
          radius: 5,
          zone: "galeri",
          data: { posterIndex: i },
        });
      });
    }

    // ---- Zona 4: Studio (work table + wall slots)
    {
      const zd = ZONE_DEFS[3];
      this.makeZoneBuilding(zd, 26, 20, 12);
      // work table
      const tableTop = this.mat(0x8a6a45, 0.8);
      this.box(20, 1, 5, tableTop, zd.x, 1.2, zd.z + 3);
      this.box(19, 1.2, 4, this.mat(0x5e452c, 0.85), zd.x, 0.2, zd.z + 3);
      // element cards on the table
      STUDIO_ELEMENTS.forEach((el, i) => {
        const card = new THREE.Mesh(
          new THREE.PlaneGeometry(2.4, 1.2),
          new THREE.MeshStandardMaterial({ map: signTexture(el.label, [], "#ffffff", "#233"), roughness: 0.5, side: THREE.DoubleSide, emissive: 0x222222 })
        );
        const px = zd.x - 8 + i * 4;
        card.position.set(px, 1.85, zd.z + 3);
        card.rotation.x = -Math.PI / 2.2;
        this.root.add(card);
        const halo = new THREE.Sprite(
          new THREE.SpriteMaterial({ map: glowTexture("#39d98a"), transparent: true, blending: THREE.AdditiveBlending, opacity: 0.4, depthWrite: false })
        );
        halo.scale.set(3.4, 3.4, 1);
        halo.position.set(px, 2.2, zd.z + 3);
        this.root.add(halo);
        this.studioEls.set(el.id, { mesh: card, home: card.position.clone(), placed: false });
        this.interactables.set(el.id, { id: el.id, kind: "element", label: "Angkat unsur: " + el.label, obj: card, radius: 3.4, zone: "studio", data: { element: el } });
      });
      // wall slots
      STUDIO_SLOTS.forEach((s, i) => {
        const px = zd.x - 8 + i * 4;
        const py = 6.2;
        const frameM = new THREE.Mesh(
          new THREE.BoxGeometry(3.6, 3.6, 0.3),
          new THREE.MeshStandardMaterial({ color: 0x2a3040, roughness: 0.6, metalness: 0.3, emissive: 0x0a2030, emissiveIntensity: 0.6 })
        );
        frameM.position.set(px, py, zd.z - 14 + 10.2);
        this.root.add(frameM);
        const label = new THREE.Mesh(
          new THREE.PlaneGeometry(3.3, 3.3),
          new THREE.MeshStandardMaterial({ map: signTexture("SLOT " + (i + 1), [s.label], "#39d98a", "#0d1a16"), roughness: 0.6 })
        );
        label.position.set(px, py, zd.z - 14 + 10.45);
        this.root.add(label);
        this.studioSlots.set(s.id, { pos: new THREE.Vector3(px, py, zd.z - 14 + 10.6), mesh: label });
        this.interactables.set(s.id, { id: s.id, kind: "slot", label: "Pasang di Slot " + (i + 1), obj: label, radius: 4.2, zone: "studio", data: { slot: s } });
      });
    }

    // ---- Zona 5: Arena (auditorium)
    {
      const zd = ZONE_DEFS[4];
      const base = new THREE.Mesh(new THREE.CylinderGeometry(16, 17, 12, 24), this.mat(0xc9c3b6, 0.85));
      base.position.set(zd.x, 6.2, zd.z - 14);
      base.castShadow = true;
      base.receiveShadow = true;
      this.root.add(base);
      this.addCollider(zd.x, 0, zd.z - 14, 30, 12, 30);
      const dome = new THREE.Mesh(new THREE.SphereGeometry(16, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), this.mat(0x8f9aa8, 0.5, 0.4));
      dome.position.set(zd.x, 12.2, zd.z - 14);
      dome.castShadow = true;
      this.root.add(dome);
      const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(14, 3.2),
        new THREE.MeshStandardMaterial({ map: signTexture("AUDITORIUM", ["ARENA KOMUNIKASI"], "#ffb64d"), roughness: 0.5, emissive: 0x333333 })
      );
      sign.position.set(zd.x, 8, zd.z - 14 + 16.4);
      this.root.add(sign);
      // columns
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const cx = zd.x + Math.cos(a) * 14;
        const cz = zd.z - 14 + Math.sin(a) * 14;
        if (cz > zd.z - 3) continue;
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 11, 12), this.mat(0xe6e0d2, 0.8));
        col.position.set(cx, 5.8, cz);
        col.castShadow = true;
        this.root.add(col);
      }
    }

    // ---- Zona 6: Pusat Kendali (tower)
    {
      const zd = ZONE_DEFS[5];
      const g = new THREE.Group();
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(7, 10, 34, 16), this.mat(0x54617a, 0.55, 0.35));
      shaft.position.y = 17;
      shaft.castShadow = true;
      g.add(shaft);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0xff6b6b, emissive: 0xff3b3b, emissiveIntensity: 2, roughness: 0.3 });
      for (let i = 0; i < 3; i++) {
        const r = new THREE.Mesh(new THREE.TorusGeometry(9 - i * 1.4, 0.4, 8, 32), ringMat);
        r.position.y = 12 + i * 7;
        r.rotation.x = Math.PI / 2;
        g.add(r);
        this.spinners.push({ obj: r, speed: 0.3 + i * 0.25, axis: "z" });
      }
      const crown = new THREE.Mesh(new THREE.ConeGeometry(6, 8, 12), this.mat(0x8f9aa8, 0.5, 0.4));
      crown.position.y = 38;
      crown.castShadow = true;
      g.add(crown);
      const beacon = new THREE.Mesh(
        new THREE.SphereGeometry(1.2, 16, 12),
        new THREE.MeshStandardMaterial({ color: 0xff8080, emissive: 0xff2020, emissiveIntensity: 2.5 })
      );
      beacon.position.y = 42.5;
      g.add(beacon);
      this.bobbers.push({ obj: beacon, amp: 0.5, speed: 1.6, base: 42.5 });
      g.position.set(zd.x, 0.2, zd.z - 16);
      this.root.add(g);
      this.addCollider(zd.x, 0, zd.z - 16, 18, 36, 18);
      // control consoles
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + 0.4;
        const cx = zd.x + Math.cos(a) * 13;
        const cz = zd.z - 4 + Math.sin(a) * 13;
        const con = new THREE.Group();
        const bodyC = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.2, 1.6), this.mat(0x39404f, 0.6, 0.3));
        bodyC.position.y = 1.2;
        bodyC.castShadow = true;
        con.add(bodyC);
        const scr = new THREE.Mesh(
          new THREE.PlaneGeometry(2.2, 1.2),
          new THREE.MeshStandardMaterial({ map: screenTexture(["DATA: VERIFIKASI", "STATUS: 4 BUKTI"], "#ff8080"), emissive: 0x662222, emissiveIntensity: 0.9, roughness: 0.4 })
        );
        scr.position.set(0, 1.9, 0.85);
        scr.rotation.x = -0.3;
        con.add(scr);
        con.position.set(cx, 0.2, cz);
        con.lookAt(zd.x, 1, zd.z - 4);
        this.root.add(con);
        this.screens.push(scr);
        this.addCollider(cx, 0, cz, 2.6, 2.4, 1.6);
      }
    }
  }

  private buildProps() {
    const lamps: [number, number][] = [];
    for (let i = -3; i <= 3; i++) {
      lamps.push([i * 30, 20]);
      lamps.push([i * 30, -20]);
      lamps.push([20, i * 30]);
      lamps.push([-20, i * 30]);
    }
    lamps.forEach(([x, z]) => {
      if (ZONE_DEFS.some((zd) => Math.hypot(x - zd.x, z - zd.z) < 12)) return;
      if (Math.hypot(x, z - 14) < 26) return;
      this.makeLamp(x, z);
    });
    // kiosks / newsstands
    const kioskSpots: [number, number][] = [
      [14, 40],
      [-14, 40],
      [30, 0],
      [-30, 0],
      [16, -30],
      [-16, -30],
    ];
    kioskSpots.forEach(([x, z], i) => {
      const k = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 3), this.mat(i % 2 ? 0xc25b4a : 0x3f7a8c, 0.7));
      body.position.y = 1.6;
      body.castShadow = true;
      k.add(body);
      const roofK = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.3, 3.8), this.mat(0x2f3a48, 0.6));
      roofK.position.y = 3.3;
      k.add(roofK);
      const scr = new THREE.Mesh(
        new THREE.PlaneGeometry(3, 1.4),
        new THREE.MeshStandardMaterial({ map: signTexture("INFO KOTA", ["CEK FAKTA", "SEBELUM", "MEMBAGIKAN"], "#39d98a"), roughness: 0.6, emissive: 0x333333 })
      );
      scr.position.set(0, 2.2, 1.6);
      k.add(scr);
      k.position.set(x, 0.2, z);
      this.root.add(k);
      this.addCollider(x, 0, z, 4, 3.2, 3);
      this.interactables.set("kiosk-" + i, { id: "kiosk-" + i, kind: "board", label: "Baca Info Kota", obj: k, radius: 4.5 });
    });
  }

  private buildNPCs() {
    NPCS.forEach((n) => {
      const zd = ZONE_DEFS.find((z) => z.id === n.zone)!;
      const parts = createCharacter({ skin: n.color, shirt: n.shirt, pants: 0x2c3345, shoes: 0x1d2230, hair: 0x241a12, accent: 0xd8b24a });
      const px = zd.x + (n.zone === "gerbang" ? 8 : 7);
      const pz = zd.z + (n.zone === "pusat" ? 6 : 8);
      parts.root.position.set(px, 0.2, pz);
      parts.root.rotation.y = Math.atan2(zd.x - px, zd.z - pz) + Math.PI;
      this.root.add(parts.root);
      this.npcs.push({ parts, t: Math.random() * 10, base: parts.root.rotation.y });
      this.interactables.set(n.id, { id: n.id, kind: "npc", label: "Bicara: " + n.name, obj: parts.root, radius: 4.5, zone: n.zone, data: { npc: n } });
      this.addCollider(px, 0, pz, 0.9, 1.8, 0.9);
    });
  }

  private buildOrbs() {
    const positions: [number, number][] = [
      [-9, 66],
      [10, 70],
      [-4, 82],
      [-64, 22],
      [-52, 38],
      [64, 20],
      [-64, -36],
      [64, -36],
    ];
    ORBS.forEach((o, i) => {
      const [x, z] = positions[i];
      const g = new THREE.Group();
      const core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.62, 1),
        new THREE.MeshStandardMaterial({ color: 0xfff3c4, emissive: 0xffc23d, emissiveIntensity: 2.2, roughness: 0.2, metalness: 0.3 })
      );
      g.add(core);
      const cage = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.95, 0),
        new THREE.MeshStandardMaterial({ color: 0x5ec8ff, emissive: 0x2f8fd8, emissiveIntensity: 1.4, wireframe: true, transparent: true, opacity: 0.75 })
      );
      g.add(cage);
      const halo = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: glowTexture("#ffd88a"), transparent: true, blending: THREE.AdditiveBlending, opacity: 0.7, depthWrite: false })
      );
      halo.scale.set(4.4, 4.4, 1);
      g.add(halo);
      g.position.set(x, 1.7, z);
      this.root.add(g);
      this.spinners.push({ obj: core, speed: 1.1, axis: "y" });
      this.spinners.push({ obj: cage, speed: -0.6, axis: "y" });
      this.bobbers.push({ obj: g, amp: 0.28, speed: 1.5 + i * 0.12, base: 1.7 });
      this.interactables.set(o.id, { id: o.id, kind: "orb", label: "Ambil Pecahan: " + o.title, obj: g, radius: 3.4, zone: o.zone, data: { orb: o } });
    });
  }

  // ---------------------------------------------------------- runtime API
  setPortalState(id: string, state: "locked" | "active" | "done") {
    const p = this.portals.get(id);
    if (!p) return;
    p.state = state;
    const inter = this.interactables.get("zone-" + id);
    if (inter) {
      inter.locked = state === "locked";
      inter.label = state === "locked" ? "Zona terkunci" : state === "done" ? `${id.toUpperCase()} — selesai (masuk lagi)` : inter.label;
    }
    const col = state === "locked" ? 0x555b66 : state === "done" ? 0x39d98a : p.color;
    const rm = p.ring.material as THREE.MeshStandardMaterial;
    rm.emissiveIntensity = state === "locked" ? 0.15 : 2.4;
    rm.color.setHex(col);
    rm.emissive.setHex(col);
    p.light.color.setHex(col);
    p.light.intensity = state === "locked" ? 4 : 26;
    (p.disc.material as THREE.MeshBasicMaterial).opacity = state === "locked" ? 0.18 : 0.85;
    (p.beacon.material as THREE.SpriteMaterial).color.setHex(col);
    (p.beacon.material as THREE.SpriteMaterial).opacity = state === "locked" ? 0.15 : 0.55;
  }

  removeInteractable(id: string) {
    const it = this.interactables.get(id);
    if (!it) return;
    it.hidden = true;
    it.obj.visible = false;
  }

  restoreInteractable(id: string) {
    const it = this.interactables.get(id);
    if (!it) return;
    it.hidden = false;
    it.obj.visible = true;
  }

  // -------- studio 3D placement mini-game --------
  pickupElement(id: string, anchor: THREE.Object3D) {
    const e = this.studioEls.get(id);
    if (!e || e.placed) return false;
    anchor.add(e.mesh);
    e.mesh.position.set(0, 0, -0.2);
    e.mesh.rotation.set(-Math.PI / 2.6, 0, 0);
    e.mesh.scale.setScalar(0.42);
    return true;
  }

  dropElementHome(id: string) {
    const e = this.studioEls.get(id);
    if (!e || e.placed) return;
    this.root.add(e.mesh);
    e.mesh.position.copy(e.home);
    e.mesh.rotation.set(-Math.PI / 2.2, 0, 0);
    e.mesh.scale.setScalar(1);
  }

  /** Returns true when the element matches the slot. */
  placeElement(elementId: string, slotId: string) {
    const e = this.studioEls.get(elementId);
    const s = this.studioSlots.get(slotId);
    if (!e || !s) return false;
    const def = STUDIO_ELEMENTS.find((x) => x.id === elementId)!;
    const correct = def.slot === slotId;
    if (correct) {
      this.root.add(e.mesh);
      e.mesh.position.copy(s.pos);
      e.mesh.position.z -= 0.05;
      e.mesh.rotation.set(0, 0, 0);
      e.mesh.scale.setScalar(0.9);
      e.placed = true;
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture("#39d98a"), transparent: true, blending: THREE.AdditiveBlending, opacity: 0.85, depthWrite: false }));
      halo.scale.set(4.5, 4.5, 1);
      halo.position.copy(s.pos);
      this.root.add(halo);
      this.bobbers.push({ obj: halo, amp: 0.25, speed: 2.4, base: s.pos.y });
      const it = this.interactables.get(elementId);
      if (it) it.hidden = true;
    }
    return correct;
  }

  resetStudio() {
    this.studioEls.forEach((e, id) => {
      this.root.add(e.mesh);
      e.mesh.position.copy(e.home);
      e.mesh.rotation.set(-Math.PI / 2.2, 0, 0);
      e.mesh.scale.setScalar(1);
      e.placed = false;
      this.restoreInteractable(id);
    });
  }

  get placedElements() {
    let n = 0;
    this.studioEls.forEach((e) => {
      if (e.placed) n++;
    });
    return n;
  }

  studioProgress() {
    return this.placedElements / STUDIO_ELEMENTS.length;
  }

  // ---------------------------------------------------------- per-frame
  update(dt: number, t: number) {
    for (const s of this.spinners) {
      if (s.speed === 0) continue;
      s.obj.rotation[s.axis] += s.speed * dt;
    }
    for (const b of this.bobbers) {
      b.obj.position.y = b.base + Math.sin(t * b.speed) * b.amp;
    }
    for (const c of this.clouds) {
      c.mesh.position.x += c.speed * dt;
      if (c.mesh.position.x > 240) c.mesh.position.x = -240;
    }
    for (const n of this.npcs) {
      n.t += dt;
      animateCharacter(
        n.parts,
        { speed: 0, grounded: true, carrying: false, celebrating: 0, interacting: 0, talking: n.t % 12 < 3 },
        0,
        n.t,
        n.base + Math.sin(n.t * 0.3) * 0.05
      );
    }
    if (this.fountain) {
      const attr = this.fountain.geometry.getAttribute("position") as THREE.BufferAttribute;
      const arr = attr.array as Float32Array;
      for (let i = 0; i < this.fountainDrops.length; i++) {
        const d = this.fountainDrops[i];
        d.v.y -= 9.0 * dt;
        arr[i * 3] += d.v.x * dt;
        arr[i * 3 + 1] += d.v.y * dt;
        arr[i * 3 + 2] += d.v.z * dt;
        if (arr[i * 3 + 1] < 1.2) {
          arr[i * 3] = 0;
          arr[i * 3 + 1] = 4.4;
          arr[i * 3 + 2] = 14;
          d.v.set((Math.random() - 0.5) * 3.2, Math.random() * 2 + 1.5, (Math.random() - 0.5) * 3.2);
        }
      }
      attr.needsUpdate = true;
    }
  }
}

// ---------------------------------------------------------- helpers
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function swirlTexture(color: number) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "rgba(0,0,0,0)";
  ctx.fillRect(0, 0, 256, 256);
  const hex = "#" + new THREE.Color(color).getHexString();
  ctx.translate(128, 128);
  for (let i = 0; i < 5; i++) {
    for (let a = 0; a < 360; a += 4) {
      const rad = (a * Math.PI) / 180;
      const r = 8 + (a / 360) * 110 + i * 6;
      ctx.fillStyle = hex;
      ctx.globalAlpha = 0.16;
      ctx.beginPath();
      ctx.arc(Math.cos(rad + i) * r, Math.sin(rad + i) * r, 4 - i * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 0.9;
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 120);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(0.25, hex);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, 120, 0, Math.PI * 2);
  ctx.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
