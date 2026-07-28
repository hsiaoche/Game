export class Projectile {
    constructor() {
        this.active = false;
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.size = 10;
        this.damage = 10;
        this.color = '#fff';
        this.life = 0;
        this.penetration = 1;
        this.hitEnemies = new Set();
    }

    reset(x, y, vx, vy, config) {
        this.active = true;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = config.size || 10;
        this.damage = config.damage || 10;
        this.color = config.color || '#fff';
        this.life = config.life || 2; // seconds
        this.penetration = config.penetration || 1;
        this.hitEnemies.clear();
    }

    update(dt) {
        if (!this.active) return;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= dt;
        if (this.life <= 0) {
            this.active = false;
        }
    }

    getHitbox() {
        return { x: this.x - this.size/2, y: this.y - this.size/2, width: this.size, height: this.size };
    }
}
