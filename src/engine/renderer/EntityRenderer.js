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
    },

    drawMapEntities(ctx, bouncePads, dropPlatforms, portals, cameraX, cameraY) {
        if (bouncePads) {
            bouncePads.forEach(pad => {
                ctx.fillStyle = '#3b82f6'; // Blue for bounce
                ctx.fillRect(pad.x - cameraX, pad.y - cameraY + pad.height/2, pad.width, pad.height/2);
                ctx.fillStyle = '#60a5fa';
                ctx.fillRect(pad.x - cameraX, pad.y - cameraY + pad.height/2, pad.width, 4);
            });
        }
        
        if (dropPlatforms) {
            dropPlatforms.forEach(drop => {
                if (drop.state === 'dropped') return;
                
                let ox = 0, oy = 0;
                if (drop.state === 'shaking') {
                    ox = (Math.random() - 0.5) * 4;
                    oy = (Math.random() - 0.5) * 4;
                    ctx.fillStyle = '#f59e0b'; // Orange when shaking
                } else {
                    ctx.fillStyle = '#eab308'; // Yellow idle
                }
                
                ctx.fillRect(drop.x - cameraX + ox, drop.y - cameraY + oy, drop.width, drop.height);
            });
        }

        if (portals) {
            portals.forEach(portal => {
                ctx.fillStyle = portal.cooldown > 0 ? '#6b7280' : (portal.id === 'P' || portal.id === 'Q' ? '#c084fc' : '#2dd4bf'); // Purple or Teal
                ctx.shadowColor = ctx.fillStyle;
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.ellipse(portal.x - cameraX + portal.width/2, portal.y - cameraY + portal.height/2, portal.width/3, portal.height/2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            });
        }
    }
};
