import { getTile, getRawTile, TILE_SIZE } from './Map.js';
import { MazeEntityManager } from './MazeEntityManager.js';

export const MazePhysics = {
    broadPhase(entity) {
        const collidables = [];
        
        // 1. Map Tiles (9-grid around entity)
        const cLeft = Math.floor(entity.x / TILE_SIZE);
        const cRight = Math.floor((entity.x + entity.width - 0.1) / TILE_SIZE);
        const rTop = Math.floor(entity.y / TILE_SIZE);
        const rBottom = Math.floor((entity.y + entity.height - 0.1) / TILE_SIZE);

        for (let r = rTop; r <= rBottom; r++) {
            for (let c = cLeft; c <= cRight; c++) {
                const rawTile = getRawTile(c, r);
                if (rawTile === '2' || rawTile === '3') {
                    collidables.push({
                        type: rawTile,
                        hitbox: { x: c * TILE_SIZE, y: r * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE }
                    });
                }
            }
        }
        
        // 2. Saws
        const saws = MazeEntityManager.saws;
        for (let s of saws) {
            const shrink = 4;
            const sawHitbox = { x: s.x + shrink, y: s.y + shrink, width: s.size - shrink * 2, height: s.size - shrink * 2 };
            // Simple distance check could be added here for broad phase, but since Saws are few, AABB is fast enough.
            if (this.checkAABB(entity, sawHitbox)) {
                 collidables.push({ type: 'SAW', hitbox: sawHitbox });
            }
        }
        
        return collidables;
    },
    checkPlatformCollisionX(entity) {
        if (!MazeEntityManager.dropPlatforms) return;
        MazeEntityManager.dropPlatforms.forEach(drop => {
            if (drop.state === 'dropped') return;
            if (this.checkAABB(entity, drop)) {
                if (drop.state === 'idle') {
                    drop.state = 'shaking';
                    drop.timer = 0.6;
                }
                // Resolve X
                if (entity.vx > 0) {
                    entity.x = drop.x - entity.width;
                    entity.vx = 0;
                } else if (entity.vx < 0) {
                    entity.x = drop.x + drop.width;
                    entity.vx = 0;
                }
            }
        });
    },

    checkPlatformCollisionY(entity) {
        if (MazeEntityManager.dropPlatforms) {
            MazeEntityManager.dropPlatforms.forEach(drop => {
                if (drop.state === 'dropped') return;
                if (this.checkAABB(entity, drop)) {
                    if (drop.state === 'idle') {
                        drop.state = 'shaking';
                        drop.timer = 0.6; // 0.6 seconds to shake before dropping
                    }
                    // Resolve Y
                    if (entity.vy > 0) {
                        entity.y = drop.y - entity.height;
                        entity.vy = 0;
                        entity.isGrounded = true;
                    } else if (entity.vy < 0) {
                        entity.y = drop.y + drop.height;
                        entity.vy = 0;
                    }
                }
            });
        }
        
        if (MazeEntityManager.bouncePads) {
            MazeEntityManager.bouncePads.forEach(pad => {
                if (this.checkAABB(entity, pad)) {
                    if (entity.vy > 0 && entity.y + entity.height - entity.vy * 0.016 <= pad.y + 10) {
                        entity.y = pad.y - entity.height;
                        entity.vy = -650; // Moderated bounce
                        entity.isGrounded = false;
                    }
                }
            });
        }
    },

    resolveCollisionX(entity) {
        const rTop = Math.floor((entity.y + 2) / TILE_SIZE);
        const rBottom = Math.floor((entity.y + entity.height - 2) / TILE_SIZE);

        if (entity.vx > 0) {
            let cRight = Math.floor((entity.x + entity.width - 0.1) / TILE_SIZE);
            let loop = 0;
            while ((getTile(cRight, rTop) === '1' || getTile(cRight, rBottom) === '1') && loop < 5) {
                entity.x = cRight * TILE_SIZE - entity.width;
                entity.vx = 0;
                cRight = Math.floor((entity.x + entity.width - 0.1) / TILE_SIZE);
                loop++;
            }
        } else if (entity.vx < 0) {
            let cLeft = Math.floor(entity.x / TILE_SIZE);
            let loop = 0;
            while ((getTile(cLeft, rTop) === '1' || getTile(cLeft, rBottom) === '1') && loop < 5) {
                entity.x = (cLeft + 1) * TILE_SIZE;
                entity.vx = 0;
                cLeft = Math.floor(entity.x / TILE_SIZE);
                loop++;
            }
        }
        
        this.checkPlatformCollisionX(entity);
    },

    resolveCollisionY(entity) {
        const cLeft = Math.floor((entity.x + 2) / TILE_SIZE);
        const cRight = Math.floor((entity.x + entity.width - 2) / TILE_SIZE);

        if (entity.vy > 0) {
            let rBottom = Math.floor((entity.y + entity.height - 0.1) / TILE_SIZE);
            let loop = 0;
            while ((getTile(cLeft, rBottom) === '1' || getTile(cRight, rBottom) === '1') && loop < 5) {
                entity.y = rBottom * TILE_SIZE - entity.height;
                entity.vy = 0;
                entity.isGrounded = true; 
                rBottom = Math.floor((entity.y + entity.height - 0.1) / TILE_SIZE);
                loop++;
            }
        } else if (entity.vy < 0) {
            let rTop = Math.floor(entity.y / TILE_SIZE);
            let loop = 0;
            while ((getTile(cLeft, rTop) === '1' || getTile(cRight, rTop) === '1') && loop < 5) {
                entity.y = (rTop + 1) * TILE_SIZE;
                entity.vy = 0; 
                rTop = Math.floor(entity.y / TILE_SIZE);
                loop++;
            }
        }
        
        this.checkPlatformCollisionY(entity);
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
