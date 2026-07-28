export class DamageText {
    constructor() {
        this.active = false;
        this.x = 0;
        this.y = 0;
        this.text = '';
        this.color = '#fff';
        this.life = 0;
        this.maxLife = 1;
        this.vy = -30;
    }

    reset(x, y, text, color = '#fff') {
        this.active = true;
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.maxLife = 0.8;
        this.life = this.maxLife;
        this.vy = -30 - Math.random() * 20;
    }

    update(dt) {
        if (!this.active) return;
        this.y += this.vy * dt;
        this.life -= dt;
        if (this.life <= 0) this.active = false;
    }
}
