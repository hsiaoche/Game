import { SurvivalEntityManager } from './SurvivalEntityManager.js';
import { SurvivalConfig } from './config.js';

export const WaveManager = {
    timeElapsed: 0,
    spawnTimer: 0,
    currentWaveConfig: null,
    
    init() {
        this.timeElapsed = 0;
        this.spawnTimer = 0;
        this.currentWaveConfig = this.getWaveConfig(0);
    },

    update(dt, canvas) {
        this.timeElapsed += dt;
        this.currentWaveConfig = this.getWaveConfig(this.timeElapsed);

        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
            this.spawnEnemy(canvas);
            this.spawnTimer = this.currentWaveConfig.spawnInterval;
        }
    },

    getWaveConfig(time) {
        // Stepped difficulty scaling
        // Every 30 seconds is a "wave"
        const waveIndex = Math.floor(time / 30);
        
        // Base interval decreases as wave increases
        let interval = Math.max(0.15, 1.0 - waveIndex * 0.15);
        
        // Minor bursts at the start of a wave (time % 30 < 5)
        if (time % 30 < 5) {
            interval = interval * 0.5; 
        }

        let hpMult = Math.pow(1.2, waveIndex); 
        let speedMult = 1 + waveIndex * 0.05;
        let damageMult = 1 + waveIndex * 0.2;

        return {
            spawnInterval: interval,
            enemyHp: 10 * hpMult,
            enemySpeed: 100 * speedMult,
            enemyDamage: 10 * damageMult,
            enemyExp: 1 + Math.floor(waveIndex / 3)
        };
    },

    spawnEnemy(canvas) {
        if (!SurvivalEntityManager.player) return;
        
        // Spawn from the top of the screen (y = -50)
        let sx = Math.random() * (canvas.width - 24);
        let sy = -50;
        
        SurvivalEntityManager.spawnEnemy(sx, sy, {
            hp: this.currentWaveConfig.enemyHp,
            speed: this.currentWaveConfig.enemySpeed,
            damage: this.currentWaveConfig.enemyDamage,
            exp: this.currentWaveConfig.enemyExp
        });
    }
};
