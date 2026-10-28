import test from 'node:test';
import assert from 'node:assert/strict';
import { tiltFromPointer } from '../js/fx/tilt.js';
import { magneticOffset } from '../js/fx/magnetic.js';

const rect = { left: 100, top: 100, width: 200, height: 100 };

test('tiltFromPointer: en el centro no inclina y el reflejo queda al 50 %', () => {
  assert.deepEqual(tiltFromPointer(200, 150, rect, 8), { rx: 0, ry: 0, gx: 50, gy: 50 });
});

test('tiltFromPointer: arriba-izquierda inclina hacia ese lado', () => {
  const t = tiltFromPointer(100, 100, rect, 8);
  assert.equal(t.rx, 8);   // arriba → rotateX positivo
  assert.equal(t.ry, -8);  // izquierda → rotateY negativo
  assert.deepEqual([t.gx, t.gy], [0, 0]);
});

test('tiltFromPointer: abajo-derecha es el opuesto', () => {
  const t = tiltFromPointer(300, 200, rect, 8);
  assert.equal(t.rx, -8);
  assert.equal(t.ry, 8);
});

test('tiltFromPointer: un puntero fuera del rectángulo no pasa el máximo', () => {
  const t = tiltFromPointer(5000, -5000, rect, 8);
  assert.ok(Math.abs(t.rx) <= 8 && Math.abs(t.ry) <= 8);
  assert.ok(t.gx <= 100 && t.gy >= 0);
});

test('tiltFromPointer: un rectángulo de tamaño 0 no produce NaN', () => {
  const t = tiltFromPointer(10, 10, { left: 0, top: 0, width: 0, height: 0 }, 8);
  assert.deepEqual(t, { rx: 0, ry: 0, gx: 50, gy: 50 });
});

const btn = { left: 100, top: 100, width: 100, height: 40 }; // centro (150, 120)

test('magneticOffset: lejos del elemento no se mueve', () => {
  assert.deepEqual(magneticOffset(900, 900, btn), { x: 0, y: 0 });
});

test('magneticOffset: justo en el centro no se mueve', () => {
  assert.deepEqual(magneticOffset(150, 120, btn), { x: 0, y: 0 });
});

test('magneticOffset: se desplaza hacia el puntero cuando está cerca', () => {
  const o = magneticOffset(190, 120, btn);
  assert.ok(o.x > 0, 'hacia la derecha');
  assert.equal(o.y, 0);
  const o2 = magneticOffset(150, 80, btn);
  assert.ok(o2.y < 0, 'hacia arriba');
});

test('magneticOffset: el desplazamiento está acotado', () => {
  const o = magneticOffset(249, 120, btn, { strength: 5, radius: 200, max: 10 });
  assert.ok(Math.abs(o.x) <= 10 && Math.abs(o.y) <= 10);
});
