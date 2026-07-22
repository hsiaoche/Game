/**
 * @file ObjectPool.js
 * @description 泛用型物件池 (Object Pool)，用於管理頻繁生成與銷毀的物件 (如特效、拋射物)，降低 GC 負擔。
 */

export class ObjectPool {
    constructor(factory, initialSize = 100) {
        this.factory = factory;
        this.pool = [];
        
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.factory());
        }
    }

    /**
     * 從池中獲取一個可用物件
     * @returns {Object|null}
     */
    get() {
        let obj = this.pool.find(item => !item.active);
        if (!obj) {
            obj = this.factory();
            this.pool.push(obj);
        }
        obj.active = true;
        return obj;
    }

    /**
     * 獲取所有目前在使用的物件
     * @returns {Array}
     */
    getActiveObjects() {
        return this.pool.filter(item => item.active);
    }
    
    /**
     * 獲取所有物件 (包含非使用中)
     * @returns {Array}
     */
    getAllObjects() {
        return this.pool;
    }

    /**
     * 重置整個池
     */
    clear() {
        this.pool.forEach(item => item.active = false);
    }
}
