/**
 * @file InputManager.js
 * @description 專職負責監聽與管理玩家的輸入操作 (Keyboard, Touch)。
 */
import { GameContext } from './GameState.js';

export const keys = { 
    left: false, 
    right: false, 
    jump: false,
    aimX: 0,
    aimY: 0
};

export const InputManager = {
    init() {
        const btnLeft = document.getElementById('btn-left');
        const btnRight = document.getElementById('btn-right');
        const btnJump = document.getElementById('btn-jump');

        const handleKeyDown = (e) => {
            if(e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
            if(e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
            if(e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') keys.jump = true;
        };

        const handleKeyUp = (e) => {
            if(e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
            if(e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
            if(e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') keys.jump = false;
        };

        window.addEventListener('keydown', (e) => {
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }
            if (GameContext.isPlaying) {
                handleKeyDown(e);
            }
        });
        
        window.addEventListener('keyup', handleKeyUp);

        // Desktop Mouse Aiming
        const canvas = document.getElementById('gameCanvas');
        window.addEventListener('mousemove', (e) => {
            if (GameContext.isPlaying) {
                const rect = canvas.getBoundingClientRect();
                keys.aimX = e.clientX - rect.left;
                keys.aimY = e.clientY - rect.top;
            }
        });

        const bindTouchBtn = (btn, keyName) => {
            if(!btn) return;
            const start = (e) => {
                e.preventDefault();
                if (GameContext.isPlaying) { keys[keyName] = true; btn.classList.add('active'); }
            };
            const end = (e) => {
                e.preventDefault();
                keys[keyName] = false; btn.classList.remove('active');
            };
            btn.addEventListener('touchstart', start, {passive: false});
            btn.addEventListener('touchend', end, {passive: false});
            btn.addEventListener('touchcancel', end, {passive: false});
            btn.addEventListener('mousedown', start);
            btn.addEventListener('mouseup', end);
            btn.addEventListener('mouseleave', end);
        };

        bindTouchBtn(btnLeft, 'left');
        bindTouchBtn(btnRight, 'right');
        bindTouchBtn(btnJump, 'jump');

        // Mobile Touch Aiming (Right half of the screen)
        const handleTouchAim = (e) => {
            if (GameContext.isPlaying && e.touches.length > 0) {
                // Find touch on the right side of screen
                for (let i = 0; i < e.touches.length; i++) {
                    const touch = e.touches[i];
                    if (touch.clientX > window.innerWidth / 2) {
                        const rect = canvas.getBoundingClientRect();
                        keys.aimX = touch.clientX - rect.left;
                        keys.aimY = touch.clientY - rect.top;
                        break;
                    }
                }
            }
        };
        window.addEventListener('touchmove', handleTouchAim, { passive: false });
        window.addEventListener('touchstart', handleTouchAim, { passive: false });
    }
};
