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
            this.x += this.speed * this.dir * dt;
            const cLeft = Math.floor(this.x / TILE_SIZE);
            const cRight = Math.floor((this.x + this.size) / TILE_SIZE);
            const rTop = Math.floor((this.y + this.size/2) / TILE_SIZE); 
            if (this.dir > 0 && getTile(cRight, rTop) === '1') {
                this.dir = -1;
            } else if (this.dir < 0 && getTile(cLeft, rTop) === '1') {
                this.dir = 1;
            }
        } else if (this.type === 'V') {
            this.y += this.speed * this.dir * dt;
            const cCenter = Math.floor((this.x + this.size/2) / TILE_SIZE);
            const rTop = Math.floor(this.y / TILE_SIZE);
            const rBottom = Math.floor((this.y + this.size) / TILE_SIZE);
            if (this.dir > 0 && getTile(cCenter, rBottom) === '1') {
                this.dir = -1;
            } else if (this.dir < 0 && getTile(cCenter, rTop) === '1') {
                this.dir = 1;
            }
        }
        this.rotation += 0.1 * (dt * 60);
    }
    
    getHitbox() {
        return { x: this.x, y: this.y, width: this.size, height: this.size };
    }
}
