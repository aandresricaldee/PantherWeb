import test from 'node:test';
import assert from 'node:assert/strict';
import { whatsappUrl, initWhatsapp } from '../js/whatsapp.js';

test('arma el enlace de wa.me con número y mensaje codificado', () => {
  assert.equal(
    whatsappUrl('5491122334455', 'Hola, ¿qué precios tienen?'),
    'https://wa.me/5491122334455?text=Hola%2C%20%C2%BFqu%C3%A9%20precios%20tienen%3F',
  );
});

test('limpia símbolos, espacios y guiones del número', () => {
  assert.equal(whatsappUrl('+54 9 11 2233-4455'), 'https://wa.me/5491122334455');
  assert.equal(whatsappUrl('(54) 911-2233.4455', ''), 'https://wa.me/5491122334455');
});

test('sin número válido devuelve cadena vacía', () => {
  assert.equal(whatsappUrl(''), '');
  assert.equal(whatsappUrl('abc'), '');
  assert.equal(whatsappUrl(undefined), '');
});

test('initWhatsapp actualiza el href de todos los [data-whatsapp]', () => {
  const links = [{ href: '#contacto' }, { href: '#contacto' }];
  const root = {
    querySelectorAll: () => links.map((l) => ({ setAttribute: (k, v) => { l[k] = v; } })),
  };
  initWhatsapp({ numero: '5491122334455', mensaje: 'Hola' }, root);
  assert.deepEqual(links.map((l) => l.href), ['https://wa.me/5491122334455?text=Hola', 'https://wa.me/5491122334455?text=Hola']);
});

test('initWhatsapp conserva el href original si el número es inválido', () => {
  const links = [{ href: '#contacto' }];
  const root = {
    querySelectorAll: () => links.map((l) => ({ setAttribute: (k, v) => { l[k] = v; } })),
  };
  initWhatsapp({ numero: '', mensaje: 'Hola' }, root);
  assert.equal(links[0].href, '#contacto');
});
