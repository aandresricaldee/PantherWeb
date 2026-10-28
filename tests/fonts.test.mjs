import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const html = readFileSync(resolve(root, 'index.html'), 'utf8');

test('el sitio no depende de Google Fonts', () => {
  assert.doesNotMatch(html, /fonts\.googleapis\.com|fonts\.gstatic\.com/);
});

test('css/fonts.css está enlazado antes del resto de los estilos', () => {
  const order = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(order[0], 'css/fonts.css');
});

test('cada @font-face apunta a un archivo que existe', () => {
  const cssPath = resolve(root, 'css/fonts.css');
  assert.ok(existsSync(cssPath), 'falta css/fonts.css');
  const css = readFileSync(cssPath, 'utf8');
  const urls = [...css.matchAll(/url\("([^"]+)"\)/g)].map((m) => m[1]);
  assert.ok(urls.length >= 5, 'se esperaban al menos 5 archivos de fuente');
  for (const u of urls) assert.ok(existsSync(resolve(dirname(cssPath), u)), `no existe ${u}`);
});

test('las fuentes del primer pantallazo se precargan y los archivos existen', () => {
  const preloads = [...html.matchAll(/<link rel="preload" href="([^"]+)" as="font" type="font\/woff2" crossorigin>/g)].map((m) => m[1]);
  assert.ok(preloads.length >= 3, `precargas: ${preloads.length}`);
  for (const p of preloads) assert.ok(existsSync(resolve(root, p)), `no existe ${p}`);
});

test('el acento tiene hover y brillo del mismo tono que el color principal', () => {
  const css = readFileSync(resolve(root, 'css/tokens.css'), 'utf8');
  const hex = (name) => css.match(new RegExp(`--${name}:\\s*#([0-9A-Fa-f]{6})`))[1];
  const hue = (h) => {
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    if (d === 0) return 0;
    const v = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return (v * 60 + 360) % 360;
  };
  const primary = hue(hex('color-primary'));
  const hover = hue(hex('color-primary-hover'));
  assert.ok(Math.abs(primary - hover) < 15, `matiz primary ${primary.toFixed(0)}° vs hover ${hover.toFixed(0)}°`);
  const soft = css.match(/--color-primary-soft:\s*rgba\((\d+),\s*(\d+),\s*(\d+)/);
  const p = hex('color-primary');
  const want = [0, 2, 4].map((i) => parseInt(p.slice(i, i + 2), 16));
  assert.deepEqual([+soft[1], +soft[2], +soft[3]], want, 'primary-soft debe usar el RGB de primary');
});
