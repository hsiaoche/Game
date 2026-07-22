const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const mobileControls = document.getElementById('mobile-controls');
const endTitle = document.getElementById('end-title');
const endMsg = document.getElementById('end-msg');

const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');
const btnJump = document.getElementById('btn-jump');

let isPlaying = false;
let isGameOver = false;
let animationId;
let cameraX = 0;
let cameraY = 0;

const keys = { left: false, right: false, jump: false };

function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// --- 地圖系統 (Tilemap) ---
// 0: 空氣, 1: 牆壁/地板, 2: 陷阱(刺), 3: 終點, S: 起點, H: 橫向鋸片, V: 直向鋸片
const TILE_SIZE = 40;
const levelMapData = [
    "1111111111111111111111111111111111111111", // 0
    "1000000000000000000000000000000000000031", // 1
    "1000000000000000000000000000000000000001", // 2
    "1001111111111111111111111111111111111111", // 3 (Floor 4)
    "1000000000000000000000000000000000000001", // 4
    "1000000000000000000000000000000000000001", // 5
    "10000V000V000V000V000V000V000V000V000001", // 6 (V-Saws)
    "1111111111111111111111111111111111111001", // 7 (Floor 3)
    "1000000000000000000000000000000000000001", // 8
    "100000H0000000000H0000000000H00000000001", // 9 (H-Saws mid-air)
    "10000000000H0000000000H0000000000H000001", // 10(H-Saws ground)
    "1001111111111111111111111111111111111111", // 11(Floor 2)
    "1000000000000000000000000000000000000001", // 12
    "1000000000000000000000000000000000000001", // 13
    "1000V000V000V000V000V000V000V00000000001", // 14(V-Saws)
    "1111111111111111111111111111111111111001", // 15(Floor 1)
    "1000000000000000000000000000000000000001", // 16
    "1000000000H0000000000H0000000000H0000001", // 17(H-Saws mid-air)
    "1S000H0000000000H0000000000H000000000001", // 18(H-Saws ground)
    "1111111111111111111111111111111111111111"  // 19(Ground)
];
const mapHeight = levelMapData.length;
const mapWidth = levelMapData[0].length;

let startPos = { x: 40, y: 40 };
const saws = [];

function parseMap() {
    saws.length = 0;
    for (let r = 0; r < mapHeight; r++) {
        for (let c = 0; c < mapWidth; c++) {
            const val = levelMapData[r][c];
            if (val === 'S') {
                startPos = { x: c * TILE_SIZE, y: r * TILE_SIZE };
            } else if (val === 'H' || val === 'V') {
                saws.push({
                    x: c * TILE_SIZE + 8,
                    y: r * TILE_SIZE + 8,
                    type: val,
                    speed: val === 'H' ? 2 : 2.5,
                    dir: 1,
                    size: 24,
                    rotation: 0
                });
            }
        }
    }
}

function getTile(c, r) {
    if (r < 0 || r >= mapHeight || c < 0 || c >= mapWidth) return '1';
    let val = levelMapData[r][c];
    if (['S', 'H', 'V'].includes(val)) val = '0'; // 這些視為空氣
    return val;
}

// 主角物件
const player = {
    x: 0, y: 0,
    width: 24, height: 24,
    vx: 0, vy: 0,
    maxSpeed: 4, 
    acceleration: 0.8,
    friction: 0.8, 
    jumpForce: 12, // 提高跳躍力，確保能跨樓層
    gravity: 0.4,
    isGrounded: false,
    color: '#38bdf8',

    init() {
        this.x = startPos.x + (TILE_SIZE - this.width) / 2;
        this.y = startPos.y + (TILE_SIZE - this.height) / 2;
        this.vx = 0;
        this.vy = 0;
        this.isGrounded = false;
        
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
        
        this.vx *= this.friction;
        if (this.vx > this.maxSpeed) this.vx = this.maxSpeed;
        if (this.vx < -this.maxSpeed) this.vx = -this.maxSpeed;
        if (Math.abs(this.vx) < 0.1) this.vx = 0;

        this.x += this.vx;
        this.checkCollisionX();

        // --- 2. 垂直移動與跳躍 ---
        this.vy += this.gravity;
        
        if (keys.jump && this.isGrounded) {
            this.vy = -this.jumpForce;
            this.isGrounded = false;
            createJumpParticles(this.x + this.width/2, this.y + this.height);
        }

        this.y += this.vy;
        this.isGrounded = false; 
        this.checkCollisionY();

        // --- 3. 陷阱與終點判定 ---
        const cLeft = Math.floor(this.x / TILE_SIZE);
        const cRight = Math.floor((this.x + this.width - 0.1) / TILE_SIZE);
        const rTop = Math.floor(this.y / TILE_SIZE);
        const rBottom = Math.floor((this.y + this.height - 0.1) / TILE_SIZE);

        for (let r = rTop; r <= rBottom; r++) {
            for (let c = cLeft; c <= cRight; c++) {
                const tile = getTile(c, r);
                if (tile === '2') {
                    triggerGameOver(false);
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
        
        cameraX = Math.max(0, Math.min(cameraX, mapWidth * TILE_SIZE - canvas.width));
        cameraY = Math.max(0, Math.min(cameraY, mapHeight * TILE_SIZE - canvas.height));
    },

    checkCollisionX() {
        const cLeft = Math.floor(this.x / TILE_SIZE);
        const cRight = Math.floor((this.x + this.width - 0.1) / TILE_SIZE);
        const rTop = Math.floor((this.y + 2) / TILE_SIZE);
        const rBottom = Math.floor((this.y + this.height - 2) / TILE_SIZE);

        if (this.vx > 0) {
            if (getTile(cRight, rTop) === '1' || getTile(cRight, rBottom) === '1') {
                this.x = cRight * TILE_SIZE - this.width;
                this.vx = 0;
            }
        } else if (this.vx < 0) {
            if (getTile(cLeft, rTop) === '1' || getTile(cLeft, rBottom) === '1') {
                this.x = (cLeft + 1) * TILE_SIZE;
                this.vx = 0;
            }
        }
    },

    checkCollisionY() {
        const cLeft = Math.floor((this.x + 2) / TILE_SIZE);
        const cRight = Math.floor((this.x + this.width - 2) / TILE_SIZE);
        const rTop = Math.floor(this.y / TILE_SIZE);
        const rBottom = Math.floor((this.y + this.height - 0.1) / TILE_SIZE);

        if (this.vy > 0) {
            if (getTile(cLeft, rBottom) === '1' || getTile(cRight, rBottom) === '1') {
                this.y = rBottom * TILE_SIZE - this.height;
                this.vy = 0;
                this.isGrounded = true; 
            }
        } else if (this.vy < 0) {
            if (getTile(cLeft, rTop) === '1' || getTile(cRight, rTop) === '1') {
                this.y = (rTop + 1) * TILE_SIZE;
                this.vy = 0; 
            }
        }
    }
};

function updateSaws() {
    for (let s of saws) {
        if (s.type === 'H') {
            s.x += s.speed * s.dir;
            const cLeft = Math.floor(s.x / TILE_SIZE);
            const cRight = Math.floor((s.x + s.size) / TILE_SIZE);
            const rTop = Math.floor((s.y + s.size/2) / TILE_SIZE); 
            if (s.dir > 0 && getTile(cRight, rTop) === '1') {
                s.dir = -1;
            } else if (s.dir < 0 && getTile(cLeft, rTop) === '1') {
                s.dir = 1;
            }
        } else if (s.type === 'V') {
            s.y += s.speed * s.dir;
            const cCenter = Math.floor((s.x + s.size/2) / TILE_SIZE);
            const rTop = Math.floor(s.y / TILE_SIZE);
            const rBottom = Math.floor((s.y + s.size) / TILE_SIZE);
            if (s.dir > 0 && getTile(cCenter, rBottom) === '1') {
                s.dir = -1;
            } else if (s.dir < 0 && getTile(cCenter, rTop) === '1') {
                s.dir = 1;
            }
        }
        
        ctx.save();
        ctx.translate(s.x + s.size/2 - cameraX, s.y + s.size/2 - cameraY);
        s.rotation += 0.1;
        ctx.rotate(s.rotation);
        
        ctx.fillStyle = '#f43f5e';
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 15;
        
        // 畫鋸片主體
        ctx.beginPath();
        ctx.arc(0, 0, s.size/2, 0, Math.PI * 2);
        ctx.fill();
        
        // 畫鋸齒
        ctx.fillStyle = '#be123c';
        for (let i = 0; i < 6; i++) {
            ctx.rotate(Math.PI / 3);
            ctx.beginPath();
            ctx.moveTo(-s.size/2 - 2, -3);
            ctx.lineTo(-s.size/2 - 6, 0);
            ctx.lineTo(-s.size/2 - 2, 3);
            ctx.fill();
        }
        // 內圈裝飾
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        // 碰撞判定
        const hitShrink = 4;
        if (
            player.x + hitShrink < s.x + s.size &&
            player.x + player.width - hitShrink > s.x &&
            player.y + hitShrink < s.y + s.size &&
            player.y + player.height - hitShrink > s.y
        ) {
            triggerGameOver(false);
        }
    }
}

function drawWorld() {
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
                ctx.fillStyle = '#475569'; 
                ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
                ctx.fillRect(px, py + TILE_SIZE - 4, TILE_SIZE, 4);
                ctx.fillRect(px + TILE_SIZE - 4, py, 4, TILE_SIZE);
            } else if (tile === '2') {
                ctx.fillStyle = '#f43f5e';
                ctx.shadowColor = '#f43f5e';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.moveTo(px, py + TILE_SIZE);
                ctx.lineTo(px + TILE_SIZE/2, py + 10);
                ctx.lineTo(px + TILE_SIZE, py + TILE_SIZE);
                ctx.fill();
                ctx.shadowBlur = 0;
            } else if (tile === '3') {
                ctx.fillStyle = '#10b981';
                ctx.shadowColor = '#10b981';
                ctx.shadowBlur = 20;
                ctx.fillRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
                ctx.shadowBlur = 0;
            } else if (tile === 'S') {
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
    parseMap(); // Reload map & saws
    player.init();
    particles.length = 0;
    
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    mobileControls.classList.remove('hidden');
    
    isPlaying = true;
    isGameOver = false;
    
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
    endMsg.innerText = isWin ? '成功逃出迷宮！' : '你碰到了陷阱/鋸片...';
    
    mobileControls.classList.add('hidden');
    
    function endAnimation() {
        if (!isGameOver) return; 
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawWorld();
        updateSaws();
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
    updateSaws();
    player.draw();
    updateParticles();

    animationId = requestAnimationFrame(gameLoop);
}

// 初始畫面繪製
parseMap();
player.init();
drawWorld();
updateSaws();
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
