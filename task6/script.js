(() => {
  const CELL_SIZE = 20;
  const GRID_SIZE = 20;
  const MOVE_INTERVAL = 150;

  class SnakeModel {
    constructor(gridSize) {
      this.gridSize = gridSize;
      this.reset();
    }

    reset() {
      this.snake = [
        { x: 5, y: 10 },
        { x: 4, y: 10 },
        { x: 3, y: 10 }
      ];
      this.direction = { x: 1, y: 0 };
      this.nextDirection = { x: 1, y: 0 };
      this.score = 0;
      this.gameOver = false;
      this.apple = this.spawnApple();
    }

    spawnApple() {
      let position;

      do {
        position = {
          x: Math.floor(Math.random() * this.gridSize),
          y: Math.floor(Math.random() * this.gridSize)
        };
      } while (this.isOnSnake(position, this.snake));

      return position;
    }

    isOnSnake(cell, body) {
      return body.some((segment) => segment.x === cell.x && segment.y === cell.y);
    }

    changeDirection(newDir) {
      const isReverse =
        newDir.x === -this.direction.x && newDir.y === -this.direction.y;
      if (isReverse) return;

      this.nextDirection = newDir;
    }

    checkCollision(head, body) {
      const hitWall =
        head.x < 0 ||
        head.x >= this.gridSize ||
        head.y < 0 ||
        head.y >= this.gridSize;

      return hitWall || this.isOnSnake(head, body);
    }

    moveSnake() {
      this.direction = this.nextDirection;

      const head = {
        x: this.snake[0].x + this.direction.x,
        y: this.snake[0].y + this.direction.y
      };

      const ateApple = head.x === this.apple.x && head.y === this.apple.y;
      const bodyToCheck = ateApple ? this.snake : this.snake.slice(0, -1);

      if (this.checkCollision(head, bodyToCheck)) {
        this.gameOver = true;
        return;
      }

      this.snake.unshift(head);

      if (ateApple) {
        this.score += 1;
        this.apple = this.spawnApple();
      } else {
        this.snake.pop();
      }
    }
  }

  class SnakeView {
    constructor(cellSize) {
      this.cellSize = cellSize;
      this.canvas = document.getElementById('game');
      this.ctx = this.canvas.getContext('2d');
      this.scoreText = document.getElementById('score');
      this.gameOverBox = document.getElementById('game-over');
      this.finalScoreText = document.getElementById('final-score');
      this.restartBtn = document.getElementById('restart-btn');
    }

    drawCell(cell, color) {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(
        cell.x * this.cellSize,
        cell.y * this.cellSize,
        this.cellSize - 1,
        this.cellSize - 1
      );
    }

    draw(model) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.drawCell(model.apple, '#e0455a');

      model.snake.forEach((segment, index) => {
        this.drawCell(segment, index === 0 ? '#3b2a9e' : '#5b3fd6');
      });
    }

    updateScore(score) {
      this.scoreText.textContent = `Счёт: ${score}`;
    }

    showGameOver(score) {
      this.finalScoreText.textContent = `Ваш счёт: ${score}`;
      this.gameOverBox.hidden = false;
    }

    hideGameOver() {
      this.gameOverBox.hidden = true;
    }

    onRestart(handler) {
      this.restartBtn.addEventListener('click', handler);
    }
  }

  class SnakeController {
    constructor(model, view, moveInterval) {
      this.model = model;
      this.view = view;
      this.moveInterval = moveInterval;
      this.lastMoveTime = null;
      this.animationId = null;
      this.loop = this.loop.bind(this);
    }

    init() {
      document.addEventListener('keydown', (event) => this.handleKey(event));
      this.view.onRestart(() => this.start());
      this.start();
    }

    start() {
      this.model.reset();
      this.lastMoveTime = null;

      this.view.updateScore(this.model.score);
      this.view.hideGameOver();

      if (this.animationId !== null) {
        cancelAnimationFrame(this.animationId);
      }
      this.animationId = requestAnimationFrame(this.loop);
    }

    handleKey(event) {
      const directions = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 }
      };

      const newDir = directions[event.key];
      if (!newDir) return;

      event.preventDefault();
      this.model.changeDirection(newDir);
    }

    update(currentTime) {
      if (this.lastMoveTime === null) {
        this.lastMoveTime = currentTime;
      }

      if (currentTime - this.lastMoveTime >= this.moveInterval) {
        this.lastMoveTime = currentTime;
        this.model.moveSnake();
        this.view.updateScore(this.model.score);

        if (this.model.gameOver) {
          this.view.showGameOver(this.model.score);
        }
      }
    }

    loop(currentTime) {
      this.update(currentTime);
      this.view.draw(this.model);

      if (!this.model.gameOver) {
        this.animationId = requestAnimationFrame(this.loop);
      } else {
        this.animationId = null;
      }
    }
  }

  const model = new SnakeModel(GRID_SIZE);
  const view = new SnakeView(CELL_SIZE);
  const controller = new SnakeController(model, view, MOVE_INTERVAL);

  controller.init();
})();