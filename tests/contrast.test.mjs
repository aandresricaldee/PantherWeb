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

// Excepción deliberada: el ícono blanco sobre el verde de WhatsApp (--color-on-whatsapp / --color-whatsapp)
// tiene ~2:1, por debajo del 3:1 recomendado para íconos. Se mantiene por decisión de diseño (estilo
// reconocible de la marca); el botón no lleva texto y expone su nombre con aria-label.
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
