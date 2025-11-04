// Game canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Original game dimensions
const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const ASPECT_RATIO = GAME_WIDTH / GAME_HEIGHT;

// Resize canvas to maintain aspect ratio
function resizeCanvas() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const windowAspectRatio = windowWidth / windowHeight;

    if (windowAspectRatio > ASPECT_RATIO) {
        // Window is wider than game
        canvas.height = windowHeight;
        canvas.width = windowHeight * ASPECT_RATIO;
    } else {
        // Window is taller than game
        canvas.width = windowWidth;
        canvas.height = windowWidth / ASPECT_RATIO;
    }

    // Scale everything proportionally
    const scale = canvas.width / GAME_WIDTH;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game state
let gameState = 'start'; // 'start', 'playing', 'gameOver'
let score = 0;
let highScore = localStorage.getItem('zappybird-highscore') || 0;
let frames = 0;

// Leaderboard functions
function getLeaderboard() {
    return JSON.parse(localStorage.getItem('zappybird-leaderboard') || '[]');
}

function saveToLeaderboard(name, score) {
    let leaderboard = getLeaderboard();
    leaderboard.push({ name, score });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10); // Keep top 10
    localStorage.setItem('zappybird-leaderboard', JSON.stringify(leaderboard));
}

function isTopScore(score) {
    const leaderboard = getLeaderboard();
    return leaderboard.length < 10 || score > leaderboard[leaderboard.length - 1].score || leaderboard.length === 0;
}

// Player (electrician)
const player = {
    x: 80,
    y: 250,
    width: 34,
    height: 24,
    velocity: 0,
    gravity: 0.5,
    jump: -8,
    rotation: 0
};

// Obstacles (exposed wires)
const obstacles = [];
const obstacleWidth = 60;
const obstacleGap = 150;
const obstacleSpeed = 2;

// Particles for effects
const particles = [];

// UI Elements
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const scoreDisplay = document.getElementById('score');
const finalScoreDisplay = document.getElementById('final-score');
const highScoreDisplay = document.getElementById('high-score');

// Event listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'playing') {
            flap();
        }
    }
});

// Touch and click controls
canvas.addEventListener('click', () => {
    if (gameState === 'playing') {
        flap();
    }
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameState === 'playing') {
        flap();
    }
}, { passive: false });

// Start the game
function startGame() {
    gameState = 'playing';
    score = 0;
    frames = 0;
    player.y = 250;
    player.velocity = 0;
    obstacles.length = 0;
    particles.length = 0;
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    scoreDisplay.textContent = 'Score: 0';
    gameLoop();
}

// Player flap
function flap() {
    player.velocity = player.jump;
    createSparks(player.x + player.width / 2, player.y + player.height / 2, '#FFD700');
}

// Create spark particles
function createSparks(x, y, color) {
    for (let i = 0; i < 5; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 20,
            color: color
        });
    }
}

// Spawn obstacles
function spawnObstacle() {
    const minHeight = 80;
    const maxHeight = GAME_HEIGHT - obstacleGap - minHeight - 100;
    const topHeight = Math.floor(Math.random() * maxHeight) + minHeight;

    obstacles.push({
        x: GAME_WIDTH,
        topHeight: topHeight,
        bottomY: topHeight + obstacleGap,
        bottomHeight: GAME_HEIGHT - (topHeight + obstacleGap) - 50,
        scored: false
    });
}

// Update game state
function update() {
    if (gameState !== 'playing') return;

    frames++;

    // Update player
    player.velocity += player.gravity;
    player.y += player.velocity;
    player.rotation = Math.min(Math.max(player.velocity * 3, -30), 90);

    // Spawn obstacles
    if (frames % 120 === 0) {
        spawnObstacle();
    }

    // Update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.x -= obstacleSpeed;

        // Score points
        if (!obs.scored && obs.x + obstacleWidth < player.x) {
            obs.scored = true;
            score++;
            scoreDisplay.textContent = 'Score: ' + score;
            createSparks(player.x, player.y + player.height / 2, '#00FF00');
        }

        // Remove off-screen obstacles
        if (obs.x + obstacleWidth < 0) {
            obstacles.splice(i, 1);
        }

        // Collision detection
        if (checkCollision(player, obs)) {
            gameOver();
        }
    }

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }

    // Check boundaries
    if (player.y + player.height > GAME_HEIGHT - 50 || player.y < 0) {
        gameOver();
    }
}

// Check collision
function checkCollision(player, obstacle) {
    const padding = 2;

    if (player.x + player.width - padding > obstacle.x &&
        player.x + padding < obstacle.x + obstacleWidth) {
        if (player.y + padding < obstacle.topHeight ||
            player.y + player.height - padding > obstacle.bottomY) {
            return true;
        }
    }
    return false;
}

// Game over
function gameOver() {
    gameState = 'gameOver';

    // Update high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('zappybird-highscore', highScore);
    }

    // Create explosion effect
    createSparks(player.x + player.width / 2, player.y + player.height / 2, '#FF4444');
    for (let i = 0; i < 20; i++) {
        createSparks(player.x + player.width / 2, player.y + player.height / 2, '#FFD700');
    }

    // Check if score qualifies for leaderboard
    if (isTopScore(score) && score > 0) {
        setTimeout(() => {
            const name = prompt('🏆 Congratulations! You made the leaderboard!\n\nEnter your name:');
            if (name && name.trim()) {
                saveToLeaderboard(name.trim().substring(0, 20), score);
            }
            // Show game over screen after name entry
            finalScoreDisplay.textContent = 'Score: ' + score;
            highScoreDisplay.textContent = 'High Score: ' + highScore;
            gameOverScreen.classList.remove('hidden');
        }, 500);
    } else {
        // Show game over screen
        finalScoreDisplay.textContent = 'Score: ' + score;
        highScoreDisplay.textContent = 'High Score: ' + highScore;
        setTimeout(() => {
            gameOverScreen.classList.remove('hidden');
        }, 500);
    }
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(50 - (frames % 400), 80, 60, 30);
    ctx.fillRect(200 - (frames % 400), 120, 80, 35);
    ctx.fillRect(350 - (frames % 400), 60, 70, 32);

    // Draw ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, GAME_HEIGHT - 50, GAME_WIDTH, 50);
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, GAME_HEIGHT - 55, GAME_WIDTH, 5);

    // Draw obstacles (exposed wires with electrical boxes)
    obstacles.forEach(obs => {
        // Top wire
        ctx.fillStyle = '#333';
        ctx.fillRect(obs.x, 0, obstacleWidth, obs.topHeight);

        // Electrical box top
        ctx.fillStyle = '#555';
        ctx.fillRect(obs.x - 5, obs.topHeight - 30, obstacleWidth + 10, 30);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(obs.x + 5, obs.topHeight - 22, 10, 14);
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(obs.x + 20, obs.topHeight - 22, 10, 14);

        // Sparks on top wire
        if (frames % 10 < 5) {
            ctx.fillStyle = '#FFFF00';
            ctx.fillRect(obs.x + 10, obs.topHeight - 10, 4, 4);
            ctx.fillRect(obs.x + 40, obs.topHeight - 15, 4, 4);
        }

        // Bottom wire
        ctx.fillStyle = '#333';
        ctx.fillRect(obs.x, obs.bottomY, obstacleWidth, obs.bottomHeight);

        // Electrical box bottom
        ctx.fillStyle = '#555';
        ctx.fillRect(obs.x - 5, obs.bottomY, obstacleWidth + 10, 30);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(obs.x + 5, obs.bottomY + 8, 10, 14);
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(obs.x + 20, obs.bottomY + 8, 10, 14);

        // Sparks on bottom wire
        if (frames % 10 < 5) {
            ctx.fillStyle = '#FFFF00';
            ctx.fillRect(obs.x + 15, obs.bottomY + 5, 4, 4);
            ctx.fillRect(obs.x + 35, obs.bottomY + 10, 4, 4);
        }
    });

    // Draw player (electrician)
    ctx.save();
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
    ctx.rotate(player.rotation * Math.PI / 180);

    // Hard hat (yellow)
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(-17, -12, 34, 10);
    ctx.fillRect(-14, -15, 28, 3);

    // Face
    ctx.fillStyle = '#FFDBAC';
    ctx.fillRect(-12, -2, 24, 16);

    // Eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(-8, 2, 4, 4);
    ctx.fillRect(4, 2, 4, 4);

    // Tool belt
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(-12, 10, 24, 4);

    // Vest (orange)
    ctx.fillStyle = '#FF6600';
    ctx.fillRect(-15, 6, 30, 8);

    ctx.restore();

    // Draw particles
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        const size = Math.max(1, p.life / 5);
        ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
    });
}

// Main game loop
function gameLoop() {
    update();
    draw();

    if (gameState === 'playing') {
        requestAnimationFrame(gameLoop);
    }
}

// Initial high score display
highScoreDisplay.textContent = 'High Score: ' + highScore;
