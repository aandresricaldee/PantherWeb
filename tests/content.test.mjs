import test from 'node:test';
import assert from 'node:assert/strict';
import { content } from '../js/content.js';
import { ICON_NAMES } from '../js/render.js';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const HORA = /^\d{2}:\d{2}$/;

test('las disciplinas tienen ids únicos, textos e íconos válidos', () => {
  const ids = content.disciplinas.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const s of content.disciplinas) {
    assert.ok(s.nombre && s.descripcion, `disciplina ${s.id} sin texto`);
    assert.ok(ICON_NAMES.includes(s.icono), `ícono desconocido: ${s.icono}`);
  }
});

test('los horarios usan días válidos, sin repetir, con turnos bien formados', () => {
  const dias = content.horarios.map((h) => h.dia);
  assert.deepEqual(dias, DIAS.filter((d) => dias.includes(d)), 'días fuera de orden o inválidos');
  assert.equal(new Set(dias).size, dias.length);
  for (const h of content.horarios) {
    for (const t of h.turnos) {
      assert.match(t.desde, HORA);
      assert.match(t.hasta, HORA);
      assert.ok(t.desde < t.hasta, `${h.dia}: ${t.desde} debe ser anterior a ${t.hasta}`);
    }
  }
});

test('hay exactamente un plan destacado y todos tienen beneficios', () => {
  assert.equal(content.planes.filter((p) => p.destacado).length, 1);
  for (const p of content.planes) {
    assert.ok(p.nombre && p.precio && p.periodo);
    assert.ok(p.beneficios.length > 0);
  }
});

test('los entrenadores tienen nombre y especialidad', () => {
  for (const e of content.entrenadores) assert.ok(e.nombre && e.especialidad);
});

test('la configuración de WhatsApp tiene número (solo dígitos) y mensaje', () => {
  assert.match(content.whatsapp.numero, /^\d{8,15}$/);
  assert.ok(content.whatsapp.mensaje.length > 0);
});

test('los horarios cubren solo de lunes a viernes, todos con turnos', () => {
  assert.deepEqual(content.horarios.map((h) => h.dia), ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']);
  for (const h of content.horarios) assert.ok(h.turnos.length > 0, `${h.dia} sin turnos`);
});

test('hay 5 entrenadores', () => {
  assert.equal(content.entrenadores.length, 5);
});

test('hay 4 planes', () => {
  assert.equal(content.planes.length, 4);
});

test('la zona horaria del club es válida', () => {
  assert.ok(content.zona && typeof content.zona === 'string');
  assert.doesNotThrow(() => new Intl.DateTimeFormat('es', { timeZone: content.zona }));
});
