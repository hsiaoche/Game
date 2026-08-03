import { ObjectPool } from '../../engine/pool/ObjectPool.js';
import { Enemy } from './entities/Enemy.js';
import { ExpGem } from './entities/ExpGem.js';
import { Projectile } from './entities/Projectile.js';
import { DamageText } from './entities/DamageText.js';
import { SurvivalPlayer } from './entities/SurvivalPlayer.js';
import { SurvivalConfig } from './config.js';

export const SurvivalEntityManager = {
    player: null,
    enemyPool: null,
    gemPool: null,
    projectilePool: null,
    damageTextPool: null,
    bossDefeated: false,

    init() {
        this.player = new SurvivalPlayer();
        
        if (!this.enemyPool) this.enemyPool = new ObjectPool(() => new Enemy(), 200);
        else this.enemyPool.clear();
        
        if (!this.gemPool) this.gemPool = new ObjectPool(() => new ExpGem(), 300);
        else this.gemPool.clear();
        
        if (!this.projectilePool) this.projectilePool = new ObjectPool(() => new Projectile(), 100);
        else this.projectilePool.clear();

        if (!this.damageTextPool) this.damageTextPool = new ObjectPool(() => new DamageText(), 100);
        else this.damageTextPool.clear();
        
        this.bossDefeated = false;
    },

    spawnEnemy(x, y, config) {
        if (!this.enemyPool) return null;
        const e = this.enemyPool.get();
        if (e) {
            e.reset(x, y, config);
            return e;
        }
        return null;
    },

    spawnGem(x, y, value) {
        if (!this.gemPool) return;
        const g = this.gemPool.get();
        if (g) g.reset(x, y, value);
    },

    spawnProjectile(x, y, vx, vy, config) {
        if (!this.projectilePool) return;
        const p = this.projectilePool.get();
        if (p) p.reset(x, y, vx, vy, config);
    },

    spawnDamageText(x, y, text, color) {
        if (!this.damageTextPool) return;
        const t = this.damageTextPool.get();
        if (t) t.reset(x, y, text, color);
    },
    
    spawnEnemyProjectile(x, y, vx, vy, speed, damage, color) {
        if (!this.projectilePool) return;
        const p = this.projectilePool.get();
        if (p) {
            p.reset(x, y, vx, vy, {
                damage: damage,
                speed: speed,
                color: color,
                size: 8,
                range: 1000,
                penetration: 1
            });
            p.isEnemyProjectile = true; // distinguish from player projectiles
        }
    },
    
    spawnExplosion(x, y, radius, damage, color, dealDamage = true) {
        if (dealDamage && this.player) {
            let dx = this.player.x - x;
            let dy = this.player.y - y;
            if (dx*dx + dy*dy < radius*radius) {
                if (this.player.takeDamage(damage)) {
                    this.spawnDamageText(this.player.x, this.player.y - 10, `-${Math.round(damage)}`, '#f43f5e');
                }
            }
        }
    },
    
    healEnemiesInRange(x, y, radius, amount) {
        if (!this.enemyPool) return;
        this.enemyPool.getActiveObjects().forEach(e => {
            let dx = e.x - x;
            let dy = e.y - y;
            if (dx*dx + dy*dy < radius*radius) {
                e.hp = Math.min(e.hp + amount, e.maxHp);
                this.spawnDamageText(e.x, e.y - 10, `+${Math.round(amount)}`, '#22c55e');
            }
        });
    },
    
    shieldEnemiesInRange(x, y, radius) {
        if (!this.enemyPool) return;
        this.enemyPool.getActiveObjects().forEach(e => {
            let dx = e.x - x;
            let dy = e.y - y;
            if (dx*dx + dy*dy < radius*radius) {
                e.hasShield = true;
            }
        });
    },

    update(dt, keys, canvas) {
        if (!this.player) return;
        
        this.player.update(dt, keys, canvas);

        // Update Projectiles
        if (this.projectilePool) {
            this.projectilePool.getActiveObjects().forEach(p => p.update(dt));
        }

        // Update Enemies
        if (this.enemyPool) {
            this.enemyPool.getActiveObjects().forEach(e => {
                e.update(dt, this.player, canvas);
            });
        }

        // Update Gems
        if (this.gemPool) {
            this.gemPool.getActiveObjects().forEach(g => {
                g.update(dt, this.player, canvas);
            });
        }

        // Update Damage Texts
        if (this.damageTextPool) {
            this.damageTextPool.getActiveObjects().forEach(t => t.update(dt));
        }
    },
    
    checkCollisions() {
        if (!this.player) return false;
        let leveledUp = false;

        const pBox = this.player.getHitbox();

        // 1. Player vs Gems (Pickup)
        const activeGems = this.gemPool ? this.gemPool.getActiveObjects() : [];
        const pCenterX = pBox.x + pBox.width / 2;
        const pCenterY = pBox.y + pBox.height / 2;
        
        for (let g of activeGems) {
            let dx = pCenterX - g.x;
            let dy = pCenterY - g.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist <= SurvivalConfig.EXP_PICKUP_RADIUS) {
                if (this.player.gainExp(g.value)) leveledUp = true;
                g.active = false;
            }
        }

        // 2. Player vs Enemies (Damage)
        const activeEnemies = this.enemyPool ? this.enemyPool.getActiveObjects() : [];
        for (let e of activeEnemies) {
            if (this.checkAABB(pBox, e.getHitbox(), 4)) {
                if (this.player.takeDamage(e.damage)) {
                    this.spawnDamageText(this.player.x, this.player.y - 10, `-${Math.round(e.damage)}`, '#f43f5e');
                }
            }
        }

        // 3. Projectiles vs Enemies & Player
        const activeProjectiles = this.projectilePool ? this.projectilePool.getActiveObjects() : [];
        for (let p of activeProjectiles) {
            const projBox = p.getHitbox();
            
            if (p.isEnemyProjectile) {
                // Enemy Projectile hits Player
                if (this.checkAABB(projBox, pBox)) {
                    if (this.player.takeDamage(p.damage)) {
                        this.spawnDamageText(this.player.x, this.player.y - 10, `-${Math.round(p.damage)}`, '#f43f5e');
                    }
                    p.active = false;
                }
            } else {
                // Player Projectile hits Enemies
                for (let e of activeEnemies) {
                    if (p.hitEnemies.has(e)) continue; // Already hit
    
                    if (this.checkAABB(projBox, e.getHitbox())) {
                        p.hitEnemies.add(e);
                        
                        if (p.onHit) {
                            p.onHit(p, e);
                        }
                        
                        // Knockback vector
                        let dx = e.x + e.width/2 - (p.x);
                        let dy = e.y + e.height/2 - (p.y);
                        let dist = Math.sqrt(dx*dx + dy*dy);
                        let kbX = 0, kbY = 0;
                        if (dist > 0 && !p.noKnockback) {
                            kbX = (dx/dist) * 300;
                            kbY = (dy/dist) * 300;
                        }
                        
                        this.spawnDamageText(e.x, e.y - 10, Math.round(p.damage), '#fff');
    
                        if (e.takeDamage(p.damage, kbX, kbY)) {
                            this.spawnGem(e.x + e.width/2, e.y + e.height/2, e.expValue);
                            if (e.isBoss) {
                                this.bossDefeated = true;
                            }
                        }
                        
                        if (p.chainLightning) {
                            // Find nearest enemy to chain to
                            let nearest = null;
                            let minDist = 400;
                            for (let other of activeEnemies) {
                                if (other === e || !other.active || p.hitEnemies.has(other)) continue;
                                let ddx = other.x - e.x;
                                let ddy = other.y - e.y;
                                let d = Math.sqrt(ddx*ddx + ddy*ddy);
                                if (d < minDist) {
                                    minDist = d;
                                    nearest = other;
                                }
                            }
                            if (nearest) {
                                let ddx = nearest.x - e.x;
                                let ddy = nearest.y - e.y;
                                p.x = e.x;
                                p.y = e.y;
                                p.vx = (ddx/minDist) * 800;
                                p.vy = (ddy/minDist) * 800;
                            } else {
                                p.active = false;
                            }
                        }
                        
                        if (p.hitEnemies.size >= p.penetration) {
                            p.active = false;
                            break;
                        }
                    }
                }
            }
        }
        
        return leveledUp;
    },

    checkAABB(a, b, shrink = 0) {
        return (
            a.x + shrink < b.x + b.width &&
            a.x + a.width - shrink > b.x &&
            a.y + shrink < b.y + b.height &&
            a.y + a.height - shrink > b.y
        );
    }
};
