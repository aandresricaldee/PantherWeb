/** Texto cinético: cada palabra sube desde una máscara, escalonada. El CSS está en css/fx.css (.kw / .kw-in). */

/** Divide un texto en palabras y espacios (los espacios se conservan como tokens). */
export function splitWords(text) {
  return String(text).split(/(\s+)/).filter((token) => token.length > 0);
}

/** Envuelve cada palabra de `el` (también dentro de elementos hijos, como <em>) y devuelve cuántas envolvió. */
export function wrapWords(el) {
  let index = 0;
  const walk = (node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === 3) {
        const fragment = document.createDocumentFragment();
        for (const token of splitWords(child.textContent)) {
          if (/^\s+$/.test(token)) {
            fragment.append(document.createTextNode(token));
            continue;
          }
          const mask = document.createElement('span');
          mask.className = 'kw';
          const inner = document.createElement('span');
          inner.className = 'kw-in';
          inner.style.setProperty('--i', String(index++));
          inner.textContent = token;
          mask.append(inner);
          fragment.append(mask);
        }
        child.replaceWith(fragment);
      } else if (child.nodeType === 1) {
        walk(child);
      }
    }
  };
  walk(el);
  return index;
}

/**
 * Prepara todos los [data-kinetic]. Los de secciones se revelan al entrar en pantalla;
 * los del hero los revela initFx() cuando termina la intro.
 */
export function initKineticText(root = document) {
  const elements = [...root.querySelectorAll('[data-kinetic]')];
  if (elements.length === 0) return;
  document.documentElement.classList.add('fx-text');
  elements.forEach(wrapWords);

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.2 });
  elements.filter((el) => !el.closest('.hero')).forEach((el) => observer.observe(el));

  // Red de seguridad: pase lo que pase, el texto nunca queda oculto
  setTimeout(() => elements.forEach((el) => el.classList.add('is-in')), 6000);
}
