import test from 'node:test';
import assert from 'node:assert/strict';
import { splitWords } from '../js/fx/text.js';

test('splitWords conserva el texto original al unir los tokens', () => {
  for (const s of ['Sacá la pantera', '  dos   espacios ', 'que llevás dentro.', 'una', '']) {
    assert.equal(splitWords(s).join(''), s);
  }
});

test('splitWords separa palabras y espacios en tokens distintos', () => {
  assert.deepEqual(splitWords('Sacá la pantera'), ['Sacá', ' ', 'la', ' ', 'pantera']);
});

test('splitWords deja la puntuación pegada a la palabra', () => {
  assert.deepEqual(splitWords('dentro.'), ['dentro.']);
  assert.deepEqual(splitWords('¿Listo? Sí'), ['¿Listo?', ' ', 'Sí']);
});

test('splitWords con texto vacío no devuelve tokens', () => {
  assert.deepEqual(splitWords(''), []);
});
