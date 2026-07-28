/**
 * @file StorageAdapter.js
 * @description Storage 系統的基礎介面 (Interface)，確保未來可以輕易替換為 IndexedDB, Firebase 等。
 */

export class StorageAdapter {
    /**
     * 讀取資料
     * @param {string} key 
     * @returns {any}
     */
    get(key) {
        throw new Error("Method 'get()' must be implemented.");
    }

    /**
     * 儲存資料
     * @param {string} key 
     * @param {any} value 
     */
    set(key, value) {
        throw new Error("Method 'set()' must be implemented.");
    }

    /**
     * 刪除資料
     * @param {string} key 
     */
    remove(key) {
        throw new Error("Method 'remove()' must be implemented.");
    }
}
