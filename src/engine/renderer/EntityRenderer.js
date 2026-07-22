/**
 * @file EntityRenderer.js
 * @description 負責繪製所有遊戲實體 (玩家、鋸片、特效粒子)，將 Canvas API 隔離於實體邏輯之外。
 */

export const EntityRenderer = {
    cachedSawCanvas: null,

    createSawCache(size) {
        if (this.cachedSawCanvas) return;
        this.cachedSawCanvas = document.createElement('canvas');
        const padding = 16; 
        this.cachedSawCanvas.width = size + padding; 
        this.cachedSawCanvas.height = size + padding;
        const cctx = this.cachedSawCanvas.getContext('2d');
        
        const center = (size + padding) / 2;
        cctx.translate(center, center);
        
        cctx.fillStyle = '#f43f5e';
        cctx.shadowColor = '#f43f5e';
        cctx.shadowBlur = 8;
        
        cctx.beginPath();
        cctx.arc(0, 0, size/2, 0, Math.PI * 2);
        cctx.fill();
        
        cctx.fillStyle = '#be123c';
        for (let i = 0; i < 6; i++) {
            cctx.rotate(Math.PI / 3);
            cctx.beginPath();
            cctx.moveTo(-size/2 - 2, -3);
            cctx.lineTo(-size/2 - 6, 0);
            cctx.lineTo(-size/2 - 2, 3);
            cctx.fill();
        }
        cctx.fillStyle = '#0f172a';
        cctx.beginPath();
        cctx.arc(0, 0, 4, 0, Math.PI * 2);
        cctx.fill();
    },

    drawPlayer(ctx, player, cameraX, cameraY) {
        if (!player) return;
        
        if (player.isInvincible) {
            if (Math.floor(player.invincibleTimer * 15) % 2 === 0) ctx.globalAlpha = 0.5;
        }
        
        ctx.fillStyle = player.color;
        ctx.shadowColor = player.color;
        ctx.shadowBlur = 12;
        ctx.fillRect(player.x - cameraX, player.y - cameraY, player.width, player.height);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
    },

    drawSaws(ctx, saws, cameraX, cameraY) {
        for (let saw of saws) {
            if (!saw.active) continue;
            
            if (!this.cachedSawCanvas) this.createSawCache(saw.size);
            
            ctx.save();
            ctx.translate(saw.x + saw.size/2 - cameraX, saw.y + saw.size/2 - cameraY);
            ctx.rotate(saw.rotation);
            
            const offset = -(saw.size + 16) / 2;
            ctx.drawImage(this.cachedSawCanvas, offset, offset);
            
            ctx.restore();
        }
    },

    drawParticles(ctx, particles, cameraX, cameraY) {
        for (let p of particles) {
            if (!p.active) continue;
            
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillRect(p.x - cameraX, p.y - cameraY, p.size, p.size);
        }
        ctx.globalAlpha = 1.0;
    }
};
