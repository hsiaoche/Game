/**
 * @file HubSceneManager.js
 * @description 管理首頁遊戲選單與切換
 */
import { canvas, ctx } from '../../engine/core/Camera.js';
import { UIEngine } from '../../shared/ui/UIEngine.js';

export class HubScene {
    enter() {
        UIEngine.showScreen('hub');
        ctx.clearRect(0, 0, canvas.width, canvas.height); // clear background
    }
    exit() {
        UIEngine.hideScreen('hub');
    }
    update(dt) {}
    draw(ctx) {}
}

export class MainMenuScene {
    // This is the old Maze Start Screen, currently kept here until it's moved into MazeSceneManager
    // Actually, Maze doesn't need its own MainMenuScene if Hub transitions directly to MazeGameplayScene,
    // but we can keep it for backwards compatibility with the HTML UI.
    enter() {
        UIEngine.showScreen('start');
    }
    exit() {
        UIEngine.hideScreen('start');
    }
    update(dt) {}
    draw(ctx) {}
}
