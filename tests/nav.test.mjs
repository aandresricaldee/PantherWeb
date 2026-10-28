import test from 'node:test';
import assert from 'node:assert/strict';
import { indicatorFor } from '../js/nav.js';

test('indicatorFor: posición y ancho de la barra relativos a la lista del menú', () => {
  assert.deepEqual(indicatorFor({ left: 540, width: 88 }, { left: 500 }), { x: 40, w: 88 });
  assert.deepEqual(indicatorFor({ left: 500, width: 70 }, { left: 500 }), { x: 0, w: 70 });
});

test('indicatorFor: redondea a 2 decimales', () => {
  assert.deepEqual(indicatorFor({ left: 100.123456, width: 50.987654 }, { left: 0 }), { x: 100.12, w: 50.99 });
});
