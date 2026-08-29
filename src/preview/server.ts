import * as http from 'node:http';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

/**
 * D15 — preview is a real local server opened in the user's real browser,
 * not a webview iframe. A webview iframe inherits the parent CSP, which would
 * mean permanently loosening our own policy to render arbitrary generated HTML.
 *
 * Security posture: binds 127.0.0.1 only (never 0.0.0.0), refuses traversal
 * above the site root, sets no CORS headers, and is off until asked.
 */

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2'
};

/** Injected into the response only. Never written to disk — the files on disk
 *  stay byte-identical to what ships. */
const RELOAD_SNIPPET = `
<script>
(function () {
  var since = 0;
  setInterval(function () {
    fetch('/__pw_changed').then(function (r) { return r.json(); }).then(function (d) {
      if (since && d.v !== since) location.reload();
      since = d.v;
    }).catch(function () {});
  }, 700);
})();
</script>`;

export class PreviewServer {
  private server: http.Server | null = null;
  private version = Date.now();
  public port = 0;
  public root = '';

  get running(): boolean { return this.server !== null; }

  /** Bump after a recompose so open browser tabs reload. */
  touch(): void { this.version = Date.now(); }

  async start(root: string, firstPort: number): Promise<number> {
    if (this.server) await this.stop();
    this.root = root;

    this.server = http.createServer((req, res) => { void this.handle(req, res); });

    for (let port = firstPort; port < firstPort + 11; port++) {
      try {
        await this.listen(port);
        this.port = port;
        return port;
      } catch (err: any) {
        if (err && err.code === 'EADDRINUSE') continue;
        throw err;
      }
    }
    this.server = null;
    throw new Error(`No free port in ${firstPort}-${firstPort + 10}. Set promptToWebsite.previewPort.`);
  }

  private listen(port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const s = this.server!;
      const onError = (e: Error) => { s.removeListener('listening', onListening); reject(e); };
      const onListening = () => { s.removeListener('error', onError); resolve(); };
      s.once('error', onError);
      s.once('listening', onListening);
      s.listen(port, '127.0.0.1');
    });
  }

  private async handle(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const url = (req.url || '/').split('?')[0];

    if (url === '/__pw_changed') {
      res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
      res.end(JSON.stringify({ v: this.version }));
      return;
    }

    const rel = decodeURIComponent(url === '/' ? '/index.html' : url);
    const target = path.resolve(this.root, '.' + rel);

    // Refuse anything resolving outside the site root.
    const rootResolved = path.resolve(this.root);
    if (target !== rootResolved && !target.startsWith(rootResolved + path.sep)) {
      res.writeHead(403, { 'content-type': 'text/plain' });
      res.end('Forbidden');
      return;
    }

    try {
      const body = await fs.readFile(target);
      const ext = path.extname(target).toLowerCase();
      const type = MIME[ext] || 'application/octet-stream';
      if (ext === '.html') {
        const withReload = body.toString('utf8').replace('</body>', RELOAD_SNIPPET + '\n</body>');
        res.writeHead(200, { 'content-type': type, 'cache-control': 'no-store' });
        res.end(withReload);
      } else {
        res.writeHead(200, { 'content-type': type, 'cache-control': 'no-store' });
        res.end(body);
      }
    } catch {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('Not found: ' + rel);
    }
  }

  async stop(): Promise<void> {
    const s = this.server;
    if (!s) return;
    this.server = null;
    this.port = 0;
    await new Promise<void>((resolve) => s.close(() => resolve()));
  }
}
