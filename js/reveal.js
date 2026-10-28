/** Entrada escalonada de elementos .reveal al hacerse visibles. */
export function initReveal(root = document) {
  const items = [...root.querySelectorAll('.reveal')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
  );
  for (const item of items) {
    const index = [...item.parentElement.children].indexOf(item);
    item.style.setProperty('--reveal-delay', `${Math.min(index, 6) * 60}ms`);
    observer.observe(item);
  }
}
