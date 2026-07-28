/**
 * @file gameConfig.js
 * @description 遊戲全域基本設定，避免 Magic Number。
 */

export const GameConfig = {
    INITIAL_LIVES: 3,
    FPS: 60,
    TILE_SIZE: 40, // 目前方塊大小 (渲染與物理共用)
    INVINCIBILITY_DURATION: 3, // 復活後的無敵時間(秒)
    COLORS: {
        PLAYER: '#38bdf8', // Light Blue
        PLAYER_INVINCIBLE: 'rgba(56, 189, 248, 0.5)',
        WALL: '#475569',   // Slate 600
        GOAL: '#10b981',   // Emerald 500
        SAW: '#f43f5e',    // Rose 500
    }
};
