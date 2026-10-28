const SVG_NS = 'http://www.w3.org/2000/svg';

// Íconos de trazo, viewBox 24x24. Cada valor es una lista de paths.
export const ICONS = {
  pesas: ['M6.5 6.5v11', 'M17.5 6.5v11', 'M3 9v6', 'M21 9v6', 'M6.5 12h11'],
  maquina: ['M4 20h16', 'M7 20V7a3 3 0 0 1 3-3h4', 'M14 4v6', 'M11 10h6', 'M7 14h5'],
  barra: ['M3 12h18', 'M6 7v10', 'M9 9v6', 'M15 9v6', 'M18 7v10'],
  objetivo: ['M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0z', 'M8 12a4 4 0 1 0 8 0 4 4 0 1 0-8 0z'],
  pulso: ['M3 12h4l3-8 4 16 3-8h4'],
  grafico: ['M3 3v18h18', 'M7 15l4-4 3 3 5-6'],
  rayo: ['M13 2 4 14h7l-1 8 9-12h-7z'],
  // Controles del carrusel
  'flecha-izq': ['M15 5l-7 7 7 7'],
  'flecha-der': ['M9 5l7 7-7 7'],
  pausa: ['M8 5v14', 'M16 5v14'],
  play: ['M7 4l13 8-13 8z'],
};
export const ICON_NAMES = Object.keys(ICONS);

/** Crea un elemento. props: `text` (textContent), `on` ({evento: fn}); el resto son atributos. */
export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === 'text') node.textContent = String(value);
    else if (key === 'on') for (const [type, fn] of Object.entries(value)) node.addEventListener(type, fn);
    else node.setAttribute(key, value === true ? '' : String(value));
  }
  for (const child of children) node.append(child);
  return node;
}

export function icon(name) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'icon');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  for (const d of ICONS[name] ?? ICONS.rayo) {
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', d);
    svg.append(path);
  }
  return svg;
}

const emptyMessage = (text) => el('p', { class: 'empty', text });
/** Esquinas tipo HUD (decorativas): se expanden al pasar el mouse. Estilos en css/fx.css. */
const hud = () => el('span', { class: 'hud', 'aria-hidden': 'true' });

export function renderDisciplinas(container, disciplinas) {
  if (disciplinas.length === 0) {
    container.replaceChildren(emptyMessage('Pronto vas a ver acá nuestras disciplinas.'));
    return;
  }
  container.replaceChildren(
    ...disciplinas.map((d, i) =>
      el('article', {
        class: 'card discipline',
        role: 'group',
        'aria-roledescription': 'diapositiva',
        'aria-label': `${i + 1} de ${disciplinas.length}`,
      }, [
        el('div', { class: 'discipline-icon' }, [icon(d.icono)]),
        el('h3', { text: d.nombre }),
        el('p', { text: d.descripcion }),
        hud(),
      ]),
    ),
  );
}

export function renderHorarios(container, horarios) {
  if (horarios.length === 0) {
    container.replaceChildren(emptyMessage('Pronto publicamos los horarios.'));
    return;
  }
  container.replaceChildren(
    el('div', { class: 'schedule' }, horarios.map((dia) => {
      const turnos = [...dia.turnos].sort((a, b) => a.desde.localeCompare(b.desde));
      const body = turnos.length > 0
        ? el('ul', { class: 'day-list' }, turnos.map((t) =>
          el('li', { class: 'slot' }, [el('span', { class: 'slot-time', text: `${t.desde} – ${t.hasta}` })])))
        : el('p', { class: 'day-empty', text: 'Cerrado' });
      return el('article', { class: 'day card reveal', 'data-dia': dia.dia }, [el('h3', { class: 'day-name', text: dia.dia }), body, hud()]);
    })),
  );
}

export function renderPlanes(container, planes) {
  if (planes.length === 0) {
    container.replaceChildren(emptyMessage('Pronto publicamos nuestros planes.'));
    return;
  }
  container.replaceChildren(
    ...planes.map((p) =>
      el('article', { class: `card plan reveal${p.destacado ? ' plan--featured' : ''}`, 'data-tilt': true }, [
        p.destacado ? el('p', { class: 'plan-badge', text: 'Más elegido' }) : null,
        el('h3', { class: 'plan-name', text: p.nombre }),
        el('p', { class: 'plan-price' }, [
          el('span', { class: 'plan-amount', text: p.precio }),
          el('span', { class: 'plan-period', text: p.periodo }),
        ]),
        el('ul', { class: 'plan-features' }, p.beneficios.map((b) => el('li', { text: b }))),
        el('a', { class: 'btn btn--primary', href: '#contacto', text: 'Consultar' }),
        hud(),
      ].filter(Boolean)),
    ),
  );
}

const initials = (nombre) =>
  nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => [...w][0].toUpperCase()).join('');

export function renderEntrenadores(container, entrenadores) {
  if (entrenadores.length === 0) {
    container.replaceChildren(emptyMessage('Pronto presentamos a nuestro equipo.'));
    return;
  }
  container.replaceChildren(
    ...entrenadores.map((e) =>
      el('article', { class: 'card coach reveal', 'data-tilt': true }, [
        e.foto
          ? el('img', { class: 'coach-photo', src: e.foto, alt: `Foto de ${e.nombre}`, width: 400, height: 500, loading: 'lazy' })
          : el('div', { class: 'coach-photo coach-initials', 'aria-hidden': 'true', text: initials(e.nombre) }),
        el('h3', { class: 'coach-name', text: e.nombre }),
        el('p', { class: 'coach-role', text: e.especialidad }),
      ]),
    ),
  );
}

export function renderAll(content, root = document) {
  const target = (name) => root.querySelector(`[data-render="${name}"]`);
  const jobs = [
    ['disciplinas', (c) => renderDisciplinas(c, content.disciplinas)],
    ['horarios', (c) => renderHorarios(c, content.horarios)],
    ['planes', (c) => renderPlanes(c, content.planes)],
    ['entrenadores', (c) => renderEntrenadores(c, content.entrenadores)],
  ];
  for (const [name, run] of jobs) {
    const container = target(name);
    if (container) run(container);
    else console.warn(`render: falta el contenedor [data-render="${name}"]`);
  }
}
