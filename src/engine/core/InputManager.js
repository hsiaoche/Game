/**
 * @file InputManager.js
 * @description 專職負責監聽與管理玩家的輸入操作 (Keyboard, Touch)。
 */
import { GameContext } from './GameState.js';

export const keys = { 
    left: false, 
    right: false, 
    jump: false,
    up: false,
    down: false,
    aimX: 0,
    aimY: 0,
    aimDx: 0,
    aimDy: 0,
    moveDx: 0, // From left joystick
    moveDy: 0
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

        // Mobile Touch Aiming and Movement Joysticks
        const joystickRight = document.getElementById('joystick-right');
        const joystickRightKnob = document.getElementById('joystick-knob');
        const joystickLeft = document.getElementById('joystick-left');
        const joystickLeftKnob = document.getElementById('joystick-left-knob');
        let rightTouchId = null;
        let leftTouchId = null;

        const setupJoystick = (base, knob, callback, resetCallback) => {
            if (!base) return;
            
            let activeId = null;
            
            const update = (e, touch) => {
                const rect = base.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                let dx = touch.clientX - centerX;
                let dy = touch.clientY - centerY;
                
                const R = rect.width / 2;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if (dist > R) {
                    dx = (dx / dist) * R;
                    dy = (dy / dist) * R;
                }
                
                if(knob) knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
                callback(dx, dy);
            };
            
            const reset = () => {
                if(knob) knob.style.transform = `translate(-50%, -50%)`;
                resetCallback();
                activeId = null;
            };

            base.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const touch = e.changedTouches[0];
                activeId = touch.identifier;
                update(e, touch);
            }, { passive: false });

            base.addEventListener('touchmove', (e) => {
                e.preventDefault();
                for (let i = 0; i < e.changedTouches.length; i++) {
                    if (e.changedTouches[i].identifier === activeId) {
                        update(e, e.changedTouches[i]);
                        break;
                    }
                }
            }, { passive: false });

            const handleEnd = (e) => {
                e.preventDefault();
                for (let i = 0; i < e.changedTouches.length; i++) {
                    if (e.changedTouches[i].identifier === activeId) {
                        reset();
                        break;
                    }
                }
            };

            base.addEventListener('touchend', handleEnd, { passive: false });
            base.addEventListener('touchcancel', handleEnd, { passive: false });
        };

        // Right Joystick (Aim)
        setupJoystick(joystickRight, joystickRightKnob, 
            (dx, dy) => { keys.aimDx = dx; keys.aimDy = dy; },
            () => { keys.aimDx = 0; keys.aimDy = 0; }
        );

        // Left Joystick (Movement)
        setupJoystick(joystickLeft, joystickLeftKnob, 
            (dx, dy) => { keys.moveDx = dx; keys.moveDy = dy; },
            () => { keys.moveDx = 0; keys.moveDy = 0; }
        );



        const handleTouchAim = (e) => {
            if (GameContext.isPlaying && e.touches.length > 0) {
                // If joystick is visible, prefer it over screen aiming
                if (joystickRight && !joystickRight.classList.contains('hidden')) {
                    return; // joystick handles itself
                }
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
