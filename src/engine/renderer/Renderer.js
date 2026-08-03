/**
 * @file Renderer.js
 * @description 統一的渲染引擎介面，協調整個遊戲的畫面繪製作業。
 */
import { TileRenderer } from './TileRenderer.js';
import { EntityRenderer } from './EntityRenderer.js';
import { MazeEntityManager } from '../../games/maze/MazeEntityManager.js';
import { currentMapData } from '../../games/maze/Map.js';

export const Renderer = {
    init() {
        TileRenderer.init(currentMapData);
    },

    rebuildCache(mapData) {
        TileRenderer.prerender(mapData);
    },

    draw(ctx, cameraX, cameraY, canvasWidth, canvasHeight, renderPlayer = true) {
        // 1. Draw Map (Background + Tiles)
        TileRenderer.draw(ctx, cameraX, cameraY, canvasWidth, canvasHeight);

        // 2. Draw Map Entities (Bounce, Drop, Portals)
        EntityRenderer.drawMapEntities(
            ctx, 
            MazeEntityManager.bouncePads, 
            MazeEntityManager.dropPlatforms, 
            MazeEntityManager.portals, 
            cameraX, 
            cameraY
        );

        // 3. Draw Entities (Saws, Particles, Player)
        const saws = MazeEntityManager.saws;
        if (saws.length > 0) {
            EntityRenderer.drawSaws(ctx, saws, cameraX, cameraY);
        }

        const particles = MazeEntityManager.particlePool ? MazeEntityManager.particlePool.getActiveObjects() : [];
        if (particles.length > 0) {
            EntityRenderer.drawParticles(ctx, particles, cameraX, cameraY);
        }
        
        // 4. Player
        if (renderPlayer && MazeEntityManager.player) {
            EntityRenderer.drawPlayer(ctx, MazeEntityManager.player, cameraX, cameraY);
        }
    }
};
