import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { resolveRequestPath, mimeFor } from '../scripts/serve.mjs';

const root = resolve('/proyecto');

test('resolveRequestPath: la raíz sirve index.html', () => {
  assert.equal(resolveRequestPath(root, '/'), resolve(root, 'index.html'));
  assert.equal(resolveRequestPath(root, ''), resolve(root, 'index.html'));
});

test('resolveRequestPath: ignora la query y decodifica el nombre', () => {
  assert.equal(resolveRequestPath(root, '/css/base.css?v=2'), resolve(root, 'css/base.css'));
  assert.equal(resolveRequestPath(root, '/panther%20V2.zip'), resolve(root, 'panther V2.zip'));
});

test('resolveRequestPath: no permite salir de la carpeta del proyecto', () => {
  assert.equal(resolveRequestPath(root, '/../secreto.txt'), null);
  assert.equal(resolveRequestPath(root, '/css/../../secreto.txt'), null);
  assert.equal(resolveRequestPath(root, '/%2e%2e/secreto.txt'), null);
});

test('resolveRequestPath: una ruta mal codificada no rompe', () => {
  assert.equal(resolveRequestPath(root, '/%E0%A4%A'), null);
});

test('mimeFor: tipos que necesita el sitio (los módulos JS deben ser text/javascript)', () => {
  assert.match(mimeFor('a.js'), /^text\/javascript/);
  assert.match(mimeFor('a.css'), /^text\/css/);
  assert.match(mimeFor('a.html'), /^text\/html/);
  assert.equal(mimeFor('a.woff2'), 'font/woff2');
  assert.equal(mimeFor('a.webp'), 'image/webp');
  assert.equal(mimeFor('a.png'), 'image/png');
  assert.equal(mimeFor('a.desconocido'), 'application/octet-stream');
});
