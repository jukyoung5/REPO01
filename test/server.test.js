const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../src/server');

let server;
let base;

before(async () => {
  server = createApp();
  await new Promise((resolve) => server.listen(0, resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => new Promise((resolve) => server.close(resolve)));

test('GET /api/health returns ok', async () => {
  const res = await fetch(`${base}/api/health`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, 'ok');
  assert.equal(typeof body.uptime, 'number');
  assert.ok(body.uptime >= 0);
});

test('todo CRUD flow', async () => {
  let res = await fetch(`${base}/api/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'write tests' }),
  });
  assert.equal(res.status, 201);
  const created = await res.json();
  assert.equal(created.title, 'write tests');

  res = await fetch(`${base}/api/todos/${created.id}`, { method: 'PATCH' });
  assert.equal((await res.json()).done, true);

  res = await fetch(`${base}/api/todos`);
  assert.equal((await res.json()).length, 1);

  res = await fetch(`${base}/api/todos/${created.id}`, { method: 'DELETE' });
  assert.equal(res.status, 204);
});

test('POST with empty title returns 400', async () => {
  const res = await fetch(`${base}/api/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: '' }),
  });
  assert.equal(res.status, 400);
});

test('GET / serves the HTML page', async () => {
  const res = await fetch(`${base}/`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /text\/html/);
});
