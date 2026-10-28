/** Parallax de los números grandes (01, 02…) detrás de cada título de sección. */

const SPEED = 0.12;

/** Desplazamiento vertical (px) de una capa según dónde está su contenedor: 0 en el centro de la pantalla. */
export const layerOffset = (top, viewportHeight, speed = SPEED) => (viewportHeight / 2 - top) * speed;

export function initLayers(root = document) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const heads = [...root.querySelectorAll('.section-head, .about-text')];
  if (heads.length === 0) return;

  const visible = new Set();
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) (entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
    update();
  }, { rootMargin: '30% 0px' });
  heads.forEach((el) => observer.observe(el));

  let raf = 0;
  function update() {
    raf = 0;
    for (const el of visible) {
      el.style.setProperty('--py', `${layerOffset(el.getBoundingClientRect().top, window.innerHeight).toFixed(1)}px`);
    }
  }
  window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
}
