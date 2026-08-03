import { SurvivalEntityManager } from './SurvivalEntityManager.js';
import { UIEngine } from '../../shared/ui/UIEngine.js';

export const WaveManager = {
    timeElapsed: 0,
    spawnTimer: 0,
    currentWaveIndex: 0,
    bossSpawned: false,
    
    init() {
        this.timeElapsed = 0;
        this.spawnTimer = 0;
        this.currentWaveIndex = 0;
        this.bossSpawned = false;
    },

    update(dt, canvas) {
        if (SurvivalEntityManager.bossDefeated) return;
        
        this.timeElapsed += dt;
        
        const newWaveIndex = Math.floor(this.timeElapsed / 30);
        if (newWaveIndex !== this.currentWaveIndex) {
            this.currentWaveIndex = newWaveIndex;
            if (this.currentWaveIndex === 10 && !this.bossSpawned) { // 5 minutes
                this.spawnBoss(canvas);
            }
        }

        if (!this.bossSpawned) {
            this.spawnTimer -= dt;
            if (this.spawnTimer <= 0) {
                this.spawnTimer = this.getSpawnInterval();
                this.spawnWaveEnemy(canvas);
            }
        }
    },

    getSpawnInterval() {
        let base = 2.0 - (this.currentWaveIndex * 0.15); // Starts slower (2.0s instead of 1.2s)
        if (base < 0.3) base = 0.3; // Cap min spawn interval at 0.3s
        // Minor burst at start of each wave (every 30s)
        if (this.timeElapsed % 30 < 3) base *= 0.6; // Reduced burst length and intensity
        return base;
    },

    spawnWaveEnemy(canvas) {
        if (!SurvivalEntityManager.player) return;
        
        let types = ['runner'];
        
        if (this.currentWaveIndex >= 2) types.push('tank', 'shooter');
        if (this.currentWaveIndex >= 4) types.push('bomber', 'healer');
        if (this.currentWaveIndex >= 6) types.push('summoner', 'shielder');
        if (this.currentWaveIndex >= 8) types.push('slime');
        
        // Randomly pick a type based on weights implicitly by adjusting the array manually
        let pick = types[Math.floor(Math.random() * types.length)];
        
        // Spawn from the top of the screen (y = -50)
        let sx = Math.random() * canvas.width;
        let sy = -50;
        
        // Base stats scaling
        let hpScale = 1 + (this.timeElapsed / 60) * 0.3; // +30% HP per minute
        let dmgScale = 1 + (this.timeElapsed / 60) * 0.15; // +15% dmg per minute
        let speedScale = 1 + (this.timeElapsed / 120) * 0.1; // +10% speed per 2 mins

        let config = this.getEnemyConfig(pick, hpScale, dmgScale, speedScale);
        SurvivalEntityManager.spawnEnemy(sx, sy, config);
    },
    
    getEnemyConfig(typeId, hpScale, dmgScale, speedScale) {
        let base = { typeId: typeId, exp: 1 };
        switch (typeId) {
            case 'runner':
                base.hp = 10; base.speed = 130; base.damage = 10; base.size = 20; base.color = '#f43f5e';
                break;
            case 'tank':
                base.hp = 50; base.speed = 60; base.damage = 20; base.size = 36; base.color = '#881337'; base.exp = 3; base.kbResist = 0.2;
                break;
            case 'shooter':
                base.hp = 15; base.speed = 90; base.damage = 15; base.size = 24; base.color = '#e11d48'; base.exp = 2;
                break;
            case 'bomber':
                base.hp = 20; base.speed = 160; base.damage = 30; base.size = 28; base.color = '#f97316'; base.exp = 2;
                break;
            case 'summoner':
                base.hp = 30; base.speed = 100; base.damage = 10; base.size = 24; base.color = '#c026d3'; base.exp = 3;
                break;
            case 'healer':
                base.hp = 25; base.speed = 110; base.damage = 5; base.size = 24; base.color = '#22c55e'; base.exp = 2;
                break;
            case 'shielder':
                base.hp = 40; base.speed = 100; base.damage = 5; base.size = 24; base.color = '#3b82f6'; base.exp = 2;
                break;
            case 'slime':
                base.hp = 60; base.speed = 70; base.damage = 15; base.size = 40; base.color = '#10b981'; base.exp = 3;
                break;
        }
        
        base.hp *= hpScale;
        base.damage *= dmgScale;
        base.speed *= speedScale;
        return base;
    },

    spawnBoss(canvas) {
        if (!SurvivalEntityManager.player) return;
        
        this.bossSpawned = true;
        UIEngine.showBossWarning();
        
        let sx = canvas.width / 2;
        let sy = -100;
        
        SurvivalEntityManager.spawnEnemy(sx, sy, {
            typeId: 'boss',
            hp: 5000,
            speed: 80,
            damage: 40,
            exp: 500,
            size: 64,
            color: '#7e22ce',
            kbResist: 0.1,
            isBoss: true
        });
    }
};
