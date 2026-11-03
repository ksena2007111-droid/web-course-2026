const CELL_SIZE = 20;
const GRID_SIZE = 20;
const MOVE_INTERVAL = 150;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreText = document.getElementById('score');
const gameOverBox = document.getElementById('game-over');
const finalScoreText = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let apple = { x: 0, y: 0 };
let score = 0;
let gameOver = false;

let lastMoveTime = null;
let animationId = null;

function startGame() {
  snake = [
    { x: 5, y: 10 },
    { x: 4, y: 10 },
    { x: 3, y: 10 }
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  gameOver = false;
  lastMoveTime = null;

  scoreText.textContent = 'Счёт: 0';
  gameOverBox.hidden = true;

  spawnApple();

  if (animationId !== null) {
    cancelAnimationFrame(animationId);
  }
  animationId = requestAnimationFrame(gameLoop);
}

function spawnApple() {
  let position;

  do {
    position = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
  } while (isOnSnake(position, snake));

  apple = position;
}

function isOnSnake(cell, body) {
  return body.some((segment) => segment.x === cell.x && segment.y === cell.y);
}

function changeDirection(newDir) {
  const isReverse = newDir.x === -direction.x && newDir.y === -direction.y;
  if (isReverse) return;

  nextDirection = newDir;
}

function checkCollision(head, body) {
  const hitWall =
    head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE;

  return hitWall || isOnSnake(head, body);
}

function moveSnake() {
  direction = nextDirection;

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };

  const ateApple = head.x === apple.x && head.y === apple.y;
  const bodyToCheck = ateApple ? snake : snake.slice(0, -1);

  if (checkCollision(head, bodyToCheck)) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (ateApple) {
    score += 1;
    scoreText.textContent = `Счёт: ${score}`;
    spawnApple();
  } else {
    snake.pop();
  }
}

function endGame() {
  gameOver = true;
  finalScoreText.textContent = `Ваш счёт: ${score}`;
  gameOverBox.hidden = false;
}

function update(currentTime) {
  if (lastMoveTime === null) {
    lastMoveTime = currentTime;
  }

  if (currentTime - lastMoveTime >= MOVE_INTERVAL) {
    lastMoveTime = currentTime;
    moveSnake();
  }
}

function drawCell(cell, color) {
  ctx.fillStyle = color;
  ctx.fillRect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawCell(apple, '#e0455a');

  snake.forEach((segment, index) => {
    drawCell(segment, index === 0 ? '#3b2a9e' : '#5b3fd6');
  });
}

function gameLoop(currentTime) {
  update(currentTime);
  draw();

  if (!gameOver) {
    animationId = requestAnimationFrame(gameLoop);
  } else {
    animationId = null;
  }
}

document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'ArrowUp':
      changeDirection({ x: 0, y: -1 });
      break;
    case 'ArrowDown':
      changeDirection({ x: 0, y: 1 });
      break;
    case 'ArrowLeft':
      changeDirection({ x: -1, y: 0 });
      break;
    case 'ArrowRight':
      changeDirection({ x: 1, y: 0 });
      break;
    default:
      return;
  }

  event.preventDefault();
});

restartBtn.addEventListener('click', startGame);

startGame();