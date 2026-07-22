/**
 * @file LocalStorageAdapter.js
 * @description 實作 StorageAdapter，使用瀏覽器的 localStorage。
 */

import { StorageAdapter } from './StorageAdapter.js';

export class LocalStorageAdapter extends StorageAdapter {
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error(`LocalStorage get error for key ${key}:`, e);
            return null;
        }
    }

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error(`LocalStorage set error for key ${key}:`, e);
        }
    }

    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error(`LocalStorage remove error for key ${key}:`, e);
        }
    }
}
