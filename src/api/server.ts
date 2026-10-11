/**
 * Reference HTTP server: JSON API under /api/v1 plus the built web UI (web/dist) at /.
 * No dependencies beyond Node. Binds to 127.0.0.1 by default; set HOST/PORT to change.
 * Take Australian legal advice before offering a hosted service to the public.
 */
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handle } from './handlers.js';

const MAX_BODY = 1_000_000;
const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

function securityHeaders(res: ServerResponse): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Frame-Options', 'DENY');
}

async function readBody(req: IncomingMessage): Promise<string> {
  let size = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > MAX_BODY) throw new Error('BODY_TOO_LARGE');
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString('utf8');
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  securityHeaders(res);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body, null, 2));
}

export function createApp(staticDir?: string): Server {
  const root = staticDir ? resolve(staticDir) : undefined;
  return createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? '/', 'http://localhost');
      const corsOrigin = process.env.CORS_ORIGIN;
      if (corsOrigin) {
        res.setHeader('Access-Control-Allow-Origin', corsOrigin);
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      }
      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }
      if (url.pathname.startsWith('/api/')) {
        let body: unknown;
        if (req.method === 'POST') {
          const ct = req.headers['content-type'] ?? '';
          if (!ct.includes('application/json')) return sendJson(res, 415, { error: 'Content-Type must be application/json' });
          let text: string;
          try {
            text = await readBody(req);
          } catch {
            return sendJson(res, 413, { error: 'request body too large' });
          }
          try {
            body = text.length ? JSON.parse(text) : {};
          } catch {
            return sendJson(res, 400, { error: 'request body is not valid JSON' });
          }
        }
        const out = handle({ method: req.method ?? 'GET', path: url.pathname, query: url.searchParams, body, now: () => new Date() });
        return sendJson(res, out.status, out.body);
      }
      if (!root || (req.method !== 'GET' && req.method !== 'HEAD')) return sendJson(res, 404, { error: 'not found' });
      // Static files, confined to the static root.
      const rel = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, '');
      let file = resolve(join(root, rel || 'index.html'));
      if (file !== root && !file.startsWith(root + sep)) return sendJson(res, 403, { error: 'forbidden' });
      let info = await stat(file).catch(() => null);
      if (info?.isDirectory()) {
        file = join(file, 'index.html');
        info = await stat(file).catch(() => null);
      }
      if (!info) {
        file = join(root, 'index.html'); // single-page app fallback
        info = await stat(file).catch(() => null);
        if (!info) return sendJson(res, 404, { error: 'not found' });
      }
      const data = await readFile(file);
      securityHeaders(res);
      res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
      res.end(req.method === 'HEAD' ? undefined : data);
    } catch (e) {
      sendJson(res, 500, { error: 'internal error', detail: e instanceof Error ? e.message : String(e) });
    }
  });
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const port = Number(process.env.PORT ?? 8787);
  const host = process.env.HOST ?? '127.0.0.1';
  const staticDir = process.env.STATIC_DIR ?? fileURLToPath(new URL('../../web/dist', import.meta.url));
  createApp(staticDir).listen(port, host, () => {
    console.log(`au-advice-calc-engine listening on http://${host}:${port} (API: /api/v1, UI: /)`);
  });
}
