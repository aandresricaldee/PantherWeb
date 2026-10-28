/** Inclinación 3D con reflejo de luz que sigue al mouse. Se aplica a los elementos [data-tilt] (planes y entrenadores). */

const MAX_DEG = 7;
const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
const round = (v, digits = 2) => Number(v.toFixed(digits));

/** Calcula la rotación (rx, ry en grados) y la posición del reflejo (gx, gy en %) según dónde está el puntero. */
export function tiltFromPointer(px, py, rect, max = MAX_DEG) {
  const x = rect.width > 0 ? clamp01((px - rect.left) / rect.width) : 0.5;
  const y = rect.height > 0 ? clamp01((py - rect.top) / rect.height) : 0.5;
  return {
    rx: round((0.5 - y) * 2 * max),
    ry: round((x - 0.5) * 2 * max),
    gx: round(x * 100, 1),
    gy: round(y * 100, 1),
  };
}

export function initTilt(root = document) {
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!canHover || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  for (const el of root.querySelectorAll('[data-tilt]')) {
    let frame = 0;
    let last = null;
    const apply = () => {
      frame = 0;
      const t = tiltFromPointer(last.clientX, last.clientY, el.getBoundingClientRect());
      el.style.setProperty('--rx', `${t.rx}deg`);
      el.style.setProperty('--ry', `${t.ry}deg`);
      el.style.setProperty('--gx', `${t.gx}%`);
      el.style.setProperty('--gy', `${t.gy}%`);
    };
    el.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse') return;
      last = event;
      if (!frame) frame = requestAnimationFrame(apply);
    });
    el.addEventListener('pointerleave', () => {
      cancelAnimationFrame(frame);
      frame = 0;
      ['--rx', '--ry'].forEach((p) => el.style.setProperty(p, '0deg'));
      ['--gx', '--gy'].forEach((p) => el.style.setProperty(p, '50%'));
    });
  }
}
