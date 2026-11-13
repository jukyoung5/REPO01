// 메모리 기반 Todo 저장소 (테스트하기 쉽게 서버와 분리)
function createStore() {
  let nextId = 1;
  const items = new Map();

  return {
    list() {
      return [...items.values()];
    },
    add(title) {
      const text = typeof title === 'string' ? title.trim() : '';
      if (!text) throw new Error('title is required');
      if (text.length > 200) throw new Error('title is too long');
      const todo = { id: nextId++, title: text, done: false };
      items.set(todo.id, todo);
      return todo;
    },
    toggle(id) {
      const todo = items.get(Number(id));
      if (!todo) return null;
      todo.done = !todo.done;
      return todo;
    },
    remove(id) {
      return items.delete(Number(id));
    },
  };
}

module.exports = { createStore };
