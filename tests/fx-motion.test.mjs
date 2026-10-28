import test from 'node:test';
import assert from 'node:assert/strict';
import { lerp, driftPoint } from '../js/fx/spotlight.js';
import { velocitySkew } from '../js/fx/marquee.js';
import { scrollProgress } from '../js/fx/progress.js';
import { layerOffset } from '../js/fx/layers.js';
import { shouldPlayIntro } from '../js/fx/intro.js';

test('lerp interpola linealmente', () => {
  assert.equal(lerp(0, 10, 0), 0);
  assert.equal(lerp(0, 10, 1), 10);
  assert.equal(lerp(0, 10, 0.25), 2.5);
});

test('driftPoint es determinista y se mantiene dentro de la escena', () => {
  assert.deepEqual(driftPoint(1234), driftPoint(1234));
  for (let t = 0; t < 60000; t += 997) {
    const { x, y } = driftPoint(t);
    assert.ok(x >= 40 && x <= 90 && y >= 25 && y <= 60, `fuera de rango: ${x}, ${y}`);
  }
});

test('velocitySkew sigue el sentido del scroll y no pasa el máximo', () => {
  assert.equal(velocitySkew(0), 0);
  assert.ok(velocitySkew(40) > 0);
  assert.ok(velocitySkew(-40) < 0);
  assert.equal(velocitySkew(100000, 8), 8);
  assert.equal(velocitySkew(-100000, 8), -8);
});

test('scrollProgress va de 0 (arriba) a 1 (abajo) y se acota', () => {
  assert.equal(scrollProgress(0, 5000, 800), 0);
  assert.equal(scrollProgress(4200, 5000, 800), 1);
  assert.equal(scrollProgress(2100, 5000, 800), 0.5);
  assert.equal(scrollProgress(9999, 5000, 800), 1);
  assert.equal(scrollProgress(-50, 5000, 800), 0);
});

test('scrollProgress: página que entra en una pantalla no produce NaN', () => {
  assert.equal(scrollProgress(0, 800, 800), 0);
  assert.equal(scrollProgress(0, 500, 800), 0);
});

test('layerOffset: 0 cuando el elemento está en el centro, signo opuesto arriba y abajo', () => {
  assert.equal(layerOffset(400, 800, 0.1), 0);
  assert.ok(layerOffset(100, 800, 0.1) > 0);
  assert.ok(layerOffset(700, 800, 0.1) < 0);
});

test('shouldPlayIntro: en cada carga, salvo con "reducir movimiento"', () => {
  assert.equal(shouldPlayIntro({ reduced: false }), true);
  assert.equal(shouldPlayIntro({ reduced: true }), false);
  assert.equal(shouldPlayIntro({ seen: true, reduced: false }), true, 'ya no importa si se vio antes');
});
