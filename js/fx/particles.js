/** Polvo en suspensión del hero: partículas suaves que suben despacio, dibujadas en un <canvas>. */

// ---------- Lógica pura (testeada en tests/fx-particles.test.mjs) ----------

export function createParticles(count, width, height, rand = Math.random) {
  return Array.from({ length: count }, () => ({
    x: rand() * width,
    y: rand() * height,
    r: 0.6 + rand() * 1.6,
    vx: (rand() - 0.5) * 6,         // px/s
    vy: -(6 + rand() * 14),         // px/s, hacia arriba
    a: 0.25 + rand() * 0.6,
    ph: rand() * Math.PI * 2,
    tw: 800 + rand() * 2200,        // período del parpadeo (ms)
  }));
}

/** Avanza la partícula; al salirse del área reaparece del lado opuesto (flujo continuo). */
export function stepParticle(p, dtMs, width, height) {
  p.x += (p.vx * dtMs) / 1000;
  p.y += (p.vy * dtMs) / 1000;
  if (p.y < -p.r) p.y = height + p.r;
  if (p.x < -p.r) p.x = width + p.r;
  else if (p.x > width + p.r) p.x = -p.r;
}

export const particleAlpha = (p, tMs) => Math.min(Math.max(p.a * (0.6 + 0.4 * Math.sin(tMs / p.tw + p.ph)), 0), 1);

// ---------- Canvas ----------

export function initParticles(root = document) {
  const canvas = root.querySelector('.hero-particles');
  const hero = root.querySelector('.hero');
  if (!canvas || !hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  const compact = window.matchMedia('(max-width: 899px)').matches;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  // El color sale de un token de css/tokens.css (los colores viven solo ahí)
  const color = getComputedStyle(document.documentElement).getPropertyValue('--color-particle').trim();
  let width = 0;
  let height = 0;
  let particles = [];
  let raf = 0;
  let last = 0;
  let inView = true;

  const resize = () => {
    const rect = hero.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    particles = createParticles(compact ? 26 : 64, width, height);
  };

  const frame = (now) => {
    raf = 0;
    if (!inView || document.hidden) { last = 0; return; }
    const dt = last ? Math.min(now - last, 64) : 16;
    last = now;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = color;
    for (const p of particles) {
      stepParticle(p, dt, width, height);
      ctx.globalAlpha = particleAlpha(p, now);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    raf = requestAnimationFrame(frame);
  };
  const start = () => { if (!raf && inView && !document.hidden) raf = requestAnimationFrame(frame); };

  resize();
  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; start(); }).observe(hero);
  document.addEventListener('visibilitychange', start);
  let resizeTimer = 0;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); });
  start();
}
