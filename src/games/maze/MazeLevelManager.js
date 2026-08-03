import { MazeEntityManager } from './MazeEntityManager.js';
import { Player } from './entities/Player.js';
import { loadMap } from './Map.js';
import { Renderer } from '../../engine/renderer/Renderer.js';
import { level1, level2, level3, level4, level5 } from './levels.js';
import { SaveManager } from '../../shared/storage/SaveManager.js';

export const MazeLevelManager = {
    levels: [level1, level2, level3, level4, level5],
    currentLevelIndex: 0,
    currentLevelData: null,
    currentRespawnPos: null,
    checkpoints: [],
    
    initGame() {
        const progress = SaveManager.loadProgress('maze');
        if (progress) {
            this.currentLevelIndex = progress.levelIndex;
        } else {
            this.currentLevelIndex = 0;
        }
        this.loadCurrentLevel();
    },
    
    loadCurrentLevel() {
        if (this.currentLevelIndex >= this.levels.length) return false;
        
        this.currentLevelData = this.levels[this.currentLevelIndex];
        const mapInfo = loadMap(this.currentLevelData);
        
        this.currentRespawnPos = { ...mapInfo.startPos };
        this.checkpoints = mapInfo.checkpointConfigs || [];
        
        Renderer.rebuildCache(this.currentLevelData.layout);
        MazeEntityManager.init(new Player());
        MazeEntityManager.loadMapEntities(mapInfo);
        MazeEntityManager.player.init(this.currentRespawnPos);
        return true;
    },
    
    update(player) {
        if (!player) return;
        for (let cp of this.checkpoints) {
            if (!cp.active) {
                const cpx = cp.x + 20;
                const cpy = cp.y + 20;
                if (Math.abs(player.x + player.width/2 - cpx) < 30 && 
                    Math.abs(player.y + player.height/2 - cpy) < 30) {
                    cp.active = true;
                    this.currentRespawnPos = { x: cp.x, y: cp.y };
                }
            }
        }
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
        this.initialStartPos = null;
        this.resetLevel();
    },
    
    resetLevel() {
        MazeEntityManager.init(new Player());
        const mapInfo = loadMap(this.currentLevelData);
        MazeEntityManager.loadMapEntities(mapInfo);
        Renderer.rebuildCache(this.currentLevelData.layout);
        
        if (!this.initialStartPos) {
            this.initialStartPos = { ...mapInfo.startPos };
        }
        if (!this.checkpointPos) {
            this.checkpointPos = { ...mapInfo.startPos };
        }
        
        MazeEntityManager.player.init(this.checkpointPos);
    },
    
    setCheckpoint(x, y) {
        // Only set if it's a new checkpoint position to avoid unnecessary console logs
        if (!this.checkpointPos || this.checkpointPos.x !== x || this.checkpointPos.y !== y) {
            this.checkpointPos = { x, y };
            console.log(`[CHECKPOINT] Saved at ${x}, ${y}`);
        }
    }
};
