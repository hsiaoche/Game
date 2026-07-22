import { getTile, getRawTile, TILE_SIZE } from './Map.js';
import { PhysicsEngine } from '../engine/PhysicsEngine.js';
import { EntityManager } from '../engine/EntityManager.js';
import { LevelManager } from '../engine/LevelManager.js';
import { devOptions } from '../engine/DevOptions.js';
import { EventBus, Events } from '../engine/EventBus.js';
import { GameConfig } from '../config/gameConfig.js';
import { PhysicsConfig } from '../config/physicsConfig.js';

export function createJumpParticles(x, y) {
    for (let i = 0; i < 4; i++) {
        EntityManager.spawnParticle(x + (Math.random()-0.5)*10, y, 'rgba(255,255,255,0.4)', false);
    }
}

export function createDeathParticles(x, y, color) {
    for (let i = 0; i < 30; i++) {
        EntityManager.spawnParticle(x, y, color, true);
    }
}

export class Player {
    constructor() {
        this.x = 0; this.y = 0;
        this.width = 24; this.height = 24;
        this.vx = 0; this.vy = 0;
        this.maxSpeed = PhysicsConfig.PLAYER_SPEED / 60; // Approximate translation for max speed
        this.acceleration = 0.8;
        this.friction = 0.8; 
        this.jumpForce = Math.abs(PhysicsConfig.JUMP_FORCE) / 30; // Approximation
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

    draw(ctx, cameraX, cameraY) {
        if (this.isInvincible) {
            if (Math.floor(this.invincibleTimer * 15) % 2 === 0) ctx.globalAlpha = 0.5;
        }
        
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 12;
        ctx.fillRect(this.x - cameraX, this.y - cameraY, this.width, this.height);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
    }

    update(timeScale, keys) {
        if (this.isInvincible) {
            this.invincibleTimer -= timeScale / 60;
            if (this.invincibleTimer <= 0) this.isInvincible = false;
        }

        // Horizontal Movement
        if (keys.left) this.vx -= this.acceleration * timeScale;
        if (keys.right) this.vx += this.acceleration * timeScale;
        
        // Friction adjustment for timeScale
        this.vx *= Math.pow(this.friction, timeScale);
        
        if (this.vx > this.maxSpeed) this.vx = this.maxSpeed;
        if (this.vx < -this.maxSpeed) this.vx = -this.maxSpeed;
        if (Math.abs(this.vx) < 0.1) this.vx = 0;

        // Vertical Acceleration
        this.vy += this.gravity * timeScale;
        
        if (keys.jump && this.isGrounded) {
            this.vy = -this.jumpForce;
            this.isGrounded = false;
            createJumpParticles(this.x + this.width/2, this.y + this.height);
        }
        
        this.isGrounded = false; 

        // Physics Sub-stepping to prevent Tunneling
        let totalDx = this.vx * timeScale;
        let totalDy = this.vy * timeScale;
        
        // Maximum pixels per step to guarantee we don't pass through a TILE_SIZE (40px)
        const STEP_SIZE = 15; 
        
        let stepsX = Math.ceil(Math.abs(totalDx) / STEP_SIZE);
        let stepsY = Math.ceil(Math.abs(totalDy) / STEP_SIZE);
        let maxSteps = Math.max(stepsX, stepsY, 1);
        
        let dx = totalDx / maxSteps;
        let dy = totalDy / maxSteps;
        
        for (let i = 0; i < maxSteps; i++) {
            this.x += dx;
            PhysicsEngine.resolveCollisionX(this);
            if (this.vx === 0) dx = 0; // stop stepping horizontally if hit a wall
            
            this.y += dy;
            PhysicsEngine.resolveCollisionY(this);
            if (this.vy === 0) dy = 0; // stop stepping vertically if hit floor/ceiling
        }

        // Goal and Spike Detection
        const cLeft = Math.floor(this.x / TILE_SIZE);
        const cRight = Math.floor((this.x + this.width - 0.1) / TILE_SIZE);
        const rTop = Math.floor(this.y / TILE_SIZE);
        const rBottom = Math.floor((this.y + this.height - 0.1) / TILE_SIZE);

        for (let r = rTop; r <= rBottom; r++) {
            for (let c = cLeft; c <= cRight; c++) {
                const rawTile = getRawTile(c, r);
                if (rawTile === '2' && !devOptions.godMode && !this.isInvincible) {
                    EventBus.emit(Events.PLAYER_DEATH);
                } else if (rawTile === '3') {
                    EventBus.emit(Events.LEVEL_COMPLETE);
                }
            }
        }
    }
}

export function updateSaws(dt) {
    const player = EntityManager.player;
    for (let s of EntityManager.saws) {
        if (s.type === 'H') {
            s.x += s.speed * s.dir * dt;
            const cLeft = Math.floor(s.x / TILE_SIZE);
            const cRight = Math.floor((s.x + s.size) / TILE_SIZE);
            const rTop = Math.floor((s.y + s.size/2) / TILE_SIZE); 
            if (s.dir > 0 && getTile(cRight, rTop) === '1') {
                s.dir = -1;
            } else if (s.dir < 0 && getTile(cLeft, rTop) === '1') {
                s.dir = 1;
            }
        } else if (s.type === 'V') {
            s.y += s.speed * s.dir * dt;
            const cCenter = Math.floor((s.x + s.size/2) / TILE_SIZE);
            const rTop = Math.floor(s.y / TILE_SIZE);
            const rBottom = Math.floor((s.y + s.size) / TILE_SIZE);
            if (s.dir > 0 && getTile(cCenter, rBottom) === '1') {
                s.dir = -1;
            } else if (s.dir < 0 && getTile(cCenter, rTop) === '1') {
                s.dir = 1;
            }
        }
        
        s.rotation += 0.1 * (dt * 60);
        
        const hitShrink = 4;
        const sawHitbox = { x: s.x, y: s.y, width: s.size, height: s.size };
        
        if (!devOptions.godMode && player && !player.isInvincible && PhysicsEngine.checkAABB(player, sawHitbox, hitShrink)) {
            EventBus.emit(Events.PLAYER_DEATH);
        }
    }
}
