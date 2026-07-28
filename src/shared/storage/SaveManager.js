/**
 * @file SaveManager.js
 * @description 統一管理遊戲的存檔紀錄與排行榜資料。
 */

import { LocalStorageAdapter } from './LocalStorageAdapter.js';

const storage = new LocalStorageAdapter();

export const SaveManager = {
    getLeaderboardKey(gameId) {
        return `${gameId}_leaderboard`;
    },
    
    getProgressKey(gameId) {
        return `${gameId}_progress`;
    },
    
    getData(key) {
        return storage.get(key);
    },
    
    setData(key, value) {
        storage.set(key, value);
    },
    
    getLeaderboard(gameId) {
        return storage.get(this.getLeaderboardKey(gameId)) || [];
    },
    
    addRecord(gameId, gameTime, sortAscending = true) {
        const records = this.getLeaderboard(gameId);
        
        const minutes = Math.floor(gameTime / 60).toString().padStart(2, '0');
        const seconds = (gameTime % 60).toFixed(2).padStart(5, '0');
        const formatted = `${minutes}:${seconds}`;
        
        const newRecord = {
            time: gameTime,
            formatted: formatted,
            date: new Date().toLocaleDateString()
        };
        
        records.push(newRecord);
        if (sortAscending) {
            records.sort((a, b) => a.time - b.time); // Lower is better (e.g. speedrun)
        } else {
            records.sort((a, b) => b.time - a.time); // Higher is better (e.g. survival time)
        }
        
        // Keep top 5
        const top5 = records.slice(0, 5);
        
        storage.set(this.getLeaderboardKey(gameId), top5);
        
        return top5;
    },
    
    formatTime(gameTime) {
        const minutes = Math.floor(gameTime / 60).toString().padStart(2, '0');
        const seconds = (gameTime % 60).toFixed(2).padStart(5, '0');
        return `${minutes}:${seconds}`;
    },
    
    saveProgress(gameId, data) {
        storage.set(this.getProgressKey(gameId), data);
    },
    
    loadProgress(gameId) {
        return storage.get(this.getProgressKey(gameId));
    },
    
    clearProgress(gameId) {
        storage.remove(this.getProgressKey(gameId));
    }
};
