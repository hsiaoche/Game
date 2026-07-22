const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreElement = document.getElementById('score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreElement = document.getElementById('final-score');
const mobileControls = document.getElementById('mobile-controls');

const endTitle = document.getElementById('end-title');
const endMsg = document.getElementById('end-msg');

// 按鈕元素
const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');
const btnJump = document.getElementById('btn-jump');

// 遊戲狀態 Variables
let isPlaying = false;
let isGameOver = false;
let animationId;
let cameraY = 0;
let highestY = 0;
let levelHeight = 0;

// 控制狀態
const keys = {
    left: false,
    right: false,
    jump: false
};

// 根據視窗大小或容器大小調整 Canvas
function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// 主角物件
const player = {
    x: 0,
    y: 0,
    width: 30,
    height: 30,
    vx: 0,
    vy: 0,
    speed: 6,
    jumpForce: 13,
    gravity: 0.6,
    friction: 0.8,
    isGrounded: false,
    color: '#38bdf8',

    init() {
        this.width = Math.min(canvas.width * 0.08, 30);
        this.height = this.width;
        // 初始位置在第一個台階上
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - 100 - this.height; 
        this.vx = 0;
        this.vy = 0;
        this.isGrounded = false;
        cameraY = 0;
        highestY = this.y;
    },

    draw() {
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        
        ctx.fillRect(this.x, this.y - cameraY, this.width, this.height);
        ctx.shadowBlur = 0;
    },

    update() {
        // 左右移動控制
        if (keys.left) {
            this.vx -= 1.5;
        }
        if (keys.right) {
            this.vx += 1.5;
        }

        // 摩擦力與最大速度限制
        this.vx *= this.friction;
        if (this.vx > this.speed) this.vx = this.speed;
        if (this.vx < -this.speed) this.vx = -this.speed;

        // 水平更新與邊界偵測
        this.x += this.vx;
        if (this.x < 0) {
            this.x = 0;
            this.vx = 0;
        } else if (this.x + this.width > canvas.width) {
            this.x = canvas.width - this.width;
            this.vx = 0;
        }

        // 重力與跳躍
        this.vy += this.gravity;
        
        // 給一點點 Coyote Time (邊緣寬限時間)
        if (keys.jump && this.isGrounded) {
            this.vy = -this.jumpForce;
            this.isGrounded = false;
            createJumpParticles(this.x + this.width/2, this.y + this.height);
        }

        // 垂直更新
        this.y += this.vy;
        this.isGrounded = false;

        // 更新最高高度 (用於計算分數)
        if (this.y < highestY) {
            highestY = this.y;
        }

        // 相機跟隨 (平滑跟隨 Y 軸)
        const targetCameraY = this.y - canvas.height * 0.6;
        if (targetCameraY < cameraY) {
            cameraY += (targetCameraY - cameraY) * 0.1;
        }
        // 如果玩家掉落太多，相機也會稍微跟著下移，但主要是玩家墜落死亡
        
        // 死亡判定：掉出相機視角底部
        if (this.y > cameraY + canvas.height + 100) {
            triggerGameOver(false);
        }
    }
};

// 關卡資料
const platforms = [];
const enemies = [];
const particles = [];
const TOTAL_PLATFORMS = 50;

function generateLevel() {
    platforms.length = 0;
    enemies.length = 0;
    
    // 1. 起始台階 (必定在畫面底部中央)
    platforms.push({
        x: canvas.width / 2 - 60,
        y: canvas.height - 100,
        w: 120,
        h: 20,
        type: 'normal'
    });

    let currentY = canvas.height - 100;
    
    // 2. 隨機生成向上的台階
    for (let i = 1; i < TOTAL_PLATFORMS; i++) {
        // 隨機高度間隔
        const gapY = Math.random() * 80 + 70; 
        currentY -= gapY;

        // 隨機寬度
        const pw = Math.random() * 60 + 50;
        
        // 隨機X位置 (確保不會太超出邊界)
        let px = Math.random() * (canvas.width - pw - 40) + 20;

        // 若前一個台階距離太遠，稍微修正 X 確保跳得到
        const prevP = platforms[i-1];
        if (Math.abs(px - prevP.x) > 200) {
            px = prevP.x + (px > prevP.x ? 150 : -150);
            px = Math.max(20, Math.min(px, canvas.width - pw - 20));
        }

        platforms.push({
            x: px,
            y: currentY,
            w: pw,
            h: 15,
            type: 'normal'
        });

        // 機率生成威脅 (敵人)
        if (i > 5 && Math.random() < 0.3) {
            enemies.push({
                x: px + pw/2 - 10,
                y: currentY - 20,
                w: 20,
                h: 20,
                speed: (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random() * 1.5),
                minX: px,
                maxX: px + pw - 20
            });
        }
    }

    // 3. 終點台階
    currentY -= 150;
    platforms.push({
        x: 0,
        y: currentY,
        w: canvas.width,
        h: 30,
        type: 'finish'
    });
    
    levelHeight = currentY;
}

function handleCollisions() {
    // 玩家與台階的碰撞 (只判定往下掉的時候踩到台階)
    if (player.vy >= 0) {
        for (let p of platforms) {
            // AABB 碰撞，且玩家底部剛好穿過台階頂部
            if (
                player.x < p.x + p.w &&
                player.x + player.width > p.x &&
                player.y + player.height > p.y &&
                player.y + player.height - player.vy <= p.y + 10 // 容錯
            ) {
                // 踩到台階
                player.isGrounded = true;
                player.vy = 0;
                player.y = p.y - player.height;
                
                // 檢查是否抵達終點
                if (p.type === 'finish') {
                    triggerGameOver(true);
                }
                break;
            }
        }
    }

    // 玩家與敵人的碰撞
    const hitShrink = 4;
    for (let e of enemies) {
        if (
            player.x + hitShrink < e.x + e.w &&
            player.x + player.width - hitShrink > e.x &&
            player.y + hitShrink < e.y + e.h &&
            player.y + player.height - hitShrink > e.y
        ) {
            // 被敵人碰到 (不論方向)
            triggerGameOver(false);
        }
    }
}

function updateEnemies() {
    for (let e of enemies) {
        // 在台階上來回移動
        e.x += e.speed;
        if (e.x <= e.minX || e.x >= e.maxX) {
            e.speed *= -1;
            // 修正位置以免卡住
            e.x = e.x <= e.minX ? e.minX : e.maxX;
        }
    }
}

function drawWorld() {
    // 背景裝飾 (會隨相機視差移動的網格)
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    const gridSize = 100;
    const offsetY = cameraY % gridSize;
    
    ctx.beginPath();
    for(let y = -offsetY; y < canvas.height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
    }
    for(let x = 0; x < canvas.width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
    }
    ctx.stroke();

    // 繪製台階
    for (let p of platforms) {
        // 略過畫面外的台階以節省效能
        if (p.y - cameraY > canvas.height + 50 || p.y - cameraY < -50) continue;

        if (p.type === 'finish') {
            ctx.fillStyle = '#10b981'; // Emerald 500
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 20;
        } else {
            ctx.fillStyle = '#475569'; // Slate 600
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            // 頂部加亮邊
            ctx.fillRect(p.x, p.y - cameraY, p.w, 2);
            ctx.fillStyle = 'rgba(71, 85, 105, 0.5)';
        }
        ctx.fillRect(p.x, p.y - cameraY + (p.type==='normal'?2:0), p.w, p.h);
    }
    ctx.shadowBlur = 0;

    // 繪製敵人
    for (let e of enemies) {
        if (e.y - cameraY > canvas.height + 50 || e.y - cameraY < -50) continue;
        
        ctx.fillStyle = '#f43f5e';
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 10;
        ctx.fillRect(e.x, e.y - cameraY, e.w, e.h);
        
        // 繪製生氣的眼睛
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 0;
        ctx.fillRect(e.x + 4, e.y - cameraY + 4, 3, 3);
        ctx.fillRect(e.x + 13, e.y - cameraY + 4, 3, 3);
    }
}

// --- 特效系統 ---
class Particle {
    constructor(x, y, color, isExplosion) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 4 + 2;
        this.speedX = (Math.random() - 0.5) * (isExplosion ? 10 : 4);
        this.speedY = (Math.random() - 0.5) * (isExplosion ? 10 : 2) - (isExplosion? 0 : 2);
        this.color = color;
        this.life = 1.0;
        this.decay = Math.random() * 0.03 + 0.02;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
        
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.max(0, this.life);
        // 注意粒子位置要加上相機偏移
        ctx.fillRect(this.x, this.y - cameraY, this.size, this.size);
        ctx.globalAlpha = 1.0;
    }
}

function createJumpParticles(x, y) {
    for (let i = 0; i < 5; i++) {
        particles.push(new Particle(x + (Math.random()-0.5)*10, y, 'rgba(255,255,255,0.5)', false));
    }
}

function createDeathParticles() {
    for (let i = 0; i < 40; i++) {
        particles.push(new Particle(player.x + player.width/2, player.y + player.height/2, player.color, true));
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }
}

// --- 遊戲流程 ---
function resetGame() {
    resizeCanvas();
    player.init();
    generateLevel();
    particles.length = 0;
    
    scoreElement.innerText = `Height: 0m`;
    
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    mobileControls.classList.remove('hidden');
    
    isPlaying = true;
    isGameOver = false;
    
    // 重設按鍵狀態
    keys.left = false;
    keys.right = false;
    keys.jump = false;
    
    gameLoop();
}

function triggerGameOver(isWin) {
    isPlaying = false;
    isGameOver = true;
    
    if (!isWin) createDeathParticles();
    
    endTitle.className = isWin ? 'win-title' : 'lose-title';
    endTitle.innerText = isWin ? 'YOU WIN!' : 'GAME OVER';
    endMsg.innerText = isWin ? '成功登頂！' : '你墜落了或碰到陷阱...';
    
    // 計算到達高度 (0 ~ 100%)
    const startY = canvas.height - 100;
    const totalDist = startY - levelHeight;
    const currentDist = startY - highestY;
    let percent = Math.floor((currentDist / totalDist) * 100);
    if (percent < 0) percent = 0;
    if (percent > 100) percent = 100;
    
    finalScoreElement.innerText = `${percent}%`;
    mobileControls.classList.add('hidden');
    
    function endAnimation() {
        if (!isGameOver) return; 
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawWorld();
        updateParticles();
        if (isWin) player.draw();
        
        if (particles.length > 0 || isWin) {
            requestAnimationFrame(endAnimation);
        } else {
            gameOverScreen.classList.remove('hidden');
        }
    }
    
    if (isWin) {
        gameOverScreen.classList.remove('hidden');
    }
    endAnimation();
}

function gameLoop() {
    if (!isPlaying) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    updateEnemies();
    player.update();
    handleCollisions();
    
    drawWorld();
    player.draw();
    updateParticles();
    
    // 更新分數 UI
    const startY = canvas.height - 100;
    const m = Math.floor((startY - highestY) / 50);
    scoreElement.innerText = `Height: ${Math.max(0, m)}m`;

    animationId = requestAnimationFrame(gameLoop);
}

// 初始畫面繪製
player.init();
generateLevel();
drawWorld();
player.draw();

// --- 虛擬按鍵與事件綁定 ---
function handleKeyDown(e) {
    if(e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
    if(e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
    if(e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') keys.jump = true;
}

function handleKeyUp(e) {
    if(e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
    if(e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
    if(e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') keys.jump = false;
}

window.addEventListener('keydown', (e) => {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
    }
    if (!isPlaying && !isGameOver && (e.code === 'Space' || e.code === 'Enter')) {
        resetGame();
    } else if (isPlaying) {
        handleKeyDown(e);
    }
});
window.addEventListener('keyup', handleKeyUp);

// 手機虛擬按鍵綁定 (支援多點觸控)
function bindTouchBtn(btn, keyName) {
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault(); // 防止雙擊縮放
        if(isPlaying) {
            keys[keyName] = true;
            btn.classList.add('active');
        }
    });
    btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys[keyName] = false;
        btn.classList.remove('active');
    });
    btn.addEventListener('touchcancel', (e) => {
        keys[keyName] = false;
        btn.classList.remove('active');
    });
    // 桌面滑鼠測試用
    btn.addEventListener('mousedown', (e) => {
        if(isPlaying) {
            keys[keyName] = true;
            btn.classList.add('active');
        }
    });
    btn.addEventListener('mouseup', () => {
        keys[keyName] = false;
        btn.classList.remove('active');
    });
    btn.addEventListener('mouseleave', () => {
        keys[keyName] = false;
        btn.classList.remove('active');
    });
}

bindTouchBtn(btnLeft, 'left');
bindTouchBtn(btnRight, 'right');
bindTouchBtn(btnJump, 'jump');

// 點擊 UI 重新開始
startScreen.addEventListener('click', () => { if(!isPlaying) resetGame(); });
gameOverScreen.addEventListener('click', () => { if(isGameOver) resetGame(); });
