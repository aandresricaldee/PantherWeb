// Servidor estático para desarrollo, sin dependencias: `npm run serve` (puerto 5173; cambiar con --port 8080).
// Reemplaza a `python -m http.server`, que rechaza conexiones cuando el navegador pide muchos archivos a la vez.
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.zip': 'application/zip',
};

export const mimeFor = (file) => MIME[extname(file).toLowerCase()] ?? 'application/octet-stream';

/** Ruta de archivo para una URL, o null si intenta salir de `root` o está mal codificada. */
export function resolveRequestPath(root, urlPath) {
  let pathname;
  try {
    pathname = decodeURIComponent(String(urlPath).split('?')[0].split('#')[0]);
  } catch {
    return null;
  }
  const relative = normalize(pathname.replace(/^[/\\]+/, '')) || 'index.html';
  const full = resolve(join(root, relative === '.' ? 'index.html' : relative));
  const base = resolve(root);
  if (full !== base && !full.startsWith(base + sep)) return null;
  return full === base ? join(base, 'index.html') : full;
}

export function createStaticServer(root) {
  return createServer((req, res) => {
    const file = resolveRequestPath(root, req.url ?? '/');
    if (!file) { res.writeHead(403).end('Prohibido'); return; }
    let target = file;
    if (existsSync(target) && statSync(target).isDirectory()) target = join(target, 'index.html');
    if (!existsSync(target)) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('No encontrado'); return; }
    res.writeHead(200, { 'Content-Type': mimeFor(target), 'Cache-Control': 'no-cache' });
    createReadStream(target).pipe(res);
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const flag = process.argv.indexOf('--port');
  const port = flag > -1 ? Number(process.argv[flag + 1]) : 5173;
  createStaticServer(root).listen(port, () => console.log(`Sitio en http://localhost:${port}/  (Ctrl+C para detener)`));
}
