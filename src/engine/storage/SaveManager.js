/**
 * @file SaveManager.js
 * @description 統一管理遊戲的存檔紀錄與排行榜資料。
 */

import { LocalStorageAdapter } from './LocalStorageAdapter.js';

const storage = new LocalStorageAdapter();

export const SaveManager = {
    leaderboardKey: 'maze_platformer_leaderboard',
    
    getLeaderboard() {
        return storage.get(this.leaderboardKey) || [];
    },
    
    addRecord(gameTime) {
        const records = this.getLeaderboard();
        
        const minutes = Math.floor(gameTime / 60).toString().padStart(2, '0');
        const seconds = (gameTime % 60).toFixed(2).padStart(5, '0');
        const formatted = `${minutes}:${seconds}`;
        
        const newRecord = {
            time: gameTime,
            formatted: formatted,
            date: new Date().toLocaleDateString()
        };
        
        records.push(newRecord);
        // Sort ascending (lower time is better)
        records.sort((a, b) => a.time - b.time);
        
        // Keep top 5
        const top5 = records.slice(0, 5);
        
        storage.set(this.leaderboardKey, top5);
        
        return top5;
    },
    
    formatTime(gameTime) {
        const minutes = Math.floor(gameTime / 60).toString().padStart(2, '0');
        const seconds = (gameTime % 60).toFixed(2).padStart(5, '0');
        return `${minutes}:${seconds}`;
    },
    
    saveProgress(levelIndex, gameTime) {
        storage.set('maze_platformer_progress', { levelIndex, gameTime });
    },
    
    loadProgress() {
        return storage.get('maze_platformer_progress');
    },
    
    clearProgress() {
        storage.set('maze_platformer_progress', null);
    }
};
