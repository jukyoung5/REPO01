const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const summary = document.getElementById('summary');

async function api(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.status === 204 ? null : res.json();
}

function render(todos) {
  list.innerHTML = '';
  for (const todo of todos) {
    const li = document.createElement('li');
    li.className = todo.done ? 'done' : '';

    const text = document.createElement('span');
    text.textContent = todo.title;
    text.addEventListener('click', () => api('PATCH', `/api/todos/${todo.id}`).then(load));

    const del = document.createElement('button');
    del.textContent = '삭제';
    del.addEventListener('click', () => api('DELETE', `/api/todos/${todo.id}`).then(load));

    li.append(text, del);
    list.append(li);
  }
  const remaining = todos.filter((t) => !t.done).length;
  summary.textContent = `전체 ${todos.length}개 · 남은 일 ${remaining}개`;
}

async function load() {
  render(await api('GET', '/api/todos'));
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await api('POST', '/api/todos', { title: input.value });
    input.value = '';
    await load();
  } catch (err) {
    alert(err.message);
  }
});

load();
