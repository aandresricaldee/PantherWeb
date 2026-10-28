import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![0-9a-zA-Z_-])/g;
const FUNC = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color-mix)\(/g;
const ALLOWED_FILE = 'css/tokens.css';

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) yield* walk(full);
    else yield full;
  }
}

function collectFiles(root) {
  const files = [];
  for (const sub of ['css', 'js']) {
    const dir = join(root, sub);
    if (existsSync(dir)) files.push(...walk(dir));
  }
  const html = join(root, 'index.html');
  if (existsSync(html)) files.push(html);
  return files;
}

export function findRawColors(root) {
  const found = [];
  for (const full of collectFiles(root)) {
    const file = relative(root, full).split(sep).join('/');
    if (file === ALLOWED_FILE) continue;
    readFileSync(full, 'utf8').split('\n').forEach((text, index) => {
      for (const regex of [HEX, FUNC]) {
        for (const m of text.matchAll(regex)) {
          found.push({ file, line: index + 1, match: m[0] });
        }
      }
    });
  }
  return found;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const found = findRawColors(root);
  for (const f of found) console.error(`${f.file}:${f.line}  color crudo "${f.match}" (usar var(--color-*))`);
  if (found.length) process.exit(1);
  console.log('OK: sin colores crudos fuera de css/tokens.css');
}
