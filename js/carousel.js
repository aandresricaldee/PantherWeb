import { icon } from './render.js';

const SPEED_PX_S = 60;        // velocidad del movimiento continuo
const RESUME_AFTER_MS = 3000; // tras una interacción del usuario, el movimiento retoma pasado este tiempo

// ---------- Lógica pura (testeada en tests/carousel.test.mjs) ----------
// El riel tiene 3 copias de las tarjetas: [copia][originales][copia]. Se mantiene el scroll dentro del set
// central, [ancho, 2·ancho): al salirse se lo corre un set entero, lo que se ve idéntico (loop sin saltos).

export const wrapPosition = (value, size) => (size > 0 ? ((value % size) + size) % size : 0);
export const normalizeScroll = (left, setWidth) => (setWidth > 0 ? setWidth + wrapPosition(left - setWidth, setWidth) : 0);
export const advanceScroll = (left, dtMs, speed, setWidth) => normalizeScroll(left + (speed * dtMs) / 1000, setWidth);
/** Scroll que deja la tarjeta siguiente (dir = 1) o anterior (dir = -1) alineada al borde. */
export const cardTarget = (left, base, step, dir) => base + (Math.round((left - base) / step) + dir) * step;

// ---------- Comportamiento en el DOM ----------

const button = (className, label, child) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = className;
  b.setAttribute('aria-label', label);
  if (child) b.append(child);
  return b;
};

/** Cinta infinita de tarjetas con movimiento continuo, flechas y botón de pausa. Espera `[data-carousel] > .carousel-track`. */
export function initCarousel(root = document) {
  const host = root.querySelector('[data-carousel]');
  const track = host?.querySelector('.carousel-track');
  const originals = track ? [...track.querySelectorAll('.discipline')] : [];
  if (!host || originals.length === 0) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Copias decorativas antes y después: ocultas para lectores de pantalla y no enfocables
  const makeCopy = () => originals.map((slide) => {
    const copy = slide.cloneNode(true);
    ['role', 'aria-roledescription', 'aria-label'].forEach((a) => copy.removeAttribute(a));
    copy.setAttribute('aria-hidden', 'true');
    copy.setAttribute('inert', '');
    return copy;
  });
  track.prepend(...makeCopy());
  track.append(...makeCopy());

  const step = () => (originals[1] ? originals[1].offsetLeft - originals[0].offsetLeft : originals[0].offsetWidth);
  const setWidth = () => originals.length * step();
  const base = () => originals[0].offsetLeft;

  let playing = !reduced;   // el usuario puede pausar/reanudar con el botón
  let focusPaused = false;  // foco de teclado dentro del carrusel
  let hidden = document.hidden;
  let interacted = false;   // pausa temporal tras tocar, deslizar o usar las flechas
  let inView = false;
  let left = 0;
  let raf = 0;
  let last = 0;
  let resumeTimer = 0;
  let settleTimer = 0;

  // Controles
  const prev = button('carousel-btn', 'Disciplina anterior', icon('flecha-izq'));
  const next = button('carousel-btn', 'Disciplina siguiente', icon('flecha-der'));
  const toggle = button('carousel-btn carousel-toggle', '', null);
  const controls = document.createElement('div');
  controls.className = 'carousel-controls';
  controls.append(prev, toggle, next);
  host.append(controls);

  const running = () => playing && !focusPaused && !hidden && !interacted && inView;

  const updateUi = () => {
    toggle.replaceChildren(icon(playing ? 'pausa' : 'play'));
    toggle.setAttribute('aria-label', playing ? 'Pausar carrusel' : 'Reanudar carrusel');
    toggle.setAttribute('aria-pressed', String(!playing));
    track.setAttribute('aria-live', running() ? 'off' : 'polite');
  };

  const tick = (now) => {
    raf = 0;
    if (!running()) { last = 0; return; }
    const dt = last ? Math.min(now - last, 100) : 0;
    last = now;
    left = advanceScroll(left, dt, SPEED_PX_S, setWidth());
    track.scrollLeft = left;
    raf = requestAnimationFrame(tick);
  };

  /** Recalcula si debe moverse o no, y arranca/actualiza el bucle. */
  const sync = () => {
    updateUi();
    if (running() && !raf) {
      left = normalizeScroll(track.scrollLeft, setWidth());
      last = 0;
      raf = requestAnimationFrame(tick);
    }
  };

  const interact = () => {
    interacted = true;
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => { interacted = false; sync(); }, RESUME_AFTER_MS);
    updateUi();
  };

  const move = (dir) => {
    interact();
    const current = normalizeScroll(track.scrollLeft, setWidth());
    if (current !== track.scrollLeft) track.scrollLeft = current;
    track.scrollTo({ left: cardTarget(current, base(), step(), dir), behavior: reduced ? 'auto' : 'smooth' });
  };

  prev.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  toggle.addEventListener('click', () => { playing = !playing; sync(); });

  // Solo el foco de teclado pausa (un clic con el mouse deja el foco en el botón y no debe frenar el movimiento)
  host.addEventListener('focusin', (e) => { if (e.target.matches(':focus-visible')) { focusPaused = true; sync(); } });
  host.addEventListener('focusout', (e) => { if (!host.contains(e.relatedTarget)) { focusPaused = false; sync(); } });
  document.addEventListener('visibilitychange', () => { hidden = document.hidden; sync(); });
  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); }, { threshold: 0.1 }).observe(host);

  // Gestos y teclado sobre la pista
  track.addEventListener('pointerdown', interact);
  track.addEventListener('pointerup', interact);
  track.addEventListener('pointercancel', interact);
  track.addEventListener('touchstart', interact, { passive: true });
  track.addEventListener('wheel', (e) => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) interact(); }, { passive: true });
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
  });

  // Si el usuario mueve la pista, pausar; y al quedar quieta, reacomodarla al set central (loop también hacia atrás)
  track.addEventListener('scroll', () => {
    if (running() && Math.abs(track.scrollLeft - left) > 3) interact();
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      if (raf) return;
      const settled = normalizeScroll(track.scrollLeft, setWidth());
      if (Math.abs(settled - track.scrollLeft) > 0.5) track.scrollLeft = settled;
      left = settled;
    }, 150);
  }, { passive: true });

  window.addEventListener('resize', () => { left = normalizeScroll(track.scrollLeft, setWidth()); });

  // Posición inicial: primera tarjeta original (set central)
  track.scrollLeft = base();
  left = base();
  updateUi();
}
