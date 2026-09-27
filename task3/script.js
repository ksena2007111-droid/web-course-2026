// ===== Состояние приложения =====
let todos = [];
let currentFilter = 'all';
let nextId = 1;

// ===== Ссылки на DOM-элементы =====
const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const warning = document.getElementById('warning');
const list = document.getElementById('todo-list');
const counter = document.getElementById('counter');
const filterButtons = document.querySelectorAll('.filter-btn');

// ===== Добавление задачи =====
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
    completed: false
  });

  nextId += 1;
  input.value = '';
  render();
});

// Скрыть предупреждение, как только начали печатать заново
input.addEventListener('input', () => {
  if (!warning.hidden) {
    warning.hidden = true;
  }
});

// ===== Переключение фильтров =====
filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;

    filterButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    render();
  });
});

// ===== Получить задачи по текущему фильтру =====
function getFilteredTodos() {
  return todos.filter((todo) => {
    if (currentFilter === 'active') return !todo.completed;
    if (currentFilter === 'completed') return todo.completed;
    return true;
  });
}

// ===== Создать DOM-элемент одной задачи =====
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

// ===== Переключить статус выполнения =====
function toggleTodo(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  render();
}

// ===== Удалить задачу =====
function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  render();
}

// ===== Обновить счётчик =====
function updateCounter() {
  const activeCount = todos.filter((todo) => !todo.completed).length;
  const completedCount = todos.filter((todo) => todo.completed).length;
  counter.textContent = `Осталось: ${activeCount}, Выполнено: ${completedCount}`;
}

// ===== Главная функция отрисовки =====
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

// ===== Первый рендер при загрузке =====
render();
