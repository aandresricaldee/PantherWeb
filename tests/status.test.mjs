import test from 'node:test';
import assert from 'node:assert/strict';
import { zonedNow, openStatus, statusText } from '../js/status.js';

const TURNOS = [{ desde: '07:00', hasta: '12:00' }, { desde: '16:00', hasta: '22:00' }];
const horarios = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map((dia) => ({ dia, turnos: TURNOS }));

test('zonedNow: da el día y los minutos en la zona horaria del club (no la de quien mira)', () => {
  const tz = 'America/Argentina/Buenos_Aires'; // UTC-3
  assert.deepEqual(zonedNow(new Date('2026-10-27T13:00:00Z'), tz), { dia: 'Martes', minutes: 600 });
  assert.deepEqual(zonedNow(new Date('2026-10-31T15:00:00Z'), tz), { dia: 'Sábado', minutes: 720 });
  assert.deepEqual(zonedNow(new Date('2026-11-01T15:00:00Z'), tz), { dia: 'Domingo', minutes: 720 });
});

test('zonedNow: pasada la medianoche UTC todavía es el día anterior en Argentina', () => {
  assert.deepEqual(zonedNow(new Date('2026-10-28T01:30:00Z'), 'America/Argentina/Buenos_Aires'), { dia: 'Martes', minutes: 22 * 60 + 30 });
});

test('openStatus: dentro de un turno está abierto y dice cuándo cierra', () => {
  assert.deepEqual(openStatus(horarios, { dia: 'Martes', minutes: 600 }), { open: true, closesAt: '12:00' });
  assert.deepEqual(openStatus(horarios, { dia: 'Martes', minutes: 7 * 60 }), { open: true, closesAt: '12:00' });
  assert.deepEqual(openStatus(horarios, { dia: 'Martes', minutes: 21 * 60 + 59 }), { open: true, closesAt: '22:00' });
});

test('openStatus: la hora de cierre ya está cerrada (el fin del turno no cuenta)', () => {
  assert.equal(openStatus(horarios, { dia: 'Martes', minutes: 12 * 60 }).open, false);
  assert.equal(openStatus(horarios, { dia: 'Martes', minutes: 22 * 60 }).open, false);
});

test('openStatus: entre turnos abre hoy más tarde', () => {
  assert.deepEqual(openStatus(horarios, { dia: 'Martes', minutes: 13 * 60 }), { open: false, next: { when: 'today', hora: '16:00' } });
  assert.deepEqual(openStatus(horarios, { dia: 'Martes', minutes: 6 * 60 }), { open: false, next: { when: 'today', hora: '07:00' } });
});

test('openStatus: de noche abre mañana; el viernes a la noche, el lunes', () => {
  assert.deepEqual(openStatus(horarios, { dia: 'Martes', minutes: 23 * 60 }), { open: false, next: { when: 'tomorrow', dia: 'Miércoles', hora: '07:00' } });
  assert.deepEqual(openStatus(horarios, { dia: 'Viernes', minutes: 23 * 60 }), { open: false, next: { when: 'day', dia: 'Lunes', hora: '07:00' } });
});

test('openStatus: fin de semana cerrado; el domingo abre mañana', () => {
  assert.deepEqual(openStatus(horarios, { dia: 'Sábado', minutes: 600 }), { open: false, next: { when: 'day', dia: 'Lunes', hora: '07:00' } });
  assert.deepEqual(openStatus(horarios, { dia: 'Domingo', minutes: 600 }), { open: false, next: { when: 'tomorrow', dia: 'Lunes', hora: '07:00' } });
});

test('openStatus: turnos desordenados y sin horarios no rompen', () => {
  const desordenado = [{ dia: 'Martes', turnos: [{ desde: '16:00', hasta: '22:00' }, { desde: '07:00', hasta: '12:00' }] }];
  assert.deepEqual(openStatus(desordenado, { dia: 'Martes', minutes: 13 * 60 }), { open: false, next: { when: 'today', hora: '16:00' } });
  assert.deepEqual(openStatus([], { dia: 'Martes', minutes: 600 }), { open: false, next: null });
});

test('statusText: textos para cada caso', () => {
  assert.equal(statusText({ open: true, closesAt: '12:00' }), 'Abierto ahora · cierra 12:00');
  assert.equal(statusText({ open: false, next: { when: 'today', hora: '16:00' } }), 'Cerrado · abre hoy a las 16:00');
  assert.equal(statusText({ open: false, next: { when: 'tomorrow', dia: 'Miércoles', hora: '07:00' } }), 'Cerrado · abre mañana a las 07:00');
  assert.equal(statusText({ open: false, next: { when: 'day', dia: 'Lunes', hora: '07:00' } }), 'Cerrado · abre el lunes a las 07:00');
  assert.equal(statusText({ open: false, next: null }), 'Cerrado');
});
