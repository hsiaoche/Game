const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
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
let cameraX = 0;
let cameraY = 0;

// 控制狀態
const keys = { left: false, right: false, jump: false };

function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// --- 地圖系統 (Tilemap) ---
// 0: 空氣, 1: 牆壁/地板, 2: 陷阱(刺), 3: 終點, S: 起點
const TILE_SIZE = 40;
const levelMapData = [
    "1111111111111111111111111111111111111111",
    "1300010000000010000000000000011000000001",
    "1111010111111010111111111110011011111101",
    "1000010000001010000000000010011010000001",
    "1011111111101011111112211110011010111111",
    "1000000000101000000011110000011010000001",
    "1111111110101111111000000111111011111101",
    "1000000010100000001111111100011000000101",
    "1011111010111111101000000000011111110101",
    "1010001010000000101011111111110000000101",
    "1010101011111110101010000000010111111101",
    "1010101000000010101010111111010100000001",
    "1010101111111010101010100001010101111111",
    "1000100000001000100000101101010101000001",
    "1111111111101111111111101101010101011111",
    "1000000000000000000000000001010101000001",
    "1011111111111111111111111111010111111101",
    "1010000000000000000000000000010000000001",
    "1S10111111122222222222222221111111111111",
    "1111111111111111111111111111111111111111"
];
const mapHeight = levelMapData.length;
const mapWidth = levelMapData[0].length;

let startPos = { x: 40, y: 40 };
for (let r = 0; r < mapHeight; r++) {
    for (let c = 0; c < mapWidth; c++) {
        if (levelMapData[r][c] === 'S') {
            startPos = { x: c * TILE_SIZE, y: r * TILE_SIZE };
        }
    }
}

function getTile(c, r) {
    if (r < 0 || r >= mapHeight || c < 0 || c >= mapWidth) return '1'; // 邊界外視為牆壁
    const val = levelMapData[r][c];
    return val;
}

// 主角物件
const player = {
    x: 0, y: 0,
    width: 24, height: 24, // 比 Tile 小一點方便在通道穿梭
    vx: 0, vy: 0,
    maxSpeed: 3.5, // 速度調慢，增加可控性
    acceleration: 0.8,
    friction: 0.7, 
    jumpForce: 8,
    gravity: 0.4,
    isGrounded: false,
    color: '#38bdf8',

    init() {
        this.x = startPos.x + (TILE_SIZE - this.width) / 2;
        this.y = startPos.y + (TILE_SIZE - this.height) / 2;
        this.vx = 0;
        this.vy = 0;
        this.isGrounded = false;
        
        // 初始化相機位置在玩家身上
        cameraX = this.x + this.width/2 - canvas.width/2;
        cameraY = this.y + this.height/2 - canvas.height/2;
    },

    draw() {
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 12;
        ctx.fillRect(this.x - cameraX, this.y - cameraY, this.width, this.height);
        ctx.shadowBlur = 0;
    },

    update() {
        // --- 1. 水平移動與碰撞 ---
        if (keys.left) this.vx -= this.acceleration;
        if (keys.right) this.vx += this.acceleration;
        
        this.vx *= this.friction; // 摩擦力
        if (this.vx > this.maxSpeed) this.vx = this.maxSpeed;
        if (this.vx < -this.maxSpeed) this.vx = -this.maxSpeed;
        if (Math.abs(this.vx) < 0.1) this.vx = 0;

        this.x += this.vx;
        this.checkCollisionX();

        // --- 2. 垂直移動與跳躍 ---
        this.vy += this.gravity;
        
        // 只有在地上才能跳
        if (keys.jump && this.isGrounded) {
            this.vy = -this.jumpForce;
            this.isGrounded = false;
            createJumpParticles(this.x + this.width/2, this.y + this.height);
        }

        this.y += this.vy;
        this.isGrounded = false; // 先假設在空中，碰撞判定後會確認
        this.checkCollisionY();

        // --- 3. 陷阱與終點判定 (AABB overlaps) ---
        const cLeft = Math.floor(this.x / TILE_SIZE);
        const cRight = Math.floor((this.x + this.width - 0.1) / TILE_SIZE);
        const rTop = Math.floor(this.y / TILE_SIZE);
        const rBottom = Math.floor((this.y + this.height - 0.1) / TILE_SIZE);

        for (let r = rTop; r <= rBottom; r++) {
            for (let c = cLeft; c <= cRight; c++) {
                const tile = getTile(c, r);
                if (tile === '2') {
                    // 稍微縮小判定框，給玩家一點容錯
                    const hitShrink = 4;
                    const tileX = c * TILE_SIZE;
                    const tileY = r * TILE_SIZE;
                    if (
                        this.x + hitShrink < tileX + TILE_SIZE &&
                        this.x + this.width - hitShrink > tileX &&
                        this.y + hitShrink < tileY + TILE_SIZE &&
                        this.y + this.height - hitShrink > tileY
                    ) {
                        triggerGameOver(false);
                    }
                } else if (tile === '3') {
                    triggerGameOver(true);
                }
            }
        }

        // --- 4. 相機跟隨 ---
        const targetCamX = this.x + this.width/2 - canvas.width/2;
        const targetCamY = this.y + this.height/2 - canvas.height/2;
        cameraX += (targetCamX - cameraX) * 0.1;
        cameraY += (targetCamY - cameraY) * 0.1;
        
        // 限制相機不要超出地圖邊界
        cameraX = Math.max(0, Math.min(cameraX, mapWidth * TILE_SIZE - canvas.width));
        cameraY = Math.max(0, Math.min(cameraY, mapHeight * TILE_SIZE - canvas.height));
    },

    checkCollisionX() {
        const cLeft = Math.floor(this.x / TILE_SIZE);
        const cRight = Math.floor((this.x + this.width - 0.1) / TILE_SIZE);
        // 為了避免卡角，上下判定稍微內縮
        const rTop = Math.floor((this.y + 2) / TILE_SIZE);
        const rBottom = Math.floor((this.y + this.height - 2) / TILE_SIZE);

        if (this.vx > 0) {
            // 向右移動，檢查右側是否有牆
            if (getTile(cRight, rTop) === '1' || getTile(cRight, rBottom) === '1') {
                this.x = cRight * TILE_SIZE - this.width;
                this.vx = 0;
            }
        } else if (this.vx < 0) {
            // 向左移動，檢查左側是否有牆
            if (getTile(cLeft, rTop) === '1' || getTile(cLeft, rBottom) === '1') {
                this.x = (cLeft + 1) * TILE_SIZE;
                this.vx = 0;
            }
        }
    },

    checkCollisionY() {
        // 左右判定稍微內縮
        const cLeft = Math.floor((this.x + 2) / TILE_SIZE);
        const cRight = Math.floor((this.x + this.width - 2) / TILE_SIZE);
        const rTop = Math.floor(this.y / TILE_SIZE);
        const rBottom = Math.floor((this.y + this.height - 0.1) / TILE_SIZE);

        if (this.vy > 0) {
            // 向下移動，檢查下方是否有牆
            if (getTile(cLeft, rBottom) === '1' || getTile(cRight, rBottom) === '1') {
                this.y = rBottom * TILE_SIZE - this.height;
                this.vy = 0;
                this.isGrounded = true; // 踩到地板
            }
        } else if (this.vy < 0) {
            // 向上移動，檢查上方是否有天花板
            if (getTile(cLeft, rTop) === '1' || getTile(cRight, rTop) === '1') {
                this.y = (rTop + 1) * TILE_SIZE;
                this.vy = 0; // 撞到天花板掉落
            }
        }
    }
};

function drawWorld() {
    // 繪製背景網格
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    const bgSize = 40;
    const offsetX = cameraX % bgSize;
    const offsetY = cameraY % bgSize;
    
    ctx.beginPath();
    for(let y = -offsetY; y < canvas.height; y += bgSize) {
        ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
    }
    for(let x = -offsetX; x < canvas.width; x += bgSize) {
        ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height);
    }
    ctx.stroke();

    // 找出目前畫面可視範圍，只繪製可見的方塊 (Culling)
    const startCol = Math.max(0, Math.floor(cameraX / TILE_SIZE));
    const endCol = Math.min(mapWidth, startCol + Math.ceil(canvas.width / TILE_SIZE) + 1);
    const startRow = Math.max(0, Math.floor(cameraY / TILE_SIZE));
    const endRow = Math.min(mapHeight, startRow + Math.ceil(canvas.height / TILE_SIZE) + 1);

    for (let r = startRow; r < endRow; r++) {
        for (let c = startCol; c < endCol; c++) {
            const tile = levelMapData[r][c];
            const px = c * TILE_SIZE - cameraX;
            const py = r * TILE_SIZE - cameraY;

            if (tile === '1') {
                // 牆壁
                ctx.fillStyle = '#475569'; // Slate 600
                ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                // 內陰影裝飾
                ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
                ctx.fillRect(px, py + TILE_SIZE - 4, TILE_SIZE, 4);
                ctx.fillRect(px + TILE_SIZE - 4, py, 4, TILE_SIZE);
            } else if (tile === '2') {
                // 陷阱 (紅色岩漿/刺)
                ctx.fillStyle = '#f43f5e';
                ctx.shadowColor = '#f43f5e';
                ctx.shadowBlur = 10;
                // 畫成微小尖刺的感覺
                ctx.beginPath();
                ctx.moveTo(px, py + TILE_SIZE);
                ctx.lineTo(px + TILE_SIZE/2, py + 10);
                ctx.lineTo(px + TILE_SIZE, py + TILE_SIZE);
                ctx.fill();
                ctx.shadowBlur = 0;
            } else if (tile === '3') {
                // 終點 (綠色傳送門)
                ctx.fillStyle = '#10b981';
                ctx.shadowColor = '#10b981';
                ctx.shadowBlur = 20;
                ctx.fillRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
                ctx.shadowBlur = 0;
            } else if (tile === 'S') {
                // 起點裝飾
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.lineWidth = 2;
                ctx.strokeRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            }
        }
    }
}

// --- 特效系統 ---
const particles = [];
class Particle {
    constructor(x, y, color, isExplosion) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 4 + 2;
        this.speedX = (Math.random() - 0.5) * (isExplosion ? 8 : 3);
        this.speedY = (Math.random() - 0.5) * (isExplosion ? 8 : 1) - (isExplosion? 0 : 1);
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
        ctx.fillRect(this.x - cameraX, this.y - cameraY, this.size, this.size);
        ctx.globalAlpha = 1.0;
    }
}

function createJumpParticles(x, y) {
    for (let i = 0; i < 4; i++) {
        particles.push(new Particle(x + (Math.random()-0.5)*10, y, 'rgba(255,255,255,0.4)', false));
    }
}

function createDeathParticles() {
    for (let i = 0; i < 30; i++) {
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
    particles.length = 0;
    
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
    endTitle.innerText = isWin ? 'MISSION CLEAR!' : 'GAME OVER';
    endMsg.innerText = isWin ? '成功逃出迷宮！' : '你碰到了陷阱...';
    
    mobileControls.classList.add('hidden');
    
    function endAnimation() {
        if (!isGameOver) return; 
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawWorld();
        if (isWin) player.draw();
        updateParticles();
        
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
    
    player.update();
    
    drawWorld();
    player.draw();
    updateParticles();

    animationId = requestAnimationFrame(gameLoop);
}

// 初始畫面繪製
player.init();
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

function bindTouchBtn(btn, keyName) {
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
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

function handleStartTap(e) {
    if(!isPlaying && !isGameOver) resetGame();
    if(isGameOver) {
        setTimeout(() => resetGame(), 100);
    }
}
startScreen.addEventListener('pointerdown', handleStartTap);
gameOverScreen.addEventListener('pointerdown', handleStartTap);
window.addEventListener('pointerdown', (e) => {
    if (e.target.tagName !== 'BUTTON') {
        handleStartTap(e);
    }
});
