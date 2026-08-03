/**
 * @file EntityManager.js
 * @description 管理所有遊戲實體，包含玩家、以及透過 ObjectPool 管理的鋸片與粒子特效。
 */
import { ObjectPool } from '../../engine/pool/ObjectPool.js';
import { Particle } from './entities/Particle.js';
import { Saw } from './entities/Saw.js';

export const MazeEntityManager = {
    player: null,
    sawPool: null,
    particlePool: null,

    init(playerRef) {
        this.player = playerRef;
        
        if (!this.particlePool) {
            this.particlePool = new ObjectPool(() => new Particle(), 100);
        } else {
            this.particlePool.clear();
        }

        if (!this.sawPool) {
            this.sawPool = new ObjectPool(() => new Saw(), 20);
        } else {
            this.sawPool.clear();
        }
    },

    loadMapEntities(mapInfo) {
        this.sawPool.clear();
        for (let config of mapInfo.sawConfigs) {
            const saw = this.sawPool.get();
            if (saw) {
                saw.reset(config);
            }
        }
        
        this.bouncePads = mapInfo.bounceConfigs || [];
        this.dropPlatforms = mapInfo.dropConfigs || [];
        this.portals = mapInfo.portalConfigs || [];
    },

    spawnParticle(x, y, color, isExplosion) {
        if (!this.particlePool) return;
        const p = this.particlePool.get();
        if (p) {
            p.reset(x, y, color, isExplosion);
        }
    },
    
    spawnExplosion(x, y, color, count = 30) {
        for (let i = 0; i < count; i++) {
            this.spawnParticle(x, y, color, true);
        }
    },

    update(dt) {
        if (this.sawPool) {
            this.sawPool.getActiveObjects().forEach(saw => saw.update(dt));
        }
        
        // Update Drop Platforms
        if (this.dropPlatforms) {
            this.dropPlatforms.forEach(drop => {
                if (drop.state === 'shaking') {
                    drop.timer -= dt;
                    if (drop.timer <= 0) {
                        drop.state = 'dropped';
                        drop.timer = 2.0; // 2 seconds to respawn
                    }
                } else if (drop.state === 'dropped') {
                    drop.timer -= dt;
                    if (drop.timer <= 0) {
                        drop.state = 'idle'; // Respawn
                    }
                }
            });
        }

        // Update Portals cooldown
        if (this.portals) {
            this.portals.forEach(p => {
                if (p.cooldown > 0) p.cooldown -= dt;
            });
        }
        
        let timeScale = dt * 60;
        if (this.particlePool) {
            this.particlePool.getActiveObjects().forEach(p => {
                p.update(timeScale);
            });
        }
    },

    get saws() {
        return this.sawPool ? this.sawPool.getActiveObjects() : [];
    }
};
