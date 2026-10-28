/** Luz del hero que sigue al mouse (en celular se desplaza sola). */

export const lerp = (a, b, t) => a + (b - a) * t;

/** Recorrido lento y suave de la luz cuando no hay mouse. Siempre dentro de la escena (en %). */
export const driftPoint = (tMs) => ({ x: 64 + 16 * Math.sin(tMs / 4200), y: 42 + 10 * Math.cos(tMs / 5600) });

const REST = { x: 64, y: 42 };

export function initHeroPointer(root = document) {
  const hero = root.querySelector('.hero');
  if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  let x = REST.x;
  let y = REST.y;
  let tx = REST.x;
  let ty = REST.y;
  let raf = 0;
  let inView = true;

  const paint = () => {
    hero.style.setProperty('--sx', `${x.toFixed(2)}%`);
    hero.style.setProperty('--sy', `${y.toFixed(2)}%`);
  };

  const frame = (now) => {
    raf = 0;
    if (!inView || document.hidden) return;
    if (!fine) ({ x: tx, y: ty } = driftPoint(now));
    x = lerp(x, tx, 0.08);
    y = lerp(y, ty, 0.08);
    paint();
    // Con mouse, el bucle se detiene cuando la luz llegó a destino; sin mouse corre mientras el hero se ve
    if (!fine || Math.abs(tx - x) > 0.05 || Math.abs(ty - y) > 0.05) raf = requestAnimationFrame(frame);
  };
  const kick = () => { if (!raf && inView && !document.hidden) raf = requestAnimationFrame(frame); };

  if (fine) {
    hero.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse') return;
      const rect = hero.getBoundingClientRect();
      tx = ((event.clientX - rect.left) / rect.width) * 100;
      ty = ((event.clientY - rect.top) / rect.height) * 100;
      kick();
    });
    hero.addEventListener('pointerleave', () => { tx = REST.x; ty = REST.y; kick(); });
  }
  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; kick(); }).observe(hero);
  document.addEventListener('visibilitychange', kick);
  paint();
  kick();
}
