/**
 * @file TileRenderer.js
 * @description 負責靜態地圖的繪製，使用 Offscreen Canvas 快取技術大幅提升效能。
 */
import { TILE_SIZE, mapWidth, mapHeight } from '../../game/Map.js';

export const TileRenderer = {
    offscreenCanvas: null,
    ctx: null,

    init(mapData) {
        if (!this.offscreenCanvas) {
            this.offscreenCanvas = document.createElement('canvas');
            this.ctx = this.offscreenCanvas.getContext('2d');
        }
        
        if (mapData && mapData.length > 0) {
            this.prerender(mapData);
        }
    },

    prerender(mapData) {
        if (!mapData || mapData.length === 0) return;
        const h = mapData.length;
        const w = mapData[0].length;
        
        this.offscreenCanvas.width = w * TILE_SIZE;
        this.offscreenCanvas.height = h * TILE_SIZE;
        
        this.ctx.clearRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
        
        for (let r = 0; r < h; r++) {
            for (let c = 0; c < w; c++) {
                const tile = mapData[r][c];
                const px = c * TILE_SIZE;
                const py = r * TILE_SIZE;

                if (tile === '1') {
                    this.ctx.fillStyle = '#475569'; 
                    this.ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
                    this.ctx.fillRect(px, py + TILE_SIZE - 4, TILE_SIZE, 4);
                    this.ctx.fillRect(px + TILE_SIZE - 4, py, 4, TILE_SIZE);
                } else if (tile === '2') {
                    this.ctx.fillStyle = '#f43f5e';
                    this.ctx.shadowColor = '#f43f5e';
                    this.ctx.shadowBlur = 10;
                    this.ctx.beginPath();
                    this.ctx.moveTo(px, py + TILE_SIZE);
                    this.ctx.lineTo(px + TILE_SIZE/2, py + 10);
                    this.ctx.lineTo(px + TILE_SIZE, py + TILE_SIZE);
                    this.ctx.fill();
                    this.ctx.shadowBlur = 0;
                } else if (tile === '3') {
                    this.ctx.fillStyle = '#10b981';
                    this.ctx.shadowColor = '#10b981';
                    this.ctx.shadowBlur = 20;
                    this.ctx.fillRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
                    this.ctx.shadowBlur = 0;
                } else if (tile === 'S') {
                    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
                }
            }
        }
    },
    
    drawBackground(ctx, cameraX, cameraY, canvasWidth, canvasHeight) {
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        ctx.lineWidth = 1;
        const bgSize = 40;
        const offsetX = cameraX % bgSize;
        const offsetY = cameraY % bgSize;
        
        ctx.beginPath();
        for(let y = -offsetY; y < canvasHeight; y += bgSize) {
            ctx.moveTo(0, y); ctx.lineTo(canvasWidth, y);
        }
        for(let x = -offsetX; x < canvasWidth; x += bgSize) {
            ctx.moveTo(x, 0); ctx.lineTo(x, canvasHeight);
        }
        ctx.stroke();
    },

    draw(ctx, cameraX, cameraY, canvasWidth, canvasHeight) {
        this.drawBackground(ctx, cameraX, cameraY, canvasWidth, canvasHeight);
        
        if (this.offscreenCanvas) {
            const sx = Math.max(0, cameraX);
            const sy = Math.max(0, cameraY);
            
            const sWidth = Math.min(canvasWidth, this.offscreenCanvas.width - sx);
            const sHeight = Math.min(canvasHeight, this.offscreenCanvas.height - sy);
            
            // Destination rectangle on the main canvas (handle negative camera coordinates)
            const dx = cameraX < 0 ? -cameraX : 0;
            const dy = cameraY < 0 ? -cameraY : 0;
            
            if (sWidth > 0 && sHeight > 0) {
                ctx.drawImage(
                    this.offscreenCanvas,
                    sx, sy, sWidth, sHeight,
                    dx, dy, sWidth, sHeight
                );
            }
        }
    }
};
