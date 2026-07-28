export class Enemy {
    constructor() {
        this.active = false;
        this.x = 0;
        this.y = 0;
        this.width = 24;
        this.height = 24;
        this.speed = 100;
        this.maxHp = 10;
        this.hp = 10;
        this.damage = 10;
        this.color = '#f43f5e';
        this.expValue = 1;
        this.hitFlashTimer = 0;
        
        // Knockback
        this.kbX = 0;
        this.kbY = 0;
    }

    reset(x, y, typeConfig = {}) {
        this.active = true;
        this.x = x;
        this.y = y;
        this.speed = typeConfig.speed || 100;
        this.maxHp = typeConfig.hp || 10;
        this.hp = this.maxHp;
        this.damage = typeConfig.damage || 10;
        this.color = typeConfig.color || '#f43f5e';
        this.width = typeConfig.size || 24;
        this.height = typeConfig.size || 24;
        this.expValue = typeConfig.exp || 1;
        this.hitFlashTimer = 0;
        this.kbX = 0;
        this.kbY = 0;
    }

    update(dt, player) {
        if (!this.active) return;
        
        if (this.hitFlashTimer > 0) {
            this.hitFlashTimer -= dt;
        }

        // Knockback physics
        if (Math.abs(this.kbX) > 5 || Math.abs(this.kbY) > 5) {
            this.x += this.kbX * dt;
            this.y += this.kbY * dt;
            this.kbX *= Math.pow(0.1, dt); // High friction for knockback
            this.kbY *= Math.pow(0.1, dt);
        } else {
            // Chase AI
            let dx = player.x - this.x;
            let dy = player.y - this.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 0) {
                dx /= dist;
                dy /= dist;
                this.x += dx * this.speed * dt;
                this.y += dy * this.speed * dt;
            }
        }
    }

    takeDamage(amount, kbX = 0, kbY = 0) {
        this.hp -= amount;
        this.hitFlashTimer = 0.1;
        this.kbX = kbX;
        this.kbY = kbY;
        if (this.hp <= 0) {
            this.active = false;
            return true; // died
        }
        return false;
    }

    getHitbox() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}
