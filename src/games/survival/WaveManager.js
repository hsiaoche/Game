import { SurvivalEntityManager } from './SurvivalEntityManager.js';
import { SurvivalConfig } from './config.js';

import { UIEngine } from '../../shared/ui/UIEngine.js';

export const WaveManager = {
    timeElapsed: 0,
    spawnTimer: 0,
    currentWaveIndex: 0,
    currentWaveConfig: null,
    bossSpawned: false,
    
    init() {
        this.timeElapsed = 0;
        this.spawnTimer = 0;
        this.currentWaveIndex = 0;
        this.bossSpawned = false;
        this.currentWaveConfig = this.getWaveConfig(0);
    },

    update(dt, canvas) {
        if (SurvivalEntityManager.bossDefeated) return;
        
        this.timeElapsed += dt;
        
        const newWaveIndex = Math.floor(this.timeElapsed / 30);
        if (newWaveIndex !== this.currentWaveIndex) {
            this.currentWaveIndex = newWaveIndex;
            if (this.currentWaveIndex === 5 && !this.bossSpawned) {
                this.spawnBoss(canvas);
            }
        }
        
        this.currentWaveConfig = this.getWaveConfig(this.timeElapsed);

        if (!this.bossSpawned) {
            this.spawnTimer -= dt;
            if (this.spawnTimer <= 0) {
                this.spawnEnemy(canvas);
                this.spawnTimer = this.currentWaveConfig.spawnInterval;
            }
        }
    },

    getWaveConfig(time) {
        const waveIndex = Math.floor(time / 30);
        
        // Defined Difficulty Curve
        const difficultyCurve = [
            { desc: "Easy", interval: 1.0, hp: 10, speed: 100, dmg: 10, exp: 1 },
            { desc: "Faster", interval: 0.8, hp: 15, speed: 120, dmg: 12, exp: 1 },
            { desc: "Tanks", interval: 1.2, hp: 40, speed: 80, dmg: 15, exp: 2 },
            { desc: "Swarms", interval: 0.3, hp: 8, speed: 150, dmg: 8, exp: 1 },
            { desc: "Mix", interval: 0.5, hp: 30, speed: 130, dmg: 20, exp: 3 },
            { desc: "Pre-Boss", interval: 0.4, hp: 50, speed: 110, dmg: 25, exp: 3 }
        ];

        let config = difficultyCurve[Math.min(waveIndex, difficultyCurve.length - 1)];
        let interval = config.interval;
        
        // Minor bursts at the start of a wave
        if (time % 30 < 5) {
            interval = interval * 0.4; 
        }

        // Endless scaling after wave 5
        let overScale = Math.max(0, waveIndex - 5);
        let hpMult = Math.pow(1.2, overScale);
        let speedMult = 1 + overScale * 0.05;

        return {
            spawnInterval: interval,
            enemyHp: config.hp * hpMult,
            enemySpeed: config.speed * speedMult,
            enemyDamage: config.dmg * (1 + overScale * 0.1),
            enemyExp: config.exp
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
            exp: this.currentWaveConfig.enemyExp,
            isBoss: false
        });
    },

    spawnBoss(canvas) {
        if (!SurvivalEntityManager.player) return;
        
        this.bossSpawned = true;
        UIEngine.showBossWarning();
        
        let sx = canvas.width / 2;
        let sy = -100;
        
        SurvivalEntityManager.spawnEnemy(sx, sy, {
            hp: 2000,
            speed: 50,
            damage: 30,
            exp: 100,
            size: 60,
            color: '#7e22ce', // Purple
            isBoss: true
        });
    }
};
