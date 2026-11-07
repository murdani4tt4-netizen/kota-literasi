import * as THREE from "three";

// ============================================================
// Procedural humanoid character: real geometry + code-driven
// skeletal-style animation (idle / walk / run / jump / carry /
// interact / celebrate).
// ============================================================

export interface CharacterParts {
  root: THREE.Group;
  hips: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  armL: THREE.Group;
  armR: THREE.Group;
  legL: THREE.Group;
  legR: THREE.Group;
  shinL: THREE.Group;
  shinR: THREE.Group;
  foreArmL: THREE.Group;
  foreArmR: THREE.Group;
  handAnchor: THREE.Group;
}

export interface CharacterPalette {
  skin: number;
  shirt: number;
  pants: number;
  shoes: number;
  hair: number;
  accent: number;
}

function mat(color: number, rough = 0.7, metal = 0.05) {
  return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
}

export function createCharacter(palette: CharacterPalette): CharacterParts {
  const root = new THREE.Group();
  const hips = new THREE.Group();
  hips.position.y = 0.95;
  root.add(hips);

  const skin = mat(palette.skin, 0.62);
  const shirt = mat(palette.shirt, 0.78);
  const pants = mat(palette.pants, 0.8);
  const shoes = mat(palette.shoes, 0.5);
  const hair = mat(palette.hair, 0.85);
  const accent = mat(palette.accent, 0.45, 0.3);

  // torso
  const torso = new THREE.Group();
  hips.add(torso);
  const chest = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.34, 4, 12), shirt);
  chest.scale.set(1.15, 1, 0.72);
  chest.position.y = 0.3;
  torso.add(chest);
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.08, 14), accent);
  belt.scale.set(1.05, 1, 0.78);
  belt.position.y = 0.05;
  torso.add(belt);
  // neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.09, 10), skin);
  neck.position.y = 0.56;
  torso.add(neck);

  // backpack
  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.36, 0.16), mat(palette.accent, 0.85));
  pack.position.set(0, 0.3, -0.22);
  torso.add(pack);
  const strapL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.34, 0.03), accent);
  strapL.position.set(0.11, 0.3, 0.13);
  torso.add(strapL);
  const strapR = strapL.clone();
  strapR.position.x = -0.11;
  torso.add(strapR);

  // head
  const head = new THREE.Group();
  head.position.y = 0.62;
  torso.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.135, 20, 16), skin);
  skull.scale.set(1, 1.12, 1.02);
  head.add(skull);
  const hairMesh = new THREE.Mesh(new THREE.SphereGeometry(0.142, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.62), hair);
  hairMesh.scale.set(1.02, 1.16, 1.04);
  hairMesh.position.y = 0.012;
  head.add(hairMesh);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.06, 8), skin);
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, -0.005, 0.135);
  head.add(nose);
  const eyeGeo = new THREE.SphereGeometry(0.021, 10, 8);
  const eyeMat = mat(0x14202c, 0.25);
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(0.052, 0.022, 0.118);
  head.add(eyeL);
  const eyeR = eyeL.clone();
  eyeR.position.x = -0.052;
  head.add(eyeR);

  // arms
  const makeArm = (side: number) => {
    const arm = new THREE.Group();
    arm.position.set(side * 0.235, 0.5, 0);
    torso.add(arm);
    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.2, 4, 10), shirt);
    upper.position.y = -0.13;
    arm.add(upper);
    const fore = new THREE.Group();
    fore.position.y = -0.26;
    arm.add(fore);
    const lower = new THREE.Mesh(new THREE.CapsuleGeometry(0.048, 0.18, 4, 10), skin);
    lower.position.y = -0.12;
    fore.add(lower);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), skin);
    hand.position.y = -0.24;
    fore.add(hand);
    return { arm, fore };
  };
  const aL = makeArm(1);
  const aR = makeArm(-1);

  // legs
  const makeLeg = (side: number) => {
    const leg = new THREE.Group();
    leg.position.set(side * 0.11, -0.02, 0);
    hips.add(leg);
    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.078, 0.3, 4, 12), pants);
    thigh.position.y = -0.2;
    leg.add(thigh);
    const shin = new THREE.Group();
    shin.position.y = -0.42;
    leg.add(shin);
    const lower = new THREE.Mesh(new THREE.CapsuleGeometry(0.066, 0.28, 4, 12), pants);
    lower.position.y = -0.18;
    shin.add(lower);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.07, 0.24), shoes);
    foot.position.set(0, -0.38, 0.05);
    shin.add(foot);
    return { leg, shin };
  };
  const lL = makeLeg(1);
  const lR = makeLeg(-1);

  root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = true;
      o.receiveShadow = false;
    }
  });

  const handAnchor = new THREE.Group();
  handAnchor.position.set(0, 2.35, 0);
  root.add(handAnchor);

  return {
    root,
    hips,
    torso,
    head,
    armL: aL.arm,
    armR: aR.arm,
    foreArmL: aL.fore,
    foreArmR: aR.fore,
    legL: lL.leg,
    legR: lR.leg,
    shinL: lL.shin,
    shinR: lR.shin,
    handAnchor,
  };
}

export interface AnimState {
  speed: number;      // horizontal speed (m/s)
  grounded: boolean;
  carrying: boolean;
  celebrating: number; // seconds remaining
  interacting: number;  // seconds remaining
  talking: boolean;
}

export function animateCharacter(p: CharacterParts, s: AnimState, phase: number, t: number, yaw: number) {
  const { speed, grounded, carrying, celebrating } = s;
  p.root.rotation.y = yaw;

  if (celebrating > 0) {
    const k = Math.min(1, celebrating);
    p.armL.rotation.x = -2.5 * k;
    p.armR.rotation.x = -2.5 * k;
    p.armL.rotation.z = 0.35;
    p.armR.rotation.z = -0.35;
    p.foreArmL.rotation.x = -0.2;
    p.foreArmR.rotation.x = -0.2;
    p.legL.rotation.x = -0.2;
    p.legR.rotation.x = 0.2;
    p.hips.position.y = 0.95 + Math.abs(Math.sin(t * 8)) * 0.12 * k;
    p.torso.rotation.x = -0.12;
    p.head.rotation.x = -0.2;
    return;
  }

  const norm = Math.min(1, speed / 7.2);
  const amp = 0.28 + norm * 0.75;
  const swing = Math.sin(phase) * amp;

  if (!grounded) {
    p.armL.rotation.x = -1.9;
    p.armR.rotation.x = -1.6;
    p.armL.rotation.z = 0.3;
    p.armR.rotation.z = -0.3;
    p.legL.rotation.x = -0.75;
    p.legR.rotation.x = 0.45;
    p.shinL.rotation.x = 0.9;
    p.shinR.rotation.x = 0.15;
    p.torso.rotation.x = 0.1;
    p.hips.position.y = 0.95;
  } else if (speed > 0.25) {
    p.legL.rotation.x = swing;
    p.legR.rotation.x = -swing;
    p.shinL.rotation.x = Math.max(0, -Math.sin(phase - 0.7)) * (0.5 + norm * 0.9);
    p.shinR.rotation.x = Math.max(0, Math.sin(phase - 0.7)) * (0.5 + norm * 0.9);
    if (carrying) {
      p.armL.rotation.x = -2.35 + swing * 0.12;
      p.armR.rotation.x = -2.35 - swing * 0.12;
      p.armL.rotation.z = 0.22;
      p.armR.rotation.z = -0.22;
      p.foreArmL.rotation.x = -0.5;
      p.foreArmR.rotation.x = -0.5;
    } else {
      p.armL.rotation.x = -swing * 0.85;
      p.armR.rotation.x = swing * 0.85;
      p.armL.rotation.z = 0.08 + norm * 0.05;
      p.armR.rotation.z = -0.08 - norm * 0.05;
      p.foreArmL.rotation.x = -0.25 - norm * 0.5;
      p.foreArmR.rotation.x = -0.25 - norm * 0.5;
    }
    p.hips.position.y = 0.95 + Math.abs(Math.sin(phase)) * 0.035 + norm * 0.02;
    p.torso.rotation.x = 0.04 + norm * 0.16;
    p.torso.rotation.y = -Math.sin(phase) * 0.09;
    p.head.rotation.x = -0.04 - norm * 0.06;
    p.head.rotation.y = Math.sin(phase) * 0.05;
  } else {
    // idle
    const breathe = Math.sin(t * 1.7) * 0.02;
    p.legL.rotation.x = 0.03;
    p.legR.rotation.x = -0.03;
    p.shinL.rotation.x = 0.02;
    p.shinR.rotation.x = 0.02;
    if (carrying) {
      p.armL.rotation.x = -2.4;
      p.armR.rotation.x = -2.4;
      p.armL.rotation.z = 0.2;
      p.armR.rotation.z = -0.2;
      p.foreArmL.rotation.x = -0.45;
      p.foreArmR.rotation.x = -0.45;
    } else {
      p.armL.rotation.x = breathe * 2;
      p.armR.rotation.x = -breathe * 2;
      p.armL.rotation.z = 0.11 + breathe;
      p.armR.rotation.z = -0.11 - breathe;
      p.foreArmL.rotation.x = -0.3;
      p.foreArmR.rotation.x = -0.3;
    }
    p.hips.position.y = 0.95 + breathe * 0.4;
    p.torso.rotation.x = breathe * 0.6;
    p.torso.rotation.y = Math.sin(t * 0.5) * 0.05;
    p.head.rotation.y = Math.sin(t * 0.45) * 0.22;
    p.head.rotation.x = Math.sin(t * 0.8) * 0.05;
  }

  if (s.talking) {
    p.head.rotation.z = Math.sin(t * 9) * 0.05;
  }
}
