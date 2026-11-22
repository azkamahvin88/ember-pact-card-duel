/* serve.ts — tiny static server for local testing of EMBER PACT.
 * Serves this repository on http://localhost:8080 (game/ at the root).
 * Node stdlib only; no network calls, no dependencies.
 */

import { createReadStream } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stat } from 'node:fs/promises';

const REPO_DIR = fileURLToPath(new URL('.', import.meta.url));
const PORT = 8080;

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

const server = createServer(async (req, res) => {
  try {
    const raw = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
    let rel = normalize(raw).replace(/^(\.\.[/\\])+/, '').replace(/^[/\\]/, '');
    if (rel === '') rel = 'game/index.html';
    const file = join(REPO_DIR, 'game', rel);
    if (!file.startsWith(join(REPO_DIR, 'game'))) {
      res.writeHead(403);
      res.end('forbidden');
      return;
    }
    const info = await stat(file).catch(() => null);
    if (!info || !info.isFile()) {
      res.writeHead(404);
      res.end('not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' });
    createReadStream(file).pipe(res);
  } catch {
    res.writeHead(500);
    res.end('error');
  }
});

server.listen(PORT, () => {
  console.log(`EMBER PACT: http://localhost:${PORT}/ (serving game/)`);
});
