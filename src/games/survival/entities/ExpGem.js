import { SurvivalConfig } from '../config.js';

export class ExpGem {
    constructor() {
        this.active = false;
        this.x = 0;
        this.y = 0;
        this.size = 8;
        this.value = 1;
        this.color = SurvivalConfig.COLORS.EXP_GEM;
        this.isBeingSucked = false;
        this.vy = 0;
    }

    reset(x, y, value) {
        this.active = true;
        this.x = x;
        this.y = y;
        this.value = value;
        this.isBeingSucked = false;
        this.vy = 0;
        if (value > 10) this.size = 12;
        else if (value > 5) this.size = 10;
        else this.size = 8;
    }

    update(dt, player, canvas) {
        if (!this.active) return;

        let dx = player.x + player.width/2 - this.x;
        let dy = player.y + player.height/2 - this.y;
        
        let distSq = dx * dx + dy * dy;
        let dist = Math.sqrt(distSq);

        // Auto-pickup: Always suck towards player quickly
        this.isBeingSucked = true;

        if (this.isBeingSucked && dist > 0) {
            // Magnet pull
            let speed = 800 + (1000 / Math.max(dist, 10)); // Increased speed for auto-pickup
            this.x += (dx / dist) * speed * dt;
            this.y += (dy / dist) * speed * dt;
        } else {
            // Apply gravity
            this.vy += SurvivalConfig.GRAVITY * dt;
            if (this.vy > SurvivalConfig.TERMINAL_VELOCITY) {
                this.vy = SurvivalConfig.TERMINAL_VELOCITY;
            }
            this.y += this.vy * dt;

            // Stop at floor level
            const floorY = canvas.height - 30; // Match player level
            if (this.y > floorY) {
                this.y = floorY;
                this.vy = 0;
            }
        }
    }
}
