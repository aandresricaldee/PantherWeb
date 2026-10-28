import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { FakeNode, installFakeDocument, byClass, findAll, hasClass } from './helpers/fake-dom.mjs';
import {
  renderDisciplinas, renderHorarios, renderPlanes, renderEntrenadores,
} from '../js/render.js';

beforeEach(() => installFakeDocument());

test('colecciones vacías muestran un mensaje, no un bloque en blanco', () => {
  for (const fn of [renderDisciplinas, renderHorarios, renderPlanes, renderEntrenadores]) {
    const c = new FakeNode('div');
    fn(c, []);
    assert.equal(byClass(c, 'empty').length, 1);
  }
});

test('el texto con HTML se muestra literal y no crea elementos', () => {
  const c = new FakeNode('div');
  renderDisciplinas(c, [{ id: 'x', nombre: '<b>Pesas</b> & <script>x</script>', descripcion: '<i>hi</i>', icono: 'pesas' }]);
  const h3 = findAll(c, (n) => n.tag === 'h3')[0];
  assert.equal(h3.textContent, '<b>Pesas</b> & <script>x</script>');
  assert.equal(findAll(c, (n) => ['b', 'i', 'script'].includes(n.tag)).length, 0);
});

test('un ícono desconocido usa el ícono por defecto sin romper', () => {
  const c = new FakeNode('div');
  renderDisciplinas(c, [{ id: 'x', nombre: 'X', descripcion: 'd', icono: 'no-existe' }]);
  assert.equal(findAll(c, (n) => n.tag === 'svg').length, 1);
});

test('cada día muestra sus turnos como "desde – hasta", ordenados', () => {
  const c = new FakeNode('div');
  renderHorarios(c, [{ dia: 'Lunes', turnos: [
    { desde: '16:00', hasta: '22:00' }, { desde: '07:00', hasta: '12:00' },
  ] }]);
  assert.deepEqual(byClass(c, 'slot-time').map((n) => n.textContent), ['07:00 – 12:00', '16:00 – 22:00']);
  assert.equal(byClass(c, 'day-name')[0].textContent, 'Lunes');
  assert.equal(byClass(c, 'day-empty').length, 0);
});

test('un día sin turnos muestra "Cerrado"', () => {
  const c = new FakeNode('div');
  renderHorarios(c, [{ dia: 'Domingo', turnos: [] }]);
  const empty = byClass(c, 'day-empty')[0];
  assert.equal(empty.textContent, 'Cerrado');
  assert.equal(byClass(c, 'slot').length, 0);
});

test('el plan destacado lleva clase, insignia y beneficios', () => {
  const c = new FakeNode('div');
  renderPlanes(c, [
    { nombre: 'A', precio: '$1', periodo: '/ mes', destacado: false, beneficios: ['x'] },
    { nombre: 'B', precio: '$2', periodo: '/ mes', destacado: true, beneficios: ['x', 'y'] },
  ]);
  const plans = byClass(c, 'plan');
  assert.equal(hasClass(plans[0], 'plan--featured'), false);
  assert.equal(hasClass(plans[1], 'plan--featured'), true);
  assert.equal(byClass(plans[1], 'plan-badge').length, 1);
  assert.equal(byClass(plans[0], 'plan-badge').length, 0);
  assert.equal(findAll(plans[1], (n) => n.tag === 'li').length, 2);
});

test('entrenador sin foto muestra iniciales; con foto muestra imagen con alt', () => {
  const c = new FakeNode('div');
  renderEntrenadores(c, [
    { nombre: 'ana benítez', especialidad: 'Yoga', foto: null },
    { nombre: 'Luis', especialidad: 'Box', foto: 'assets/img/luis.webp' },
  ]);
  assert.equal(byClass(c, 'coach-initials')[0].textContent, 'AB');
  const img = findAll(c, (n) => n.tag === 'img')[0];
  assert.equal(img.getAttribute('alt'), 'Foto de Luis');
  assert.equal(img.getAttribute('loading'), 'lazy');
});

test('cada disciplina es una diapositiva accesible numerada', () => {
  const c = new FakeNode('div');
  renderDisciplinas(c, [
    { id: 'a', nombre: 'A', descripcion: 'd', icono: 'pesas' },
    { id: 'b', nombre: 'B', descripcion: 'd', icono: 'rayo' },
  ]);
  const slides = byClass(c, 'discipline');
  assert.equal(slides.length, 2);
  assert.equal(slides[0].getAttribute('role'), 'group');
  assert.equal(slides[0].getAttribute('aria-roledescription'), 'diapositiva');
  assert.equal(slides[0].getAttribute('aria-label'), '1 de 2');
  assert.equal(slides[1].getAttribute('aria-label'), '2 de 2');
  assert.equal(hasClass(slides[0], 'reveal'), false, 'las diapositivas no llevan .reveal (se revela el carrusel entero)');
});

test('planes y entrenadores se marcan para la inclinación 3D; las disciplinas no', () => {
  const c = new FakeNode('div');
  renderPlanes(c, [{ nombre: 'A', precio: '$1', periodo: '/ mes', destacado: false, beneficios: ['x'] }]);
  assert.ok(byClass(c, 'plan')[0].hasAttribute('data-tilt'));
  const e = new FakeNode('div');
  renderEntrenadores(e, [{ nombre: 'Ana', especialidad: 'Y', foto: null }]);
  assert.ok(byClass(e, 'coach')[0].hasAttribute('data-tilt'));
  const d = new FakeNode('div');
  renderDisciplinas(d, [{ id: 'a', nombre: 'A', descripcion: 'd', icono: 'pesas' }]);
  assert.equal(byClass(d, 'discipline')[0].hasAttribute('data-tilt'), false);
});

test('las tarjetas de disciplinas, días y planes llevan las esquinas HUD (decorativas)', () => {
  const d = new FakeNode('div');
  renderDisciplinas(d, [{ id: 'a', nombre: 'A', descripcion: 'd', icono: 'pesas' }]);
  const h = new FakeNode('div');
  renderHorarios(h, [{ dia: 'Lunes', turnos: [{ desde: '07:00', hasta: '12:00' }] }, { dia: 'Domingo', turnos: [] }]);
  const p = new FakeNode('div');
  renderPlanes(p, [{ nombre: 'A', precio: '$1', periodo: '/ mes', destacado: false, beneficios: ['x'] }]);
  for (const card of [...byClass(d, 'discipline'), ...byClass(h, 'day'), ...byClass(p, 'plan')]) {
    const huds = byClass(card, 'hud');
    assert.equal(huds.length, 1);
    assert.equal(huds[0].getAttribute('aria-hidden'), 'true');
  }
});

test('cada día lleva su nombre en data-dia (el estado "hoy" lo usa para resaltarlo)', () => {
  const h = new FakeNode('div');
  renderHorarios(h, [{ dia: 'Lunes', turnos: [] }, { dia: 'Miércoles', turnos: [] }]);
  assert.deepEqual(byClass(h, 'day').map((n) => n.getAttribute('data-dia')), ['Lunes', 'Miércoles']);
});
