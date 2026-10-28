/** Contadores animados para las cifras de "Nosotros" (+8, +600, +30, 5). */

const DURATION_MS = 1600;

/** Separa "+600" en { prefix: '+', value: 600, suffix: '' }. Devuelve null si no hay número. */
export function parseCounter(text) {
  const match = String(text).trim().match(/^(\D*)(\d[\d.,]*)(\D*)$/);
  if (!match) return null;
  return { prefix: match[1], value: Number(match[2].replace(/[.,]/g, '')), suffix: match[3] };
}

export const formatCounter = ({ prefix, suffix }, n) => `${prefix}${n}${suffix}`;

/** Arranca rápido y desacelera al final. */
export const easeOutExpo = (t) => {
  const x = Math.min(Math.max(t, 0), 1);
  return x >= 1 ? 1 : 1 - 2 ** (-10 * x);
};

/** Valor mostrado para un progreso 0..1; nunca se pasa del final. */
export const countAt = (value, progress) => Math.min(value, Math.round(value * easeOutExpo(progress)));

export function initCounters(root = document) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const items = [...root.querySelectorAll('.stat-value')]
    .map((el) => ({ el, parts: parseCounter(el.textContent), final: el.textContent }))
    .filter((item) => item.parts);
  if (items.length === 0) return;

  const run = ({ el, parts, final }) => {
    el.setAttribute('aria-label', final); // los lectores de pantalla leen el valor final, no los números intermedios
    const start = performance.now();
    const frame = (now) => {
      const progress = (now - start) / DURATION_MS;
      el.textContent = formatCounter(parts, countAt(parts.value, progress));
      if (progress < 1) requestAnimationFrame(frame);
      else {
        el.textContent = final;
        el.closest('.stat')?.classList.add('is-scan'); // línea de escaneo (css/fx.css)
      }
    };
    requestAnimationFrame(frame);
  };

  const byEl = new Map(items.map((item) => [item.el, item]));
  items.forEach(({ el, parts }) => { el.textContent = formatCounter(parts, 0); });
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      run(byEl.get(entry.target));
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.6 });
  items.forEach(({ el }) => observer.observe(el));
}
