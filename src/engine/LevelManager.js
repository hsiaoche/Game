import { EntityManager } from './EntityManager.js';
import { Player } from '../game/entities/Player.js';
import { loadMap } from '../game/Map.js';
import { Renderer } from './renderer/Renderer.js';
import { level1, level2, level3, level4, level5, level6, level7, level8, level9, level10 } from '../game/levels.js';
import { SaveManager } from './storage/SaveManager.js';

export const LevelManager = {
    levels: [level1, level2, level3, level4, level5, level6, level7, level8, level9, level10],
    currentLevelIndex: 0,
    currentLevelData: null,
    initialStartPos: null,
    checkpointPos: null,
    
    initGame() {
        const progress = SaveManager.loadProgress();
        if (progress) {
            this.currentLevelIndex = progress.levelIndex;
        } else {
            this.currentLevelIndex = 0;
        }
        this.loadCurrentLevel();
    },
    
    loadCurrentLevel() {
        this.currentLevelData = this.levels[this.currentLevelIndex];
        this.checkpointPos = null;
        this.initialStartPos = null;
        this.resetLevel();
    },
    
    loadNextLevel() {
        if (this.currentLevelIndex + 1 < this.levels.length) {
            this.currentLevelIndex++;
            this.loadCurrentLevel();
            return true;
        }
        return false;
    },
    
    loadLevel(levelData) {
        this.currentLevelData = levelData;
        this.checkpointPos = null;
        this.initialStartPos = null;
        this.resetLevel();
    },
    
    resetLevel() {
        EntityManager.init(new Player());
        const { startPos, sawConfigs } = loadMap(this.currentLevelData);
        EntityManager.loadSaws(sawConfigs);
        Renderer.rebuildCache(this.currentLevelData.layout);
        
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
