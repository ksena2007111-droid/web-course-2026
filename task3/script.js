
let todos = [];
let currentFilter = 'all';
let nextId = 1;

const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const warning = document.getElementById('warning');
const list = document.getElementById('todo-list');
const counter = document.getElementById('counter');
const filterButtons = document.querySelectorAll('.filter-btn');
const doneCheckbox = document.getElementById('todo-done');


form.addEventListener('submit', (event) => {
  event.preventDefault();

  const text = input.value.trim();

  if (text === '') {
    warning.hidden = false;
    return;
  }

  warning.hidden = true;

  todos.push({
    id: nextId,
    text: text,
    completed: doneCheckbox.checked
  });

  nextId += 1;
  input.value = '';
  doneCheckbox.checked = false;
  render();
});

input.addEventListener('input', () => {
  if (!warning.hidden) {
    warning.hidden = true;
  }
});

filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;

    filterButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    render();
  });
});

function getFilteredTodos() {
  return todos.filter((todo) => {
    if (currentFilter === 'active') return !todo.completed;
    if (currentFilter === 'completed') return todo.completed;
    return true;
  });
}

function createTodoElement(todo) {
  const li = document.createElement('li');
  li.className = 'todo-item' + (todo.completed ? ' completed' : '');

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'todo-checkbox';
  checkbox.checked = todo.completed;
  checkbox.addEventListener('change', () => toggleTodo(todo.id));

  const span = document.createElement('span');
  span.className = 'todo-text';
  span.textContent = todo.text;

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'btn-delete';
  deleteBtn.textContent = '✕';
  deleteBtn.setAttribute('aria-label', 'Удалить задачу');
  deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(deleteBtn);

  return li;
}

function toggleTodo(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  render();
}

function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  render();
}

function updateCounter() {
  const activeCount = todos.filter((todo) => !todo.completed).length;
  const completedCount = todos.filter((todo) => todo.completed).length;
  counter.textContent = `Осталось: ${activeCount}, Выполнено: ${completedCount}`;
}

function render() {
  list.innerHTML = '';

  const filtered = getFilteredTodos();

  if (filtered.length === 0) {
    const emptyMessage = document.createElement('li');
    emptyMessage.className = 'empty-message';
    emptyMessage.textContent = 'Задач пока нет';
    list.appendChild(emptyMessage);
  } else {
    filtered.forEach((todo) => {
      list.appendChild(createTodoElement(todo));
    });
  }

  updateCounter();
}

render();
