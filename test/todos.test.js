const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createStore } = require('../src/todos');

test('add creates a todo with incrementing id', () => {
  const store = createStore();
  assert.deepEqual(store.add('first'), { id: 1, title: 'first', done: false });
  assert.equal(store.add('second').id, 2);
  assert.equal(store.list().length, 2);
});

test('add trims and rejects empty titles', () => {
  const store = createStore();
  assert.equal(store.add('  hello  ').title, 'hello');
  assert.throws(() => store.add('   '), /required/);
  assert.throws(() => store.add(undefined), /required/);
});

test('toggle flips done and returns null for unknown id', () => {
  const store = createStore();
  const { id } = store.add('task');
  assert.equal(store.toggle(id).done, true);
  assert.equal(store.toggle(id).done, false);
  assert.equal(store.toggle(999), null);
});

test('remove deletes a todo', () => {
  const store = createStore();
  const { id } = store.add('task');
  assert.equal(store.remove(id), true);
  assert.equal(store.remove(id), false);
  assert.equal(store.list().length, 0);
});
