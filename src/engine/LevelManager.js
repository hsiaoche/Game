import { EntityManager } from './EntityManager.js';
import { Player } from '../game/Entities.js';
import { loadMap } from '../game/Map.js';

export const LevelManager = {
    currentLevelData: null,
    initialStartPos: null,
    checkpointPos: null,
    
    loadLevel(levelData) {
        this.currentLevelData = levelData;
        this.checkpointPos = null;
        this.resetLevel();
    },
    
    resetLevel() {
        EntityManager.init(new Player());
        const startPos = loadMap(this.currentLevelData, EntityManager.saws);
        
        if (!this.initialStartPos) {
            this.initialStartPos = { ...startPos };
        }
        if (!this.checkpointPos) {
            this.checkpointPos = { ...startPos };
        }
        
        EntityManager.player.init(this.checkpointPos);
    },
    
    setCheckpoint(x, y) {
        // Only set if it's a new checkpoint position to avoid unnecessary console logs
        if (!this.checkpointPos || this.checkpointPos.x !== x || this.checkpointPos.y !== y) {
            this.checkpointPos = { x, y };
            console.log(`[CHECKPOINT] Saved at ${x}, ${y}`);
        }
    }
};
