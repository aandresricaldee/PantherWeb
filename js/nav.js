/** Posición (x) y ancho (w) de la barra deslizante para un enlace, relativos a la lista del menú. */
export const indicatorFor = (link, list) => ({
  x: Number((link.left - list.left).toFixed(2)),
  w: Number(link.width.toFixed(2)),
});

/** Menú móvil accesible, resaltado de la sección activa y barra que se desliza entre enlaces. */
export function initNav(root = document) {
  const header = root.querySelector('.site-header');
  const toggle = root.querySelector('#nav-toggle');
  const nav = root.querySelector('#site-nav');
  if (!header || !toggle || !nav) return;

  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
  const setOpen = (open) => {
    header.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  };

  toggle.addEventListener('click', () => setOpen(!isOpen()));
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });
  root.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });
  window.matchMedia('(min-width: 900px)').addEventListener('change', (event) => {
    if (event.matches) setOpen(false);
  });

  // Barra que se desliza bajo el enlace activo (solo escritorio; en móvil el menú es vertical y la barra está oculta)
  const list = nav.querySelector('ul');
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const indicator = document.createElement('span');
  indicator.className = 'nav-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  list?.append(indicator);
  const moveIndicator = () => {
    const current = links.find((a) => a.getAttribute('aria-current') === 'true');
    if (!current || !list) { indicator.style.setProperty('--io', '0'); return; }
    const { x, w } = indicatorFor(current.getBoundingClientRect(), list.getBoundingClientRect());
    indicator.style.setProperty('--ix', `${x}px`);
    indicator.style.setProperty('--iw', String(w));
    indicator.style.setProperty('--io', '1');
  };
  // Primera posición sin animar; las siguientes se deslizan
  const place = () => { moveIndicator(); requestAnimationFrame(() => indicator.classList.add('is-ready')); };
  window.addEventListener('resize', moveIndicator);
  document.fonts?.ready.then(moveIndicator);

  // Sección activa: la que cruza la línea central de la ventana. Arriba de todo (hero) no hay ninguna activa.
  if (!('IntersectionObserver' in window)) return;
  const linkById = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        links.forEach((a) => a.removeAttribute('aria-current'));
        linkById.get(entry.target.id)?.setAttribute('aria-current', 'true');
      }
      moveIndicator();
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  for (const id of ['inicio', ...linkById.keys()]) {
    const section = root.getElementById(id);
    if (section) observer.observe(section);
  }
  place();
}
