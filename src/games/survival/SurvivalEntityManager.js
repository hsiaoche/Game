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
                e.update(dt, this.player);
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
                    this.spawnDamageText(this.player.x, this.player.y - 10, `-${e.damage}`, '#f43f5e');
                }
            }
        }

        // 3. Projectiles vs Enemies
        const activeProjectiles = this.projectilePool ? this.projectilePool.getActiveObjects() : [];
        for (let p of activeProjectiles) {
            const projBox = p.getHitbox();
            for (let e of activeEnemies) {
                if (p.hitEnemies.has(e)) continue; // Already hit

                if (this.checkAABB(projBox, e.getHitbox())) {
                    p.hitEnemies.add(e);
                    
                    // Knockback vector
                    let dx = e.x + e.width/2 - (p.x);
                    let dy = e.y + e.height/2 - (p.y);
                    let dist = Math.sqrt(dx*dx + dy*dy);
                    let kbX = 0, kbY = 0;
                    if (dist > 0) {
                        kbX = (dx/dist) * 300;
                        kbY = (dy/dist) * 300;
                    }
                    
                    this.spawnDamageText(e.x, e.y - 10, p.damage, '#fff');

                    if (e.takeDamage(p.damage, kbX, kbY)) {
                        this.spawnGem(e.x + e.width/2, e.y + e.height/2, e.expValue);
                        if (e.isBoss) {
                            this.bossDefeated = true;
                        }
                    }
                    
                    if (p.hitEnemies.size >= p.penetration) {
                        p.active = false;
                        break;
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
