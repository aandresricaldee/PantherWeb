import { content } from './content.js';
import { renderAll } from './render.js';
import { initNav } from './nav.js';
import { initCarousel } from './carousel.js';
import { initReveal } from './reveal.js';
import { initParallax } from './parallax.js';
import { initWhatsapp } from './whatsapp.js';
import { initStatus } from './status.js';

initNav();
initWhatsapp(content.whatsapp);
try {
  renderAll(content);
} catch (error) {
  console.error('No se pudo renderizar el contenido dinámico:', error);
}
initStatus(content);
initCarousel();
initReveal();
initParallax();
// Efectos cinematográficos (js/fx/): se cargan aparte, así que si fallan el sitio sigue funcionando.
// Para quitarlos, borrar estas líneas.
import('./fx/index.js')
  .then(({ initFx }) => initFx())
  .catch((error) => console.error('Los efectos cinematográficos no se pudieron cargar:', error));
