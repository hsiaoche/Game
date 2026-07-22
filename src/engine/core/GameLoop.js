/**
 * @file GameLoop.js
 * @description 封裝 requestAnimationFrame，隔離 Update 與 Draw 的調度邏輯。
 */
import { GameContext } from './GameState.js';
import { Time } from './Time.js';
import { canvas, ctx } from './Camera.js';

let currentAnimationId = null;

export const GameLoop = {
    start(updateFn, drawFn) {
        if (currentAnimationId) cancelAnimationFrame(currentAnimationId);
        Time.lastTime = 0;
        
        const loop = (time) => {
            if (!GameContext.isPlaying) {
                currentAnimationId = null;
                return;
            }
            if (!Time.lastTime) {
                Time.lastTime = time;
                currentAnimationId = requestAnimationFrame(loop);
                return;
            }
            
            // Calculate Delta Time in seconds
            let dt = (time - Time.lastTime) / 1000;
            Time.lastTime = time;
            
            // Cap dt to prevent huge jumps if tab was inactive
            if (dt > 0.1) dt = 0.1;
            
            Time.deltaTime = dt * Time.timeScale;
            
            // update & draw
            updateFn(Time.deltaTime);
            
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawFn(ctx);
            }
            
            currentAnimationId = requestAnimationFrame(loop);
        };
        
        currentAnimationId = requestAnimationFrame(loop);
    },
    
    stop() {
        if (currentAnimationId) {
            cancelAnimationFrame(currentAnimationId);
            currentAnimationId = null;
        }
    }
};
