import { Core } from './engine/Core.js';
import { GameContext as state } from './engine/core/GameState.js';
import { canvas, ctx, CameraState, resizeCanvas } from './engine/core/Camera.js';
import { keys } from './engine/core/InputManager.js';
import { GameLoop } from './engine/core/GameLoop.js';
import { drawWorld, mapWidth, mapHeight, TILE_SIZE } from './game/Map.js';
import { Player, updateSaws, createDeathParticles } from './game/Entities.js';
import { EntityManager } from './engine/EntityManager.js';
import { SceneManager } from './engine/SceneManager.js';
import { initDevOptions, devOptions } from './engine/DevOptions.js';
import { LevelManager } from './engine/LevelManager.js';
import { level1 } from './game/levels.js';
import { QuestionManager } from './engine/QuestionManager.js';
import { LeaderboardManager } from './engine/LeaderboardManager.js';
import { EventBus, Events } from './engine/EventBus.js';
import { GameConfig } from './config/gameConfig.js';

const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const mobileControls = document.getElementById('mobile-controls');
const endTitle = document.getElementById('end-title');
const endMsg = document.getElementById('end-msg');

function updateHUD() {
    const minutes = Math.floor(state.gameTime / 60).toString().padStart(2, '0');
    const seconds = (state.gameTime % 60).toFixed(2).padStart(5, '0');
    document.getElementById('timer').innerText = `${minutes}:${seconds}`;
    
    const livesContainer = document.getElementById('lives');
    livesContainer.innerHTML = '';
    for(let i=0; i<3; i++) {
        const div = document.createElement('div');
        div.className = 'life-box' + (i >= state.lives ? ' lost' : '');
        livesContainer.appendChild(div);
    }
}

class MainMenuScene {
    enter() {
        startScreen.classList.remove('hidden');
        gameOverScreen.classList.add('hidden');
        mobileControls.classList.add('hidden');
        state.isPlaying = false;
        
        // Draw static background
        resizeCanvas();
        LevelManager.loadLevel(level1);
        
        CameraState.x = EntityManager.player.x + EntityManager.player.width/2 - canvas.width/2;
        CameraState.y = EntityManager.player.y + EntityManager.player.height/2 - canvas.height/2;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawWorld(ctx, CameraState.x, CameraState.y, canvas.width, canvas.height);
        EntityManager.draw(ctx, CameraState.x, CameraState.y);
    }
    exit() {
        startScreen.classList.add('hidden');
        state.isPlaying = true;
    }
    update(dt) {}
    draw(ctx) {}
}

class GameplayScene {
    constructor(isReset = true) {
        this.isReset = isReset;
    }
    enter() {
        resizeCanvas();
        if (this.isReset) {
            state.gameTime = 0;
            state.lives = GameConfig.INITIAL_LIVES;
            LevelManager.resetLevel();
        }
        
        CameraState.x = EntityManager.player.x + EntityManager.player.width/2 - canvas.width/2;
        CameraState.y = EntityManager.player.y + EntityManager.player.height/2 - canvas.height/2;
        
        mobileControls.classList.remove('hidden');
        document.getElementById('hud').classList.remove('hidden');
        
        keys.left = false;
        keys.right = false;
        keys.jump = false;
    }
    exit() {
        mobileControls.classList.add('hidden');
    }
    update(dt) {
        state.gameTime += dt * devOptions.speedMultiplier;
        updateHUD();
        
        let timeScale = dt * 60;
        timeScale *= devOptions.speedMultiplier; 
        
        if (EntityManager.player) {
            EntityManager.player.update(timeScale, keys);
        }
        
        updateSaws(dt * devOptions.speedMultiplier);
        
        if (!EntityManager.player) return; // Stop executing if player died and scene changed
        
        const targetCamX = EntityManager.player.x + EntityManager.player.width/2 - canvas.width/2;
        const targetCamY = EntityManager.player.y + EntityManager.player.height/2 - canvas.height/2;
        CameraState.x += (targetCamX - CameraState.x) * (0.1 * timeScale);
        CameraState.y += (targetCamY - CameraState.y) * (0.1 * timeScale);
        
        CameraState.x = Math.max(0, Math.min(CameraState.x, mapWidth * TILE_SIZE - canvas.width));
        CameraState.y = Math.max(0, Math.min(CameraState.y, mapHeight * TILE_SIZE - canvas.height));
    }
    draw(ctx) {
        drawWorld(ctx, CameraState.x, CameraState.y, canvas.width, canvas.height);
        EntityManager.draw(ctx, CameraState.x, CameraState.y);
        EntityManager.updateParticles(1 * devOptions.speedMultiplier, ctx, CameraState.x, CameraState.y);
    }
    handleDeath() {
        if (!EntityManager.player || EntityManager.player.isInvincible || devOptions.godMode) return;
        
        createDeathParticles(EntityManager.player.x + EntityManager.player.width/2, EntityManager.player.y + EntityManager.player.height/2, EntityManager.player.color);
        
        state.lives--;
        updateHUD();
        
        if (state.lives >= 0) {
            SceneManager.changeScene(new QuestionScene(EntityManager.player.x, EntityManager.player.y));
        } else {
            SceneManager.changeScene(new GameOverScene(false, { reason: 'OUT_OF_LIVES' }));
        }
    }
}

class QuestionScene {
    constructor(deathX, deathY) {
        this.deathX = deathX;
        this.deathY = deathY;
    }
    enter() {
        const tempPlayer = EntityManager.player;
        EntityManager.player = null; // Hide player visually
        
        QuestionManager.showQuestion().then(result => {
            EntityManager.player = tempPlayer; // Restore player
            if (result.isCorrect) {
                EntityManager.player.x = this.deathX;
                EntityManager.player.y = this.deathY;
                EntityManager.player.isInvincible = true;
                EntityManager.player.invincibleTimer = GameConfig.INVINCIBILITY_DURATION;
                SceneManager.changeScene(new GameplayScene(false));
            } else {
                SceneManager.changeScene(new GameOverScene(false, { reason: 'WRONG_ANSWER', correctAnswer: result.correctAnswer }));
            }
        });
    }
    exit() {}
    update(dt) {
        state.gameTime += dt * devOptions.speedMultiplier;
        updateHUD();
        updateSaws(dt * devOptions.speedMultiplier);
    }
    draw(ctx) {
        drawWorld(ctx, CameraState.x, CameraState.y, canvas.width, canvas.height);
        EntityManager.draw(ctx, CameraState.x, CameraState.y);
        EntityManager.updateParticles(1 * devOptions.speedMultiplier, ctx, CameraState.x, CameraState.y);
    }
}

class GameOverScene {
    constructor(isWin, deathInfo = null) {
        this.isWin = isWin;
        this.deathInfo = deathInfo;
    }
    enter() {
        document.getElementById('hud').classList.add('hidden');
        if (!this.isWin) {
            createDeathParticles(EntityManager.player.x + EntityManager.player.width/2, EntityManager.player.y + EntityManager.player.height/2, EntityManager.player.color);
        }
        
        endTitle.className = this.isWin ? 'win-title' : 'lose-title';
        endTitle.innerText = this.isWin ? 'MISSION CLEAR!' : 'GAME OVER';
        
        const leaderboardContainer = document.getElementById('leaderboard-container');
        const leaderboardList = document.getElementById('leaderboard-list');
        
        if (this.isWin) {
            const finalTimeStr = LeaderboardManager.formatTime(state.gameTime);
            endMsg.innerHTML = `成功逃出迷宮！<br><span style="color:var(--accent-color); font-weight:bold; font-size:1.2rem; display:inline-block; margin-top:10px;">本次時間: ${finalTimeStr}</span>`;
            
            const topRecords = LeaderboardManager.addRecord(state.gameTime);
            
            leaderboardList.innerHTML = '';
            topRecords.forEach((record, index) => {
                const li = document.createElement('li');
                li.className = `rank-${index + 1}`;
                li.innerHTML = `<span>#${index + 1}</span> <span>${record.formatted}</span>`;
                leaderboardList.appendChild(li);
            });
            
            leaderboardContainer.classList.remove('hidden');
            gameOverScreen.classList.remove('hidden');
        } else {
            if (this.deathInfo && this.deathInfo.reason === 'WRONG_ANSWER') {
                endMsg.innerHTML = `答錯了！<br>正確答案是：<span style="color:var(--success-color); font-weight:bold; font-size:1.1rem; display:inline-block; margin-top:5px;">${this.deathInfo.correctAnswer}</span>`;
            } else if (this.deathInfo && this.deathInfo.reason === 'OUT_OF_LIVES') {
                endMsg.innerHTML = `復活方塊已耗盡...`;
            } else {
                endMsg.innerText = '你碰到了陷阱/鋸片...';
            }
            leaderboardContainer.classList.add('hidden');
        }
    }
    exit() {
        gameOverScreen.classList.add('hidden');
    }
    update(dt) {
        let hasActiveParticles = EntityManager.particles.some(p => p.active);
        if (!hasActiveParticles && !this.isWin) {
            gameOverScreen.classList.remove('hidden');
        }
        
        if (!this.isWin) {
            updateSaws(dt * devOptions.speedMultiplier);
        }
    }
    draw(ctx) {
        drawWorld(ctx, CameraState.x, CameraState.y, canvas.width, canvas.height);
        
        // 死亡時不畫玩家，通關時畫玩家
        if (this.isWin) {
            EntityManager.player.draw(ctx, CameraState.x, CameraState.y);
        } else {
            const tempPlayer = EntityManager.player;
            EntityManager.player = null; // 暫時移除讓 EntityManager 不畫
            EntityManager.draw(ctx, CameraState.x, CameraState.y);
            EntityManager.player = tempPlayer;
        }
        
        if(this.isWin) EntityManager.draw(ctx, CameraState.x, CameraState.y);
        
        EntityManager.updateParticles(1, ctx, CameraState.x, CameraState.y);
    }
}

function init() {
    Core.init();
    initDevOptions();
    QuestionManager.loadQuestions(); // 預載入 Markdown 題庫
    
    // Subscribe to Global Events
    EventBus.on(Events.PLAYER_DEATH, () => {
        if (SceneManager.currentScene instanceof GameplayScene) {
            SceneManager.currentScene.handleDeath();
        }
    });

    EventBus.on(Events.LEVEL_COMPLETE, () => {
        if (SceneManager.currentScene instanceof GameplayScene) {
            SceneManager.changeScene(new GameOverScene(true));
        }
    });
    
    let resetTimeout = null;
    function handleStartTap(e) {
        if (SceneManager.currentScene instanceof MainMenuScene) {
            SceneManager.changeScene(new GameplayScene(true));
        } else if (SceneManager.currentScene instanceof GameOverScene) {
            if (resetTimeout) clearTimeout(resetTimeout);
            resetTimeout = setTimeout(() => {
                SceneManager.changeScene(new GameplayScene(true));
            }, 100);
        }
    }
    
    window.focus(); // Ensure window has focus for keyboard events
    
    startScreen.addEventListener('pointerdown', handleStartTap);
    gameOverScreen.addEventListener('pointerdown', handleStartTap);
    window.addEventListener('pointerdown', (e) => {
        if (e.target.tagName !== 'BUTTON') handleStartTap(e);
    });
    
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.key === ' ' || e.code === 'Enter') {
            if (SceneManager.currentScene instanceof MainMenuScene) {
                SceneManager.changeScene(new GameplayScene(true));
            } else if (SceneManager.currentScene instanceof GameOverScene) {
                SceneManager.changeScene(new GameplayScene(true));
            }
        }
    });

    SceneManager.changeScene(new MainMenuScene());
    
    // We start the loop once, and it never stops, it just updates the current scene
    state.isPlaying = true; 
    GameLoop.start(
        (dt) => SceneManager.update(dt),
        (ctx) => SceneManager.draw(ctx)
    );
}

window.onload = init;
