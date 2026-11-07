import * as THREE from "three";
import { World } from "./world";
import { createCharacter, animateCharacter, type CharacterParts } from "./player";
import { input, pollKeyboard, resetInput } from "./input";
import { glowTexture } from "./textures";
import type { CutsceneDef, EngineEvents, EngineLiveState, EngineSettings, PromptInfo, Quality } from "./types";
import { ZONES } from "./content";

const GRAVITY = -24;
const WALK = 4.4;
const RUN = 8.2;
const JUMP_V = 9.2;
const PLAYER_R = 0.55;

export class GameEngine {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  camera: THREE.PerspectiveCamera;
  world: World;
  events: EngineEvents;
  settings: EngineSettings;

  live: EngineLiveState = { px: 0, pz: 74, pyaw: 0, zone: "gerbang", blips: [], fps: 60 };

  private clock = new THREE.Clock();
  private raf = 0;
  private paused = false;
  private disposed = false;
  private sun!: THREE.DirectionalLight;
  private hemi!: THREE.HemisphereLight;
  private ambient!: THREE.AmbientLight;

  // player
  private parts!: CharacterParts;
  private pos = new THREE.Vector3(0, 0.2, 86);
  private vel = new THREE.Vector3();
  private yaw = Math.PI;
  private onGround = true;
  private phase = 0;
  private groundY = 0.2;
  private celebrating = 0;
  private lastStepPhase = 0;
  private autoCamTimer = 0;

  // camera orbit
  private camYaw = Math.PI;
  private camPitch = 0.24;
  private camDist = 7.2;
  private camPos = new THREE.Vector3();
  private camLook = new THREE.Vector3();

  // interaction
  private current: PromptInfo | null = null;
  private promptThrottle = 0;

  // carried studio element
  carriedElement: string | null = null;

  // cutscene
  private cutscene: CutsceneDef | null = null;
  private csTime = 0;
  private csTotal = 0;
  private csStartPos = new THREE.Vector3();
  private csStartLook = new THREE.Vector3();
  private inCutscene = false;

  // particles
  private particles!: THREE.Points;
  private pVel: THREE.Vector3[] = [];
  private pLife: number[] = [];
  private pIdx = 0;

  private fpsAcc = 0;
  private fpsFrames = 0;

  constructor(canvas: HTMLCanvasElement, events: EngineEvents, settings: EngineSettings) {
    this.events = events;
    this.settings = settings;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: settings.quality !== "low", powerPreference: "high-performance" });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.06;
    this.renderer.shadowMap.enabled = settings.quality !== "low";
    this.renderer.shadowMap.type = settings.quality === "high" ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;

    this.camera = new THREE.PerspectiveCamera(58, 16 / 9, 0.1, 900);
    this.scene.fog = new THREE.FogExp2(0xa9c3dd, settings.quality === "low" ? 0.006 : 0.0034);

    this.buildLights();
    this.world = new World(settings.quality);
    this.scene.add(this.world.root);
    this.buildPlayer();
    this.buildParticles();
    this.buildWaypoint();
    this.applyQuality(settings.quality);
    this.resize();
    this.camPos.set(0, 6, 96);
    this.camLook.copy(this.pos);
    this.updateBlips();
  }

  // ---------------------------------------------------------- setup
  private buildLights() {
    this.hemi = new THREE.HemisphereLight(0xbcd8ff, 0x5a4a35, 0.85);
    this.scene.add(this.hemi);
    this.ambient = new THREE.AmbientLight(0xffffff, 0.22);
    this.scene.add(this.ambient);
    this.sun = new THREE.DirectionalLight(0xfff0d4, 2.6);
    this.sun.position.set(60, 90, 40);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.camera.near = 1;
    this.sun.shadow.camera.far = 320;
    const s = 95;
    this.sun.shadow.camera.left = -s;
    this.sun.shadow.camera.right = s;
    this.sun.shadow.camera.top = s;
    this.sun.shadow.camera.bottom = -s;
    this.sun.shadow.bias = -0.0006;
    this.sun.shadow.normalBias = 0.03;
    this.sun.shadow.camera.updateProjectionMatrix();
    this.scene.add(this.sun);
    this.scene.add(this.sun.target);
    // warm rim light for cinematic contrast
    const rim = new THREE.DirectionalLight(0xffb46b, 0.5);
    rim.position.set(-70, 40, -60);
    this.scene.add(rim);
  }

  private buildPlayer() {
    this.parts = createCharacter({ skin: 0xc98f63, shirt: 0x2f5f9e, pants: 0x2a2f3d, shoes: 0xe8e8ee, hair: 0x1d150f, accent: 0xf5b32a });
    this.parts.root.position.copy(this.pos);
    this.scene.add(this.parts.root);
  }

  private buildParticles() {
    const N = this.settings.quality === "low" ? 120 : 420;
    const geo = new THREE.BufferGeometry();
    const arr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      arr[i * 3] = 0;
      arr[i * 3 + 1] = -999;
      arr[i * 3 + 2] = 0;
      this.pVel.push(new THREE.Vector3());
      this.pLife.push(0);
    }
    geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    const colors = new Float32Array(N * 3).fill(1);
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    this.particles = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        size: 0.42,
        map: glowTexture("#ffffff"),
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    this.particles.frustumCulled = false;
    this.scene.add(this.particles);
  }

  /** Tall light beam marking the current objective — visible across the city. */
  private waypoint!: THREE.Group;
  private buildWaypoint() {
    const g = new THREE.Group();
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 1.5, 70, 12, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0xffd25e,
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    );
    beam.position.y = 35;
    g.add(beam);
    const halo = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: glowTexture("#ffd25e"), transparent: true, blending: THREE.AdditiveBlending, opacity: 0.55, depthWrite: false })
    );
    halo.scale.set(16, 16, 1);
    halo.position.y = 1.2;
    g.add(halo);
    g.visible = false;
    this.waypoint = g;
    this.scene.add(g);
  }

  setWaypoint(x: number | null, z?: number) {
    if (x === null || z === undefined) {
      this.waypoint.visible = false;
      return;
    }
    this.waypoint.visible = true;
    this.waypoint.position.set(x, 0.2, z);
  }

  applyQuality(q: Quality) {
    this.settings.quality = q;
    const dpr = window.devicePixelRatio || 1;
    const ratio = q === "low" ? Math.min(dpr, 1) * 0.8 : q === "medium" ? Math.min(dpr, 1.35) : Math.min(dpr, 2);
    this.renderer.setPixelRatio(ratio);
    this.renderer.shadowMap.enabled = q !== "low";
    this.sun.castShadow = q !== "low";
    this.sun.shadow.mapSize.set(q === "high" ? 2048 : 1024, q === "high" ? 2048 : 1024);
    if (this.sun.shadow.map) {
      this.sun.shadow.map.dispose();
      this.sun.shadow.map = null as unknown as THREE.WebGLRenderTarget;
    }
    (this.scene.fog as THREE.FogExp2).density = q === "low" ? 0.006 : q === "medium" ? 0.004 : 0.0032;
    this.renderer.toneMappingExposure = q === "low" ? 1.0 : 1.06;
    this.resize();
  }

  resize() {
    const canvas = this.renderer.domElement;
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / Math.max(1, h);
    this.camera.updateProjectionMatrix();
  }

  // ---------------------------------------------------------- loop
  start() {
    const loop = () => {
      if (this.disposed) return;
      this.raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, this.clock.getDelta());
      this.fpsAcc += dt;
      this.fpsFrames++;
      if (this.fpsAcc > 0.5) {
        this.live.fps = Math.round(this.fpsFrames / this.fpsAcc);
        this.fpsAcc = 0;
        this.fpsFrames = 0;
      }
      if (!this.paused) this.update(dt);
      this.renderer.render(this.scene, this.camera);
    };
    this.raf = requestAnimationFrame(loop);
  }

  setPaused(p: boolean) {
    this.paused = p;
    resetInput();
    this.clock.getDelta();
  }

  cinematic = false;
  private cineAngle = 0.6;

  /** Slow cinematic orbit used as living 3D backdrop for menus. */
  setCinematic(on: boolean) {
    this.cinematic = on;
    input.active = !on;
    resetInput();
  }

  private update(dt: number) {
    const t = this.clock.elapsedTime;

    if (this.cinematic) {
      this.cineAngle += dt * 0.055;
      const r = 84;
      this.camera.position.set(
        Math.sin(this.cineAngle) * r,
        40 + Math.sin(this.cineAngle * 0.6) * 10,
        14 + Math.cos(this.cineAngle) * r
      );
      this.camera.lookAt(0, 12, 14);
      this.world.update(dt, t);
      this.updateParticles(dt);
      return;
    }

    if (this.inCutscene) {
      this.updateCutscene(dt);
      this.world.update(dt * 0.6, t);
      this.updateParticles(dt);
      return;
    }

    this.updatePlayer(dt);
    this.updateCamera(dt);
    this.world.update(dt, t);
    this.updateParticles(dt);
    this.updateInteraction(dt);
    this.updateLive();
  }

  private updatePlayer(dt: number) {
    pollKeyboard();
    let mx = input.moveX + input.joyX;
    let my = input.moveY + input.joyY;
    const mag = Math.hypot(mx, my);
    if (mag > 1) {
      mx /= mag;
      my /= mag;
    }
    const moving = mag > 0.08;

    // camera-relative movement
    const sin = Math.sin(this.camYaw);
    const cos = Math.cos(this.camYaw);
    const dirX = mx * cos - my * sin;
    const dirZ = -mx * sin - my * cos;
    const speed = input.run ? RUN : WALK;

    const targetVX = moving ? dirX * speed * Math.min(1, mag) : 0;
    const targetVZ = moving ? dirZ * speed * Math.min(1, mag) : 0;
    const accel = this.onGround ? 14 : 5;
    this.vel.x += (targetVX - this.vel.x) * Math.min(1, accel * dt);
    this.vel.z += (targetVZ - this.vel.z) * Math.min(1, accel * dt);

    if (input.jumpQueued && this.onGround) {
      this.vel.y = JUMP_V;
      this.onGround = false;
      this.events.onFootstep();
    }
    input.jumpQueued = false;
    this.vel.y += GRAVITY * dt;

    // horizontal move + collision
    const nx = this.pos.x + this.vel.x * dt;
    const nz = this.pos.z + this.vel.z * dt;
    this.resolveMove(nx, nz);

    // vertical
    this.pos.y += this.vel.y * dt;
    this.groundY = 0.2;
    for (const b of this.world.colliders) {
      if (this.pos.x > b.min.x - PLAYER_R && this.pos.x < b.max.x + PLAYER_R && this.pos.z > b.min.z - PLAYER_R && this.pos.z < b.max.z + PLAYER_R) {
        if (b.max.y <= this.pos.y + 0.55 && b.max.y > this.groundY) this.groundY = b.max.y;
      }
    }
    if (this.pos.y <= this.groundY) {
      if (!this.onGround && this.vel.y < -6) this.events.onFootstep();
      this.pos.y = this.groundY;
      this.vel.y = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }

    // keep the player inside the playfield
    this.pos.x = THREE.MathUtils.clamp(this.pos.x, -130, 130);
    this.pos.z = THREE.MathUtils.clamp(this.pos.z, -110, 118);

    const hSpeed = Math.hypot(this.vel.x, this.vel.z);
    this.phase += dt * (2.2 + hSpeed * 1.35);

    // footsteps
    if (this.onGround && hSpeed > 1.2) {
      const stepMark = Math.floor(this.phase / Math.PI);
      if (stepMark !== this.lastStepPhase) {
        this.lastStepPhase = stepMark;
        this.events.onFootstep();
      }
    }

    if (moving) {
      const targetYaw = Math.atan2(this.vel.x, this.vel.z);
      let d = targetYaw - this.yaw;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      this.yaw += d * Math.min(1, dt * 12);
    }

    if (this.celebrating > 0) this.celebrating -= dt;

    this.parts.root.position.copy(this.pos);
    animateCharacter(
      this.parts,
      { speed: hSpeed, grounded: this.onGround, carrying: !!this.carriedElement, celebrating: this.celebrating, interacting: 0, talking: false },
      this.phase,
      this.clock.elapsedTime,
      this.yaw
    );

    // sun follows the player so shadows stay crisp around the action
    this.sun.position.set(this.pos.x + 60, 92, this.pos.z + 44);
    this.sun.target.position.copy(this.pos);
  }

  private resolveMove(nx: number, nz: number) {
    let x = nx;
    let z = nz;
    const headY = this.pos.y + 1.7;
    for (const b of this.world.colliders) {
      // allow standing on top of low obstacles
      if (b.max.y <= this.pos.y + 0.55) continue;
      if (b.min.y > headY) continue;
      const ex = b.min.x - PLAYER_R;
      const bx = b.max.x + PLAYER_R;
      const ez = b.min.z - PLAYER_R;
      const bz = b.max.z + PLAYER_R;
      if (x > ex && x < bx && z > ez && z < bz) {
        const dxL = Math.abs(x - ex);
        const dxR = Math.abs(bx - x);
        const dzL = Math.abs(z - ez);
        const dzR = Math.abs(bz - z);
        const m = Math.min(dxL, dxR, dzL, dzR);
        if (m === dxL) x = ex;
        else if (m === dxR) x = bx;
        else if (m === dzL) z = ez;
        else z = bz;
      }
    }
    this.pos.x = x;
    this.pos.z = z;
  }

  private updateCamera(dt: number) {
    // look input
    if (Math.abs(input.lookDX) > 0.0001 || Math.abs(input.lookDY) > 0.0001) {
      this.camYaw -= input.lookDX * 0.006;
      this.camPitch = THREE.MathUtils.clamp(this.camPitch + input.lookDY * 0.004, -0.35, 1.15);
      this.autoCamTimer = 0;
    } else {
      this.autoCamTimer += dt;
    }
    input.lookDX = 0;
    input.lookDY = 0;

    if (input.zoomDelta) {
      this.camDist = THREE.MathUtils.clamp(this.camDist + input.zoomDelta, 3.2, 16);
      input.zoomDelta = 0;
    }

    // auto camera (helpful on interactive whiteboards / touch devices)
    const hSpeed = Math.hypot(this.vel.x, this.vel.z);
    if (this.settings.autoCamera && this.autoCamTimer > 1.4 && hSpeed > 1.5) {
      let d = this.yaw + Math.PI - this.camYaw;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      this.camYaw += d * Math.min(1, dt * 1.6);
    }

    const target = new THREE.Vector3(this.pos.x, this.pos.y + 1.62, this.pos.z);
    const desired = new THREE.Vector3(
      target.x + Math.sin(this.camYaw) * Math.cos(this.camPitch) * this.camDist,
      target.y + Math.sin(this.camPitch) * this.camDist + 0.7,
      target.z + Math.cos(this.camYaw) * Math.cos(this.camPitch) * this.camDist
    );

    // camera collision avoidance (ray vs world AABBs)
    const dirv = desired.clone().sub(target);
    const dist = dirv.length();
    dirv.normalize();
    const ray = new THREE.Ray(target, dirv);
    let allowed = dist;
    const hit = new THREE.Vector3();
    for (const b of this.world.colliders) {
      if (ray.intersectBox(b, hit)) {
        const d = hit.distanceTo(target);
        if (d < allowed) allowed = Math.max(1.6, d - 0.45);
      }
    }
    if (allowed < dist) desired.copy(target).add(dirv.multiplyScalar(allowed));

    const k = 1 - Math.exp(-dt * 8.5);
    this.camPos.lerp(desired, k);
    this.camLook.lerp(target, 1 - Math.exp(-dt * 11));
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camLook);
  }

  private updateInteraction(_dt: number) {
    this.promptThrottle += _dt;
    let bestId: string | null = null;
    let bestLabel = "";
    let bestKind: PromptInfo["kind"] = "object";
    let bestD = Infinity;
    for (const it of this.world.interactables.values()) {
      if (it.hidden) continue;
      if (it.kind === "slot" && !this.carriedElement) continue;
      if (it.kind === "element" && this.carriedElement) continue;
      if (it.locked) continue;
      const p = it.obj.getWorldPosition(new THREE.Vector3());
      const d = Math.hypot(p.x - this.pos.x, p.z - this.pos.z);
      if (d > it.radius) continue;
      if (Math.abs(p.y - this.pos.y) > 8) continue;
      if (d < bestD) {
        bestD = d;
        bestId = it.id;
        bestLabel = it.label;
        bestKind = it.kind;
      }
    }
    const best: PromptInfo | null = bestId ? { id: bestId, label: bestLabel, kind: bestKind, distance: bestD } : null;

    const changed = (best ? best.id : null) !== (this.current ? this.current.id : null);
    this.current = best;
    if (changed || this.promptThrottle > 0.25) {
      this.promptThrottle = 0;
      this.events.onPrompt(this.current);
    }

    if (input.interactQueued) {
      input.interactQueued = false;
      this.tryInteract();
    }
  }

  tryInteract(): boolean {
    if (this.inCutscene || !this.current) return false;
    const it = this.world.interactables.get(this.current.id);
    if (!it) return false;
    this.events.onInteract(it.id, it.kind);
    return true;
  }

  private updateLive() {
    this.live.px = this.pos.x;
    this.live.pz = this.pos.z;
    this.live.pyaw = this.camYaw;
    // nearest zone
    let zone = this.live.zone;
    let bestD = 1e9;
    for (const z of ZONES) {
      const d = Math.hypot(z.position[0] - this.pos.x, z.position[1] - this.pos.z);
      if (d < bestD) {
        bestD = d;
        zone = z.id;
      }
    }
    this.live.zone = zone;
  }

  private updateBlips() {
    this.live.blips = ZONES.map((z) => ({ x: z.position[0], z: z.position[1], color: z.color, label: z.name }));
  }

  // ---------------------------------------------------------- FX
  burst(pos: THREE.Vector3, color: string, count = 40, power = 6) {
    const geo = this.particles.geometry;
    const pAttr = geo.getAttribute("position") as THREE.BufferAttribute;
    const cAttr = geo.getAttribute("color") as THREE.BufferAttribute;
    const col = new THREE.Color(color);
    const n = Math.min(count, this.pVel.length);
    for (let i = 0; i < n; i++) {
      const idx = this.pIdx % this.pVel.length;
      this.pIdx++;
      pAttr.setXYZ(idx, pos.x, pos.y, pos.z);
      cAttr.setXYZ(idx, col.r, col.g, col.b);
      const a = Math.random() * Math.PI * 2;
      const e = Math.random() * Math.PI * 0.5;
      const sp = power * (0.4 + Math.random() * 0.8);
      this.pVel[idx].set(Math.cos(a) * Math.cos(e) * sp, Math.sin(e) * sp + 1.6, Math.sin(a) * Math.cos(e) * sp);
      this.pLife[idx] = 1.4 + Math.random() * 0.6;
    }
    pAttr.needsUpdate = true;
    cAttr.needsUpdate = true;
  }

  celebrate(pos?: THREE.Vector3) {
    this.celebrating = 1.6;
    const p = pos ?? this.pos.clone().add(new THREE.Vector3(0, 1.2, 0));
    this.burst(p, "#ffd76a", 70, 7);
    setTimeout(() => this.burst(p, "#39d98a", 50, 5), 260);
    setTimeout(() => this.burst(p, "#5ec8ff", 50, 5), 520);
  }

  private updateParticles(dt: number) {
    const pAttr = this.particles.geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = pAttr.array as Float32Array;
    let dirty = false;
    for (let i = 0; i < this.pLife.length; i++) {
      if (this.pLife[i] <= 0) continue;
      this.pLife[i] -= dt;
      this.pVel[i].y += GRAVITY * 0.35 * dt;
      arr[i * 3] += this.pVel[i].x * dt;
      arr[i * 3 + 1] += this.pVel[i].y * dt;
      arr[i * 3 + 2] += this.pVel[i].z * dt;
      if (this.pLife[i] <= 0) arr[i * 3 + 1] = -999;
      dirty = true;
    }
    if (dirty) pAttr.needsUpdate = true;
  }

  // ---------------------------------------------------------- cutscenes
  playCutscene(def: CutsceneDef) {
    this.cutscene = def;
    this.inCutscene = true;
    this.csTime = 0;
    this.csTotal = def.keys.reduce((a, k) => a + k.t, 0) + (def.hold ?? 1.2);
    this.csStartPos.copy(this.camera.position);
    this.csStartLook.copy(this.camLook);
    input.active = false;
    resetInput();
  }

  skipCutscene() {
    if (!this.cutscene) return;
    const def = this.cutscene;
    this.cutscene = null;
    this.inCutscene = false;
    input.active = true;
    const last = def.keys[def.keys.length - 1];
    this.camPos.set(...last.pos);
    this.camLook.set(...last.look);
    this.events.onCutsceneTick(1, "");
    this.events.onCutsceneEnd(def.id);
  }

  private updateCutscene(dt: number) {
    if (!this.cutscene) return;
    this.csTime += dt;
    const def = this.cutscene;
    const keys = def.keys;
    let acc = 0;
    let i = 0;
    for (; i < keys.length; i++) {
      if (this.csTime < acc + keys[i].t) break;
      acc += keys[i].t;
    }
    const progress = THREE.MathUtils.clamp(this.csTime / this.csTotal, 0, 1);
    this.events.onCutsceneTick(progress, def.subtitle);

    const from = i === 0 ? { pos: this.csStartPos, look: this.csStartLook } : { pos: new THREE.Vector3(...keys[i - 1].pos), look: new THREE.Vector3(...keys[i - 1].look) };
    const to = i >= keys.length ? keys[keys.length - 1] : keys[i];
    const segT = i >= keys.length ? 1 : smoothstep(THREE.MathUtils.clamp((this.csTime - acc) / Math.max(0.001, keys[i].t), 0, 1));
    this.camPos.set(
      THREE.MathUtils.lerp(from.pos.x, to.pos[0], segT),
      THREE.MathUtils.lerp(from.pos.y, to.pos[1], segT),
      THREE.MathUtils.lerp(from.pos.z, to.pos[2], segT)
    );
    this.camLook.set(
      THREE.MathUtils.lerp(from.look.x, to.look[0], segT),
      THREE.MathUtils.lerp(from.look.y, to.look[1], segT),
      THREE.MathUtils.lerp(from.look.z, to.look[2], segT)
    );
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camLook);

    if (this.csTime >= this.csTotal) {
      const done = this.cutscene;
      this.cutscene = null;
      this.inCutscene = false;
      input.active = true;
      this.events.onCutsceneTick(1, "");
      this.events.onCutsceneEnd(done.id);
    }
  }

  get cutsceneActive() {
    return this.inCutscene;
  }
  get cutsceneId() {
    return this.cutscene?.id ?? "";
  }

  // ---------------------------------------------------------- gameplay helpers
  teleport(x: number, z: number, faceTo?: number) {
    this.pos.set(x, 0.2, z);
    this.vel.set(0, 0, 0);
    if (faceTo !== undefined) this.yaw = faceTo;
    this.camPos.set(x + Math.sin(this.camYaw) * this.camDist, 4.5, z + Math.cos(this.camYaw) * this.camDist);
    this.camLook.set(x, 1.7, z);
  }

  focusOn(x: number, y: number, z: number, dur = 2.4) {
    this.playCutscene({
      id: "focus",
      title: "",
      subtitle: "",
      keys: [
        { pos: [this.camera.position.x, this.camera.position.y, this.camera.position.z], look: [this.camLook.x, this.camLook.y, this.camLook.z], t: dur * 0.4 },
        { pos: [x, y + 1.2, z + 9], look: [x, y, z], t: dur * 0.6 },
      ],
    });
  }

  pickupElement(id: string): boolean {
    const ok = this.world.pickupElement(id, this.parts.handAnchor);
    if (ok) {
      this.carriedElement = id;
      this.camDist = Math.min(this.camDist, 6.4);
    }
    return ok;
  }

  placeElement(slotId: string): { ok: boolean; correct: boolean } {
    if (!this.carriedElement) return { ok: false, correct: false };
    const el = this.carriedElement;
    const correct = this.world.placeElement(el, slotId);
    if (correct) {
      this.carriedElement = null;
      this.celebrate();
    } else {
      this.world.dropElementHome(el);
      this.carriedElement = null;
    }
    return { ok: true, correct };
  }

  dropCarried() {
    if (this.carriedElement) {
      this.world.dropElementHome(this.carriedElement);
      this.carriedElement = null;
    }
  }

  setAutoCamera(on: boolean) {
    this.settings.autoCamera = on;
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else if (mat) mat.dispose();
    });
    this.renderer.dispose();
  }
}

function smoothstep(x: number) {
  return x * x * (3 - 2 * x);
}
