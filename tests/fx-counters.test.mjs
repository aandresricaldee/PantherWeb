import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCounter, formatCounter, easeOutExpo, countAt } from '../js/fx/counters.js';

test('parseCounter separa prefijo, valor y sufijo', () => {
  assert.deepEqual(parseCounter('+600'), { prefix: '+', value: 600, suffix: '' });
  assert.deepEqual(parseCounter('5'), { prefix: '', value: 5, suffix: '' });
  assert.deepEqual(parseCounter(' +8 '), { prefix: '+', value: 8, suffix: '' });
  assert.deepEqual(parseCounter('30 kg'), { prefix: '', value: 30, suffix: ' kg' });
});

test('parseCounter ignora separadores de miles y rechaza texto sin número', () => {
  assert.equal(parseCounter('12.500').value, 12500);
  assert.equal(parseCounter('hola'), null);
  assert.equal(parseCounter(''), null);
});

test('easeOutExpo: 0 al inicio, 1 al final, creciente y acotada', () => {
  assert.equal(easeOutExpo(0), 0);
  assert.equal(easeOutExpo(1), 1);
  assert.equal(easeOutExpo(2), 1);
  assert.equal(easeOutExpo(-1), 0);
  assert.ok(easeOutExpo(0.5) > 0.9, 'arranca rápido y desacelera');
  let prev = -1;
  for (let t = 0; t <= 1; t += 0.1) { const v = easeOutExpo(t); assert.ok(v >= prev); prev = v; }
});

test('countAt llega exactamente al valor final y nunca se pasa', () => {
  assert.equal(countAt(600, 0), 0);
  assert.equal(countAt(600, 1), 600);
  assert.equal(countAt(600, 5), 600);
  for (let t = 0; t <= 1; t += 0.05) assert.ok(countAt(600, t) <= 600);
});

test('formatCounter arma el texto con prefijo y sufijo', () => {
  assert.equal(formatCounter({ prefix: '+', suffix: '' }, 42), '+42');
  assert.equal(formatCounter({ prefix: '', suffix: ' kg' }, 7), '7 kg');
});
