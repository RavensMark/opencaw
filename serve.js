// FOR LOCAL DEVELOPMENT ONLY
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.csv': 'text/csv; charset=utf-8',
};

function resolvePath(urlPath) {
  const clean = decodeURIComponent((urlPath.split('?')[0] || '/').replace(/\/+$/, '') || '/');
  if (clean === '/') return path.join(root, 'index.html');
  if (clean === '/dm' || clean.startsWith('/dm/')) return path.join(root, 'index.html');
  const direct = path.join(root, clean.slice(1));
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
  const index = path.join(root, clean.slice(1), 'index.html');
  if (fs.existsSync(index) && fs.statSync(index).isFile()) return index;
  const fallback = path.join(root, '404.html');
  if (fs.existsSync(fallback)) return fallback;
  return null;
}

http.createServer((req, res) => {
  const target = resolvePath(req.url || '/');
  if (!target) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }
  fs.readFile(target, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(8000, () => {
  console.log('Serving at http://127.0.0.1:8000/');
});
