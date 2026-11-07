// ============================================================
// Unified input layer: keyboard + mouse + touch + accessibility
// ============================================================

export interface InputState {
  moveX: number;      // strafe  (-1 left, 1 right)
  moveY: number;      // forward (1 forward, -1 back)
  joyX: number;       // virtual joystick (touch)
  joyY: number;
  lookDX: number;     // consumed per frame
  lookDY: number;
  run: boolean;
  joyRun: boolean;
  jumpQueued: boolean;
  interactQueued: boolean;
  zoomDelta: number;
  active: boolean;    // engine currently accepts gameplay input
}

export const input: InputState = {
  moveX: 0,
  moveY: 0,
  joyX: 0,
  joyY: 0,
  lookDX: 0,
  lookDY: 0,
  run: false,
  joyRun: false,
  jumpQueued: false,
  interactQueued: false,
  zoomDelta: 0,
  active: true,
};

const keys = new Set<string>();

export function resetInput() {
  keys.clear();
  input.moveX = 0;
  input.moveY = 0;
  input.joyX = 0;
  input.joyY = 0;
  input.lookDX = 0;
  input.lookDY = 0;
  input.run = false;
  input.joyRun = false;
  input.jumpQueued = false;
  input.interactQueued = false;
  input.zoomDelta = 0;
}

export function pressInteract() {
  input.interactQueued = true;
}
export function pressJump() {
  input.jumpQueued = true;
}
export function pushLook(dx: number, dy: number) {
  input.lookDX += dx;
  input.lookDY += dy;
}

export function attachKeyboard(onEsc: () => void, onToggleMap: () => void) {
  const down = (e: KeyboardEvent) => {
    const ae = document.activeElement;
    if (ae && ["INPUT", "TEXTAREA", "SELECT"].includes(ae.tagName)) {
      if (e.key === "Escape") (ae as HTMLElement).blur();
      return;
    }
    const k = e.key.toLowerCase();
    if (["w", "a", "s", "d", "e", " ", "shift", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) {
      if (document.activeElement && ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
      e.preventDefault();
    }
    keys.add(k);
    if (k === "e") input.interactQueued = true;
    if (k === " ") input.jumpQueued = true;
    if (k === "escape") onEsc();
    if (k === "m") onToggleMap();
  };
  const up = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase());
  const blur = () => resetInput();
  window.addEventListener("keydown", down);
  window.addEventListener("keyup", up);
  window.addEventListener("blur", blur);
  return () => {
    window.removeEventListener("keydown", down);
    window.removeEventListener("keyup", up);
    window.removeEventListener("blur", blur);
  };
}

export function pollKeyboard() {
  let x = 0;
  let y = 0;
  if (keys.has("w") || keys.has("arrowup")) y += 1;
  if (keys.has("s") || keys.has("arrowdown")) y -= 1;
  if (keys.has("a")) x -= 1;
  if (keys.has("d")) x += 1;
  if (keys.has("arrowleft")) input.lookDX -= 6;
  if (keys.has("arrowright")) input.lookDX += 6;
  input.moveX = x;
  input.moveY = y;
  input.run = keys.has("shift") || input.joyRun;
}

/** Drag-to-look works for mouse AND touch (right side of the screen on mobile). */
export function attachLook(el: HTMLElement) {
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let id = -1;

  const onDown = (e: PointerEvent) => {
    if (!input.active) return;
    // On touch devices the left half is reserved for the joystick.
    if (e.pointerType === "touch" && e.clientX < window.innerWidth * 0.42) return;
    dragging = true;
    id = e.pointerId;
    lastX = e.clientX;
    lastY = e.clientY;
    el.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: PointerEvent) => {
    if (!dragging || e.pointerId !== id) return;
    const sens = e.pointerType === "touch" ? 0.42 : 0.28;
    input.lookDX += (e.clientX - lastX) * sens;
    input.lookDY += (e.clientY - lastY) * sens;
    lastX = e.clientX;
    lastY = e.clientY;
  };
  const onUp = (e: PointerEvent) => {
    if (e.pointerId === id) dragging = false;
  };
  const onWheel = (e: WheelEvent) => {
    if (!input.active) return;
    e.preventDefault();
    input.zoomDelta += e.deltaY * 0.004;
  };

  el.addEventListener("pointerdown", onDown);
  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerup", onUp);
  el.addEventListener("pointercancel", onUp);
  el.addEventListener("wheel", onWheel, { passive: false });
  return () => {
    el.removeEventListener("pointerdown", onDown);
    el.removeEventListener("pointermove", onMove);
    el.removeEventListener("pointerup", onUp);
    el.removeEventListener("pointercancel", onUp);
    el.removeEventListener("wheel", onWheel);
  };
}
