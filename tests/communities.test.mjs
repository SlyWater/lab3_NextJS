import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const directory = await mkdtemp(path.join(tmpdir(), 'lab3-test-'));
const file = path.join(directory, 'communities.json');
process.env.COMMUNITIES_FILE = file;
const previousVercel = process.env.VERCEL;
delete process.env.VERCEL;
const { addCommunity, listCommunities } = await import('../lib/communities.mjs');
const { default: handler } = await import('../pages/api/communities.js');

before(() => writeFile(file, '[]'));
after(async () => {
  if (previousVercel !== undefined) process.env.VERCEL = previousVercel;
  delete process.env.COMMUNITIES_FILE;
  await rm(directory, { recursive: true });
});

test('одновременное создание сохраняет все сообщества в JSON и разделяет пользователей', async () => {
  await Promise.all(Array.from({ length: 10 }, (_, i) => addCommunity({
    id: String(i), name: 'Сообщество ' + i, members: [i % 2 ? 'Николаев' : 'Куликовский']
  })));
  const saved = JSON.parse(await readFile(file, 'utf8'));
  assert.equal(saved.length, 10);
  assert.equal(new Set(saved.map(item => item.id)).size, 10);
  assert.equal((await listCommunities('Куликовский')).length, 5);
  assert.equal((await listCommunities('Николаев')).length, 5);
  assert.deepEqual(await listCommunities('Другой'), []);
});

test('повреждённый JSON не перезаписывается пустым списком', async () => {
  await writeFile(file, '{broken');
  await assert.rejects(addCommunity({ id: 'new', members: ['Автор'] }));
  assert.equal(await readFile(file, 'utf8'), '{broken');
  await writeFile(file, '[]');
});

function response() {
  return { headers: {}, statusCode: 200,
    setHeader(key, value) { this.headers[key] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
}

test('API отклоняет незаполненную форму и неподдерживаемый метод', async () => {
  const invalid = response();
  await handler({ method: 'POST', body: { user: 'Автор' } }, invalid);
  assert.equal(invalid.statusCode, 400);
  assert.equal(await readFile(file, 'utf8'), '[]');
  const unsupported = response();
  await handler({ method: 'DELETE' }, unsupported);
  assert.equal(unsupported.statusCode, 405);
  assert.equal(unsupported.headers.Allow, 'GET, POST');
});

test('API сохраняет поля, аватарку и членство создателя в JSON', async () => {
  const created = response();
  const avatar = 'data:image/png;base64,aGVsbG8=';
  await handler({ method: 'POST', body: {
    user: ' Автор ', name: ' Название ', description: ' Описание ', avatar
  } }, created);
  assert.equal(created.statusCode, 201);
  const saved = JSON.parse(await readFile(file, 'utf8'));
  assert.equal(saved.length, 1);
  assert.equal(saved[0].name, 'Название');
  assert.equal(saved[0].description, 'Описание');
  assert.equal(saved[0].avatar, avatar);
  assert.deepEqual(saved[0].members, ['Автор']);
  const other = response();
  await handler({ method: 'GET', query: { user: 'Другой' } }, other);
  assert.deepEqual(other.body, []);
  const own = response();
  await handler({ method: 'GET', query: { user: 'Автор' } }, own);
  assert.equal(own.body[0].id, created.body.id);
  assert.equal(own.headers['Cache-Control'], 'no-store');
});
