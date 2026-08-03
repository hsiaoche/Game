import { SurvivalEntityManager } from '../SurvivalEntityManager.js';
import { SkillManager } from '../SkillManager.js'; // Needed to check synergies

function getAimDir(player, keys) {
    let dx = 0, dy = -1;
    if (keys.aimDx || keys.aimDy) {
        dx = keys.aimDx;
        dy = keys.aimDy;
    } else if (keys.aimX || keys.aimY) {
        dx = keys.aimX - (player.x + player.width/2);
        dy = keys.aimY - (player.y + player.height/2);
    }
    let dist = Math.sqrt(dx*dx + dy*dy);
    if (dist > 0) return { dx: dx/dist, dy: dy/dist };
    return { dx, dy };
}

export const SKILLS_DB = {
    'magic_missile': {
        id: 'magic_missile',
        name: '魔法飛彈',
        description: '自動追蹤，基礎投射物。',
        maxLevel: 5,
        baseCooldown: 1.0,
        fire: (level, player, keys) => {
            let numMissiles = 1 + Math.floor(level / 2);
            let damage = 10 + level * 5;
            let dir = getAimDir(player, keys);
            for (let i = 0; i < numMissiles; i++) {
                let angle = Math.atan2(dir.dy, dir.dx) + (Math.random() - 0.5) * 0.5;
                SurvivalEntityManager.spawnProjectile(player.x + player.width/2, player.y + player.height/2, Math.cos(angle)*400, Math.sin(angle)*400, {
                    damage: damage, color: '#38bdf8', size: 8, penetration: 1, magicMissile: true
                });
            }
        }
    },
    'fireball': {
        id: 'fireball',
        name: '火球術',
        description: '擊中後產生小範圍爆炸。',
        maxLevel: 5,
        baseCooldown: 1.5,
        fire: (level, player, keys) => {
            let damage = 20 + level * 10;
            let dir = getAimDir(player, keys);
            
            let proj = SurvivalEntityManager.spawnProjectile(player.x + player.width/2, player.y + player.height/2, dir.dx*300, dir.dy*300, {
                damage: damage, color: '#f97316', size: 12, penetration: 1,
                onHit: (p, e) => {
                    let explodeRadius = 60 + level * 10;
                    SurvivalEntityManager.spawnExplosion(p.x, p.y, explodeRadius, damage * 0.5, '#f97316', true);
                    
                    // Synergy: Toxic Explosion
                    if (SkillManager.hasSynergy('fireball', 'poison_mist')) {
                        SurvivalEntityManager.spawnExplosion(p.x, p.y, explodeRadius * 1.5, damage, '#84cc16', true);
                    }
                }
            });
        }
    },
    'ice_spike': {
        id: 'ice_spike',
        name: '冰刺',
        description: '穿透敵人，造成減速。',
        maxLevel: 5,
        baseCooldown: 1.2,
        fire: (level, player, keys) => {
            let numArrows = 1 + Math.floor(level / 3);
            let damage = 15 + level * 8;
            let dir = getAimDir(player, keys);
            for (let i = 0; i < numArrows; i++) {
                let vy = dir.dy * 500 + (Math.random() - 0.5) * 50;
                SurvivalEntityManager.spawnProjectile(player.x + player.width/2, player.y + player.height/2, dir.dx*500, vy, {
                    damage: damage, color: '#6ee7b7', size: 10, penetration: 2 + level,
                    onHit: (p, e) => { e.speed *= 0.5; e.color = '#6ee7b7'; } // Slow
                });
            }
        }
    },
    'chain_lightning': {
        id: 'chain_lightning',
        name: '連鎖閃電',
        description: '擊中敵人後會彈跳至下一名敵人。',
        maxLevel: 5,
        baseCooldown: 2.0,
        fire: (level, player, keys) => {
            let damage = 15 + level * 10;
            let bounces = 2 + level;
            let dir = getAimDir(player, keys);
            // We simulate chain lightning with a fast invisible projectile that seeks on hit
            SurvivalEntityManager.spawnProjectile(player.x + player.width/2, player.y + player.height/2, dir.dx*600, dir.dy*600, {
                damage: damage, color: '#fef08a', size: 6, penetration: bounces, chainLightning: true
            });
        }
    },
    'boomerang': {
        id: 'boomerang',
        name: '迴旋飛鏢',
        description: '飛出後返回，造成兩次傷害。',
        maxLevel: 5,
        baseCooldown: 2.0,
        fire: (level, player, keys) => {
            let damage = 10 + level * 5;
            let dir = getAimDir(player, keys);
            SurvivalEntityManager.spawnProjectile(player.x + player.width/2, player.y + player.height/2, dir.dx*400, dir.dy*400, {
                damage: damage, color: '#9ca3af', size: 10, penetration: 999, life: 1.5, boomerang: true
            });
        }
    },
    'poison_dart': {
        id: 'poison_dart',
        name: '毒液飛鏢',
        description: '單體高傷害。',
        maxLevel: 5,
        baseCooldown: 0.8,
        fire: (level, player, keys) => {
            let damage = 5 + level * 3;
            let dir = getAimDir(player, keys);
            SurvivalEntityManager.spawnProjectile(player.x + player.width/2, player.y + player.height/2, dir.dx*450, dir.dy*450, {
                damage: damage, color: '#4ade80', size: 6, penetration: 1
            });
        }
    },
    'fire_aura': {
        id: 'fire_aura',
        name: '火焰光環',
        description: '對範圍內敵人造成高頻燃燒。',
        maxLevel: 5,
        baseCooldown: 0.5,
        fire: (level, player) => {
            let radius = 60 + level * 15;
            let damage = 5 + level * 2;
            
            if (SkillManager.hasSynergy('fire_aura', 'energy_shield')) radius *= 1.5;

            SurvivalEntityManager.spawnProjectile(player.x + player.width/2, player.y + player.height/2, 0, 0, {
                damage: damage, color: 'rgba(244, 63, 94, 0.3)', size: radius * 2, life: 0.1, penetration: 999, noKnockback: true
            });
        }
    },
    'poison_mist': {
        id: 'poison_mist',
        name: '劇毒迷霧',
        description: '在玩家走過的路徑留下毒霧。',
        maxLevel: 5,
        baseCooldown: 0.2,
        fire: (level, player) => {
            let radius = 30 + level * 5;
            let damage = 2 + level;
            SurvivalEntityManager.spawnProjectile(player.x + player.width/2, player.y + player.height/2, 0, 0, {
                damage: damage, color: 'rgba(132, 204, 22, 0.4)', size: radius * 2, life: 2.0, penetration: 999, noKnockback: true, stationary: true
            });
        }
    },
    'frost_nova': {
        id: 'frost_nova',
        name: '冰霜新星',
        description: '週期性爆發，凍結周圍敵人。',
        maxLevel: 5,
        baseCooldown: 3.0,
        fire: (level, player) => {
            let radius = 100 + level * 20;
            let damage = 15 + level * 5;
            SurvivalEntityManager.spawnProjectile(player.x + player.width/2, player.y + player.height/2, 0, 0, {
                damage: damage, color: 'rgba(167, 243, 208, 0.6)', size: radius * 2, life: 0.2, penetration: 999, noKnockback: true,
                onHit: (p, e) => { e.speed *= 0.1; e.color = '#a7f3d0'; }
            });
        }
    },
    'tornado': {
        id: 'tornado',
        name: '龍捲風',
        description: '隨機向外擴散，會輕微牽引敵人。',
        maxLevel: 5,
        baseCooldown: 2.0,
        fire: (level, player) => {
            let damage = 10 + level * 4;
            let angle = Math.random() * Math.PI * 2;
            
            let color = 'rgba(148, 163, 184, 0.5)';
            if (SkillManager.hasSynergy('tornado', 'fire_aura')) {
                damage *= 2;
                color = 'rgba(239, 68, 68, 0.7)';
            }
            
            SurvivalEntityManager.spawnProjectile(player.x + player.width/2, player.y + player.height/2, Math.cos(angle)*150, Math.sin(angle)*150, {
                damage: damage, color: color, size: 60, life: 3.0, penetration: 999, tornado: true
            });
        }
    },
    'laser': {
        id: 'laser',
        name: '雷射射線',
        description: '朝面對方向發射極高穿透傷害的光束。',
        maxLevel: 5,
        baseCooldown: 4.0,
        fire: (level, player, keys) => {
            let damage = 50 + level * 20;
            let dir = getAimDir(player, keys);
            // Simulated as a fast, very long projectile
            SurvivalEntityManager.spawnProjectile(player.x + player.width/2, player.y + player.height/2, dir.dx*1500, dir.dy*1500, {
                damage: damage, color: '#fcd34d', size: 16, penetration: 999, life: 0.4, stretchToV: true
            });
        }
    },
    'drone': {
        id: 'drone',
        name: '戰鬥無人機',
        description: '繞著玩家旋轉並自動射擊。',
        maxLevel: 5,
        baseCooldown: 0.5,
        fire: (level, player) => {
            let damage = 8 + level * 4;
            let time = Date.now() / 300;
            let dx = Math.cos(time);
            let dy = Math.sin(time);
            let droneX = player.x + player.width/2 + dx * 80;
            let droneY = player.y + player.height/2 + dy * 80;
            
            if (SkillManager.hasSynergy('drone', 'boomerang')) {
                SurvivalEntityManager.spawnProjectile(droneX, droneY, dx*500, dy*500, {
                    damage: damage, color: '#9ca3af', size: 10, penetration: 3, boomerang: true
                });
            } else {
                SurvivalEntityManager.spawnProjectile(droneX, droneY, dx*600, dy*600, {
                    damage: damage, color: '#cbd5e1', size: 6, penetration: 1
                });
            }
        }
    },
    'turret': {
        id: 'turret',
        name: '砲塔',
        description: '放置在原地，自動攻擊範圍內敵人。',
        maxLevel: 5,
        baseCooldown: 5.0,
        fire: (level, player) => {
            let damage = 5 + level * 2;
            // Spawns a stationary projectile that periodically fires at nearest enemy (simplified to radial burst)
            SurvivalEntityManager.spawnProjectile(player.x + player.width/2, player.y + player.height/2, 0, 0, {
                damage: damage, color: '#64748b', size: 24, life: 4.0, penetration: 999, turret: true
            });
        }
    },
    'energy_shield': {
        id: 'energy_shield',
        name: '能量護盾',
        description: '抵擋傷害，破裂時擊退敵人。',
        maxLevel: 5,
        baseCooldown: 10.0,
        fire: (level, player) => {
            if (!player.hasShield) {
                player.hasShield = true;
                player.shieldStrength = level;
            }
        }
    },
    'spikes': {
        id: 'spikes',
        name: '地刺',
        description: '在玩家腳下生成地刺，造成範圍傷害。',
        maxLevel: 5,
        baseCooldown: 1.5,
        fire: (level, player) => {
            let damage = 25 + level * 10;
            SurvivalEntityManager.spawnProjectile(player.x + player.width/2, player.y + player.height/2, 0, 0, {
                damage: damage, color: '#94a3b8', size: 40, life: 0.5, penetration: 999, stationary: true
            });
        }
    }
};
