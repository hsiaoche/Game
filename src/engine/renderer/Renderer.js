/**
 * @file Renderer.js
 * @description 統一的渲染引擎介面，協調整個遊戲的畫面繪製作業。
 */
import { TileRenderer } from './TileRenderer.js';
import { EntityRenderer } from './EntityRenderer.js';
import { EntityManager } from '../EntityManager.js';
import { currentMapData } from '../../game/Map.js';

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

        // 2. Draw Entities (Saws, Particles, Player)
        const saws = EntityManager.saws;
        if (saws.length > 0) {
            EntityRenderer.drawSaws(ctx, saws, cameraX, cameraY);
        }

        const particles = EntityManager.particlePool ? EntityManager.particlePool.getActiveObjects() : [];
        if (particles.length > 0) {
            EntityRenderer.drawParticles(ctx, particles, cameraX, cameraY);
        }

        if (renderPlayer && EntityManager.player) {
            EntityRenderer.drawPlayer(ctx, EntityManager.player, cameraX, cameraY);
        }
    }
};
