/** Barra fina de progreso de lectura, en el borde inferior del header. */

/** Progreso 0..1 del scroll; 0 si la página entra en una sola pantalla. */
export function scrollProgress(scrollY, docHeight, viewportHeight) {
  const scrollable = docHeight - viewportHeight;
  if (scrollable <= 0) return 0;
  return Math.min(Math.max(scrollY / scrollable, 0), 1);
}

export function initProgress(root = document) {
  const bar = root.querySelector('.scroll-progress');
  if (!bar) return;
  // Con animation-timeline: scroll() la barra la maneja el CSS fuera del hilo principal (css/fx.css)
  if (window.CSS?.supports?.('animation-timeline: scroll()')) return;
  let raf = 0;
  const update = () => {
    raf = 0;
    const p = scrollProgress(window.scrollY, document.documentElement.scrollHeight, window.innerHeight);
    bar.style.setProperty('--progress', p.toFixed(4));
  };
  window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
  window.addEventListener('resize', update);
  update();
}
