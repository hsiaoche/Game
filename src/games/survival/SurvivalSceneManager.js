import { GameContext as state } from '../../engine/core/GameState.js';
import { canvas, ctx, CameraState, resizeCanvas } from '../../engine/core/Camera.js';
import { keys } from '../../engine/core/InputManager.js';
import { Renderer } from '../../engine/renderer/Renderer.js';
import { SceneManager } from '../../engine/SceneManager.js';
import { devOptions } from '../../shared/utils/DevOptions.js';
import { UIEngine } from '../../shared/ui/UIEngine.js';
import { SaveManager } from '../../shared/storage/SaveManager.js';
import { AudioManager } from '../../shared/audio/AudioManager.js';

import { SurvivalConfig } from './config.js';
import { SurvivalEntityManager } from './SurvivalEntityManager.js';
import { WaveManager } from './WaveManager.js';
import { SkillManager } from './SkillManager.js';

function drawSurvivalGrid(ctx, cameraX, cameraY) {
    ctx.fillStyle = SurvivalConfig.COLORS.BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = SurvivalConfig.COLORS.GRID;
    ctx.lineWidth = 1;

    const gridSize = 100;
    const startX = -(cameraX % gridSize);
    const startY = -(cameraY % gridSize);

    ctx.beginPath();
    for (let x = startX; x < canvas.width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
    }
    for (let y = startY; y < canvas.height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();

    // Draw arena boundaries if visible
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.strokeRect(-cameraX, -cameraY, SurvivalConfig.ARENA_WIDTH, SurvivalConfig.ARENA_HEIGHT);
}

export class SurvivalGameplayScene {
    constructor(isReset = true) {
        this.isReset = isReset;
        this.isLevelingUp = false;
    }

    enter() {
        resizeCanvas();
        if (this.isReset) {
            state.gameTime = 0;
            SurvivalEntityManager.init();
            SurvivalEntityManager.player.initPos(canvas);
            WaveManager.init();
            SkillManager.init();
        }
        
        CameraState.x = 0;
        CameraState.y = 0;
        
        UIEngine.showScreen('mobileControls');
        UIEngine.showScreen('survivalHud');
        const jumpBtn = document.getElementById('btn-jump');
        const joystick = document.getElementById('joystick-right');
        if(jumpBtn) jumpBtn.classList.add('hidden');
        if(joystick) joystick.classList.remove('hidden');
        this.updateHUD();
        
        keys.left = false;
        keys.right = false;
        keys.up = false;
        keys.down = false;
        this.isLevelingUp = false;
    }

    exit() {
        UIEngine.hideScreen('mobileControls');
        UIEngine.hideScreen('survivalHud');
        const jumpBtn = document.getElementById('btn-jump');
        const joystick = document.getElementById('joystick-right');
        if(jumpBtn) jumpBtn.classList.remove('hidden');
        if(joystick) joystick.classList.add('hidden');
    }

    update(dt) {
        if (this.isLevelingUp) return;

        state.gameTime += dt * devOptions.speedMultiplier;
        
        let timeScale = dt * devOptions.speedMultiplier;

        SurvivalEntityManager.update(timeScale, keys, canvas);
        WaveManager.update(timeScale, canvas);
        SkillManager.update(timeScale, SurvivalEntityManager.player, keys);

        let leveledUp = SurvivalEntityManager.checkCollisions();
        
        if (SurvivalEntityManager.player.hp <= 0 && !devOptions.godMode) {
            this.handleDeath();
            return;
        }

        if (leveledUp) {
            this.handleLevelUp();
        }

        // Camera Follow (Removed, static camera)
        CameraState.x = 0;
        CameraState.y = 0;

        this.updateHUD();
    }

    draw(ctx) {
        drawSurvivalGrid(ctx, CameraState.x, CameraState.y);
        
        // Draw Gems
        if (SurvivalEntityManager.gemPool) {
            for (let g of SurvivalEntityManager.gemPool.getActiveObjects()) {
                ctx.fillStyle = g.color;
                ctx.beginPath();
                ctx.arc(g.x - CameraState.x, g.y - CameraState.y, g.size/2, 0, Math.PI*2);
                ctx.fill();
            }
        }

        // Draw Projectiles
        if (SurvivalEntityManager.projectilePool) {
            for (let p of SurvivalEntityManager.projectilePool.getActiveObjects()) {
                ctx.fillStyle = p.color;
                ctx.globalAlpha = Math.min(1, p.life * 2);
                if (p.size > 20) {
                    ctx.beginPath();
                    ctx.arc(p.x - CameraState.x, p.y - CameraState.y, p.size/2, 0, Math.PI*2);
                    ctx.fill();
                } else {
                    ctx.fillRect(p.x - p.size/2 - CameraState.x, p.y - p.size/2 - CameraState.y, p.size, p.size);
                }
                ctx.globalAlpha = 1.0;
            }
        }

        // Draw Enemies
        if (SurvivalEntityManager.enemyPool) {
            for (let e of SurvivalEntityManager.enemyPool.getActiveObjects()) {
                ctx.fillStyle = e.hitFlashTimer > 0 ? '#fff' : e.color;
                ctx.fillRect(e.x - CameraState.x, e.y - CameraState.y, e.width, e.height);
            }
        }

        // Draw Player
        const p = SurvivalEntityManager.player;
        if (p) {
            if (p.isInvincible && Math.floor(p.invincibleTimer * 15) % 2 === 0) ctx.globalAlpha = 0.5;
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;
            ctx.fillRect(p.x - CameraState.x, p.y - CameraState.y, p.width, p.height);
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1.0;
            
            // Player HP bar
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(p.x - CameraState.x, p.y - 10 - CameraState.y, p.width, 4);
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(p.x - CameraState.x, p.y - 10 - CameraState.y, p.width * (p.hp / p.maxHp), 4);
        }

        // Draw Damage Texts
        if (SurvivalEntityManager.damageTextPool) {
            ctx.font = 'bold 16px Inter';
            ctx.textAlign = 'center';
            for (let t of SurvivalEntityManager.damageTextPool.getActiveObjects()) {
                ctx.globalAlpha = Math.max(0, t.life / t.maxLife);
                ctx.fillStyle = t.color;
                ctx.fillText(t.text, t.x - CameraState.x, t.y - CameraState.y);
            }
            ctx.globalAlpha = 1.0;
        }
    }

    updateHUD() {
        const p = SurvivalEntityManager.player;
        if (!p) return;
        
        // We will implement SurvivalUIEngine later, but for now use DOM directly or via UIEngine
        const timeStr = SaveManager.formatTime(state.gameTime);
        UIEngine.updateSurvivalHUD(timeStr, p.level, p.exp, p.expToNextLevel, p.hp, p.maxHp);
    }

    handleDeath() {
        SurvivalEntityManager.spawnDamageText(SurvivalEntityManager.player.x, SurvivalEntityManager.player.y, "DEFEATED", "#f43f5e");
        AudioManager.playSFX('death');
        
        SceneManager.changeScene(new SurvivalQuestionScene(SurvivalEntityManager.player.x, SurvivalEntityManager.player.y));
    }

    handleLevelUp() {
        this.isLevelingUp = true;
        AudioManager.playSFX('win'); // temp sfx
        const options = SkillManager.getUpgradeOptions();
        
        UIEngine.showSurvivalLevelUp(options).then(chosenSkillId => {
            if (chosenSkillId) {
                SkillManager.addOrUpgradeSkill(chosenSkillId);
            }
            this.isLevelingUp = false;
        });
    }
}

export class SurvivalQuestionScene {
    constructor(deathX, deathY) {
        this.deathX = deathX;
        this.deathY = deathY;
    }
    enter() {
        const tempPlayer = SurvivalEntityManager.player;
        SurvivalEntityManager.player = null; // Hide visually
        
        UIEngine.showQuestion().then(result => {
            SurvivalEntityManager.player = tempPlayer; 
            if (result.isCorrect) {
                SurvivalEntityManager.player.hp = SurvivalEntityManager.player.maxHp;
                SurvivalEntityManager.player.isInvincible = true;
                SurvivalEntityManager.player.invincibleTimer = 3.0; // 3 secs i-frames
                SceneManager.changeScene(new SurvivalGameplayScene(false));
            } else {
                SceneManager.changeScene(new SurvivalGameOverScene(false, { reason: 'WRONG_ANSWER', correctAnswer: result.correctAnswer }));
            }
        });
    }
    exit() {}
    update(dt) {}
    draw(ctx) {
        drawSurvivalGrid(ctx, CameraState.x, CameraState.y);
        // Draw entities statically
        const p = SurvivalEntityManager.player;
        // Simplified draw for question background
    }
}

export class SurvivalGameOverScene {
    constructor(isWin, deathInfo = null) {
        this.isWin = isWin;
        this.deathInfo = deathInfo;
    }
    enter() {
        AudioManager.playSFX('gameover');
        
        let finalTimeStr = SaveManager.formatTime(state.gameTime);
        let topRecords = SaveManager.addRecord('survival', state.gameTime); // Save time survived
        
        UIEngine.showGameOver(false, this.deathInfo, finalTimeStr, topRecords); // Use existing game over UI
    }
    exit() {
        UIEngine.hideScreen('gameOver');
    }
    update(dt) {}
    draw(ctx) {}
}
