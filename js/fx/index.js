/**
 * Efectos cinematográficos. Cada uno vive en su módulo: para quitar uno, borrar su línea acá.
 * Todos respetan "reducir movimiento" y los de mouse solo se activan en dispositivos con mouse.
 */
import { initKineticText } from './text.js';
import { initCounters } from './counters.js';
import { initTilt } from './tilt.js';
import { initMagnetic } from './magnetic.js';
import { initParticles } from './particles.js';
import { initHeroPointer } from './spotlight.js';
import { initMarquee } from './marquee.js';
import { initProgress } from './progress.js';
import { initLayers } from './layers.js';
import { initDecode } from './decode.js';
import { playIntro } from './intro.js';

// Un efecto que falla no debe romper al resto ni al sitio
const guard = (name, fn) => {
  try { return fn(); } catch (error) { console.error(`fx:${name}`, error); }
};

export async function initFx() {
  guard('texto', initKineticText);
  guard('contadores', initCounters);
  guard('inclinacion', initTilt);
  guard('iman', initMagnetic);
  guard('particulas', initParticles);
  guard('hero', initHeroPointer);
  guard('cinta', initMarquee);
  guard('progreso', initProgress);
  guard('capas', initLayers);
  guard('decodificado', initDecode);

  await guard('intro', playIntro);

  // Desde acá arrancan las animaciones del hero (están en pausa hasta que <html> tenga .is-ready)
  document.documentElement.classList.add('is-ready');
  document.querySelectorAll('.hero [data-kinetic]').forEach((el) => el.classList.add('is-in'));
}
