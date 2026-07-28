/**
 * @file AchievementManager.js
 * @description 統一管理遊戲成就系統。
 */
import { SaveManager } from './storage/SaveManager.js';
import { EventBus } from '../engine/EventBus.js';

export const AchievementManager = {
    getAchievementsKey(gameId) {
        return `${gameId}_achievements`;
    },
    
    getAchievements(gameId) {
        return SaveManager.getData(this.getAchievementsKey(gameId)) || {};
    },
    
    unlockAchievement(gameId, achievementId, title, description) {
        const achievements = this.getAchievements(gameId);
        if (!achievements[achievementId]) {
            achievements[achievementId] = {
                id: achievementId,
                title: title,
                description: description,
                unlockedAt: new Date().getTime()
            };
            SaveManager.setData(this.getAchievementsKey(gameId), achievements);
            
            // Dispatch event for UI
            EventBus.emit('ACHIEVEMENT_UNLOCKED', {
                gameId,
                achievement: achievements[achievementId]
            });
            console.log(`[Achievement Unlocked] ${gameId}: ${title} - ${description}`);
            return true;
        }
        return false;
    }
};
