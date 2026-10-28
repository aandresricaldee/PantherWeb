/** Cinta de texto gigante que corre en bucle y se inclina según la velocidad del scroll. */

/** Inclinación (grados) proporcional a la velocidad de scroll (px por cuadro), acotada. */
export const velocitySkew = (deltaPx, max = 8, k = 0.12) => Math.min(Math.max(deltaPx * k, -max), max) || 0;

export function initMarquee(root = document) {
  const marquee = root.querySelector('.marquee');
  const track = marquee?.querySelector('.marquee-track');
  const set = track?.querySelector('.marquee-set');
  if (!marquee || !set) return;

  // Segundo set idéntico (decorativo) para que el bucle sea continuo
  track.append(set.cloneNode(true));
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  marquee.classList.add('is-running');

  let lastY = window.scrollY;
  let skew = 0;
  let raf = 0;
  const frame = () => {
    raf = 0;
    const y = window.scrollY;
    skew += (velocitySkew(y - lastY) - skew) * 0.2;
    lastY = y;
    marquee.style.setProperty('--skew', `${skew.toFixed(2)}deg`);
    if (Math.abs(skew) > 0.02 || Math.abs(velocitySkew(window.scrollY - lastY)) > 0) raf = requestAnimationFrame(frame);
    else marquee.style.setProperty('--skew', '0deg');
  };
  window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(frame); }, { passive: true });
}
