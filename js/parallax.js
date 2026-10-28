/** Parallax suave del hero: la foto sube más lento y el contenido se desvanece al hacer scroll. */
export function initParallax(root = document) {
  const hero = root.querySelector('.hero');
  const bg = root.querySelector('.hero-bg');
  const content = root.querySelector('.hero-inner');
  if (!hero || !bg || !content) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let frame = 0;
  const update = () => {
    frame = 0;
    const y = window.scrollY;
    const height = hero.offsetHeight;
    if (y > height) return;
    const progress = y / height;
    bg.style.transform = `translate3d(0, ${y * 0.15}px, 0)`;
    content.style.transform = `translate3d(0, ${y * -0.06}px, 0)`;
    content.style.opacity = String(Math.max(0, 1 - progress * 1.15));
  };
  window.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(update); }, { passive: true });
  update();
}
