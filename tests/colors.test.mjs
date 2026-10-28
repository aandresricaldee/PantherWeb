import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findRawColors } from '../scripts/check-colors.mjs';

function project(files) {
  const root = mkdtempSync(join(tmpdir(), 'panther-'));
  for (const [path, content] of Object.entries(files)) {
    const full = join(root, path);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, content);
  }
  return root;
}

test('permite colores crudos solo en css/tokens.css', () => {
  const root = project({ 'css/tokens.css': ':root{--color-bg:#0B0B0D;--x:rgb(1,2,3)}' });
  assert.deepEqual(findRawColors(root), []);
});

test('detecta hex en otros archivos css', () => {
  const root = project({ 'css/sections.css': '.a{\n  color: #fff;\n}' });
  const found = findRawColors(root);
  assert.equal(found.length, 1);
  assert.equal(found[0].file, 'css/sections.css');
  assert.equal(found[0].line, 2);
  assert.equal(found[0].match, '#fff');
});

test('detecta funciones de color en css, js y html', () => {
  const root = project({
    'css/base.css': '.a{background:hsl(10 20% 30%)}',
    'js/x.js': "el.style.color = 'rgba(0,0,0,.5)';",
    'index.html': '<div style="color:rgb(1,2,3)"></div>',
  });
  assert.equal(findRawColors(root).length, 3);
});

test('no marca var(), anclas ni palabras clave', () => {
  const root = project({
    'css/base.css': '.a{color:var(--color-fg);background:transparent;border-color:currentColor}',
    'index.html': '<a href="#planes">Planes</a><a href="#contacto">x</a>',
    'js/x.js': "document.querySelector('#site-nav');",
  });
  assert.deepEqual(findRawColors(root), []);
});

test('el proyecto real no tiene colores crudos fuera de tokens.css', () => {
  const root = fileURLToPath(new URL('..', import.meta.url));
  assert.deepEqual(findRawColors(root), []);
});
