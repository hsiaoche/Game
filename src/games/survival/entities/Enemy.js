import { SurvivalEntityManager } from '../SurvivalEntityManager.js';

export class Enemy {
    constructor() {
        this.active = false;
        this.x = 0;
        this.y = 0;
        this.width = 24;
        this.height = 24;
        this.speed = 100;
        this.maxHp = 10;
        this.hp = 10;
        this.damage = 10;
        this.color = '#f43f5e';
        this.expValue = 1;
        this.hitFlashTimer = 0;
        
        this.typeId = 'runner'; // runner, tank, shooter, bomber, summoner, healer, shielder, slime, boss
        this.state = 'idle'; // idle, attacking, detonating, phase1, phase2, phase3
        this.stateTimer = 0;
        
        this.isBoss = false;
        
        this.kbX = 0;
        this.kbY = 0;
        this.kbResist = 1.0;
        this.hasShield = false;
    }

    reset(x, y, typeConfig = {}) {
        this.active = true;
        this.x = x;
        this.y = y;
        this.typeId = typeConfig.typeId || 'runner';
        this.speed = typeConfig.speed || 100;
        this.maxHp = typeConfig.hp || 10;
        this.hp = this.maxHp;
        this.damage = typeConfig.damage || 10;
        this.color = typeConfig.color || '#f43f5e';
        this.width = typeConfig.size || 24;
        this.height = typeConfig.size || 24;
        this.expValue = typeConfig.exp || 1;
        this.isBoss = typeConfig.isBoss || false;
        this.kbResist = typeConfig.kbResist || 1.0;
        
        this.hitFlashTimer = 0;
        this.kbX = 0;
        this.kbY = 0;
        this.state = 'idle';
        this.stateTimer = 0;
        this.hasShield = false;
        
        if (this.isBoss) {
            this.state = 'phase1';
        }
    }

    update(dt, player, canvas) {
        if (!this.active) return;
        
        if (this.hitFlashTimer > 0) this.hitFlashTimer -= dt;
        
        // Handle knockback
        if (Math.abs(this.kbX) > 5 || Math.abs(this.kbY) > 5) {
            this.x += this.kbX * dt;
            this.y += this.kbY * dt;
            this.kbX *= Math.pow(0.1, dt);
            this.kbY *= Math.pow(0.1, dt);
            if (!this.isBoss) return;
        }

        // Enemies ONLY move downwards
        this.y += this.speed * 0.5 * dt;

        if (canvas && this.y + this.height > canvas.height) {
            player.takeDamage(this.damage);
            SurvivalEntityManager.spawnDamageText(player.x, player.y - 10, `-${Math.round(this.damage)}`, '#f43f5e');
            this.active = false;
            return;
        }

        let dx = player.x - this.x;
        let dy = player.y - this.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        
        if (this.isBoss) {
            this.updateBossAI(dt, player, dx, dy, dist);
            return;
        }

        this.updateNormalAI(dt, player, dx, dy, dist);
    }
    
    updateNormalAI(dt, player, dx, dy, dist) {
        let dirX = dist > 0 ? dx / dist : 0;
        let dirY = dist > 0 ? dy / dist : 0;
        
        switch (this.typeId) {
            case 'runner':
            case 'tank':
            case 'slime':
                // Only falls (handled above)
                break;
                
            case 'shooter':
                if (dist <= 300) {
                    // Shoot
                    this.stateTimer -= dt;
                    if (this.stateTimer <= 0) {
                        this.stateTimer = 2.0;
                        SurvivalEntityManager.spawnEnemyProjectile(this.x, this.y, dirX, dirY, 150, 10, '#ef4444');
                    }
                }
                break;
                
            case 'bomber':
                if (this.state === 'idle') {
                    if (dist < 60) {
                        this.state = 'detonating';
                        this.stateTimer = 0.5;
                        this.color = '#ffffff'; // flash white
                    }
                } else if (this.state === 'detonating') {
                    this.stateTimer -= dt;
                    if (this.stateTimer <= 0) {
                        SurvivalEntityManager.spawnExplosion(this.x, this.y, 100, 30, '#ef4444');
                        this.active = false;
                    }
                }
                break;
                
            case 'summoner':
                this.stateTimer -= dt;
                if (this.stateTimer <= 0) {
                    this.stateTimer = 5.0;
                    SurvivalEntityManager.spawnEnemy(this.x + 30, this.y, { typeId: 'runner', speed: 150, hp: 5, exp: 1 });
                    SurvivalEntityManager.spawnEnemy(this.x - 30, this.y, { typeId: 'runner', speed: 150, hp: 5, exp: 1 });
                }
                break;
                
            case 'healer':
            case 'shielder':
                this.stateTimer -= dt;
                if (this.stateTimer <= 0) {
                    this.stateTimer = 3.0;
                    if (this.typeId === 'healer') {
                        SurvivalEntityManager.healEnemiesInRange(this.x, this.y, 200, 20);
                        SurvivalEntityManager.spawnExplosion(this.x, this.y, 200, 0, '#22c55e', false); // Visual only
                    } else {
                        SurvivalEntityManager.shieldEnemiesInRange(this.x, this.y, 200);
                        SurvivalEntityManager.spawnExplosion(this.x, this.y, 200, 0, '#3b82f6', false); // Visual only
                    }
                }
                break;
        }
    }

    updateBossAI(dt, player, dx, dy, dist) {
        let dirX = dist > 0 ? dx / dist : 0;
        let dirY = dist > 0 ? dy / dist : 0;
        
        let hpPct = this.hp / this.maxHp;
        if (hpPct < 0.3 && this.state !== 'phase3') {
            this.state = 'phase3';
            this.color = '#a855f7';
        } else if (hpPct < 0.65 && hpPct >= 0.3 && this.state !== 'phase2' && this.state !== 'phase3') {
            this.state = 'phase2';
            this.color = '#d946ef';
        }
        
        this.stateTimer -= dt;
        
        if (this.state === 'phase1') {
            // Hover horizontally
            if (this.x < 50) this.kbX = 100;
            if (this.x > canvas.width - 50) this.kbX = -100;
            
            if (this.stateTimer <= 0) {
                this.stateTimer = 2.0;
                for (let i = 0; i < 8; i++) {
                    let angle = (i / 8) * Math.PI * 2;
                    SurvivalEntityManager.spawnEnemyProjectile(this.x, this.y, Math.cos(angle), Math.sin(angle), 120, 15, '#fb923c');
                }
            }
        } else if (this.state === 'phase2') {
            // Dash attack + spawn bombers
            if (this.stateTimer <= 0) {
                // Dash horizontally towards player
                this.kbX = dirX * 600;
                this.stateTimer = 3.0;
                SurvivalEntityManager.spawnEnemy(this.x + 50, this.y, { typeId: 'bomber', hp: 20, speed: 180, exp: 2 });
            }
        } else if (this.state === 'phase3') {
            if (this.x < 50) this.kbX = 200;
            if (this.x > canvas.width - 50) this.kbX = -200;
            
            if (this.stateTimer <= 0) {
                this.stateTimer = 0.2;
                let timeOffset = Date.now() / 500;
                let angle = Math.atan2(dirY, dirX) + Math.sin(timeOffset) * 0.5;
                SurvivalEntityManager.spawnEnemyProjectile(this.x, this.y, Math.cos(angle), Math.sin(angle), 300, 25, '#a855f7');
            }
        }
    }

    takeDamage(amount, kbX = 0, kbY = 0) {
        if (this.hasShield) {
            amount *= 0.5; // 50% damage reduction
            this.hasShield = false; // shield breaks
        }
        
        this.hp -= amount;
        this.hitFlashTimer = 0.1;
        
        this.kbX = kbX * this.kbResist;
        this.kbY = kbY * this.kbResist;
        
        if (this.hp <= 0) {
            this.active = false;
            
            if (this.typeId === 'slime') {
                // Split logic
                SurvivalEntityManager.spawnEnemy(this.x - 15, this.y, { typeId: 'runner', hp: this.maxHp * 0.5, speed: this.speed * 1.2, size: 16, exp: 1 });
                SurvivalEntityManager.spawnEnemy(this.x + 15, this.y, { typeId: 'runner', hp: this.maxHp * 0.5, speed: this.speed * 1.2, size: 16, exp: 1 });
            }
            return true; // died
        }
        return false;
    }

    getHitbox() {
        return { x: this.x - this.width/2, y: this.y - this.height/2, width: this.width, height: this.height };
    }
}
