import { Core } from './engine/Core.js';
import { GameContext as state } from './engine/core/GameState.js';
import { canvas, ctx, CameraState, resizeCanvas } from './engine/core/Camera.js';
import { keys } from './engine/core/InputManager.js';
import { GameLoop } from './engine/core/GameLoop.js';
import { mapWidth, mapHeight, TILE_SIZE } from './game/Map.js';
import { EntityManager } from './engine/EntityManager.js';
import { Renderer } from './engine/renderer/Renderer.js';
import { SceneManager } from './engine/SceneManager.js';
import { initDevOptions, devOptions } from './engine/DevOptions.js';
import { LevelManager } from './engine/LevelManager.js';
import { level1 } from './game/levels.js';
import { UIEngine } from './engine/ui/UIEngine.js';
import { QuestionRepository } from './engine/data/QuestionRepository.js';
import { SaveManager } from './engine/storage/SaveManager.js';
import { AudioManager } from './engine/audio/AudioManager.js';
import { EventBus, Events } from './engine/EventBus.js';
import { GameConfig } from './config/gameConfig.js';

// DOM elements are now managed by UIEngine

class MainMenuScene {
    enter() {
        UIEngine.showScreen('start');
        UIEngine.hideScreen('gameOver');
        UIEngine.hideScreen('mobileControls');
        state.isPlaying = false;
        
        // Draw static background
        resizeCanvas();
        LevelManager.loadLevel(level1);
        
        CameraState.x = EntityManager.player.x + EntityManager.player.width/2 - canvas.width/2;
        CameraState.y = EntityManager.player.y + EntityManager.player.height/2 - canvas.height/2;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        Renderer.draw(ctx, CameraState.x, CameraState.y, canvas.width, canvas.height);
    }
    exit() {
        UIEngine.hideScreen('start');
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
            LevelManager.initGame();
            const progress = SaveManager.loadProgress();
            if (progress) {
                state.gameTime = progress.gameTime || 0;
                state.lives = GameConfig.INITIAL_LIVES;
            } else {
                state.gameTime = 0;
                state.lives = GameConfig.INITIAL_LIVES;
            }
        }
        
        CameraState.x = EntityManager.player.x + EntityManager.player.width/2 - canvas.width/2;
        CameraState.y = EntityManager.player.y + EntityManager.player.height/2 - canvas.height/2;
        
        UIEngine.showScreen('mobileControls');
        UIEngine.showScreen('hud');
        
        keys.left = false;
        keys.right = false;
        keys.jump = false;
    }
    exit() {
        UIEngine.hideScreen('mobileControls');
    }
    update(dt) {
        state.gameTime += dt * devOptions.speedMultiplier;
        UIEngine.updateHUD(state.gameTime, state.lives, GameConfig.INITIAL_LIVES, LevelManager.currentLevelIndex);
        
        let timeScale = dt * 60;
        timeScale *= devOptions.speedMultiplier; 
        
        if (EntityManager.player) {
            EntityManager.player.update(timeScale, keys);
        }
        
        EntityManager.update(dt * devOptions.speedMultiplier);
        
        if (!EntityManager.player) return; // Stop executing if player died and scene changed
        
        const targetCamX = EntityManager.player.x + EntityManager.player.width/2 - canvas.width/2;
        
        // Vertical Deadzone
        const playerScreenY = EntityManager.player.y - CameraState.y;
        const deadzoneTop = canvas.height * 0.35;
        const deadzoneBottom = canvas.height * 0.65;
        
        let targetCamY = CameraState.y;
        if (playerScreenY < deadzoneTop) {
            targetCamY = EntityManager.player.y - deadzoneTop;
        } else if (playerScreenY + EntityManager.player.height > deadzoneBottom) {
            targetCamY = EntityManager.player.y + EntityManager.player.height - deadzoneBottom;
        }
        
        CameraState.x += (targetCamX - CameraState.x) * (0.1 * timeScale);
        CameraState.y += (targetCamY - CameraState.y) * (0.08 * timeScale);
        
        CameraState.x = Math.max(0, Math.min(CameraState.x, mapWidth * TILE_SIZE - canvas.width));
        CameraState.y = Math.max(0, Math.min(CameraState.y, mapHeight * TILE_SIZE - canvas.height));
    }
    draw(ctx) {
        Renderer.draw(ctx, CameraState.x, CameraState.y, canvas.width, canvas.height);
    }
    handleDeath() {
        if (!EntityManager.player || EntityManager.player.isInvincible || devOptions.godMode) return;
        
        EntityManager.spawnExplosion(EntityManager.player.x + EntityManager.player.width/2, EntityManager.player.y + EntityManager.player.height/2, EntityManager.player.color);
        AudioManager.playSFX('death');
        
        state.lives--;
        UIEngine.updateHUD(state.gameTime, state.lives, GameConfig.INITIAL_LIVES);
        
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
        
        UIEngine.showQuestion().then(result => {
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
        UIEngine.updateHUD(state.gameTime, state.lives, GameConfig.INITIAL_LIVES);
        EntityManager.update(dt * devOptions.speedMultiplier);
    }
    draw(ctx) {
        Renderer.draw(ctx, CameraState.x, CameraState.y, canvas.width, canvas.height, false);
    }
}

class GameOverScene {
    constructor(isWin, deathInfo = null) {
        this.isWin = isWin;
        this.deathInfo = deathInfo;
    }
    enter() {
        if (!this.isWin) {
            EntityManager.spawnExplosion(EntityManager.player.x + EntityManager.player.width/2, EntityManager.player.y + EntityManager.player.height/2, EntityManager.player.color);
            AudioManager.playSFX('gameover');
        } else {
            AudioManager.playSFX('win');
        }
        
        let finalTimeStr = null;
        let topRecords = [];
        
        if (this.isWin) {
            finalTimeStr = SaveManager.formatTime(state.gameTime);
            topRecords = SaveManager.addRecord(state.gameTime);
        }
        
        UIEngine.showGameOver(this.isWin, this.deathInfo, finalTimeStr, topRecords);
    }
    exit() {
        UIEngine.hideScreen('gameOver');
    }
    update(dt) {
        let hasActiveParticles = EntityManager.particlePool ? EntityManager.particlePool.getActiveObjects().length > 0 : false;
        if (!hasActiveParticles && !this.isWin) {
            UIEngine.showScreen('gameOver');
        }
        
        if (!this.isWin) {
            EntityManager.update(dt * devOptions.speedMultiplier);
        }
    }
    draw(ctx) {
        Renderer.draw(ctx, CameraState.x, CameraState.y, canvas.width, canvas.height, this.isWin);
    }
}

function init() {
    Core.init();
    initDevOptions();
    Renderer.init();
    AudioManager.init();
    QuestionRepository.load(); // 預載入 Markdown 題庫
    
    // Subscribe to Global Events
    EventBus.on(Events.PLAYER_DEATH, () => {
        if (SceneManager.currentScene instanceof GameplayScene) {
            SceneManager.currentScene.handleDeath();
        }
    });

    EventBus.on(Events.LEVEL_COMPLETE, () => {
        if (SceneManager.currentScene instanceof GameplayScene) {
            if (LevelManager.loadNextLevel()) {
                state.lives = GameConfig.INITIAL_LIVES;
                SaveManager.saveProgress(LevelManager.currentLevelIndex, state.gameTime);
                SceneManager.changeScene(new GameplayScene(false));
            } else {
                SaveManager.clearProgress();
                SceneManager.changeScene(new GameOverScene(true));
            }
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
    
    UIEngine.screens.start.addEventListener('pointerdown', handleStartTap);
    UIEngine.screens.gameOver.addEventListener('pointerdown', handleStartTap);
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
        (dt) => {
            SceneManager.update(dt);
            UIEngine.updateFPS(GameLoop.fps);
        },
        (ctx) => SceneManager.draw(ctx)
    );
}

window.onload = init;
