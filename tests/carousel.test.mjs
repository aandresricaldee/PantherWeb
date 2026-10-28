import test from 'node:test';
import assert from 'node:assert/strict';
import { wrapPosition, normalizeScroll, advanceScroll, cardTarget } from '../js/carousel.js';

test('wrapPosition: devuelve el valor dentro de [0, tamaño), también con negativos', () => {
  assert.equal(wrapPosition(250, 100), 50);
  assert.equal(wrapPosition(-30, 100), 70);
  assert.equal(wrapPosition(100, 100), 0);
  assert.equal(wrapPosition(5, 0), 0, 'tamaño 0 no produce NaN');
});

test('normalizeScroll: mantiene el scroll dentro del set central [ancho, 2·ancho)', () => {
  assert.equal(normalizeScroll(0, 100), 100);
  assert.equal(normalizeScroll(100, 100), 100);
  assert.equal(normalizeScroll(199.5, 100), 199.5);
  assert.equal(normalizeScroll(200, 100), 100);
  assert.equal(normalizeScroll(250, 100), 150);
  assert.equal(normalizeScroll(-40, 100), 160);
  assert.equal(normalizeScroll(50, 0), 0);
});

test('advanceScroll: avanza a velocidad constante (px/s) según el tiempo transcurrido', () => {
  assert.equal(advanceScroll(500, 1000, 60, 500), 560);
  assert.equal(advanceScroll(500, 500, 60, 500), 530);
  assert.equal(advanceScroll(500, 0, 60, 500), 500);
});

test('advanceScroll: al llegar al final del set vuelve al inicio sin saltos visibles (loop infinito)', () => {
  // 990 + 60 = 1050 → equivale a 550 (misma imagen, un set menos)
  assert.equal(advanceScroll(990, 1000, 60, 500), 550);
  // un frame enorme (pestaña dormida) tampoco se sale del rango
  const v = advanceScroll(700, 60000, 60, 500);
  assert.ok(v >= 500 && v < 1000, `fuera de rango: ${v}`);
});

test('advanceScroll: ancho de set 0 no produce NaN', () => {
  assert.equal(advanceScroll(0, 1000, 60, 0), 0);
});

test('cardTarget: va a la tarjeta siguiente o anterior más cercana, alineada al inicio de una tarjeta', () => {
  const base = 600, step = 300;
  assert.equal(cardTarget(base, base, step, 1), 900);
  assert.equal(cardTarget(base + 10, base, step, 1), 900);   // un poco pasada la tarjeta 0 → siguiente es la 1
  assert.equal(cardTarget(base + 190, base, step, 1), 1200); // más cerca de la 1 → siguiente es la 2
  assert.equal(cardTarget(base + 190, base, step, -1), 600); // más cerca de la 1 → anterior es la 0
  assert.equal(cardTarget(base, base, step, -1), 300);       // retroceder desde la 0 entra al set anterior
});
