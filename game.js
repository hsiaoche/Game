const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreElement = document.getElementById('score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreElement = document.getElementById('final-score');

// 遊戲狀態 Variables
let isPlaying = false;
let isGameOver = false;
let score = 0;
let animationId;
let gameSpeed = 5.5; // 基礎速度
let frameCount = 0;

// 根據視窗大小或容器大小調整 Canvas
function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}
window.addEventListener('resize', () => {
    if(!isPlaying) resizeCanvas();
});
resizeCanvas();

// 主角物件
const player = {
    x: canvas.width * 0.15,
    y: 0,
    size: Math.min(canvas.height * 0.08, 30), // 響應式大小
    dy: 0,
    jumpForce: 13,
    gravity: 0.65,
    groundY: 0,
    isJumping: false,
    rotation: 0,

    init() {
        this.groundY = canvas.height * 0.8;
        this.y = this.groundY - this.size;
        this.dy = 0;
        this.isJumping = false;
        this.rotation = 0;
    },

    draw() {
        ctx.fillStyle = '#38bdf8'; // Accent color (Cyan)
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 15;
        
        ctx.save();
        // 將原點移至中心點以進行旋轉
        ctx.translate(this.x + this.size/2, this.y + this.size/2);
        
        if (this.isJumping) {
            this.rotation += 5; // 在空中旋轉
        } else {
            // 著陸時歸正
            this.rotation = Math.round(this.rotation / 90) * 90;
        }
        
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        ctx.restore();
        
        ctx.shadowBlur = 0; // 重置陰影
    },

    jump() {
        if (!this.isJumping) {
            this.dy = -this.jumpForce;
            this.isJumping = true;
        }
    },

    update() {
        this.y += this.dy;
        
        // 落地判定
        if (this.y + this.size < this.groundY) {
            this.dy += this.gravity;
            this.isJumping = true;
        } else {
            this.dy = 0;
            this.y = this.groundY - this.size;
            this.isJumping = false;
        }
        this.draw();
    }
};

const obstacles = [];

class Obstacle {
    constructor() {
        // 隨機寬度與高度
        this.width = 25 + Math.random() * 20;
        this.height = 35 + Math.random() * 45;
        this.x = canvas.width;
        this.y = player.groundY - this.height;
        this.passed = false;
    }

    draw() {
        ctx.fillStyle = '#f43f5e'; // Danger color (Rose)
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 15;
        
        // 繪製稍微圓角的障礙物
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, 4);
        ctx.fill();
        
        ctx.shadowBlur = 0;
    }

    update() {
        this.x -= gameSpeed;
        this.draw();
    }
}

// 粒子系統 (特效)
const particles = [];
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 4 + 2;
        this.speedX = (Math.random() - 0.5) * 10;
        this.speedY = (Math.random() - 0.5) * 10;
        this.color = color;
        this.life = 1.0;
        this.decay = Math.random() * 0.02 + 0.015;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
        
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1.0;
    }
}

function createDeathParticles() {
    for (let i = 0; i < 40; i++) {
        particles.push(new Particle(player.x + player.size/2, player.y + player.size/2, '#38bdf8'));
    }
}

function drawEnvironment() {
    // 繪製地面線條
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, player.groundY);
    ctx.lineTo(canvas.width, player.groundY);
    ctx.stroke();

    // 繪製地面移動網格以產生速度感
    ctx.beginPath();
    const gridSpacing = 50;
    const offset = (frameCount * gameSpeed) % gridSpacing;
    for (let i = 0; i < canvas.width + gridSpacing; i += gridSpacing) {
        ctx.moveTo(i - offset, player.groundY);
        // 透視效果
        ctx.lineTo(i - offset - 40, canvas.height);
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.stroke();
    
    // 背景星光/塵埃 (簡單版本)
    if (frameCount % 10 === 0) {
        // 可以加入一些背景小點
    }
}

function handleObstacles() {
    // 隨機生成障礙物
    let spawnRate = Math.max(50, 100 - score * 2); // 隨著分數增加，生成頻率提高
    
    if (frameCount % Math.floor(Math.random() * spawnRate + spawnRate) === 0 && frameCount > 0) {
        obstacles.push(new Obstacle());
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obs = obstacles[i];
        obs.update();

        // AABB 碰撞偵測 (加入微小容錯率)
        const hitBoxShrink = 4;
        if (
            player.x + hitBoxShrink < obs.x + obs.width &&
            player.x + player.size - hitBoxShrink > obs.x &&
            player.y + hitBoxShrink < obs.y + obs.height &&
            player.y + player.size - hitBoxShrink > obs.y
        ) {
            gameOver();
        }

        // 計分
        if (obs.x + obs.width < player.x && !obs.passed) {
            score++;
            obs.passed = true;
            scoreElement.innerText = `SCORE: ${score}`;
            
            // 難度曲線：每 5 分加速
            if (score % 5 === 0) {
                gameSpeed += 0.4;
            }
        }

        // 移除畫面外的障礙物
        if (obs.x + obs.width < 0) {
            obstacles.splice(i, 1);
        }
    }
}

function handleParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function resetGame() {
    resizeCanvas();
    player.init();
    obstacles.length = 0;
    particles.length = 0;
    score = 0;
    gameSpeed = 5.5;
    frameCount = 0;
    scoreElement.innerText = `SCORE: ${score}`;
    
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    
    isPlaying = true;
    isGameOver = false;
    gameLoop();
}

function gameOver() {
    isPlaying = false;
    isGameOver = true;
    createDeathParticles();
    
    // 繪製最後一幀 (包含爆炸粒子)
    function deathAnimation() {
        if (!isGameOver) return; // 如果玩家快速重開則停止
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawEnvironment();
        obstacles.forEach(obs => obs.draw());
        handleParticles();
        
        if (particles.length > 0) {
            requestAnimationFrame(deathAnimation);
        }
    }
    deathAnimation();

    finalScoreElement.innerText = score;
    gameOverScreen.classList.remove('hidden');
    cancelAnimationFrame(animationId);
}

function gameLoop() {
    if (!isPlaying) return;

    // 清空畫布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawEnvironment();
    player.update();
    handleObstacles();
    
    // 偶爾產生拖尾粒子
    if (player.isJumping && frameCount % 3 === 0) {
         particles.push(new Particle(player.x, player.y + player.size, 'rgba(56, 189, 248, 0.4)'));
    }

    frameCount++;
    animationId = requestAnimationFrame(gameLoop);
}

// 初始畫面繪製
resizeCanvas();
player.init();
drawEnvironment();
player.draw();

// 控制輸入
function handleInput(e) {
    if (e.type === 'keydown' && e.code !== 'Space') return;
    
    // 防止預設行為 (例如空白鍵向下捲動)
    if(e.type === 'keydown') e.preventDefault();
    
    if (!isPlaying) {
        resetGame();
    } else if (!isGameOver) {
        player.jump();
    }
}

window.addEventListener('keydown', handleInput);
// 使用 pointerdown 以同時支援滑鼠與觸控
window.addEventListener('pointerdown', handleInput);
