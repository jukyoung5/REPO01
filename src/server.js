const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { createStore } = require('./todos');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
};

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(data === undefined ? '' : JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1e5) reject(new Error('body too large'));
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error('invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function serveStatic(req, res) {
  const urlPath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const filePath = path.normalize(path.join(PUBLIC_DIR, urlPath));
  if (!filePath.startsWith(PUBLIC_DIR)) return sendJson(res, 403, { error: 'forbidden' });

  fs.readFile(filePath, (err, content) => {
    if (err) return sendJson(res, 404, { error: 'not found' });
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    res.end(content);
  });
}

function createApp(store = createStore()) {
  return http.createServer(async (req, res) => {
    const { method } = req;
    const url = req.url.split('?')[0];
    const idMatch = url.match(/^\/api\/todos\/(\d+)$/);

    try {
      if (method === 'GET' && url === '/api/health') {
        return sendJson(res, 200, { status: 'ok', uptime: Math.round(process.uptime()) });
      }
      if (method === 'GET' && url === '/api/todos') {
        return sendJson(res, 200, store.list());
      }
      if (method === 'POST' && url === '/api/todos') {
        const body = await readBody(req);
        return sendJson(res, 201, store.add(body.title));
      }
      if (method === 'PATCH' && idMatch) {
        const todo = store.toggle(idMatch[1]);
        return todo ? sendJson(res, 200, todo) : sendJson(res, 404, { error: 'not found' });
      }
      if (method === 'DELETE' && idMatch) {
        return store.remove(idMatch[1]) ? sendJson(res, 204) : sendJson(res, 404, { error: 'not found' });
      }
      if (method === 'GET' && !url.startsWith('/api/')) {
        return serveStatic(req, res);
      }
      return sendJson(res, 404, { error: 'not found' });
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  createApp().listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

module.exports = { createApp };
