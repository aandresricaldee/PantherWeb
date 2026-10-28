/** Texto que se "decodifica": las letras cambian al azar y se van fijando de izquierda a derecha. Para los eyebrows de sección. */

export const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const DURATION_MS = 650;
const FRAME_MS = 40;

/** Texto intermedio para un progreso 0..1. Conserva el largo y los espacios; con progreso 1 devuelve el original. */
export function scrambleFrame(target, progress, rand = Math.random) {
  const chars = [...target];
  const letters = chars.filter((c) => c !== ' ').length;
  const resolved = Math.floor(Math.min(Math.max(progress, 0), 1) * letters);
  let seen = 0;
  return chars.map((c) => {
    if (c === ' ') return c;
    const index = seen;
    seen += 1;
    return index < resolved ? c : GLYPHS[Math.floor(rand() * GLYPHS.length)];
  }).join('');
}

export function initDecode(root = document) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const items = [...root.querySelectorAll('.section-head .eyebrow, .about-text .eyebrow')];
  if (items.length === 0) return;

  const targets = new Map();
  for (const el of items) {
    const text = el.textContent;
    // Los lectores de pantalla leen el texto final; lo que se anima es una copia oculta para ellos
    const reader = document.createElement('span');
    reader.className = 'sr-only';
    reader.textContent = text;
    const visual = document.createElement('span');
    visual.setAttribute('aria-hidden', 'true');
    visual.textContent = text;
    el.replaceChildren(reader, visual);
    targets.set(el, { text, visual });
  }

  const run = ({ text, visual }) => {
    const start = performance.now();
    let last = 0;
    const frame = (now) => {
      const progress = (now - start) / DURATION_MS;
      if (progress >= 1) { visual.textContent = text; return; }
      if (now - last >= FRAME_MS) { visual.textContent = scrambleFrame(text, progress); last = now; }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      run(targets.get(entry.target));
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.8 });
  items.forEach((el) => observer.observe(el));
}
