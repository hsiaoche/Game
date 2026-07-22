/**
 * @file GameState.js
 * @description 統一管理遊戲運作時的共享狀態，消除對全域變數的濫用。
 */
import { GameConfig } from '../../config/gameConfig.js';

export const GameContext = {
    isPlaying: false,
    isGameOver: false,
    gameTime: 0,
    lives: GameConfig.INITIAL_LIVES
};
