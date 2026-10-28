import test from 'node:test';
import assert from 'node:assert/strict';
import { createParticles, stepParticle, particleAlpha } from '../js/fx/particles.js';

const seq = (values) => { let i = 0; return () => values[i++ % values.length]; };

test('createParticles crea la cantidad pedida, dentro del área y con valores válidos', () => {
  const ps = createParticles(40, 800, 500, seq([0.1, 0.5, 0.9, 0.3, 0.7]));
  assert.equal(ps.length, 40);
  for (const p of ps) {
    assert.ok(p.x >= 0 && p.x <= 800 && p.y >= 0 && p.y <= 500);
    assert.ok(p.r > 0 && p.r < 3);
    assert.ok(p.vy < 0, 'las partículas suben');
    assert.ok(p.a > 0 && p.a <= 1);
  }
});

test('createParticles con 0 devuelve lista vacía', () => {
  assert.deepEqual(createParticles(0, 100, 100), []);
});

test('stepParticle mueve la partícula según su velocidad y el tiempo', () => {
  const p = { x: 10, y: 100, r: 1, vx: 10, vy: -20, a: 1, ph: 0, tw: 1000 };
  stepParticle(p, 1000, 800, 500);
  assert.equal(p.x, 20);
  assert.equal(p.y, 80);
});

test('stepParticle: al salir por arriba reaparece abajo (flujo continuo)', () => {
  const p = { x: 10, y: 0.5, r: 1, vx: 0, vy: -50, a: 1, ph: 0, tw: 1000 };
  stepParticle(p, 1000, 800, 500);
  assert.ok(p.y > 450, `y=${p.y}`);
});

test('stepParticle: al salir por un costado reaparece en el opuesto', () => {
  const p = { x: 799, y: 100, r: 1, vx: 50, vy: 0, a: 1, ph: 0, tw: 1000 };
  stepParticle(p, 1000, 800, 500);
  assert.ok(p.x < 10, `x=${p.x}`);
});

test('particleAlpha oscila pero siempre queda entre 0 y 1', () => {
  const p = { a: 0.8, ph: 1, tw: 1500 };
  for (let t = 0; t < 10000; t += 137) { const a = particleAlpha(p, t); assert.ok(a >= 0 && a <= 1, `alpha ${a}`); }
});
