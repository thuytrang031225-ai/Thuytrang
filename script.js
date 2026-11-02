
"use strict";

// ===== 1. LẤY CÁC PHẦN TỬ GIAO DIỆN =====
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const bestScoreElement = document.getElementById("bestScore");
const lengthElement = document.getElementById("length");
const overlay = document.getElementById("overlay");
const overlayEmoji = document.getElementById("overlayEmoji");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const mainButton = document.getElementById("mainButton");
const pauseButton = document.getElementById("pauseButton");
const restartButton = document.getElementById("restartButton");
const statusElement = document.getElementById("status");

// ===== 2. CẤU HÌNH GAME =====
const CELL = 20;
const CELLS = canvas.width / CELL;
const EASY_SPEED = 170;

const COLORS = {
  background: "#fff8fd",
  grid: "#f6eaf5",
  snake: "#b69ae8",
  snakeHead: "#8966ca",
  food: "#f28cbd",
  foodLeaf: "#79bd92",
  eye: "#ffffff"
};

// ===== 3. TRẠNG THÁI GAME =====
let snake = [];
let food = { x: 10, y: 10 };
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };

let score = 0;
let bestScore = loadBestScore();
let gameState = "ready";
let timer = null;

// ===== 4. ĐIỂM CAO NHẤT =====
function loadBestScore() {
  try {
    return Number(localStorage.getItem("pastelSnakeBest")) || 0;
  } catch {
    return 0;
  }
}

function saveBestScore() {
  try {
    localStorage.setItem("pastelSnakeBest", String(bestScore));
  } catch {
    // Game vẫn chơi được nếu trình duyệt chặn lưu dữ liệu.
  }
}

// ===== 5. KHỞI TẠO VÁN CHƠI =====
function resetGame() {
  stopTimer();

  snake = [
    { x: 6, y: 10 },
    { x: 5, y: 10 },
    { x: 4, y: 10 }
  ];

  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;

  createFood();
  updateScore();
  drawGame();
}

function startGame() {
  if (gameState === "running") return;

  if (gameState === "ready" || gameState === "over") {
    resetGame();
  }

  gameState = "running";
  hideOverlay();
  pauseButton.disabled = false;
  pauseButton.textContent = "⏸ Tạm dừng";
  statusElement.textContent = "Cố lên! Ăn dâu để ghi điểm nhé 🍓";

  stopTimer();
  timer = setInterval(gameStep, EASY_SPEED);
}

function pauseGame() {
  if (gameState === "running") {
    gameState = "paused";
    stopTimer();

    showOverlay(
      "⏸️",
      "Tạm dừng một chút!",
      "Rắn đang nghỉ ngơi. Khi sẵn sàng, bạn có thể chơi tiếp nhé."
    );

    mainButton.textContent = "▶ Tiếp tục";
    pauseButton.textContent = "▶ Tiếp tục";
    statusElement.textContent = "Trò chơi đang tạm dừng.";
  } else if (gameState === "paused") {
    startGame();
  }
}

function endGame() {
  gameState = "over";
  stopTimer();
  pauseButton.disabled = true;

  showOverlay(
    "💗",
    "Trò chơi kết thúc!",
    `Bạn đạt ${score} điểm. Thử lại để lập kỷ lục mới nhé!`
  );

  mainButton.textContent = "↻ Chơi lại";
  statusElement.textContent = "Đừng buồn nhé, bạn có thể thử lại!";
  drawGame();
}

function stopTimer() {
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
}

// ===== 6. GIAO DIỆN LỚP PHỦ =====
function showOverlay(emoji, title, message) {
  overlayEmoji.textContent = emoji;
  overlayTitle.textContent = title;
  overlayText.textContent = message;
  overlay.classList.remove("hidden");
}

function hideOverlay() {
  overlay.classList.add("hidden");
}

// ===== 7. TẠO THỨC ĂN NGẪU NHIÊN =====
function createFood() {
  let position;
  let attempts = 0;

  do {
    position = {
      x: Math.floor(Math.random() * CELLS),
      y: Math.floor(Math.random() * CELLS)
    };
    attempts++;
  } while (
    snake.some(part =>
      part.x === position.x && part.y === position.y
    ) && attempts < 1000
  );

  food = position;
}

// ===== 8. ĐIỀU KHIỂN HƯỚNG ĐI =====
function changeDirection(newDirection) {
  if (gameState !== "running") return;

  // Không cho rắn quay ngược vào thân ngay lập tức.
  if (
    newDirection.x === -direction.x &&
    newDirection.y === -direction.y
  ) {
    return;
  }

  nextDirection = newDirection;
}

document.addEventListener("keydown", event => {
  const key = event.key.toLowerCase();

  const directions = {
    arrowup: { x: 0, y: -1 },
    w: { x: 0, y: -1 },
    arrowdown: { x: 0, y: 1 },
    s: { x: 0, y: 1 },
    arrowleft: { x: -1, y: 0 },
    a: { x: -1, y: 0 },
    arrowright: { x: 1, y: 0 },
    d: { x: 1, y: 0 }
  };

  if (directions[key]) {
    event.preventDefault();
    changeDirection(directions[key]);
  }

  if (key === " " || key === "escape") {
    event.preventDefault();

    if (gameState === "running" || gameState === "paused") {
      pauseGame();
    } else if (gameState === "ready") {
      startGame();
    }
  }
});

// Các nút điều khiển cho điện thoại.
document.querySelectorAll("[data-direction]").forEach(button => {
  button.addEventListener("pointerdown", event => {
    event.preventDefault();

    const directions = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 }
    };

    changeDirection(directions[button.dataset.direction]);
  });
});

// ===== 9. VÒNG LẶP XỬ LÝ GAME =====
function gameStep() {
  if (gameState !== "running") return;

  direction = { ...nextDirection };

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };

  // Va vào tường.
  if (
    head.x < 0 ||
    head.x >= CELLS ||
    head.y < 0 ||
    head.y >= CELLS
  ) {
    endGame();
    return;
  }

  const eating = head.x === food.x && head.y === food.y;

  // Nếu không ăn, đuôi sẽ rời đi trong bước này.
  // Vì vậy có thể đi vào vị trí đuôi vừa rời khỏi.
  const bodyToCheck = eating ? snake : snake.slice(0, -1);

  // Va vào thân rắn.
  const hitBody = bodyToCheck.some(part =>
    part.x === head.x && part.y === head.y
  );

  if (hitBody) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (eating) {
    score += 10;

    if (score > bestScore) {
      bestScore = score;
      saveBestScore();
    }

    if (snake.length === CELLS * CELLS) {
      updateScore();
      gameState = "over";
      stopTimer();
      pauseButton.disabled = true;

      showOverlay(
        "🏆",
        "Bạn đã chiến thắng!",
        "Tuyệt vời! Bạn đã lấp đầy toàn bộ bàn chơi."
      );

      mainButton.textContent = "↻ Chơi lại";
      statusElement.textContent = "Chiến thắng hoàn hảo!";
      drawGame();
      return;
    }

    createFood();
  } else {
    snake.pop();
  }

  updateScore();
  drawGame();
}

// ===== 10. CẬP NHẬT ĐIỂM =====
function updateScore() {
  scoreElement.textContent = score;
  bestScoreElement.textContent = bestScore;
  lengthElement.textContent = snake.length;
}

// ===== 11. VẼ BÀN CHƠI =====
function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawGrid();
  drawFood();

  // Vẽ phần thân trước, đầu sau.
  for (let i = snake.length - 1; i >= 0; i--) {
    drawSnakePart(snake[i], i === 0);
  }
}

function drawGrid() {
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 0.7;

  for (let i = 0; i <= CELLS; i++) {
    const position = i * CELL;

    ctx.beginPath();
    ctx.moveTo(position, 0);
    ctx.lineTo(position, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, position);
    ctx.lineTo(canvas.width, position);
    ctx.stroke();
  }
}

function drawSnakePart(part, isHead) {
  const padding = isHead ? 1 : 2;
  const x = part.x * CELL + padding;
  const y = part.y * CELL + padding;
  const size = CELL - padding * 2;

  ctx.fillStyle = isHead ? COLORS.snakeHead : COLORS.snake;

  roundedRect(x, y, size, size, isHead ? 7 : 5);
  ctx.fill();

  if (isHead) {
    drawEyes(x, y, size);
  }
}

function drawEyes(x, y, size) {
  ctx.fillStyle = COLORS.eye;

  let eyes;

  if (direction.x !== 0) {
    const eyeX = direction.x > 0 ? x + size - 5 : x + 2;
    eyes = [
      { x: eyeX, y: y + 4 },
      { x: eyeX, y: y + size - 7 }
    ];
  } else {
    const eyeY = direction.y > 0 ? y + size - 5 : y + 2;
    eyes = [
      { x: x + 4, y: eyeY },
      { x: x + size - 7, y: eyeY }
    ];
  }

  eyes.forEach(eye => {
    ctx.beginPath();
    ctx.arc(eye.x + 1, eye.y + 1, 2, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawFood() {
  const centerX = food.x * CELL + CELL / 2;
  const centerY = food.y * CELL + CELL / 2;

  // Lá dâu.
  ctx.fillStyle = COLORS.foodLeaf;
  ctx.beginPath();
  ctx.ellipse(centerX + 2, centerY - 6, 4, 2, -0.5, 0, Math.PI * 2);
  ctx.fill();

  // Quả dâu.
  ctx.fillStyle = COLORS.food;
  ctx.beginPath();
  ctx.arc(centerX, centerY - 1, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(centerX - 6, centerY + 1);
  ctx.lineTo(centerX + 6, centerY + 1);
  ctx.lineTo(centerX, centerY + 8);
  ctx.closePath();
  ctx.fill();

  // Hạt dâu.
  ctx.fillStyle = "#fff4fb";

  [
    [-2, -2],
    [3, 0],
    [-1, 3]
  ].forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.arc(centerX + dx, centerY + dy, 0.8, 0, Math.PI * 2);
    ctx.fill();
  });
}

function roundedRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

// ===== 12. NÚT ĐIỀU KHIỂN =====
mainButton.addEventListener("click", () => {
  if (gameState === "paused") {
    startGame();
  } else {
    startGame();
  }
});

pauseButton.addEventListener("click", pauseGame);

restartButton.addEventListener("click", () => {
  resetGame();
  startGame();
});


// ===== 13. CHẠY LẦN ĐẦU =====
bestScoreElement.textContent = bestScore;
resetGame();

showOverlay(
  "🐍",
  "Sẵn sàng chưa?",
  "Ăn dâu tây để tăng điểm và tránh va vào thân rắn nhé!"
);

mainButton.textContent = "♡ Bắt đầu chơi";
pauseButton.disabled = true;
