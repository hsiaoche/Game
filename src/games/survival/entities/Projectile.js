import { SurvivalEntityManager } from '../SurvivalEntityManager.js';

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
        this.maxLife = 0;
        this.penetration = 1;
        this.hitEnemies = new Set();
        
        // Custom behaviors
        this.isEnemyProjectile = false;
        this.onHit = null;
        this.boomerang = false;
        this.boomerangReturned = false;
        this.tornado = false;
        this.stationary = false;
        this.turret = false;
        this.turretTimer = 0;
        this.stretchToV = false;
        this.chainLightning = false;
        this.noKnockback = false;
        this.tornadoAngle = 0;
        this.tornadoRadius = 0;
        this.originX = 0;
        this.originY = 0;
    }

    reset(x, y, vx, vy, config) {
        this.active = true;
        this.x = x;
        this.y = y;
        this.originX = x;
        this.originY = y;
        this.vx = vx;
        this.vy = vy;
        this.size = config.size || 10;
        this.damage = config.damage || 10;
        this.color = config.color || '#fff';
        this.life = config.life || 2; 
        this.maxLife = this.life;
        this.penetration = config.penetration || 1;
        this.hitEnemies.clear();
        
        this.isEnemyProjectile = config.isEnemyProjectile || false;
        this.onHit = config.onHit || null;
        this.boomerang = config.boomerang || false;
        this.boomerangReturned = false;
        this.tornado = config.tornado || false;
        this.stationary = config.stationary || false;
        this.turret = config.turret || false;
        this.turretTimer = 0.5;
        this.stretchToV = config.stretchToV || false;
        this.chainLightning = config.chainLightning || false;
        this.noKnockback = config.noKnockback || false;
        this.magicMissile = config.magicMissile || false;
        
        this.tornadoAngle = Math.atan2(vy, vx);
        this.tornadoRadius = 0;
    }

    update(dt) {
        if (!this.active) return;
        
        if (this.stationary) {
            // don't move
        } else if (this.tornado) {
            this.tornadoRadius += 50 * dt;
            this.tornadoAngle += 3 * dt;
            this.x = this.originX + Math.cos(this.tornadoAngle) * this.tornadoRadius;
            this.y = this.originY + Math.sin(this.tornadoAngle) * this.tornadoRadius;
            this.originX += this.vx * dt;
            this.originY += this.vy * dt;
        } else if (this.boomerang) {
            if (this.life < this.maxLife / 2 && !this.boomerangReturned) {
                this.vx *= -1;
                this.vy *= -1;
                this.boomerangReturned = true;
                this.hitEnemies.clear(); // Can hit again on return
            }
            this.x += this.vx * dt;
            this.y += this.vy * dt;
        } else if (this.magicMissile && (this.maxLife - this.life) >= 0.2) {
            // Find lowest enemy (highest Y)
            let target = null;
            let maxY = -9999;
            if (SurvivalEntityManager.enemyPool) {
                for (let e of SurvivalEntityManager.enemyPool.getActiveObjects()) {
                    if (e.y > maxY) {
                        maxY = e.y;
                        target = e;
                    }
                }
            }
            if (target) {
                let dx = target.x - this.x;
                let dy = target.y - this.y;
                let dist = Math.sqrt(dx*dx + dy*dy);
                if (dist > 0) {
                    let speed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
                    // Steer towards target
                    let targetVx = (dx/dist) * speed;
                    let targetVy = (dy/dist) * speed;
                    this.vx += (targetVx - this.vx) * 10 * dt;
                    this.vy += (targetVy - this.vy) * 10 * dt;
                }
            }
            this.x += this.vx * dt;
            this.y += this.vy * dt;
        } else {
            this.x += this.vx * dt;
            this.y += this.vy * dt;
        }
        
        if (this.turret) {
            this.turretTimer -= dt;
            if (this.turretTimer <= 0) {
                this.turretTimer = 0.5;
                // Fire at nearest enemy (just shoot a bullet right)
                SurvivalEntityManager.spawnProjectile(this.x, this.y, 400, 0, {
                    damage: this.damage, color: '#e2e8f0', size: 6, penetration: 1
                });
                SurvivalEntityManager.spawnProjectile(this.x, this.y, -400, 0, {
                    damage: this.damage, color: '#e2e8f0', size: 6, penetration: 1
                });
            }
        }

        this.life -= dt;
        if (this.life <= 0) {
            this.active = false;
        }
    }

    getHitbox() {
        if (this.stretchToV) {
            let len = Math.sqrt(this.vx*this.vx + this.vy*this.vy) * 0.1;
            return { x: this.x - len, y: this.y - len, width: len*2, height: len*2 };
        }
        return { x: this.x - this.size/2, y: this.y - this.size/2, width: this.size, height: this.size };
    }
}
