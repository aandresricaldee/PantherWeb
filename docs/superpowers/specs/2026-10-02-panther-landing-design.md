# Landing Panther Club de Entrenamiento — Diseño

Fecha: 2026-10-02

## 1. Objetivo
Landing page de presencia de marca e información para **Panther Club de Entrenamiento**.
No busca conversión directa (sin formularios ni pasarela de pago). Debe verse profesional, con identidad fuerte y ser fácil de mantener.

- Stack: HTML, CSS y JavaScript puros (sin frameworks ni build).
- Idioma: español rioplatense.
- Logo: `PantherBlanco.png` (blanco, solo sobre fondos oscuros).
- Contenido: de ejemplo (placeholders), centralizado para reemplazarlo fácilmente.

## 2. Alcance (secciones)
1. **Hero**: logo, lema, subtítulo, dos botones de ancla (Ver planes, Ver horarios).
2. **Sobre nosotros**: texto breve y 3-4 datos destacados (años, socios, entrenadores, disciplinas).
3. **Disciplinas**: grilla de tarjetas (nombre, descripción corta, ícono SVG).
4. **Horarios**: grilla semanal por día y franja, con filtro por disciplina.
5. **Planes y precios**: 3 tarjetas, una destacada.
6. **Entrenadores**: tarjetas con foto placeholder, nombre y especialidad.
7. **Ubicación**: dirección, horarios de atención y mapa embebido (iframe de Google Maps, `loading="lazy"`).
8. **Contacto y redes**: teléfono, email, enlaces a Instagram/Facebook/WhatsApp.
9. **Footer**: logo, enlaces, copyright.

Fuera de alcance: galería de fotos, formularios, backend, multi-idioma, CMS, i18n, analítica.

## 3. Arquitectura de archivos
```
PantherWeb/
├─ index.html
├─ assets/
│  ├─ PantherBlanco.png      (se mueve/copia desde la raíz)
│  └─ img/                   (placeholders)
├─ css/
│  ├─ tokens.css             variables (color, tipografía, espaciado, radios, motion)
│  ├─ base.css               reset, tipografía base, utilidades, foco, reduced-motion
│  ├─ components.css         botones, tarjetas, header/nav, chips
│  └─ sections.css           estilos por sección
└─ js/
   ├─ content.js             ÚNICA fuente de datos editables
   ├─ render.js              vuelca content.js al DOM (disciplinas, horarios, planes, entrenadores)
   ├─ nav.js                 menú móvil, scroll suave, sección activa
   ├─ reveal.js              animaciones de entrada (IntersectionObserver)
   └─ main.js                punto de entrada, inicializa módulos
```
Los scripts se cargan como `<script type="module">`. Cada módulo tiene una responsabilidad y exporta una función `init`/`render`.

### Reparto HTML / JS
- **En el HTML (funciona sin JS):** hero, sobre nosotros, ubicación, contacto, footer.
- **Desde `content.js` (render por JS):** disciplinas, horarios, planes, entrenadores.
- Cada contenedor renderizado lleva un `<noscript>` con un mensaje mínimo de respaldo ("Activá JavaScript para ver los horarios").
- Los módulos ES requieren servir por HTTP; no se abre con `file://`. Se documenta en el README (`npx serve` o `python -m http.server`).

## 4. Diseño visual (ui-ux-pro-max)
Estilo: **oscuro agresivo / Vibrant & Block-based**, bloques geométricos, alto contraste, tipografía grande.

### Paleta (tokens)
| Token | Valor | Uso |
|---|---|---|
| `--color-bg` | `#0B0B0D` | Fondo principal |
| `--color-surface` | `#16171B` | Fondos de sección alternos |
| `--color-card` | `#1F2026` | Tarjetas |
| `--color-border` | `#2E3038` | Bordes |
| `--color-fg` | `#F8FAFC` | Texto principal |
| `--color-fg-muted` | `#B6BCC8` | Texto secundario |
| `--color-primary` | `#F97316` | Acento y CTA |
| `--color-primary-hover` | `#FB923C` | Hover del acento |
| `--color-on-primary` | `#0B0B0D` | Texto sobre acento |

**Regla:** todos los colores se definen únicamente como variables CSS en `css/tokens.css`. Ningún otro archivo CSS, HTML ni JS puede contener valores de color crudos (hex, rgb, hsl); solo `var(--color-*)`. Las variantes (hover, transparencias) también son tokens (por ejemplo `--color-primary-hover`, `--color-overlay`). Cambiar un color implica editar un solo lugar. Se verifica con una búsqueda de `#[0-9a-fA-F]{3,8}` y `rgb(`/`hsl(` fuera de `tokens.css`.

Nota: la skill propuso un fondo pizarra `#1F2937` y un acento verde secundario. Se adopta el naranja `#F97316` y se baja el fondo a casi negro para reforzar el carácter agresivo. Se descarta el verde (un solo acento).
Contraste: texto sobre fondo y acento ≥ 4.5:1 (a verificar en implementación).

### Tipografía
- Títulos: **Barlow Condensed** 600/700, mayúsculas, tamaños grandes (32px+).
- Texto: **Barlow** 400/500, base 16px, interlineado 1.5.
- Carga vía Google Fonts con `display=swap`.

### Iconos
SVG inline (estilo Lucide). Sin emojis como íconos.

### Layout
Mobile-first. Breakpoints de prueba: 375, 768, 1024, 1440. Contenedor máx. ~1200px, gutters de 16px en móvil. Separación entre secciones de 48px o más. Sin scroll horizontal.

## 5. Comportamiento (JS)
- **Header fijo** con logo y navegación; en <768px se vuelve hamburguesa accesible (`aria-expanded`, cierre con Esc y al elegir un enlace).
- **Scroll suave** a anclas, con compensación del header fijo (`scroll-margin-top`).
- **Sección activa** resaltada en el menú (`IntersectionObserver`).
- **Horarios:** filtro por disciplina (botones tipo chip). En móvil la grilla pasa a lista por día.
- **Reveal:** entrada escalonada de tarjetas (opacity + translateY, 300-450ms) con `IntersectionObserver`. Solo `transform` y `opacity`.
- `prefers-reduced-motion: reduce` desactiva animaciones y scroll suave; el contenido se muestra directamente.

## 6. Modelo de datos (`content.js`)
`content.js` contiene solo las colecciones que se renderizan por JS. Hero, nosotros, ubicación, contacto y footer son texto fijo en el HTML (así funcionan sin JS), cada dato en un único lugar.
```js
export const content = {
  disciplinas:[{ id, nombre, descripcion, icono }],
  horarios:   [{ dia, franjas: [{ hora, disciplinaId }] }],
  planes:     [{ nombre, precio, periodo, destacado, beneficios: [] }],
  entrenadores:[{ nombre, especialidad, foto }]   // foto: ruta o null (null muestra iniciales)
};
```
`icono` es una clave de los íconos SVG definidos en `render.js`.
Renderizado con `createElement`/`textContent` (sin `innerHTML` con datos), para evitar inyección de HTML.

## 7. Accesibilidad y calidad
- HTML semántico (`header`, `nav`, `main`, `section` con encabezados, `footer`); un solo `h1`.
- Skip link, foco visible, navegación por teclado completa.
- Objetivos táctiles ≥ 44×44px y 8px de separación.
- `alt` descriptivo en imágenes; `aria-label` en controles sin texto.
- Imágenes con `width`/`height` y `loading="lazy"` bajo el pliegue (CLS < 0.1).
- Metadatos: `lang="es"`, `viewport`, `title`, `description`, Open Graph básico, favicon basado en el logo.

## 8. Verificación
Servidor local y revisión manual en 375/768/1024/1440px: sin scroll horizontal, menú móvil, filtro de horarios, estados de foco, reduced-motion, contraste, consola sin errores. Sin tests automatizados (alcance estático); se verifica con la herramienta de navegador disponible.

## 9. Riesgos y decisiones abiertas
- Contenido y fotos reales pendientes; todo queda como placeholder.
- Dirección real y URL del mapa pendientes (el mapa usa una ubicación de ejemplo).
- Si más adelante se necesita SEO fuerte, evaluar prerender del contenido dinámico.
