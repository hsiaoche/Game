import { LocalStorageAdapter } from './storage/LocalStorageAdapter.js';

const storage = new LocalStorageAdapter();

export const LeaderboardManager = {
    storageKey: 'maze_platformer_leaderboard',
    
    getRecords() {
        return storage.get(this.storageKey) || [];
    },
    
    addRecord(gameTime) {
        const records = this.getRecords();
        
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
        
        storage.set(this.storageKey, top5);
        
        return top5;
    },
    
    formatTime(gameTime) {
        const minutes = Math.floor(gameTime / 60).toString().padStart(2, '0');
        const seconds = (gameTime % 60).toFixed(2).padStart(5, '0');
        return `${minutes}:${seconds}`;
    }
};
