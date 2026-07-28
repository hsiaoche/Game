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
    }

    reset(x, y, value) {
        this.active = true;
        this.x = x;
        this.y = y;
        this.value = value;
        this.isBeingSucked = false;
        if (value > 10) this.size = 12;
        else if (value > 5) this.size = 10;
        else this.size = 8;
    }

    update(dt, player) {
        if (!this.active) return;

        let dx = player.x + player.width/2 - this.x;
        let dy = player.y + player.height/2 - this.y;
        
        // Infinite magnet range
        this.isBeingSucked = true;
        
        let distSq = dx * dx + dy * dy;
        let dist = Math.sqrt(distSq);
        if (dist > 0) {
            // Gems accelerate slightly the closer they get, base speed 400
            let speed = 400 + (1000 / Math.max(dist, 10));
            this.x += (dx / dist) * speed * dt;
            this.y += (dy / dist) * speed * dt;
        }
    }
}
