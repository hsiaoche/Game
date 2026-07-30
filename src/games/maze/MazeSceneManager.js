/**
 * @file MazeSceneManager.js
 * @description 迷宮跑酷專屬的場景管理器
 */
import { GameContext as state } from '../../engine/core/GameState.js';
import { canvas, ctx, CameraState, resizeCanvas } from '../../engine/core/Camera.js';
import { keys } from '../../engine/core/InputManager.js';
import { mapWidth, mapHeight, TILE_SIZE } from './Map.js';
import { MazeEntityManager } from './MazeEntityManager.js';
import { Renderer } from '../../engine/renderer/Renderer.js';
import { SceneManager } from '../../engine/SceneManager.js';
import { devOptions } from '../../shared/utils/DevOptions.js';
import { MazeLevelManager } from './MazeLevelManager.js';
import { level1 } from './levels.js';
import { UIEngine } from '../../shared/ui/UIEngine.js';
import { SaveManager } from '../../shared/storage/SaveManager.js';
import { AudioManager } from '../../shared/audio/AudioManager.js';
import { GameConfig } from '../../shared/config/gameConfig.js';
// TODO: MazeEntityManager and MazePhysics

export class MazeGameplayScene {
    constructor(isReset = true) {
        this.isReset = isReset;
    }
    enter() {
        resizeCanvas();
        if (this.isReset) {
            MazeLevelManager.initGame();
            const progress = SaveManager.loadProgress('maze');
            if (progress) {
                state.gameTime = progress.gameTime || 0;
                state.lives = GameConfig.INITIAL_LIVES;
            } else {
                state.gameTime = 0;
                state.lives = GameConfig.INITIAL_LIVES;
            }
        }
        
        CameraState.x = MazeEntityManager.player.x + MazeEntityManager.player.width/2 - canvas.width/2;
        CameraState.y = MazeEntityManager.player.y + MazeEntityManager.player.height/2 - canvas.height/2;
        
        UIEngine.showScreen('mobileControls');
        UIEngine.showScreen('hud');
        UIEngine.setupMazeControls();
        
        keys.left = false;
        keys.right = false;
        keys.jump = false;
    }
    exit() {
        UIEngine.hideScreen('mobileControls');
    }
    update(dt) {
        state.gameTime += dt * devOptions.speedMultiplier;
        UIEngine.updateHUD(state.gameTime, state.lives, GameConfig.INITIAL_LIVES, MazeLevelManager.currentLevelIndex);
        
        let timeScale = dt * 60;
        timeScale *= devOptions.speedMultiplier; 
        
        if (MazeEntityManager.player) {
            MazeEntityManager.player.update(timeScale, keys);
            MazeLevelManager.update(MazeEntityManager.player);
        }
        
        MazeEntityManager.update(dt * devOptions.speedMultiplier);
        
        if (!MazeEntityManager.player) return; // Stop executing if player died and scene changed
        
        const targetCamX = MazeEntityManager.player.x + MazeEntityManager.player.width/2 - canvas.width/2;
        
        // Vertical Deadzone
        const playerScreenY = MazeEntityManager.player.y - CameraState.y;
        const deadzoneTop = canvas.height * 0.35;
        const deadzoneBottom = canvas.height * 0.65;
        
        let targetCamY = CameraState.y;
        if (playerScreenY < deadzoneTop) {
            targetCamY = MazeEntityManager.player.y - deadzoneTop;
        } else if (playerScreenY + MazeEntityManager.player.height > deadzoneBottom) {
            targetCamY = MazeEntityManager.player.y + MazeEntityManager.player.height - deadzoneBottom;
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
        if (!MazeEntityManager.player || MazeEntityManager.player.isInvincible || devOptions.godMode) return;
        
        MazeEntityManager.spawnExplosion(MazeEntityManager.player.x + MazeEntityManager.player.width/2, MazeEntityManager.player.y + MazeEntityManager.player.height/2, MazeEntityManager.player.color);
        AudioManager.playSFX('death');
        
        state.lives--;
        UIEngine.updateHUD(state.gameTime, state.lives, GameConfig.INITIAL_LIVES);
        
        if (state.lives >= 0) {
            SceneManager.changeScene(new MazeQuestionScene());
        } else {
            SceneManager.changeScene(new MazeGameOverScene(false, { reason: 'OUT_OF_LIVES' }));
        }
    }
}

export class MazeQuestionScene {
    constructor() {}
    enter() {
        const tempPlayer = MazeEntityManager.player;
        MazeEntityManager.player = null; // Hide player visually
        
        UIEngine.showQuestion().then(result => {
            MazeEntityManager.player = tempPlayer; // Restore player
            if (result.isCorrect) {
                MazeEntityManager.player.x = MazeLevelManager.currentRespawnPos.x;
                MazeEntityManager.player.y = MazeLevelManager.currentRespawnPos.y;
                MazeEntityManager.player.isInvincible = true;
                MazeEntityManager.player.invincibleTimer = GameConfig.INVINCIBILITY_DURATION;
                SceneManager.changeScene(new MazeGameplayScene(false));
            } else {
                SceneManager.changeScene(new MazeGameOverScene(false, { reason: 'WRONG_ANSWER', correctAnswer: result.correctAnswer }));
            }
        });
    }
    exit() {}
    update(dt) {
        state.gameTime += dt * devOptions.speedMultiplier;
        UIEngine.updateHUD(state.gameTime, state.lives, GameConfig.INITIAL_LIVES, MazeLevelManager.currentLevelIndex);
        MazeEntityManager.update(dt * devOptions.speedMultiplier);
    }
    draw(ctx) {
        Renderer.draw(ctx, CameraState.x, CameraState.y, canvas.width, canvas.height, false);
    }
}

export class MazeGameOverScene {
    constructor(isWin, deathInfo = null) {
        this.isWin = isWin;
        this.deathInfo = deathInfo;
    }
    enter() {
        if (!this.isWin) {
            MazeEntityManager.spawnExplosion(MazeEntityManager.player.x + MazeEntityManager.player.width/2, MazeEntityManager.player.y + MazeEntityManager.player.height/2, MazeEntityManager.player.color);
            AudioManager.playSFX('gameover');
        } else {
            AudioManager.playSFX('win');
        }
        
        let finalTimeStr = null;
        let topRecords = [];
        
        if (this.isWin) {
            finalTimeStr = SaveManager.formatTime(state.gameTime);
            topRecords = SaveManager.addRecord('maze', state.gameTime);
        }
        
        UIEngine.showGameOver(this.isWin, this.deathInfo, finalTimeStr, topRecords);
    }
    exit() {
        UIEngine.hideScreen('gameOver');
    }
    update(dt) {
        let hasActiveParticles = MazeEntityManager.particlePool ? MazeEntityManager.particlePool.getActiveObjects().length > 0 : false;
        if (!hasActiveParticles && !this.isWin) {
            UIEngine.showScreen('gameOver');
        }
        
        if (!this.isWin) {
            MazeEntityManager.update(dt * devOptions.speedMultiplier);
        }
    }
    draw(ctx) {
        Renderer.draw(ctx, CameraState.x, CameraState.y, canvas.width, canvas.height, this.isWin);
    }
}
