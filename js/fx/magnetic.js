/** Botones "magnéticos": se desplazan un poco hacia el puntero cuando está cerca. */

const SELECTOR = '.btn--primary, .wa-fab';

/** Desplazamiento (px) hacia el puntero; 0 si está lejos o justo en el centro. Acotado por `max`. */
export function magneticOffset(px, py, rect, { strength = 0.25, radius = 60, max = 6 } = {}) {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = px - cx;
  const dy = py - cy;
  const reach = Math.max(rect.width, rect.height) / 2 + radius;
  if (Math.hypot(dx, dy) > reach) return { x: 0, y: 0 };
  const clamp = (v) => Math.min(Math.max(v, -max), max);
  return { x: clamp(dx * strength) || 0, y: clamp(dy * strength) || 0 };
}

export function initMagnetic(root = document) {
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!canHover || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const targets = [...root.querySelectorAll(SELECTOR)];
  targets.forEach((el) => el.classList.add('magnetic'));
  let frame = 0;
  let pointer = null;

  const update = () => {
    frame = 0;
    for (const el of targets) {
      const rect = el.getBoundingClientRect();
      // Solo se calcula para los que están cerca de la pantalla
      if (rect.bottom < -100 || rect.top > window.innerHeight + 100) continue;
      const o = magneticOffset(pointer.x, pointer.y, rect);
      el.style.setProperty('--mx', `${o.x}px`);
      el.style.setProperty('--my', `${o.y}px`);
    }
  };
  window.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse') return;
    pointer = { x: event.clientX, y: event.clientY };
    if (!frame) frame = requestAnimationFrame(update);
  }, { passive: true });
}
