const STORAGE_KEY = 'small-wins.tasks.v1';

const taskList = document.querySelector('#task-list');
const emptyState = document.querySelector('#empty-state');
const emptyTitle = document.querySelector('#empty-title');
const emptyCopy = document.querySelector('#empty-copy');
const emptyAction = document.querySelector('#empty-action');
const taskInput = document.querySelector('#task-input');
const addForm = document.querySelector('#add-form');
const clearCompletedButton = document.querySelector('#clear-completed');
const saveButton = document.querySelector('#save-button');
const footerMessage = document.querySelector('#footer-message');
const listHint = document.querySelector('#list-hint');
const progressLabel = document.querySelector('#progress-label');
const progressCount = document.querySelector('#progress-count');
const progressBar = document.querySelector('#progress-bar');
const todayLabel = document.querySelector('#today-label');
const filterTabs = [...document.querySelectorAll('.filter-tab')];
const allCount = document.querySelector('#all-count');
const activeCount = document.querySelector('#active-count');
const completedCount = document.querySelector('#completed-count');

let tasks = loadTasks();
let currentFilter = 'all';
let lastAddedId = null;
let lastCompletedId = null;
let saveTimeoutId = null;

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadTasks() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((task) => task && typeof task.text === 'string' && typeof task.id === 'string')
      .map((task) => ({
        id: task.id,
        text: task.text.slice(0, 120),
        completed: Boolean(task.completed),
      }));
  } catch (error) {
    console.warn('Small Wins could not read saved tasks.', error);
    return [];
  }
}

function saveTasks() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.warn('Small Wins could not save tasks.', error);
  }
}

function getCounts() {
  return {
    all: tasks.length,
    active: tasks.filter((task) => !task.completed).length,
    completed: tasks.filter((task) => task.completed).length,
  };
}

function getVisibleTasks() {
  if (currentFilter === 'active') return tasks.filter((task) => !task.completed);
  if (currentFilter === 'completed') return tasks.filter((task) => task.completed);
  return tasks;
}

function getDeleteIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 7h14"></path>
      <path d="M9 7V5.5h6V7"></path>
      <path d="M7.5 7l.8 11.5h7.4L16.5 7"></path>
      <path d="M10.5 10.5v5"></path>
      <path d="M13.5 10.5v5"></path>
    </svg>
  `;
}

function createTaskElement(task) {
  const item = document.createElement('li');
  item.className = 'task-row';
  if (task.completed) item.classList.add('completed');
  if (task.id === lastAddedId) item.classList.add('is-entering');
  if (task.id === lastCompletedId) item.classList.add('just-completed');
  item.dataset.taskId = task.id;

  const checkButton = document.createElement('button');
  checkButton.type = 'button';
  checkButton.className = 'task-check';
  checkButton.setAttribute('aria-label', task.completed ? `Mark "${task.text}" active` : `Mark "${task.text}" complete`);
  checkButton.setAttribute('aria-pressed', String(task.completed));
  checkButton.dataset.action = 'toggle';
  checkButton.dataset.testid = `button-toggle-task-${task.id}`;

  const label = document.createElement('span');
  label.className = 'task-label';
  label.textContent = task.text;
  label.dataset.testid = `text-task-${task.id}`;

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'task-delete';
  deleteButton.setAttribute('aria-label', `Delete "${task.text}"`);
  deleteButton.title = 'Delete task';
  deleteButton.dataset.action = 'delete';
  deleteButton.dataset.testid = `button-delete-task-${task.id}`;
  deleteButton.innerHTML = getDeleteIcon();

  item.append(checkButton, label, deleteButton);
  return item;
}

function render() {
  const counts = getCounts();
  const visibleTasks = getVisibleTasks();

  taskList.innerHTML = '';
  visibleTasks.forEach((task) => taskList.appendChild(createTaskElement(task)));

  const hasVisibleTasks = visibleTasks.length > 0;
  taskList.hidden = !hasVisibleTasks;
  emptyState.hidden = hasVisibleTasks;

  if (!hasVisibleTasks) {
    if (currentFilter === 'completed' && counts.completed === 0) {
      emptyTitle.textContent = 'Nothing checked off yet.';
      emptyCopy.textContent = 'Finish one small thing and it will land here.';
      emptyAction.textContent = 'See active tasks';
      emptyAction.hidden = counts.active === 0;
    } else if (currentFilter === 'active' && counts.all > 0) {
      emptyTitle.textContent = 'A clean slate.';
      emptyCopy.textContent = 'You finished everything on this list. Take the win.';
      emptyAction.textContent = 'See completed';
      emptyAction.hidden = false;
    } else {
      emptyTitle.textContent = 'Nothing here yet.';
      emptyCopy.textContent = 'Start with one small thing. You can always add another.';
      emptyAction.textContent = 'Add your first task';
      emptyAction.hidden = false;
    }
  }

  allCount.textContent = counts.all;
  activeCount.textContent = counts.active;
  completedCount.textContent = counts.completed;
  filterTabs.forEach((tab) => {
    const isActive = tab.dataset.filter === currentFilter;
    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });

  const completionPercent = counts.all ? Math.round((counts.completed / counts.all) * 100) : 0;
  progressLabel.textContent = `${completionPercent}% finished`;
  progressCount.textContent = `${counts.completed} of ${counts.all}`;
  progressBar.style.width = `${completionPercent}%`;
  clearCompletedButton.disabled = counts.completed === 0;

  if (counts.all === 0) {
    footerMessage.textContent = '0 tasks to go';
    listHint.textContent = 'A little progress counts.';
  } else if (counts.active === 0) {
    footerMessage.textContent = 'Everything is done';
    listHint.textContent = 'That is a very good list.';
  } else {
    footerMessage.textContent = `${counts.active} ${counts.active === 1 ? 'task' : 'tasks'} to go`;
    listHint.textContent = counts.completed ? 'Keep the good rhythm.' : 'A little progress counts.';
  }

  requestAnimationFrame(() => {
    const entering = taskList.querySelector('.is-entering');
    if (entering) {
      requestAnimationFrame(() => entering.classList.remove('is-entering'));
    }
  });

  if (lastCompletedId) {
    window.setTimeout(() => {
      const completedRow = taskList.querySelector(`[data-task-id="${lastCompletedId}"]`);
      if (completedRow) completedRow.classList.remove('just-completed');
      lastCompletedId = null;
    }, 480);
  }
}

function addTask(text) {
  const cleanText = text.trim();
  if (!cleanText) {
    taskInput.focus();
    return;
  }

  const newTask = { id: createId(), text: cleanText.slice(0, 120), completed: false };
  tasks = [newTask, ...tasks];
  lastAddedId = newTask.id;
  saveTasks();
  if (currentFilter === 'completed') currentFilter = 'all';
  render();
  taskInput.value = '';
  taskInput.focus();
  window.setTimeout(() => {
    lastAddedId = null;
  }, 380);
}

function toggleTask(taskId) {
  const task = tasks.find((item) => item.id === taskId);
  if (!task) return;
  task.completed = !task.completed;
  lastCompletedId = task.completed ? task.id : null;
  saveTasks();
  render();
}

function deleteTask(taskId, row) {
  if (!row) return;
  row.classList.add('is-removing');
  window.setTimeout(() => {
    tasks = tasks.filter((task) => task.id !== taskId);
    saveTasks();
    render();
  }, 235);
}

function clearCompleted() {
  const completedRows = [...taskList.querySelectorAll('.task-row.completed')];
  if (!completedRows.length) return;
  completedRows.forEach((row, index) => {
    window.setTimeout(() => row.classList.add('is-removing'), index * 24);
  });
  window.setTimeout(() => {
    tasks = tasks.filter((task) => !task.completed);
    saveTasks();
    render();
  }, 260 + Math.min(completedRows.length, 8) * 24);
}

function saveCurrentList() {
  saveTasks();
  saveButton.classList.add('is-saved');
  if (saveTimeoutId) window.clearTimeout(saveTimeoutId);
  saveTimeoutId = window.setTimeout(() => {
    saveButton.classList.remove('is-saved');
  }, 900);
}

function setFilter(filter) {
  currentFilter = filter;
  render();
}

function setTodayLabel() {
  const date = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());
  todayLabel.textContent = date;
}

addForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addTask(taskInput.value);
});

taskList.addEventListener('click', (event) => {
  const actionButton = event.target.closest('[data-action]');
  const row = event.target.closest('.task-row');
  if (!actionButton || !row) return;
  const taskId = row.dataset.taskId;
  if (actionButton.dataset.action === 'toggle') toggleTask(taskId);
  if (actionButton.dataset.action === 'delete') deleteTask(taskId, row);
});

filterTabs.forEach((tab) => {
  tab.addEventListener('click', () => setFilter(tab.dataset.filter));
});

clearCompletedButton.addEventListener('click', clearCompleted);
saveButton.addEventListener('click', saveCurrentList);

emptyAction.addEventListener('click', () => {
  if (currentFilter === 'active' && getCounts().all > 0) {
    setFilter('completed');
  } else if (currentFilter === 'completed') {
    setFilter('active');
  } else {
    taskInput.focus();
  }
});

setTodayLabel();
render();