/**
 * @file Core.js
 * @description 重構後的 Core.js 退化為 Facade 模式，僅提供系統初始化入口。
 */
import { InputManager } from './core/InputManager.js';
import { GameLoop } from './core/GameLoop.js';

export const Core = {
    init() {
        InputManager.init();
    },
    start: GameLoop.start,
    stop: GameLoop.stop
};
