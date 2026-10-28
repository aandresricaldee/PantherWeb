# Panther Club de Entrenamiento — Landing

Landing estática en HTML, CSS y JavaScript puros.

## Ver el sitio
Los módulos ES necesitan servirse por HTTP (no abrir `index.html` con doble clic):

```bash
npm run serve        # servidor propio sin dependencias (puerto 5173; otro puerto: node scripts/serve.mjs --port 8080)
```
Abrir http://localhost:5173/  
(No uses `python -m http.server`: rechaza conexiones cuando el navegador pide muchos archivos a la vez.)

## Qué editar
| Quiero cambiar… | Dónde |
|---|---|
| Colores del sitio | `css/tokens.css` (único lugar donde hay colores) |
| Disciplinas (carrusel), horarios, planes, entrenadores | `js/content.js` |
| Número y mensaje de WhatsApp (botón flotante y botón de contacto) | `js/content.js` → `whatsapp` (número en formato internacional, solo dígitos) |
| Textos de Hero, Nosotros, Ubicación, Contacto y redes | `index.html` |
| Zona horaria del club (para "Abierto ahora") | `js/content.js` → `zona` |
| Efectos cinematográficos | `js/fx/` (un módulo por efecto) y `css/fx.css`; ver la sección de abajo |
| Tipografías | `css/fonts.css` y `assets/fonts/` (Barlow y Barlow Condensed alojadas en el proyecto, sin depender de Google Fonts) |
| Fotos de entrenadores | poner la imagen en `assets/img/` y completar `foto` en `js/content.js` |
| Logo o foto de fondo del hero | reemplazar `assets/PantherBlanco.png` o `assets/FondoGym.png` y correr `npm run assets` (requiere Python + Pillow; también regenera el escudo de la intro) |

## Efectos cinematográficos
Todo vive en `js/fx/` y `css/fx.css`, y `main.js` los carga aparte: si fallaran, el sitio sigue funcionando.
Respetan "reducir movimiento" del sistema, y los de mouse solo se activan en dispositivos con mouse.

| Efecto | Módulo | Para quitarlo |
|---|---|---|
| Intro con el escudo (en cada carga) | `intro.js` + bloque *Intro* de `fx.css` y el `<div class="intro">` de `index.html` | quitar esos tres |
| Texto cinético (títulos) | `text.js` | quitar los `data-kinetic` del HTML |
| Contadores de "Nosotros" | `counters.js` | borrar su línea en `fx/index.js` |
| Inclinación 3D (planes y entrenadores) | `tilt.js` | quitar `data-tilt` en `js/render.js` |
| Botones magnéticos | `magnetic.js` | borrar su línea en `fx/index.js` |
| Polvo, foco de luz, haces y grano del hero | `particles.js`, `spotlight.js` y `.hero-fx` | borrar el `<div class="hero-fx">` |
| Cinta de texto gigante | `marquee.js` | borrar el `<div class="marquee">` |
| Números 01–07, barra de progreso | `layers.js`, `progress.js` y `animation-timeline` en `fx.css` | borrar su línea en `fx/index.js` |
| Estado en vivo "Abierto ahora" y tarjeta "Hoy" | `js/status.js` (usa los horarios y la zona de `content.js`) | quitar `initStatus` en `main.js` y el `<p data-status>` del hero |
| Barra que se desliza bajo el enlace activo del menú | `nav.js` + `.nav-indicator` en `components.css` | borrar el bloque `.nav-indicator` |
| Esquinas HUD en tarjetas | `hud()` en `js/render.js` + bloque *HUD* de `fx.css` | quitar `hud()` en `render.js` |
| Profundidad del carrusel (sin JS) | bloque *Carrusel* de `fx.css` (`animation-timeline: view()`) | borrar ese bloque |
| Línea de latido (ECG) | `<div class="ecg">` en `index.html` + bloque *ECG* de `fx.css` | borrar el `<div class="ecg">` |
| Texto que se decodifica en los eyebrows | `decode.js` | borrar su línea en `fx/index.js` |
| Escaneo en las cifras | `counters.js` + bloque *Cifras* de `fx.css` | borrar ese bloque |

Reglas de movimiento del proyecto: todo `:hover` va dentro de `@media (hover: hover) and (pointer: fine)`; solo se animan `transform` y `opacity`;
las curvas son `--ease-out` y `--ease-in-out` de `tokens.css` (no inventar otras); y toda animación nueva debe tener su versión para "reducir movimiento".

Para cambiar la velocidad o la intensidad, buscar la constante al inicio de cada módulo (por ejemplo `SPEED_PX_S` en `carousel.js`) o la variable `--color-spot`, `--color-beam` y `--color-particle` en `css/tokens.css`.

## Datos de ejemplo pendientes de reemplazar
Número de WhatsApp (`js/content.js`), dirección y mapa (`#ubicacion`), teléfono, email y redes (`#contacto`), cifras de "Nosotros", precios, horarios, y fotos de entrenadores.
Para el mapa: en Google Maps → Compartir → Insertar un mapa → copiar el `src` del iframe.

## Chequeos
```bash
npm test               # datos, render, contraste y regla de colores
npm run check:colors   # falla si hay colores crudos fuera de tokens.css
```
