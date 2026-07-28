/**
 * @file Particle.js
 * @description 粒子特效實體，支援 ObjectPool 重複利用。
 */

export class Particle {
    constructor() {
        this.active = false;
        this.x = 0;
        this.y = 0;
        this.size = 0;
        this.speedX = 0;
        this.speedY = 0;
        this.color = '';
        this.life = 0;
        this.decay = 0;
    }

    reset(x, y, color, isExplosion) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 4 + 2;
        this.speedX = (Math.random() - 0.5) * (isExplosion ? 8 : 3);
        this.speedY = (Math.random() - 0.5) * (isExplosion ? 8 : 1) - (isExplosion ? 0 : 1);
        this.color = color;
        this.life = 1.0;
        this.decay = Math.random() * 0.03 + 0.02;
    }

    update(timeScale) {
        if (!this.active) return;
        this.x += this.speedX * timeScale;
        this.y += this.speedY * timeScale;
        this.life -= this.decay * timeScale;
        
        if (this.life <= 0) {
            this.active = false;
        }
    }
}
