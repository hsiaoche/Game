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
        let dx = 0;
        if (keys.left) dx -= 1;
        if (keys.right) dx += 1;
        
        if (dx > 0) this.facing = 1;
        else if (dx < 0) this.facing = -1;

        this.x += dx * this.speed * dt;

        // Screen Boundaries
        if (this.x < 0) this.x = 0;
        if (this.x > canvas.width - this.width) this.x = canvas.width - this.width;
        
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
