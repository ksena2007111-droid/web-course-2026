// ===== Состояние приложения =====
let secretNumber = '';
let history = [];
let attempts = 0;
let gameOver = false;

// ===== Ссылки на DOM-элементы =====
const form = document.getElementById('guess-form');
const input = document.getElementById('guess-input');
const errorMessage = document.getElementById('error-message');
const attemptsCounter = document.getElementById('attempts-counter');
const winMessage = document.getElementById('win-message');
const historyList = document.getElementById('history-list');
const newGameBtn = document.getElementById('new-game-btn');

// ===== Генерация загаданного числа из 4 неповторяющихся цифр =====
function generateSecretNumber() {
  const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  // Перемешиваем массив цифр (Fisher-Yates shuffle)
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }

  // Берём первые 4 цифры после перемешивания
  // (первая цифра может быть "0" — это допустимо, число не выводится как число, а как строка)
  return digits.slice(0, 4).join('');
}

// ===== Валидация ввода игрока =====
// Возвращает объект { valid: true } или { valid: false, message: "..." }
function validateGuess(guess) {
  if (guess.length !== 4) {
    return { valid: false, message: 'Введите ровно 4 цифры' };
  }

  if (!/^\d{4}$/.test(guess)) {
    return { valid: false, message: 'Можно вводить только цифры' };
  }

  const uniqueDigits = new Set(guess.split(''));
  if (uniqueDigits.size !== 4) {
    return { valid: false, message: 'Все цифры должны быть разными' };
  }

  return { valid: true };
}

// ===== Подсчёт быков и коров =====
function countBullsAndCows(secret, guess) {
  let bulls = 0;
  let cows = 0;

  const secretDigits = secret.split('');
  const guessDigits = guess.split('');

  for (let i = 0; i < 4; i++) {
    if (guessDigits[i] === secretDigits[i]) {
      bulls += 1;
    } else if (secretDigits.includes(guessDigits[i])) {
      cows += 1;
    }
  }

  return { bulls, cows };
}

// ===== Начать новую игру =====
function startNewGame() {
  secretNumber = generateSecretNumber();
  history = [];
  attempts = 0;
  gameOver = false;

  input.value = '';
  input.disabled = false;
  form.querySelector('.btn-check').disabled = false;

  errorMessage.hidden = true;
  winMessage.hidden = true;

  render();
}

// ===== Обработка отправки попытки =====
form.addEventListener('submit', (event) => {
  event.preventDefault();

  if (gameOver) return;

  const guess = input.value.trim();
  const validation = validateGuess(guess);

  if (!validation.valid) {
    errorMessage.textContent = validation.message;
    errorMessage.hidden = false;
    return;
  }

  errorMessage.hidden = true;

  const result = countBullsAndCows(secretNumber, guess);
  attempts += 1;

  history.push({
    guess: guess,
    bulls: result.bulls,
    cows: result.cows
  });

  input.value = '';

  if (result.bulls === 4) {
    endGame();
  }

  render();
});

// Скрыть ошибку, как только начали печатать заново
input.addEventListener('input', () => {
  if (!errorMessage.hidden) {
    errorMessage.hidden = true;
  }
});

// ===== Завершить игру победой =====
function endGame() {
  gameOver = true;
  input.disabled = true;
  form.querySelector('.btn-check').disabled = true;

  winMessage.textContent = `Победа! Угадано за ${attempts} ${getAttemptsWord(attempts)}`;
  winMessage.hidden = false;
}

// ===== Склонение слова "попытка" =====
function getAttemptsWord(n) {
  const lastTwo = n % 100;
  const last = n % 10;

  if (lastTwo >= 11 && lastTwo <= 14) return 'попыток';
  if (last === 1) return 'попытку';
  if (last >= 2 && last <= 4) return 'попытки';
  return 'попыток';
}

// ===== Создать DOM-элемент одной строки истории =====
function createHistoryElement(entry) {
  const li = document.createElement('li');
  li.className = 'history-item';

  const guessSpan = document.createElement('span');
  guessSpan.className = 'history-guess';
  guessSpan.textContent = entry.guess;

  const resultSpan = document.createElement('span');
  resultSpan.className = 'history-result';
  resultSpan.innerHTML =
    `<span class="bulls">${entry.bulls} ${entry.bulls === 1 ? 'бык' : 'быка'}</span>, ` +
    `<span class="cows">${entry.cows} ${entry.cows === 1 ? 'корова' : 'коровы'}</span>`;

  li.appendChild(guessSpan);
  li.appendChild(resultSpan);

  return li;
}

// ===== Обновить счётчик попыток =====
function updateAttemptsCounter() {
  attemptsCounter.textContent = `Попыток: ${attempts}`;
}

// ===== Главная функция отрисовки =====
function render() {
  historyList.innerHTML = '';

  history.forEach((entry) => {
    historyList.appendChild(createHistoryElement(entry));
  });

  updateAttemptsCounter();
}

// ===== Кнопка "Новая игра" =====
newGameBtn.addEventListener('click', startNewGame);

// ===== Старт игры при загрузке страницы =====
startNewGame();
