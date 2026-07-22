/**
 * @file Player.js
 * @description 玩家實體，處理物理移動、碰撞偵測發起與死亡判定。
 */
import { getRawTile, TILE_SIZE } from '../Map.js';
import { PhysicsEngine } from '../../engine/PhysicsEngine.js';
import { EntityManager } from '../../engine/EntityManager.js';
import { devOptions } from '../../engine/DevOptions.js';
import { EventBus, Events } from '../../engine/EventBus.js';
import { GameConfig } from '../../config/gameConfig.js';
import { PhysicsConfig } from '../../config/physicsConfig.js';

export class Player {
    constructor() {
        this.x = 0; 
        this.y = 0;
        this.width = 24; 
        this.height = 24;
        this.vx = 0; 
        this.vy = 0;
        this.maxSpeed = PhysicsConfig.PLAYER_SPEED / 60;
        this.acceleration = 0.8;
        this.friction = 0.8; 
        this.jumpForce = Math.abs(PhysicsConfig.JUMP_FORCE) / 30;
        this.gravity = PhysicsConfig.GRAVITY / 2000;
        this.isGrounded = false;
        this.color = GameConfig.COLORS.PLAYER;
        this.isInvincible = false;
        this.invincibleTimer = 0;
    }

    init(startPos) {
        this.x = startPos.x + (TILE_SIZE - this.width) / 2;
        this.y = startPos.y + (TILE_SIZE - this.height) / 2;
        this.vx = 0;
        this.vy = 0;
        this.isGrounded = false;
        this.isInvincible = false;
        this.invincibleTimer = 0;
    }

    update(timeScale, keys) {
        if (this.isInvincible) {
            this.invincibleTimer -= timeScale / 60;
            if (this.invincibleTimer <= 0) this.isInvincible = false;
        }

        // Horizontal Movement
        if (keys.left) this.vx -= this.acceleration * timeScale;
        if (keys.right) this.vx += this.acceleration * timeScale;
        
        this.vx *= Math.pow(this.friction, timeScale);
        
        if (this.vx > this.maxSpeed) this.vx = this.maxSpeed;
        if (this.vx < -this.maxSpeed) this.vx = -this.maxSpeed;
        if (Math.abs(this.vx) < 0.1) this.vx = 0;

        // Vertical Acceleration
        this.vy += this.gravity * timeScale;
        
        if (keys.jump && this.isGrounded) {
            this.vy = -this.jumpForce;
            this.isGrounded = false;
            this.createJumpParticles();
        }
        
        this.isGrounded = false; 

        // Physics Sub-stepping
        let totalDx = this.vx * timeScale;
        let totalDy = this.vy * timeScale;
        const STEP_SIZE = 15; 
        
        let stepsX = Math.ceil(Math.abs(totalDx) / STEP_SIZE);
        let stepsY = Math.ceil(Math.abs(totalDy) / STEP_SIZE);
        let maxSteps = Math.max(stepsX, stepsY, 1);
        
        let dx = totalDx / maxSteps;
        let dy = totalDy / maxSteps;
        
        for (let i = 0; i < maxSteps; i++) {
            this.x += dx;
            PhysicsEngine.resolveCollisionX(this);
            if (this.vx === 0) dx = 0; 
            
            this.y += dy;
            PhysicsEngine.resolveCollisionY(this);
            if (this.vy === 0) dy = 0;
        }

        // Static Collision (Spikes, Goal) - Broad Phase
        const collidables = PhysicsEngine.broadPhase(this);
        for (let tile of collidables) {
            if ((tile.type === '2' || tile.type === 'SAW') && !devOptions.godMode && !this.isInvincible) {
                EventBus.emit(Events.PLAYER_DEATH);
            } else if (tile.type === '3') {
                EventBus.emit(Events.LEVEL_COMPLETE);
            }
        }
    }
    
    createJumpParticles() {
        for (let i = 0; i < 4; i++) {
            EntityManager.spawnParticle(this.x + (Math.random()-0.5)*10, this.y + this.height, 'rgba(255,255,255,0.4)', false);
        }
    }
    
    getHitbox() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}
