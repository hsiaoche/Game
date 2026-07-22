/**
 * @file InputManager.js
 * @description 專職負責監聽與管理玩家的輸入操作 (Keyboard, Touch)。
 */
import { GameContext } from './GameState.js';

export const keys = { 
    left: false, 
    right: false, 
    jump: false 
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
    }
};
