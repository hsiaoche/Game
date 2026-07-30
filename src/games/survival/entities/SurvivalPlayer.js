import { SurvivalConfig } from '../config.js';
import { devOptions } from '../../../shared/utils/DevOptions.js';

export class SurvivalPlayer {
    constructor() {
        this.width = SurvivalConfig.PLAYER_SIZE;
        this.height = SurvivalConfig.PLAYER_SIZE;
        this.x = SurvivalConfig.ARENA_WIDTH / 2 - this.width / 2;
        this.y = SurvivalConfig.ARENA_HEIGHT / 2 - this.height / 2;
        
        this.vx = 0;
        this.vy = 0;
        this.speed = SurvivalConfig.PLAYER_SPEED;
        
        this.maxHp = SurvivalConfig.PLAYER_MAX_HP;
        this.hp = this.maxHp;
        this.color = SurvivalConfig.COLORS.PLAYER;
        
        this.exp = 0;
        this.level = 1;
        this.expToNextLevel = SurvivalConfig.LEVEL_UP_BASE;
        
        this.isInvincible = false;
        this.invincibleTimer = 0;
        this.facing = 1; // 1 for right, -1 for left
    }

    initPos(canvas) {
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 30;
    }

    update(dt, keys, canvas) {
        if (this.isInvincible) {
            this.invincibleTimer -= dt;
            if (this.invincibleTimer <= 0) this.isInvincible = false;
        }

        // 1-directional movement (Horizontal only)
        let inputDx = 0;
        if (keys.left) inputDx -= 1;
        if (keys.right) inputDx += 1;
        
        // Add left joystick support
        if (Math.abs(keys.moveDx) > 0) {
            inputDx = keys.moveDx / 50; // Normalize somewhat based on knob radius
            if (inputDx > 1) inputDx = 1;
            if (inputDx < -1) inputDx = -1;
        }
        
        if (inputDx > 0) this.facing = 1;
        else if (inputDx < 0) this.facing = -1;

        // Apply acceleration
        if (inputDx !== 0) {
            this.vx += inputDx * SurvivalConfig.PLAYER_ACCEL * dt;
        } else {
            // Apply friction
            this.vx *= Math.pow(SurvivalConfig.PLAYER_FRICTION, dt * 60);
        }
        
        // Clamp speed
        if (this.vx > this.speed) this.vx = this.speed;
        if (this.vx < -this.speed) this.vx = -this.speed;
        
        // Stop completely if very slow
        if (Math.abs(this.vx) < 5 && inputDx === 0) this.vx = 0;

        this.x += this.vx * dt;

        // Screen Boundaries
        if (this.x < 0) {
            this.x = 0;
            this.vx = 0;
        }
        if (this.x > canvas.width - this.width) {
            this.x = canvas.width - this.width;
            this.vx = 0;
        }
        
        // Lock Y to fixed bottom position
        this.y = canvas.height - this.height - 30;
    }

    takeDamage(amount) {
        if (this.isInvincible || devOptions.godMode) return false;
        this.hp -= amount;
        this.isInvincible = true;
        this.invincibleTimer = 0.5; // i-frames
        return true;
    }
    
    gainExp(amount) {
        this.exp += amount;
        if (this.exp >= this.expToNextLevel) {
            this.exp -= this.expToNextLevel;
            this.level++;
            this.expToNextLevel = Math.floor(this.expToNextLevel * SurvivalConfig.LEVEL_UP_FACTOR);
            return true; // Leveled up
        }
        return false;
    }

    getHitbox() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}
