# Landing Panther Club de Entrenamiento — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir la landing estática de Panther Club de Entrenamiento (HTML/CSS/JS puros), oscura y agresiva, con todos los colores centralizados en variables CSS.

**Architecture:** `index.html` estático con CSS dividido por responsabilidad (`tokens` → `base` → `components` → `sections`) y módulos ES chicos en `js/`. Las secciones de texto fijo (hero, nosotros, ubicación, contacto, footer) viven en el HTML; disciplinas, horarios, planes y entrenadores se dibujan desde `js/content.js` con `js/render.js`. Un test de Node impide colores crudos fuera de `css/tokens.css`.

**Tech Stack:** HTML5, CSS3 (custom properties, grid), JavaScript ES modules, Node 22 (`node --test`) solo para tests/chequeos, Python 3 + Pillow solo para generar las imágenes del logo. Sin dependencias npm.

**Spec:** `docs/superpowers/specs/2026-10-02-panther-landing-design.md`

> **Nota:** la carpeta no es un repositorio git, por eso las tareas cierran con un paso de verificación y no con un commit. Si se hace `git init` más adelante, commitear al final de cada tarea.

## Global Constraints

- Solo HTML, CSS y JavaScript; sin frameworks ni build. Node/Python solo para tests y generación de imágenes.
- Idioma de la interfaz: español rioplatense (voseo: "Entrená", "Consultá").
- **Todos los colores solo como variables en `css/tokens.css`.** Ningún otro archivo CSS, HTML ni JS contiene hex, `rgb()`, `hsl()` u otras funciones de color; solo `var(--color-*)`, `transparent` y `currentColor`.
- Paleta: `--color-bg #0B0B0D`, `--color-surface #16171B`, `--color-card #1F2026`, `--color-border #2E3038`, `--color-fg #F8FAFC`, `--color-fg-muted #B6BCC8`, `--color-primary #F97316`, `--color-primary-hover #FB923C`, `--color-on-primary #0B0B0D`.
- Tipografía: títulos Barlow Condensed 600/700 en mayúsculas; texto Barlow 400/500/600, base 16px, interlineado 1.5.
- Íconos: SVG inline, nunca emojis.
- Mobile-first; breakpoints de prueba 375, 768, 1024, 1440px; sin scroll horizontal; objetivos táctiles ≥ 44×44px.
- Contraste de texto ≥ 4.5:1.
- Animaciones solo con `transform` y `opacity`, 150–450ms, y respetan `prefers-reduced-motion: reduce`.
- Datos renderizados con `textContent`/`createElement`, nunca `innerHTML`.
- Un solo `<h1>`; HTML semántico; `lang="es"`; foco visible; skip link.
- Los módulos ES requieren servir por HTTP (no `file://`).

## Review Focus

Entradas y condiciones que la spec no ejercita y que más probablemente rompan algo (cada una tiene su test o chequeo manual en la tarea indicada):

1. Colección vacía (sin disciplinas, horarios, planes o entrenadores) → mensaje visible, no un bloque en blanco. (Task 2)
2. Día sin franjas, o filtro por una disciplina que ese día no tiene → el día muestra "Descanso"/"Sin clases", nunca una columna vacía. (Task 2)
3. Textos con caracteres HTML (`<b>`, `&`, `<script>`) → se muestran literales, sin inyectar markup. (Task 2)
4. Franja con `disciplinaId` inexistente → no rompe el render; usa el nombre "Clase". (Task 2)
5. Menú móvil abierto y luego cambio a escritorio, tecla Esc, o JavaScript desactivado → el menú se cierra, el foco vuelve al botón, y sin JS no queda contenido oculto (mensajes `<noscript>`, el `reveal` solo se activa con `.js`). Además, textos muy largos no generan scroll horizontal. (Task 3 y Task 5, manual)

---

### Task 1: Andamiaje, herramientas, imágenes y tokens de color

**Files:**
- Create: `package.json`, `.gitignore`
- Create: `scripts/check-colors.mjs`, `scripts/make-assets.py`
- Create: `tests/colors.test.mjs`, `tests/contrast.test.mjs`
- Create: `css/tokens.css`
- Create (generados): `assets/PantherBlanco.png` (copia), `assets/img/logo-480.webp`, `assets/img/logo-960.webp`, `assets/img/shield-96.webp`, `assets/img/shield-192.webp`, `assets/img/favicon-64.png`

**Interfaces:**
- Produces: `findRawColors(root: string): Array<{ file: string, line: number, match: string }>` exportada por `scripts/check-colors.mjs` (también ejecutable por CLI con `npm run check:colors`); variables CSS de `css/tokens.css` (nombres exactos en el paso 9); archivos de imagen con los nombres de arriba.

- [ ] **Step 1: Crear carpetas, `package.json` y `.gitignore`**

```bash
mkdir -p assets/img css js scripts tests/helpers
cp PantherBlanco.png assets/PantherBlanco.png
```

`package.json`:
```json
{
  "name": "panther-web",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test \"tests/**/*.test.mjs\"",
    "check:colors": "node scripts/check-colors.mjs",
    "assets": "python scripts/make-assets.py",
    "serve": "python -m http.server 5173"
  }
}
```

`.gitignore`:
```
node_modules/
.DS_Store
```

(El `PantherBlanco.png` original queda en la raíz sin tocar; la copia en `assets/` es la que usa el proyecto.)

- [ ] **Step 2: Escribir el test que falla del chequeo de colores**

`tests/colors.test.mjs`:
```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findRawColors } from '../scripts/check-colors.mjs';

function project(files) {
  const root = mkdtempSync(join(tmpdir(), 'panther-'));
  for (const [path, content] of Object.entries(files)) {
    const full = join(root, path);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, content);
  }
  return root;
}

test('permite colores crudos solo en css/tokens.css', () => {
  const root = project({ 'css/tokens.css': ':root{--color-bg:#0B0B0D;--x:rgb(1,2,3)}' });
  assert.deepEqual(findRawColors(root), []);
});

test('detecta hex en otros archivos css', () => {
  const root = project({ 'css/sections.css': '.a{\n  color: #fff;\n}' });
  const found = findRawColors(root);
  assert.equal(found.length, 1);
  assert.equal(found[0].file, 'css/sections.css');
  assert.equal(found[0].line, 2);
  assert.equal(found[0].match, '#fff');
});

test('detecta funciones de color en css, js y html', () => {
  const root = project({
    'css/base.css': '.a{background:hsl(10 20% 30%)}',
    'js/x.js': "el.style.color = 'rgba(0,0,0,.5)';",
    'index.html': '<div style="color:rgb(1,2,3)"></div>',
  });
  assert.equal(findRawColors(root).length, 3);
});

test('no marca var(), anclas ni palabras clave', () => {
  const root = project({
    'css/base.css': '.a{color:var(--color-fg);background:transparent;border-color:currentColor}',
    'index.html': '<a href="#planes">Planes</a><a href="#contacto">x</a>',
    'js/x.js': "document.querySelector('#site-nav');",
  });
  assert.deepEqual(findRawColors(root), []);
});

test('el proyecto real no tiene colores crudos fuera de tokens.css', () => {
  const root = fileURLToPath(new URL('..', import.meta.url));
  assert.deepEqual(findRawColors(root), []);
});
```

- [ ] **Step 3: Correr el test y verificar que falla**

Run: `node --test tests/colors.test.mjs`
Expected: FAIL (`Cannot find module '../scripts/check-colors.mjs'`).

- [ ] **Step 4: Implementar `scripts/check-colors.mjs`**

```js
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![0-9a-zA-Z_-])/g;
const FUNC = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color-mix)\(/g;
const ALLOWED_FILE = 'css/tokens.css';

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) yield* walk(full);
    else yield full;
  }
}

function collectFiles(root) {
  const files = [];
  for (const sub of ['css', 'js']) {
    const dir = join(root, sub);
    if (existsSync(dir)) files.push(...walk(dir));
  }
  const html = join(root, 'index.html');
  if (existsSync(html)) files.push(html);
  return files;
}

export function findRawColors(root) {
  const found = [];
  for (const full of collectFiles(root)) {
    const file = relative(root, full).split(sep).join('/');
    if (file === ALLOWED_FILE) continue;
    readFileSync(full, 'utf8').split('\n').forEach((text, index) => {
      for (const regex of [HEX, FUNC]) {
        for (const m of text.matchAll(regex)) {
          found.push({ file, line: index + 1, match: m[0] });
        }
      }
    });
  }
  return found;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const found = findRawColors(root);
  for (const f of found) console.error(`${f.file}:${f.line}  color crudo "${f.match}" (usar var(--color-*))`);
  if (found.length) process.exit(1);
  console.log('OK: sin colores crudos fuera de css/tokens.css');
}
```

- [ ] **Step 5: Correr el test y verificar que pasa**

Run: `node --test tests/colors.test.mjs`
Expected: PASS (5 tests).

- [ ] **Step 6: Escribir `scripts/make-assets.py` y generar las imágenes**

El logo original (8002×8699, 2,2 MB) es vertical: escudo con la pantera arriba y el texto "PANTHER CLUB DE ENTRENAMIENTO" abajo. Se generan: logo completo (hero) y solo el escudo (header y favicon).

`scripts/make-assets.py`:
```python
"""Genera las imágenes web del logo a partir de assets/PantherBlanco.png."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "PantherBlanco.png"
OUT = ROOT / "assets" / "img"
OUT.mkdir(parents=True, exist_ok=True)

logo = Image.open(SRC).convert("RGBA")
w, h = logo.size  # 8002 x 8699


def save_webp(img, name, width):
    height = round(img.height * width / img.width)
    resized = img.resize((width, height), Image.LANCZOS)
    resized.save(OUT / name, "WEBP", quality=85, method=6)
    print(f"{name}: {width}x{height}")


# Logo completo (hero)
save_webp(logo, "logo-480.webp", 480)
save_webp(logo, "logo-960.webp", 960)

# Solo el escudo (header): recorte cuadrado que excluye el texto de abajo
shield = logo.crop((600, 0, 7400, 6800))
save_webp(shield, "shield-96.webp", 96)
save_webp(shield, "shield-192.webp", 192)

# Favicon: escudo sobre el color de fondo del sitio (--color-bg = #0B0B0D)
fav = Image.new("RGBA", (64, 64), (11, 11, 13, 255))
icon = shield.resize((56, 56), Image.LANCZOS)
fav.alpha_composite(icon, (4, 4))
fav.save(OUT / "favicon-64.png", "PNG", optimize=True)
print("favicon-64.png: 64x64")
```

Run: `python scripts/make-assets.py`
Expected: imprime `logo-480.webp: 480x522`, `logo-960.webp: 960x1043`, `shield-96.webp: 96x96`, `shield-192.webp: 192x192`, `favicon-64.png: 64x64`.

- [ ] **Step 7: Verificar visualmente el recorte del escudo**

Abrir `assets/img/shield-192.webp` y `assets/img/logo-480.webp` con la herramienta de lectura de imágenes. Expected: el escudo se ve completo, sin cortes ni texto abajo; el logo completo incluye el texto "PANTHER CLUB DE ENTRENAMIENTO". Si el recorte corta el escudo, ajustar la tupla de `shield = logo.crop(...)` y regenerar.

- [ ] **Step 8: Escribir el test de contraste (falla)**

`tests/contrast.test.mjs`:
```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../css/tokens.css', import.meta.url), 'utf8');

function token(name) {
  const m = css.match(new RegExp(`--${name}:\\s*#([0-9a-fA-F]{6})`));
  assert.ok(m, `falta el token --${name} (hex de 6 dígitos) en tokens.css`);
  return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16));
}

const lin = (c) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const pairs = [
  ['color-fg', 'color-bg'],
  ['color-fg', 'color-surface'],
  ['color-fg', 'color-card'],
  ['color-fg-muted', 'color-bg'],
  ['color-fg-muted', 'color-surface'],
  ['color-fg-muted', 'color-card'],
  ['color-primary', 'color-bg'],
  ['color-primary', 'color-surface'],
  ['color-primary', 'color-card'],
  ['color-on-primary', 'color-primary'],
  ['color-on-primary', 'color-primary-hover'],
];

for (const [fg, bg] of pairs) {
  test(`contraste ${fg} sobre ${bg} >= 4.5`, () => {
    const r = ratio(token(fg), token(bg));
    assert.ok(r >= 4.5, `${fg} sobre ${bg}: ${r.toFixed(2)}`);
  });
}
```

Run: `node --test tests/contrast.test.mjs`
Expected: FAIL (`ENOENT ... tokens.css`).

- [ ] **Step 9: Crear `css/tokens.css`**

```css
/* Única fuente de verdad de diseño. Los colores se definen SOLO acá.
   Para cambiar un color del sitio, editar el valor de su variable. */
:root {
  /* Color — base */
  --color-bg: #0B0B0D;
  --color-surface: #16171B;
  --color-card: #1F2026;
  --color-border: #2E3038;

  /* Color — texto */
  --color-fg: #F8FAFC;
  --color-fg-muted: #B6BCC8;

  /* Color — acento */
  --color-primary: #F97316;
  --color-primary-hover: #FB923C;
  --color-on-primary: #0B0B0D;
  --color-primary-soft: rgba(249, 115, 22, 0.12);

  /* Color — utilitarios */
  --color-overlay: rgba(11, 11, 13, 0.88);
  --color-focus: #F8FAFC;

  /* Tipografía */
  --font-display: "Barlow Condensed", "Arial Narrow", Impact, sans-serif;
  --font-body: "Barlow", system-ui, -apple-system, "Segoe UI", sans-serif;

  /* Espaciado (rem) */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.5rem;
  --space-6: 2rem;
  --space-7: 3rem;
  --space-8: 4rem;
  --space-9: 6rem;

  /* Forma */
  --radius-sm: 4px;
  --cut: 16px;

  /* Layout */
  --container: 1200px;
  --header-h: 72px;

  /* Movimiento */
  --dur-fast: 150ms;
  --dur-base: 300ms;
  --dur-slow: 450ms;
  --ease-out: cubic-bezier(0.2, 0.8, 0.2, 1);
}
```

- [ ] **Step 10: Correr toda la suite y el chequeo**

Run: `npm test` y `npm run check:colors`
Expected: todos los tests PASS (colors: 5, contrast: 11); `OK: sin colores crudos fuera de css/tokens.css`. Si algún contraste falla, ajustar el valor en `tokens.css` (y en la spec).

---

### Task 2: Datos y render (`content.js`, `render.js`)

**Files:**
- Create: `js/content.js`, `js/render.js`
- Create: `tests/helpers/fake-dom.mjs`, `tests/content.test.mjs`, `tests/render.test.mjs`

**Interfaces:**
- Consumes: nada de tareas anteriores (solo el runner de tests).
- Produces (usado por Task 3 y 4):
  - `content` (export nombrado de `js/content.js`) con forma: `{ disciplinas: [{id, nombre, descripcion, icono}], horarios: [{dia, franjas: [{hora, disciplinaId}]}], planes: [{nombre, precio, periodo, destacado, beneficios: string[]}], entrenadores: [{nombre, especialidad, foto: string|null}] }`.
  - De `js/render.js`: `el(tag, props, children)`, `icon(name)`, `ICONS`, `ICON_NAMES`, `renderDisciplinas(container, disciplinas)`, `renderHorarios(container, { disciplinas, horarios })`, `renderPlanes(container, planes)`, `renderEntrenadores(container, entrenadores)`, `renderAll(content, root = document)`.
  - Contrato de DOM que `renderAll` espera encontrar: elementos `[data-render="disciplinas"]`, `[data-render="horarios"]`, `[data-render="planes"]`, `[data-render="entrenadores"]`.
  - Clases CSS que `render.js` emite (las estiliza Task 4): `card`, `reveal`, `discipline`, `discipline-icon`, `icon`, `filters`, `chip`, `schedule`, `day`, `day-name`, `day-list`, `slot`, `slot-time`, `slot-name`, `day-empty`, `plan`, `plan--featured`, `plan-badge`, `plan-name`, `plan-price`, `plan-amount`, `plan-period`, `plan-features`, `coach`, `coach-photo`, `coach-initials`, `coach-name`, `coach-role`, `empty`, `btn`, `btn--primary`.

- [ ] **Step 1: Crear el DOM falso para tests**

`tests/helpers/fake-dom.mjs`:
```js
class TextNode {
  constructor(text) { this.tag = '#text'; this.text = text; }
  get textContent() { return this.text; }
}

export class FakeNode {
  constructor(tag) {
    this.tag = tag;
    this.attrs = {};
    this.children = [];
    this.listeners = {};
  }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
  removeAttribute(k) { delete this.attrs[k]; }
  hasAttribute(k) { return k in this.attrs; }
  append(...nodes) {
    for (const n of nodes) this.children.push(typeof n === 'string' ? new TextNode(n) : n);
  }
  replaceChildren(...nodes) { this.children = []; this.append(...nodes); }
  addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
  set textContent(v) { this.children = [new TextNode(String(v))]; }
  get textContent() { return this.children.map((c) => c.textContent).join(''); }
}

export function installFakeDocument() {
  globalThis.document = {
    createElement: (tag) => new FakeNode(tag),
    createElementNS: (_ns, tag) => new FakeNode(tag),
  };
}

export function walk(node, visit) {
  visit(node);
  for (const child of node.children ?? []) walk(child, visit);
}

export function findAll(node, predicate) {
  const out = [];
  walk(node, (n) => { if (predicate(n)) out.push(n); });
  return out;
}

export const hasClass = (node, name) => (node.attrs?.class ?? '').split(/\s+/).includes(name);
export const byClass = (node, name) => findAll(node, (n) => hasClass(n, name));
export const fire = (node, type) => (node.listeners[type] ?? []).forEach((fn) => fn({ target: node }));
```

- [ ] **Step 2: Escribir el test de integridad de datos (falla)**

`tests/content.test.mjs`:
```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { content } from '../js/content.js';
import { ICON_NAMES } from '../js/render.js';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

test('las disciplinas tienen ids únicos, textos e íconos válidos', () => {
  const ids = content.disciplinas.map((d) => d.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const d of content.disciplinas) {
    assert.ok(d.nombre && d.descripcion, `disciplina ${d.id} sin texto`);
    assert.ok(ICON_NAMES.includes(d.icono), `ícono desconocido: ${d.icono}`);
  }
});

test('los horarios usan días válidos, sin repetir, y disciplinas existentes', () => {
  const ids = new Set(content.disciplinas.map((d) => d.id));
  const dias = content.horarios.map((h) => h.dia);
  assert.deepEqual(dias, DIAS.filter((d) => dias.includes(d)), 'días fuera de orden o inválidos');
  assert.equal(new Set(dias).size, dias.length);
  for (const h of content.horarios) {
    for (const f of h.franjas) {
      assert.match(f.hora, /^\d{2}:\d{2}$/, `hora inválida: ${f.hora}`);
      assert.ok(ids.has(f.disciplinaId), `disciplinaId inexistente: ${f.disciplinaId}`);
    }
  }
});

test('hay exactamente un plan destacado y todos tienen beneficios', () => {
  assert.equal(content.planes.filter((p) => p.destacado).length, 1);
  for (const p of content.planes) {
    assert.ok(p.nombre && p.precio && p.periodo);
    assert.ok(p.beneficios.length > 0);
  }
});

test('los entrenadores tienen nombre y especialidad', () => {
  for (const e of content.entrenadores) assert.ok(e.nombre && e.especialidad);
});
```

Run: `node --test tests/content.test.mjs`
Expected: FAIL (módulo `../js/content.js` no existe).

- [ ] **Step 3: Crear `js/content.js` (datos de ejemplo)**

```js
// Única fuente de datos editables de la landing.
// Para actualizar disciplinas, horarios, planes o entrenadores, editar solo este archivo.
// Los textos de Hero, Nosotros, Ubicación y Contacto están directamente en index.html.
export const content = {
  disciplinas: [
    { id: 'musculacion', nombre: 'Musculación', descripcion: 'Sala completa con máquinas y peso libre, con seguimiento de tu rutina.', icono: 'pesas' },
    { id: 'funcional', nombre: 'Funcional', descripcion: 'Circuitos de fuerza y resistencia en grupo, para todos los niveles.', icono: 'rayo' },
    { id: 'boxeo', nombre: 'Boxeo', descripcion: 'Técnica, saco y condición física con entrenadores especializados.', icono: 'objetivo' },
    { id: 'cardio', nombre: 'Cardio', descripcion: 'Intervalos de alta intensidad para quemar grasa y mejorar tu resistencia.', icono: 'pulso' },
    { id: 'movilidad', nombre: 'Movilidad', descripcion: 'Elongación y trabajo articular para rendir mejor y prevenir lesiones.', icono: 'movilidad' },
    { id: 'spinning', nombre: 'Spinning', descripcion: 'Clases de ciclismo indoor con música y ritmo que te empujan.', icono: 'bici' },
  ],

  horarios: [
    { dia: 'Lunes', franjas: [
      { hora: '07:00', disciplinaId: 'musculacion' },
      { hora: '09:00', disciplinaId: 'funcional' },
      { hora: '18:00', disciplinaId: 'spinning' },
      { hora: '19:30', disciplinaId: 'boxeo' },
    ] },
    { dia: 'Martes', franjas: [
      { hora: '07:00', disciplinaId: 'funcional' },
      { hora: '18:00', disciplinaId: 'musculacion' },
      { hora: '19:00', disciplinaId: 'movilidad' },
    ] },
    { dia: 'Miércoles', franjas: [
      { hora: '09:00', disciplinaId: 'boxeo' },
      { hora: '18:30', disciplinaId: 'cardio' },
      { hora: '20:00', disciplinaId: 'spinning' },
    ] },
    { dia: 'Jueves', franjas: [
      { hora: '07:00', disciplinaId: 'musculacion' },
      { hora: '18:00', disciplinaId: 'funcional' },
      { hora: '19:30', disciplinaId: 'boxeo' },
    ] },
    { dia: 'Viernes', franjas: [
      { hora: '08:00', disciplinaId: 'cardio' },
      { hora: '18:00', disciplinaId: 'spinning' },
      { hora: '19:00', disciplinaId: 'movilidad' },
    ] },
    { dia: 'Sábado', franjas: [
      { hora: '10:00', disciplinaId: 'funcional' },
      { hora: '11:30', disciplinaId: 'movilidad' },
    ] },
  ],

  planes: [
    { nombre: 'Básico', precio: '$25.000', periodo: '/ mes', destacado: false,
      beneficios: ['Acceso a sala de musculación', '3 días por semana', 'Plan de rutina inicial'] },
    { nombre: 'Full', precio: '$35.000', periodo: '/ mes', destacado: true,
      beneficios: ['Acceso libre todos los días', 'Todas las clases grupales', 'Seguimiento con entrenador', 'Evaluación física mensual'] },
    { nombre: 'Trimestral', precio: '$90.000', periodo: '/ 3 meses', destacado: false,
      beneficios: ['Todo lo del plan Full', 'Ahorro frente al pago mensual', 'Congelamiento de 15 días'] },
  ],

  entrenadores: [
    { nombre: 'Martín Gómez', especialidad: 'Musculación y fuerza', foto: null },
    { nombre: 'Lucía Fernández', especialidad: 'Funcional y cardio', foto: null },
    { nombre: 'Diego Romero', especialidad: 'Boxeo', foto: null },
    { nombre: 'Camila Ríos', especialidad: 'Movilidad y spinning', foto: null },
  ],
};
```

- [ ] **Step 4: Escribir los tests de render (fallan)**

`tests/render.test.mjs`:
```js
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { FakeNode, installFakeDocument, byClass, findAll, fire, hasClass } from './helpers/fake-dom.mjs';
import {
  renderDisciplinas, renderHorarios, renderPlanes, renderEntrenadores,
} from '../js/render.js';

beforeEach(() => installFakeDocument());

const disciplinas = [
  { id: 'a', nombre: 'Alfa', descripcion: 'd', icono: 'pesas' },
  { id: 'b', nombre: 'Beta', descripcion: 'd', icono: 'rayo' },
];

test('colecciones vacías muestran un mensaje, no un bloque en blanco', () => {
  for (const [fn, arg] of [
    [renderDisciplinas, []],
    [renderHorarios, { disciplinas: [], horarios: [] }],
    [renderPlanes, []],
    [renderEntrenadores, []],
  ]) {
    const c = new FakeNode('div');
    fn(c, arg);
    assert.equal(byClass(c, 'empty').length, 1);
  }
});

test('el texto con HTML se muestra literal y no crea elementos', () => {
  const c = new FakeNode('div');
  renderDisciplinas(c, [{ id: 'x', nombre: '<b>Box</b> & <script>x</script>', descripcion: '<i>hi</i>', icono: 'rayo' }]);
  const h3 = findAll(c, (n) => n.tag === 'h3')[0];
  assert.equal(h3.textContent, '<b>Box</b> & <script>x</script>');
  assert.equal(findAll(c, (n) => ['b', 'i', 'script'].includes(n.tag)).length, 0);
});

test('un ícono desconocido usa el ícono por defecto sin romper', () => {
  const c = new FakeNode('div');
  renderDisciplinas(c, [{ id: 'x', nombre: 'X', descripcion: 'd', icono: 'no-existe' }]);
  assert.equal(findAll(c, (n) => n.tag === 'svg').length, 1);
});

test('una franja con disciplinaId inexistente usa el nombre "Clase"', () => {
  const c = new FakeNode('div');
  renderHorarios(c, { disciplinas, horarios: [{ dia: 'Lunes', franjas: [{ hora: '08:00', disciplinaId: 'zzz' }] }] });
  assert.equal(byClass(c, 'slot-name')[0].textContent, 'Clase');
});

test('un día sin franjas muestra "Descanso"', () => {
  const c = new FakeNode('div');
  renderHorarios(c, { disciplinas, horarios: [{ dia: 'Domingo', franjas: [] }] });
  const empty = byClass(c, 'day-empty')[0];
  assert.equal(empty.textContent, 'Descanso');
  assert.equal(empty.hasAttribute('hidden'), false);
});

test('las franjas se ordenan por hora', () => {
  const c = new FakeNode('div');
  renderHorarios(c, { disciplinas, horarios: [{ dia: 'Lunes', franjas: [
    { hora: '19:00', disciplinaId: 'a' }, { hora: '07:00', disciplinaId: 'b' },
  ] }] });
  assert.deepEqual(byClass(c, 'slot-time').map((n) => n.textContent), ['07:00', '19:00']);
});

test('el filtro oculta otras disciplinas y muestra "Sin clases" en días vacíos', () => {
  const c = new FakeNode('div');
  renderHorarios(c, { disciplinas, horarios: [
    { dia: 'Lunes', franjas: [{ hora: '07:00', disciplinaId: 'a' }, { hora: '08:00', disciplinaId: 'b' }] },
    { dia: 'Martes', franjas: [{ hora: '07:00', disciplinaId: 'a' }] },
  ] });
  const chips = byClass(c, 'chip');
  assert.deepEqual(chips.map((n) => n.textContent), ['Todas', 'Alfa', 'Beta']);
  assert.equal(chips[0].getAttribute('aria-pressed'), 'true');

  fire(chips[2], 'click'); // Beta: solo el lunes tiene clase
  const slots = byClass(c, 'slot');
  assert.equal(slots[0].hasAttribute('hidden'), true);   // lunes Alfa
  assert.equal(slots[1].hasAttribute('hidden'), false);  // lunes Beta
  assert.equal(slots[2].hasAttribute('hidden'), true);   // martes Alfa
  const empties = byClass(c, 'day-empty');
  assert.equal(empties[0].hasAttribute('hidden'), true);
  assert.equal(empties[1].hasAttribute('hidden'), false);
  assert.equal(empties[1].textContent, 'Sin clases');
  assert.equal(chips[2].getAttribute('aria-pressed'), 'true');
  assert.equal(chips[0].getAttribute('aria-pressed'), 'false');

  fire(chips[0], 'click'); // Todas
  assert.ok(byClass(c, 'slot').every((s) => !s.hasAttribute('hidden')));
  assert.ok(byClass(c, 'day-empty').every((e) => e.hasAttribute('hidden')));
});

test('el plan destacado lleva clase, insignia y beneficios', () => {
  const c = new FakeNode('div');
  renderPlanes(c, [
    { nombre: 'A', precio: '$1', periodo: '/ mes', destacado: false, beneficios: ['x'] },
    { nombre: 'B', precio: '$2', periodo: '/ mes', destacado: true, beneficios: ['x', 'y'] },
  ]);
  const plans = byClass(c, 'plan');
  assert.equal(hasClass(plans[0], 'plan--featured'), false);
  assert.equal(hasClass(plans[1], 'plan--featured'), true);
  assert.equal(byClass(plans[1], 'plan-badge').length, 1);
  assert.equal(byClass(plans[0], 'plan-badge').length, 0);
  assert.equal(findAll(plans[1], (n) => n.tag === 'li').length, 2);
});

test('entrenador sin foto muestra iniciales; con foto muestra imagen con alt', () => {
  const c = new FakeNode('div');
  renderEntrenadores(c, [
    { nombre: 'ana benítez', especialidad: 'Yoga', foto: null },
    { nombre: 'Luis', especialidad: 'Box', foto: 'assets/img/luis.webp' },
  ]);
  assert.equal(byClass(c, 'coach-initials')[0].textContent, 'AB');
  const img = findAll(c, (n) => n.tag === 'img')[0];
  assert.equal(img.getAttribute('alt'), 'Foto de Luis');
  assert.equal(img.getAttribute('loading'), 'lazy');
});
```

Run: `node --test tests/render.test.mjs`
Expected: FAIL (módulo `../js/render.js` no existe).

- [ ] **Step 5: Implementar `js/render.js`**

```js
const SVG_NS = 'http://www.w3.org/2000/svg';

// Íconos de trazo, viewBox 24x24. Cada valor es una lista de paths.
export const ICONS = {
  pesas: ['M6.5 6.5v11', 'M17.5 6.5v11', 'M3 9v6', 'M21 9v6', 'M6.5 12h11'],
  rayo: ['M13 2 4 14h7l-1 8 9-12h-7z'],
  objetivo: ['M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0z', 'M8 12a4 4 0 1 0 8 0 4 4 0 1 0-8 0z'],
  pulso: ['M3 12h4l3-8 4 16 3-8h4'],
  movilidad: ['M10.5 4.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0-3 0z', 'M12 8v6', 'M7 11l5-3 5 3', 'M9 21l3-7 3 7'],
  bici: ['M3 19a3 3 0 1 0 6 0 3 3 0 1 0-6 0z', 'M15 19a3 3 0 1 0 6 0 3 3 0 1 0-6 0z', 'M6 16l4-8h5l3 8', 'M10 8l2 8'],
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
const setHidden = (node, hidden) => (hidden ? node.setAttribute('hidden', '') : node.removeAttribute('hidden'));

export function renderDisciplinas(container, disciplinas) {
  if (disciplinas.length === 0) {
    container.replaceChildren(emptyMessage('Pronto vas a ver acá nuestras disciplinas.'));
    return;
  }
  container.replaceChildren(
    ...disciplinas.map((d) =>
      el('article', { class: 'card discipline reveal' }, [
        el('div', { class: 'discipline-icon' }, [icon(d.icono)]),
        el('h3', { text: d.nombre }),
        el('p', { text: d.descripcion }),
      ]),
    ),
  );
}

export function renderHorarios(container, { disciplinas = [], horarios = [] }) {
  if (horarios.length === 0) {
    container.replaceChildren(emptyMessage('Pronto publicamos los horarios.'));
    return;
  }
  const nombres = new Map(disciplinas.map((d) => [d.id, d.nombre]));
  const days = [];

  const dayEls = horarios.map((dia) => {
    const franjas = [...dia.franjas].sort((a, b) => a.hora.localeCompare(b.hora));
    const hasClasses = franjas.length > 0;
    const empty = el('p', { class: 'day-empty', text: hasClasses ? 'Sin clases' : 'Descanso' });
    if (hasClasses) setHidden(empty, true);
    const items = [];
    const list = el('ul', { class: 'day-list' });
    for (const f of franjas) {
      const item = el('li', { class: 'slot' }, [
        el('span', { class: 'slot-time', text: f.hora }),
        el('span', { class: 'slot-name', text: nombres.get(f.disciplinaId) ?? 'Clase' }),
      ]);
      items.push({ item, disciplinaId: f.disciplinaId });
      list.append(item);
    }
    days.push({ empty, items, hasClasses });
    return el('article', { class: 'day card reveal' }, [el('h3', { class: 'day-name', text: dia.dia }), list, empty]);
  });

  const options = [{ id: 'todas', nombre: 'Todas' }, ...disciplinas];
  const chips = options.map((opt, index) =>
    el('button', {
      type: 'button',
      class: 'chip',
      'aria-pressed': index === 0 ? 'true' : 'false',
      text: opt.nombre,
      on: { click: () => apply(opt.id) },
    }),
  );

  function apply(activeId) {
    chips.forEach((chip, i) => chip.setAttribute('aria-pressed', String(options[i].id === activeId)));
    for (const day of days) {
      let visible = 0;
      for (const { item, disciplinaId } of day.items) {
        const show = activeId === 'todas' || disciplinaId === activeId;
        setHidden(item, !show);
        if (show) visible += 1;
      }
      setHidden(day.empty, visible > 0);
    }
  }

  container.replaceChildren(
    el('div', { class: 'filters', role: 'group', 'aria-label': 'Filtrar por disciplina' }, chips),
    el('div', { class: 'schedule' }, dayEls),
  );
}

export function renderPlanes(container, planes) {
  if (planes.length === 0) {
    container.replaceChildren(emptyMessage('Pronto publicamos nuestros planes.'));
    return;
  }
  container.replaceChildren(
    ...planes.map((p) =>
      el('article', { class: `card plan reveal${p.destacado ? ' plan--featured' : ''}` }, [
        p.destacado ? el('p', { class: 'plan-badge', text: 'Más elegido' }) : null,
        el('h3', { class: 'plan-name', text: p.nombre }),
        el('p', { class: 'plan-price' }, [
          el('span', { class: 'plan-amount', text: p.precio }),
          el('span', { class: 'plan-period', text: p.periodo }),
        ]),
        el('ul', { class: 'plan-features' }, p.beneficios.map((b) => el('li', { text: b }))),
        el('a', { class: 'btn btn--primary', href: '#contacto', text: 'Consultar' }),
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
      el('article', { class: 'card coach reveal' }, [
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
    ['horarios', (c) => renderHorarios(c, { disciplinas: content.disciplinas, horarios: content.horarios })],
    ['planes', (c) => renderPlanes(c, content.planes)],
    ['entrenadores', (c) => renderEntrenadores(c, content.entrenadores)],
  ];
  for (const [name, run] of jobs) {
    const container = target(name);
    if (container) run(container);
    else console.warn(`render: falta el contenedor [data-render="${name}"]`);
  }
}
```

- [ ] **Step 6: Correr la suite completa**

Run: `npm test`
Expected: PASS en todos (colors, contrast, content: 4, render: 9). Si un test de render falla, corregir `render.js`, no el test.

---

### Task 3: Estructura de la página, estilos base/componentes, navegación y reveal

**Files:**
- Create: `index.html`
- Create: `css/base.css`, `css/components.css`
- Create: `js/nav.js`, `js/reveal.js`, `js/main.js`

**Interfaces:**
- Consumes: `renderAll(content, root)` de `js/render.js`, `content` de `js/content.js`, tokens de `css/tokens.css`, imágenes de Task 1.
- Produces: `initNav(root = document)` en `js/nav.js`, `initReveal(root = document)` en `js/reveal.js`; clases utilitarias de `base.css` (`container`, `section`, `section--alt`, `section-head`, `eyebrow`, `section-title`, `section-lead`, `sr-only`, `skip-link`, `reveal`, `is-visible`, `grid`, `empty`); componentes (`btn`, `btn--primary`, `btn--ghost`, `card`, `chip`, header/nav) que Task 4 completa con `sections.css`. IDs/clases del header: `.site-header`, `#nav-toggle`, `#site-nav`; clase `is-open` sobre `.site-header`.

- [ ] **Step 1: Crear `index.html`**

```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Panther Club de Entrenamiento</title>
  <meta name="description" content="Panther Club de Entrenamiento: musculación, funcional, boxeo y más. Conocé nuestras disciplinas, horarios, planes y entrenadores.">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Panther Club de Entrenamiento">
  <meta property="og:description" content="Entrená sin límites. Disciplinas, horarios, planes y entrenadores.">
  <link rel="icon" type="image/png" href="assets/img/favicon-64.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Barlow:wght@400;500;600&display=swap">
  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/components.css">
  <link rel="stylesheet" href="css/sections.css">
  <script>document.documentElement.classList.add('js');</script>
</head>
<body>
  <a class="skip-link" href="#contenido">Saltar al contenido</a>

  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="#inicio" aria-label="Panther Club de Entrenamiento, ir al inicio">
        <img src="assets/img/shield-96.webp" srcset="assets/img/shield-96.webp 1x, assets/img/shield-192.webp 2x" width="44" height="44" alt="">
        <span class="brand-name">Panther</span>
      </a>
      <button id="nav-toggle" class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Abrir menú">
        <span class="nav-toggle-bar"></span>
      </button>
      <nav id="site-nav" class="site-nav" aria-label="Principal">
        <ul>
          <li><a href="#nosotros">Nosotros</a></li>
          <li><a href="#disciplinas">Disciplinas</a></li>
          <li><a href="#horarios">Horarios</a></li>
          <li><a href="#planes">Planes</a></li>
          <li><a href="#entrenadores">Entrenadores</a></li>
          <li><a href="#ubicacion">Ubicación</a></li>
          <li><a href="#contacto">Contacto</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <main id="contenido">
    <section id="inicio" class="hero" aria-labelledby="hero-title">
      <div class="container hero-inner">
        <div class="hero-copy">
          <p class="eyebrow">Panther Club de Entrenamiento</p>
          <h1 id="hero-title" class="hero-title">
            <span class="hero-line">Sacá la <em>pantera</em></span>
            <span class="hero-line">que llevás dentro.</span>
          </h1>
          <p class="hero-lead">Entrená con método, en un club donde cada clase te exige un poco más. Musculación, funcional, boxeo y mucho más.</p>
          <div class="hero-actions">
            <a class="btn btn--primary" href="#planes">Ver planes</a>
            <a class="btn btn--ghost" href="#horarios">Ver horarios</a>
          </div>
        </div>
        <img class="hero-logo"
             src="assets/img/logo-480.webp"
             srcset="assets/img/logo-480.webp 480w, assets/img/logo-960.webp 960w"
             sizes="(min-width: 900px) 420px, 68vw"
             width="480" height="522"
             alt="Logo de Panther Club de Entrenamiento: escudo con una pantera">
      </div>
    </section>

    <section id="nosotros" class="section section--alt" aria-labelledby="nosotros-title">
      <div class="container about-grid">
        <div class="about-text reveal">
          <p class="eyebrow">Sobre nosotros</p>
          <h2 id="nosotros-title" class="section-title">Un club para entrenar en serio</h2>
          <p>En Panther Club creemos que entrenar bien cambia todo lo demás. Armamos un espacio exigente pero cercano, donde cada socio tiene seguimiento y un plan a su medida.</p>
          <p>Desde quien pisa un gimnasio por primera vez hasta quien se prepara para competir: acá hay lugar, equipo y comunidad para vos.</p>
        </div>
        <div class="stats reveal">
          <div class="stat"><p class="stat-value">+8</p><p class="stat-label">años entrenando</p></div>
          <div class="stat"><p class="stat-value">+600</p><p class="stat-label">socios activos</p></div>
          <div class="stat"><p class="stat-value">6</p><p class="stat-label">disciplinas</p></div>
          <div class="stat"><p class="stat-value">4</p><p class="stat-label">entrenadores</p></div>
        </div>
      </div>
    </section>

    <section id="disciplinas" class="section" aria-labelledby="disciplinas-title">
      <div class="container">
        <div class="section-head reveal">
          <p class="eyebrow">Qué entrenamos</p>
          <h2 id="disciplinas-title" class="section-title">Disciplinas</h2>
          <p class="section-lead">Elegí la que va con vos o combiná varias.</p>
        </div>
        <div class="grid" data-render="disciplinas">
          <noscript><p class="empty">Activá JavaScript para ver las disciplinas.</p></noscript>
        </div>
      </div>
    </section>

    <section id="horarios" class="section section--alt" aria-labelledby="horarios-title">
      <div class="container">
        <div class="section-head reveal">
          <p class="eyebrow">Cuándo entrenamos</p>
          <h2 id="horarios-title" class="section-title">Horarios</h2>
          <p class="section-lead">Filtrá por disciplina para ver solo lo que te interesa.</p>
        </div>
        <div data-render="horarios">
          <noscript><p class="empty">Activá JavaScript para ver los horarios.</p></noscript>
        </div>
      </div>
    </section>

    <section id="planes" class="section" aria-labelledby="planes-title">
      <div class="container">
        <div class="section-head reveal">
          <p class="eyebrow">Sumate</p>
          <h2 id="planes-title" class="section-title">Planes y precios</h2>
          <p class="section-lead">Precios de ejemplo. Consultá por promociones vigentes.</p>
        </div>
        <div class="grid grid--plans" data-render="planes">
          <noscript><p class="empty">Activá JavaScript para ver los planes.</p></noscript>
        </div>
      </div>
    </section>

    <section id="entrenadores" class="section section--alt" aria-labelledby="entrenadores-title">
      <div class="container">
        <div class="section-head reveal">
          <p class="eyebrow">Tu equipo</p>
          <h2 id="entrenadores-title" class="section-title">Entrenadores</h2>
        </div>
        <div class="grid grid--coaches" data-render="entrenadores">
          <noscript><p class="empty">Activá JavaScript para ver a los entrenadores.</p></noscript>
        </div>
      </div>
    </section>

    <section id="ubicacion" class="section" aria-labelledby="ubicacion-title">
      <div class="container">
        <div class="section-head reveal">
          <p class="eyebrow">Dónde estamos</p>
          <h2 id="ubicacion-title" class="section-title">Ubicación</h2>
        </div>
        <div class="location-grid">
          <dl class="info-list reveal">
            <div><dt>Dirección</dt><dd>Av. Ejemplo 1234, Ciudad</dd></div>
            <div><dt>Atención</dt><dd>Lunes a viernes de 7 a 22 h · Sábados de 9 a 13 h</dd></div>
          </dl>
          <div class="map reveal">
            <iframe title="Mapa con la ubicación de Panther Club de Entrenamiento"
                    src="https://www.google.com/maps?q=Obelisco%2C%20Buenos%20Aires&amp;output=embed"
                    width="600" height="450" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
          </div>
        </div>
      </div>
    </section>

    <section id="contacto" class="section section--alt" aria-labelledby="contacto-title">
      <div class="container">
        <div class="section-head reveal">
          <p class="eyebrow">Hablemos</p>
          <h2 id="contacto-title" class="section-title">Contacto y redes</h2>
          <p class="section-lead">Escribinos o pasá por el club. Te contamos todo.</p>
        </div>
        <dl class="info-list reveal">
          <div><dt>Teléfono</dt><dd><a href="tel:+5400000000000">+54 0 000 000-0000</a></dd></div>
          <div><dt>Email</dt><dd><a href="mailto:info@panthersclub.example">info@panthersclub.example</a></dd></div>
        </dl>
        <ul class="social reveal">
          <li><a class="btn btn--ghost" href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">Instagram</a></li>
          <li><a class="btn btn--ghost" href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">Facebook</a></li>
          <li><a class="btn btn--ghost" href="https://wa.me/5400000000000" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
        </ul>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="container footer-inner">
      <p>© Panther Club de Entrenamiento</p>
      <a href="#inicio">Volver arriba</a>
    </div>
  </footer>

  <script type="module" src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: Crear `css/base.css`**

```css
*, *::before, *::after { box-sizing: border-box; }

html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }

body {
  margin: 0;
  background: var(--color-bg);
  color: var(--color-fg);
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.5;
  overflow-wrap: break-word;
}

img, svg, iframe { display: block; max-width: 100%; }
h1, h2, h3 {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: 0.01em;
  text-transform: uppercase;
}
p, dl, dd { margin: 0; }
ul { margin: 0; padding: 0; list-style: none; }
a { color: inherit; }
button { font: inherit; color: inherit; }
[hidden] { display: none !important; }

:focus-visible { outline: 3px solid var(--color-focus); outline-offset: 3px; }

.container { width: 100%; max-width: var(--container); margin-inline: auto; padding-inline: var(--space-4); }
@media (min-width: 900px) { .container { padding-inline: var(--space-5); } }

.section { padding-block: var(--space-8); }
.section--alt { background: var(--color-surface); }
@media (min-width: 900px) { .section { padding-block: var(--space-9); } }
section[id] { scroll-margin-top: var(--header-h); }

.section-head { max-width: 46rem; margin-bottom: var(--space-6); }
.eyebrow {
  margin-bottom: var(--space-2);
  color: var(--color-primary);
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.section-title { font-size: clamp(2.25rem, 6vw, 3.75rem); }
.section-lead { margin-top: var(--space-3); color: var(--color-fg-muted); font-size: 1.125rem; }

.grid { display: grid; gap: var(--space-5); grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr)); }
.empty { color: var(--color-fg-muted); font-size: 1.125rem; }

.sr-only {
  position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}
.skip-link {
  position: absolute; left: var(--space-4); top: -100px; z-index: 100;
  padding: var(--space-3) var(--space-4);
  background: var(--color-primary); color: var(--color-on-primary);
  font-weight: 600; text-decoration: none;
}
.skip-link:focus { top: var(--space-3); }

/* Reveal: solo se oculta si hay JS (clase .js en <html>) */
.js .reveal { opacity: 0; }
.js .reveal.is-visible {
  opacity: 1;
  animation: reveal-in var(--dur-slow) var(--ease-out) var(--reveal-delay, 0ms) backwards;
}
@keyframes reveal-in {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { transition-duration: 0.01ms !important; }
  .js .reveal { opacity: 1; }
  .js .reveal.is-visible { animation: none; }
}
```

- [ ] **Step 3: Crear `css/components.css`**

```css
/* Botones */
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  min-height: 48px; padding: 0 var(--space-5);
  border: 2px solid transparent; border-radius: var(--radius-sm);
  font-family: var(--font-display); font-size: 1.125rem; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase; text-decoration: none;
  cursor: pointer;
  transition: background var(--dur-fast), color var(--dur-fast), border-color var(--dur-fast), transform var(--dur-fast);
}
.btn:active { transform: translateY(1px); }
.btn--primary { background: var(--color-primary); color: var(--color-on-primary); }
.btn--primary:hover { background: var(--color-primary-hover); }
.btn--ghost { border-color: var(--color-fg); color: var(--color-fg); background: transparent; }
.btn--ghost:hover { background: var(--color-fg); color: var(--color-bg); }

/* Tarjeta con esquina cortada */
.card {
  padding: var(--space-5);
  background: var(--color-card);
  border: 1px solid var(--color-border);
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - var(--cut)), calc(100% - var(--cut)) 100%, 0 100%);
  transition: border-color var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out);
}
.card:hover { border-color: var(--color-primary); transform: translateY(-4px); }

/* Chip de filtro */
.chip {
  min-height: 44px; padding: 0 var(--space-4);
  border: 2px solid var(--color-border); border-radius: var(--radius-sm);
  background: transparent; cursor: pointer;
  font-family: var(--font-display); font-size: 1.125rem; font-weight: 600;
  letter-spacing: 0.06em; text-transform: uppercase;
  transition: background var(--dur-fast), color var(--dur-fast), border-color var(--dur-fast);
}
.chip:hover { border-color: var(--color-primary); }
.chip[aria-pressed="true"] { background: var(--color-primary); border-color: var(--color-primary); color: var(--color-on-primary); }

/* Header y navegación */
.site-header {
  position: fixed; inset: 0 0 auto 0; z-index: 50; height: var(--header-h);
  background: var(--color-overlay);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--color-border);
}
.header-inner { display: flex; align-items: center; justify-content: space-between; height: 100%; }
.brand { display: inline-flex; align-items: center; gap: var(--space-3); min-height: 48px; text-decoration: none; }
.brand img { width: 44px; height: 44px; }
.brand-name { font-family: var(--font-display); font-size: 1.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }

.nav-toggle {
  position: relative; display: grid; place-items: center;
  width: 48px; height: 48px; padding: 0;
  background: none; border: 0; cursor: pointer;
}
.nav-toggle-bar, .nav-toggle-bar::before, .nav-toggle-bar::after {
  display: block; width: 24px; height: 2px; background: currentColor;
  transition: transform var(--dur-base) var(--ease-out), background var(--dur-base);
}
.nav-toggle-bar { position: relative; }
.nav-toggle-bar::before, .nav-toggle-bar::after { content: ""; position: absolute; left: 0; }
.nav-toggle-bar::before { transform: translateY(-7px); }
.nav-toggle-bar::after { transform: translateY(7px); }
.site-header.is-open .nav-toggle-bar { background: transparent; }
.site-header.is-open .nav-toggle-bar::before { transform: rotate(45deg); }
.site-header.is-open .nav-toggle-bar::after { transform: rotate(-45deg); }

.site-nav {
  display: none; position: absolute; top: 100%; left: 0; right: 0;
  padding: var(--space-3) var(--space-4) var(--space-5);
  background: var(--color-surface); border-bottom: 1px solid var(--color-border);
}
.site-header.is-open .site-nav { display: block; }
.site-nav a {
  display: flex; align-items: center; min-height: 48px;
  font-family: var(--font-display); font-size: 1.375rem; font-weight: 600;
  letter-spacing: 0.06em; text-transform: uppercase; text-decoration: none;
  transition: color var(--dur-fast);
}
.site-nav a:hover, .site-nav a[aria-current="true"] { color: var(--color-primary); }

@media (min-width: 900px) {
  .nav-toggle { display: none; }
  .site-nav { display: block; position: static; padding: 0; background: none; border: 0; }
  .site-nav ul { display: flex; gap: var(--space-1); }
  .site-nav a { padding: 0 var(--space-3); font-size: 1.125rem; }
}
```

- [ ] **Step 4: Crear `js/nav.js`**

```js
/** Menú móvil accesible y resaltado de la sección activa. */
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

  // Sección activa: la que cruza la línea central de la ventana.
  if (!('IntersectionObserver' in window)) return;
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const linkById = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        links.forEach((a) => a.removeAttribute('aria-current'));
        linkById.get(entry.target.id)?.setAttribute('aria-current', 'true');
      }
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  for (const id of linkById.keys()) {
    const section = root.getElementById(id);
    if (section) observer.observe(section);
  }
}
```

- [ ] **Step 5: Crear `js/reveal.js`**

```js
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
```

- [ ] **Step 6: Crear `js/main.js`**

```js
import { content } from './content.js';
import { renderAll } from './render.js';
import { initNav } from './nav.js';
import { initReveal } from './reveal.js';

initNav();
try {
  renderAll(content);
} catch (error) {
  console.error('No se pudo renderizar el contenido dinámico:', error);
}
initReveal();
```

- [ ] **Step 7: Crear un `css/sections.css` provisional vacío y verificar en el navegador**

`index.html` ya enlaza `css/sections.css`; crearlo con solo `/* Estilos por sección (Task 4) */` para evitar un 404.

Run: `npm run serve` (en segundo plano), abrir `http://localhost:5173/` con la herramienta de navegador disponible (skill `anthropic-skills:built-in-browser` o `anthropic-skills:chrome-browser`).
Expected: la página carga sin errores en consola; el header fijo muestra el escudo y "PANTHER"; en 375px aparece el botón hamburguesa, abre y cierra el menú (también con Esc, que devuelve el foco al botón) y al elegir un enlace se cierra; en ≥900px se ve el menú horizontal; las secciones de disciplinas/horarios/planes/entrenadores muestran el contenido renderizado (sin estilos finales todavía). Run también `npm test` y `npm run check:colors`: todo PASS.

---

### Task 4: Estilos de secciones y acabado visual

**Files:**
- Modify: `css/sections.css` (reemplazar el contenido provisional)

**Interfaces:**
- Consumes: clases emitidas por `index.html` (Task 3) y por `render.js` (lista en Task 2); tokens de `css/tokens.css`.
- Produces: diseño final de todas las secciones; sin nuevas interfaces.

- [ ] **Step 1: Escribir `css/sections.css`**

```css
/* ---------- Hero ---------- */
.hero {
  position: relative; overflow: hidden;
  display: flex; align-items: center;
  min-height: 100svh;
  padding-block: calc(var(--header-h) + var(--space-6)) var(--space-9);
  background:
    radial-gradient(60% 55% at 78% 35%, var(--color-primary-soft), transparent 70%),
    var(--color-bg);
}
.hero::after {
  content: ""; position: absolute; inset: auto 0 0 0; height: 14%;
  background: var(--color-surface);
  clip-path: polygon(0 70%, 100% 0, 100% 100%, 0 100%);
}
.hero-inner { position: relative; z-index: 1; display: grid; gap: var(--space-7); align-items: center; }
.hero-title { font-size: clamp(3.25rem, 12vw, 6.75rem); }
.hero-line { display: block; }
.hero-title em { font-style: normal; color: var(--color-primary); }
.hero-lead { max-width: 34rem; margin-top: var(--space-5); color: var(--color-fg-muted); font-size: 1.25rem; }
.hero-actions { display: flex; flex-wrap: wrap; gap: var(--space-3); margin-top: var(--space-6); }
.hero-logo { width: min(68vw, 300px); height: auto; margin-inline: auto; }
@media (min-width: 900px) {
  .hero-inner { grid-template-columns: 1.15fr 0.85fr; }
  .hero-logo { width: min(100%, 420px); }
}

/* ---------- Nosotros ---------- */
.about-grid { display: grid; gap: var(--space-7); }
.about-text { color: var(--color-fg-muted); font-size: 1.125rem; }
.about-text .section-title { margin-bottom: var(--space-4); color: var(--color-fg); }
.about-text p + p { margin-top: var(--space-4); }
.stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-4); }
.stat { padding: var(--space-5); background: var(--color-card); border-left: 4px solid var(--color-primary); }
.stat-value { font-family: var(--font-display); font-size: clamp(2.5rem, 7vw, 3.75rem); font-weight: 700; line-height: 1; color: var(--color-primary); }
.stat-label { margin-top: var(--space-2); color: var(--color-fg-muted); }
@media (min-width: 900px) { .about-grid { grid-template-columns: 1.1fr 0.9fr; align-items: center; } }

/* ---------- Disciplinas ---------- */
.discipline { display: flex; flex-direction: column; gap: var(--space-3); }
.discipline p { color: var(--color-fg-muted); }
.discipline h3 { font-size: 1.75rem; }
.discipline-icon {
  display: grid; place-items: center; width: 56px; height: 56px;
  background: var(--color-primary-soft); color: var(--color-primary);
}
.icon { width: 1.75rem; height: 1.75rem; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }

/* ---------- Horarios ---------- */
.filters { display: flex; flex-wrap: wrap; gap: var(--space-2); margin-bottom: var(--space-5); }
.schedule { display: grid; gap: var(--space-4); grid-template-columns: repeat(auto-fit, minmax(min(100%, 11.5rem), 1fr)); }
.day { padding: var(--space-4); }
.day-name { margin-bottom: var(--space-3); font-size: 1.5rem; color: var(--color-primary); }
.day-list { display: grid; gap: var(--space-2); }
.slot { display: flex; align-items: baseline; gap: var(--space-3); }
.slot-time { min-width: 3.25rem; font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; }
.slot-name { color: var(--color-fg-muted); }
.day-empty { color: var(--color-fg-muted); font-style: italic; }

/* ---------- Planes ---------- */
.grid--plans { grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr)); align-items: stretch; }
.plan { display: flex; flex-direction: column; gap: var(--space-4); }
.plan--featured { background: var(--color-surface); border-color: var(--color-primary); }
.plan-badge {
  align-self: flex-start; padding: var(--space-1) var(--space-3);
  background: var(--color-primary); color: var(--color-on-primary);
  font-family: var(--font-display); font-size: 1rem; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase;
}
.plan-name { font-size: 2rem; }
.plan-price { display: flex; align-items: baseline; gap: var(--space-2); flex-wrap: wrap; }
.plan-amount { font-family: var(--font-display); font-size: 3.25rem; font-weight: 700; line-height: 1; color: var(--color-primary); }
.plan-period { color: var(--color-fg-muted); }
.plan-features { display: grid; gap: var(--space-2); }
.plan-features li { position: relative; padding-left: var(--space-5); color: var(--color-fg-muted); }
.plan-features li::before {
  content: ""; position: absolute; left: 0.3rem; top: 0.3em;
  width: 0.4rem; height: 0.8rem;
  border: solid var(--color-primary); border-width: 0 2px 2px 0; transform: rotate(45deg);
}
.plan .btn { margin-top: auto; }

/* ---------- Entrenadores ---------- */
.grid--coaches { grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr)); }
.coach { display: flex; flex-direction: column; gap: var(--space-2); padding: 0 0 var(--space-4); }
.coach-photo { width: 100%; aspect-ratio: 4 / 5; object-fit: cover; margin-bottom: var(--space-3); background: var(--color-surface); }
.coach-initials { display: grid; place-items: center; font-family: var(--font-display); font-size: 5rem; font-weight: 700; color: var(--color-primary); }
.coach-name, .coach-role { padding-inline: var(--space-4); }
.coach-name { font-size: 1.5rem; }
.coach-role { color: var(--color-fg-muted); }

/* ---------- Ubicación y contacto ---------- */
.location-grid { display: grid; gap: var(--space-6); }
.info-list > div { padding-block: var(--space-4); border-bottom: 1px solid var(--color-border); }
.info-list dt { color: var(--color-primary); font-family: var(--font-display); font-size: 1.125rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; }
.info-list dd { margin-top: var(--space-1); font-size: 1.25rem; }
.info-list a { text-decoration: underline; text-underline-offset: 4px; }
.info-list a:hover { color: var(--color-primary); }
.map iframe { width: 100%; aspect-ratio: 4 / 3; border: 0; filter: grayscale(1) invert(0.9) contrast(0.9); }
.social { display: flex; flex-wrap: wrap; gap: var(--space-3); margin-top: var(--space-6); }
@media (min-width: 900px) {
  .location-grid { grid-template-columns: 0.9fr 1.1fr; align-items: start; }
}

/* ---------- Footer ---------- */
.site-footer { padding-block: var(--space-6); border-top: 1px solid var(--color-border); color: var(--color-fg-muted); }
.footer-inner { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--space-3); }
.footer-inner a { display: inline-flex; align-items: center; min-height: 44px; }
.footer-inner a:hover { color: var(--color-primary); }
```

- [ ] **Step 2: Verificar en el navegador a 375, 768, 1024 y 1440px**

Con el servidor activo (`npm run serve`), recorrer toda la página en cada ancho.
Expected: sin scroll horizontal; hero con logo visible y legible; grillas de disciplinas/planes/entrenadores reordenándose sin cortes; horarios en 1 columna en 375px y varias en escritorio; filtro de horarios funciona (con "Boxeo" los días sin boxeo muestran "Sin clases"); plan "Full" resaltado; mapa cargando; los títulos nunca se cortan. Corregir en `sections.css` lo que falle.

- [ ] **Step 3: Verificar tests y regla de colores**

Run: `npm test` y `npm run check:colors`
Expected: todo PASS y `OK: sin colores crudos fuera de css/tokens.css`.

---

### Task 5: README, QA final de accesibilidad y Review Focus

**Files:**
- Create: `README.md`
- Modify: archivos de `css/` o `js/` solo si el QA encuentra fallas

**Interfaces:**
- Consumes: el sitio completo de las tareas 1–4.
- Produces: documentación de uso y la verificación final.

- [ ] **Step 1: Crear `README.md`**

````markdown
# Panther Club de Entrenamiento — Landing

Landing estática en HTML, CSS y JavaScript puros.

## Ver el sitio
Los módulos ES necesitan servirse por HTTP (no abrir `index.html` con doble clic):

```bash
npm run serve        # o: python -m http.server 5173
```
Abrir http://localhost:5173/

## Qué editar
| Quiero cambiar… | Dónde |
|---|---|
| Colores del sitio | `css/tokens.css` (único lugar donde hay colores) |
| Disciplinas, horarios, planes, entrenadores | `js/content.js` |
| Textos de Hero, Nosotros, Ubicación, Contacto y redes | `index.html` |
| Fotos de entrenadores | poner la imagen en `assets/img/` y completar `foto` en `js/content.js` |
| Logo | reemplazar `assets/PantherBlanco.png` y correr `npm run assets` (requiere Python + Pillow) |

## Chequeos
```bash
npm test               # datos, render, contraste y regla de colores
npm run check:colors   # falla si hay colores crudos fuera de tokens.css
```
````

- [ ] **Step 2: Chequeos automáticos finales**

Run: `npm test` y `npm run check:colors`
Expected: todos PASS; `OK: sin colores crudos fuera de css/tokens.css`.

- [ ] **Step 3: QA manual de Review Focus #5 y accesibilidad**

Con el sitio servido, verificar en el navegador:
1. **Menú móvil:** a 375px abrir el menú; redimensionar a ≥900px → el menú se cierra y el botón vuelve a "Abrir menú"; reabrir en móvil y presionar Esc → se cierra y el foco vuelve al botón.
2. **Sin JavaScript:** desactivar JS (DevTools → Disable JavaScript) y recargar → se leen los mensajes `<noscript>` en las secciones dinámicas y todo el contenido estático es visible (nada queda en `opacity: 0`).
3. **Reduced motion:** activar "Emulate CSS prefers-reduced-motion: reduce" → el contenido aparece sin animar y el scroll a anclas es instantáneo.
4. **Teclado:** recorrer con Tab → el skip link aparece primero; todos los controles muestran foco visible; los chips de filtro se activan con Enter/Espacio.
5. **Texto largo:** en `js/content.js` poner temporalmente un nombre de disciplina de 80 caracteres sin espacios y un nombre de entrenador largo → no aparece scroll horizontal en 375px; luego revertir el cambio.
6. **Consola:** sin errores ni warnings (salvo los de red del iframe de mapas, si los hubiera).
7. **Objetivos táctiles:** botones, chips, enlaces del menú y de contacto miden al menos 44px de alto.

Si algo falla, corregir en el archivo correspondiente y repetir el chequeo y `npm test`.

- [ ] **Step 4: Cierre**

Detener el servidor de desarrollo. Resumen final para el usuario: lista de archivos creados, comandos (`npm run serve`, `npm test`), y los pendientes de contenido real (dirección y mapa, teléfono/email/redes, precios, horarios, fotos de entrenadores).
