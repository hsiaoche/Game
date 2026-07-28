/**
 * @file Saw.js
 * @description 巡邏鋸片實體，支援水平與垂直巡邏，以及獨立的繪製快取。
 */

import { TILE_SIZE, getTile } from '../Map.js';

export class Saw {
    constructor() {
        this.active = false;
        this.x = 0;
        this.y = 0;
        this.type = 'H';
        this.speed = 0;
        this.dir = 1;
        this.size = 24;
        this.rotation = 0;
    }
    
    reset(config) {
        this.x = config.x;
        this.y = config.y;
        this.type = config.type;
        this.speed = config.speed;
        this.dir = config.dir || 1;
        this.size = config.size || 24;
        this.rotation = config.rotation || 0;
    }

    update(dt) {
        if (!this.active) return;
        
        if (this.type === 'H') {
            let dx = this.speed * this.dir * dt;
            const steps = Math.ceil(Math.abs(dx) / (TILE_SIZE / 2));
            const stepDx = dx / steps;
            const rTop = Math.floor((this.y + this.size/2) / TILE_SIZE); 
            
            for (let i = 0; i < steps; i++) {
                this.x += stepDx;
                if (this.dir > 0) {
                    const cRight = Math.floor((this.x + this.size) / TILE_SIZE);
                    if (getTile(cRight, rTop) === '1') {
                        this.dir = -1;
                        this.x = cRight * TILE_SIZE - this.size;
                        break;
                    }
                } else if (this.dir < 0) {
                    const cLeft = Math.floor(this.x / TILE_SIZE);
                    if (getTile(cLeft, rTop) === '1') {
                        this.dir = 1;
                        this.x = (cLeft + 1) * TILE_SIZE;
                        break;
                    }
                }
            }
        } else if (this.type === 'V') {
            let dy = this.speed * this.dir * dt;
            const steps = Math.ceil(Math.abs(dy) / (TILE_SIZE / 2));
            const stepDy = dy / steps;
            const cCenter = Math.floor((this.x + this.size/2) / TILE_SIZE);
            
            for (let i = 0; i < steps; i++) {
                this.y += stepDy;
                if (this.dir > 0) {
                    const rBottom = Math.floor((this.y + this.size) / TILE_SIZE);
                    if (getTile(cCenter, rBottom) === '1') {
                        this.dir = -1;
                        this.y = rBottom * TILE_SIZE - this.size;
                        break;
                    }
                } else if (this.dir < 0) {
                    const rTop = Math.floor(this.y / TILE_SIZE);
                    if (getTile(cCenter, rTop) === '1') {
                        this.dir = 1;
                        this.y = (rTop + 1) * TILE_SIZE;
                        break;
                    }
                }
            }
        }
        this.rotation += 0.1 * (dt * 60);
    }
    
    getHitbox() {
        return { x: this.x, y: this.y, width: this.size, height: this.size };
    }
}
