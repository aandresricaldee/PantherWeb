/**
 * Intro con el escudo (~1,4 s, en cada carga de la página). La animación corre en CSS desde el primer pintado;
 * acá solo se coordina: avisar cuándo arranca el hero, permitir saltarla y limpiar el DOM.
 * La decisión de mostrarla la toma el script del <head> de index.html (misma regla que shouldPlayIntro).
 */

export const shouldPlayIntro = ({ reduced }) => !reduced; // se omite solo si el usuario pidió "reducir movimiento"

const SAFETY_MS = 2800;
const HERO_STARTS_AFTER_MS = 100; // el hero arranca apenas se empiezan a abrir las cortinas

/** Devuelve una promesa que se resuelve cuando el hero puede empezar a animarse. */
export function playIntro() {
  const root = document.documentElement;
  const overlay = document.querySelector('.intro');
  if (!overlay || !root.classList.contains('intro-pending')) {
    overlay?.remove();
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    let ready = false;
    let closed = false;
    const markReady = () => { if (!ready) { ready = true; resolve(true); } };
    const close = () => {
      if (closed) return;
      closed = true;
      markReady();
      root.classList.remove('intro-pending');
      overlay.remove();
      ['keydown', 'pointerdown'].forEach((type) => window.removeEventListener(type, skip));
    };
    function skip() {
      if (closed) return;
      overlay.classList.add('is-skipping');
      markReady();
      setTimeout(close, 260);
    }

    const curtain = overlay.querySelector('.intro-curtain--bottom');
    curtain?.addEventListener('animationstart', () => setTimeout(markReady, HERO_STARTS_AFTER_MS));
    curtain?.addEventListener('animationend', (event) => { if (event.animationName === 'intro-curtain-down') close(); });
    ['keydown', 'pointerdown'].forEach((type) => window.addEventListener(type, skip));
    setTimeout(close, SAFETY_MS);
  });
}
