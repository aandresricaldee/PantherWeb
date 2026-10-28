import test from 'node:test';
import assert from 'node:assert/strict';
import { scrambleFrame, GLYPHS } from '../js/fx/decode.js';

const seq = (values) => { let i = 0; return () => values[i++ % values.length]; };

test('scrambleFrame: con el progreso completo devuelve el texto exacto', () => {
  assert.equal(scrambleFrame('Sobre nosotros', 1), 'Sobre nosotros');
  assert.equal(scrambleFrame('Sobre nosotros', 2), 'Sobre nosotros');
});

test('scrambleFrame: sin progreso mantiene el largo y los espacios, y no deja letras originales fijas', () => {
  const out = scrambleFrame('QUÉ OFRECEMOS', 0, seq([0.01]));
  assert.equal(out.length, 'QUÉ OFRECEMOS'.length);
  assert.equal(out[3], ' ');
  assert.ok([...out].filter((c) => c !== ' ').every((c) => GLYPHS.includes(c)), out);
});

test('scrambleFrame: las letras se fijan de izquierda a derecha a medida que avanza', () => {
  // con el generador fijo en 0,99 el glifo sin resolver siempre es el último de la lista ("9")
  assert.equal(scrambleFrame('ABCDEFGH', 0.5, seq([0.99])), 'ABCD9999');
  assert.equal(scrambleFrame('ABCDEFGH', 0.25, seq([0.99])), 'AB999999');
  assert.equal(scrambleFrame('ABCDEFGH', 0.75, seq([0.99])), 'ABCDEF99');
  assert.equal(GLYPHS.at(-1), '9');
});

test('scrambleFrame: acepta progresos fuera de rango sin romper', () => {
  assert.equal(scrambleFrame('HOLA', -3, seq([0.5])).length, 4);
  assert.equal(scrambleFrame('', 0.5), '');
});
