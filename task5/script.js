// ===== Состояние игры =====
const state = {
  sequence: [],      // последовательность компьютера, например [2, 0, 3]
  playerIndex: 0,    // сколько шагов игрок уже ввёл верно в этом раунде
  isShowing: false,  // true, пока идёт показ (клики игнорируются)
  isPlaying: false   // true, пока игра идёт
};

// ===== Ссылки на DOM-элементы =====
const pads = document.querySelectorAll('.pad');
const startBtn = document.getElementById('start-btn');
const levelText = document.getElementById('level');
const messageText = document.getElementById('message');

// ===== Пауза через setTimeout (возвращает Promise) =====
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ===== Подсветить кнопку на время =====
async function flashPad(index, duration) {
  pads[index].classList.add('active');
  await wait(duration);
  pads[index].classList.remove('active');
}

// ===== Показать последовательность целиком =====
async function showSequence() {
  state.isShowing = true;
  messageText.textContent = 'Запоминайте...';

  await wait(600);

  for (const index of state.sequence) {
    await flashPad(index, 500);
    await wait(250);
  }

  state.playerIndex = 0;
  state.isShowing = false;
  messageText.textContent = 'Ваш ход';
}

// ===== Новый раунд: добавить один шаг и показать =====
async function nextRound() {
  state.sequence.push(Math.floor(Math.random() * 4));
  levelText.textContent = `Уровень: ${state.sequence.length}`;
  await showSequence();
}

// ===== Конец игры =====
function gameOver() {
  state.isPlaying = false;
  startBtn.disabled = false;
  messageText.textContent = `Вы дошли до уровня ${state.sequence.length}. Нажмите «Старт», чтобы сыграть снова`;
}

// ===== Клик игрока по кнопке =====
function handlePadClick(index) {
  // Игнорируем клики, если игра не идёт или идёт показ
  if (!state.isPlaying || state.isShowing) return;

  flashPad(index, 200);

  if (index !== state.sequence[state.playerIndex]) {
    gameOver();
    return;
  }

  state.playerIndex += 1;

  // Игрок повторил всю последовательность верно
  if (state.playerIndex === state.sequence.length) {
    state.isShowing = true; // блокируем клики до следующего показа
    messageText.textContent = 'Верно!';
    wait(800).then(nextRound);
  }
}

pads.forEach((pad) => {
  pad.addEventListener('click', () => handlePadClick(Number(pad.dataset.index)));
});

// ===== Кнопка «Старт» =====
startBtn.addEventListener('click', () => {
  if (state.isPlaying) return;

  state.sequence = [];
  state.playerIndex = 0;
  state.isPlaying = true;
  startBtn.disabled = true;

  nextRound();
});