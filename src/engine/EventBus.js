/**
 * @file EventBus.js
 * @description 實作 Publish/Subscribe 模式，用於解耦遊戲內各系統的事件傳遞。
 */

export const Events = {
    PLAYER_DEATH: 'PLAYER_DEATH',
    QUESTION_CORRECT: 'QUESTION_CORRECT',
    QUESTION_WRONG: 'QUESTION_WRONG',
    LEVEL_COMPLETE: 'LEVEL_COMPLETE',
    LIVES_CHANGED: 'LIVES_CHANGED',
};

class EventBusClass {
    constructor() {
        this.listeners = {};
    }

    /**
     * 訂閱事件
     * @param {string} event 
     * @param {function} callback 
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    /**
     * 發送事件
     * @param {string} event 
     * @param {any} data 
     */
    emit(event, data = null) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(callback => callback(data));
    }

    /**
     * 取消訂閱
     * @param {string} event 
     * @param {function} callback 
     */
    off(event, callback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
}

export const EventBus = new EventBusClass();
