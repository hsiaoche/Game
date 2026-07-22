import { drawDevUI } from './DevOptions.js';

class Particle {
    constructor() {
        this.active = false;
    }
    reset(x, y, color, isExplosion) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 4 + 2;
        this.speedX = (Math.random() - 0.5) * (isExplosion ? 8 : 3);
        this.speedY = (Math.random() - 0.5) * (isExplosion ? 8 : 1) - (isExplosion? 0 : 1);
        this.color = color;
        this.life = 1.0;
        this.decay = Math.random() * 0.03 + 0.02;
        this.active = true;
    }
    update(timeScale, ctx, cameraX, cameraY) {
        if (!this.active) return;
        this.x += this.speedX * timeScale;
        this.y += this.speedY * timeScale;
        this.life -= this.decay * timeScale;
        
        if (this.life <= 0) {
            this.active = false;
            return;
        }
        
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillRect(this.x - cameraX, this.y - cameraY, this.size, this.size);
        ctx.globalAlpha = 1.0;
    }
}

let cachedSawCanvas = null;
function createSawCache(size) {
    if (cachedSawCanvas) return;
    cachedSawCanvas = document.createElement('canvas');
    const padding = 16; // space for shadow blur
    cachedSawCanvas.width = size + padding; 
    cachedSawCanvas.height = size + padding;
    const cctx = cachedSawCanvas.getContext('2d');
    
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
}

export const EntityManager = {
    player: null,
    saws: [],
    particles: [],

    init(playerRef) {
        this.player = playerRef;
        this.saws = [];
        
        // Initialize object pool for particles (Max 100 on screen to save memory/GC)
        if (this.particles.length === 0) {
            for(let i=0; i<100; i++) {
                this.particles.push(new Particle());
            }
        } else {
            this.particles.forEach(p => p.active = false);
        }
    },

    addSaw(saw) {
        this.saws.push(saw);
    },

    spawnParticle(x, y, color, isExplosion) {
        const p = this.particles.find(p => !p.active);
        if (p) {
            p.reset(x, y, color, isExplosion);
        }
    },

    draw(ctx, cameraX, cameraY) {
        // Draw Saws using Offscreen Canvas Cache
        for (let s of this.saws) {
            if (!cachedSawCanvas) createSawCache(s.size);
            
            ctx.save();
            ctx.translate(s.x + s.size/2 - cameraX, s.y + s.size/2 - cameraY);
            ctx.rotate(s.rotation);
            
            const offset = -(s.size + 16) / 2;
            ctx.drawImage(cachedSawCanvas, offset, offset);
            
            ctx.restore();
        }

        // Draw Player
        if (this.player) this.player.draw(ctx, cameraX, cameraY);
        
        // Draw Developer UI Overlay
        drawDevUI(ctx);
    },
    
    updateParticles(timeScale, ctx, cameraX, cameraY) {
        for (let p of this.particles) {
            if (p.active) {
                p.update(timeScale, ctx, cameraX, cameraY);
            }
        }
    }
};
