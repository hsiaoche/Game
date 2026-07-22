import { getTile, TILE_SIZE } from '../game/Map.js';

export const PhysicsEngine = {
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
