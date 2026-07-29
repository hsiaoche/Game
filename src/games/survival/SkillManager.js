import { SurvivalEntityManager } from './SurvivalEntityManager.js';

export const SKILLS_DB = {
    'magic_missile': {
        id: 'magic_missile',
        name: '魔法飛彈',
        description: '自動發射飛彈攻擊最近的敵人',
        maxLevel: 5,
        baseCooldown: 1.0,
        fire: (level, player, keys) => {
            let numMissiles = 1 + Math.floor(level / 2);
            let damage = 10 + level * 5;
            
            for (let i = 0; i < numMissiles; i++) {
                let dx = 0, dy = -1; // Default upwards
                if (keys.aimDx || keys.aimDy) {
                    dx = keys.aimDx;
                    dy = keys.aimDy;
                } else {
                    dx = keys.aimX - (player.x + player.width/2);
                    dy = keys.aimY - (player.y + player.height/2);
                }

                let dist = Math.sqrt(dx*dx + dy*dy);
                let vx = 0, vy = -300;
                
                if (dist > 0) {
                    let angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.3; // Less spread
                    vx = Math.cos(angle) * 300;
                    vy = Math.sin(angle) * 300;
                }

                SurvivalEntityManager.spawnProjectile(player.x + player.width/2, player.y + player.height/2, vx, vy, {
                    damage: damage,
                    color: '#38bdf8',
                    size: 8,
                    penetration: 1
                });
            }
        }
    },
    'fire_aura': {
        id: 'fire_aura',
        name: '火焰光環',
        description: '對周圍敵人造成持續傷害',
        maxLevel: 5,
        baseCooldown: 0.5,
        fire: (level, player) => {
            let radius = 60 + level * 10;
            let damage = 5 + level * 2;
            
            // Visual effect
            SurvivalEntityManager.spawnProjectile(player.x + player.width/2, player.y + player.height/2, 0, 0, {
                damage: damage,
                color: 'rgba(244, 63, 94, 0.3)',
                size: radius * 2,
                life: 0.1,
                penetration: 999
            });
        }
    },
    'pierce_arrow': {
        id: 'pierce_arrow',
        name: '穿透箭',
        description: '朝玩家面朝方向發射穿透箭',
        maxLevel: 5,
        baseCooldown: 1.5,
        fire: (level, player, keys) => {
            let numArrows = 1 + Math.floor(level / 3);
            let damage = 15 + level * 8;
            let penetration = 2 + level;
            
            let dx = 0, dy = -1;
            if (keys.aimDx || keys.aimDy) {
                dx = keys.aimDx;
                dy = keys.aimDy;
            } else {
                dx = keys.aimX - (player.x + player.width/2);
                dy = keys.aimY - (player.y + player.height/2);
            }

            let dist = Math.sqrt(dx*dx + dy*dy);
            
            let baseVx = 0, baseVy = -400; // Default upwards
            if (dist > 0) {
                baseVx = (dx / dist) * 400;
                baseVy = (dy / dist) * 400;
            }

            for (let i = 0; i < numArrows; i++) {
                let vx = baseVx;
                let vy = baseVy + (Math.random() - 0.5) * 50; // Slight parallel spread
                SurvivalEntityManager.spawnProjectile(player.x + player.width/2, player.y + player.height/2, vx, vy, {
                    damage: damage,
                    color: '#fbbf24',
                    size: 12,
                    penetration: penetration
                });
            }
        }
    }
};

export const SkillManager = {
    playerSkills: {}, // { 'magic_missile': { level: 1, cooldown: 0 } }
    
    init() {
        this.playerSkills = {};
        // Start with one basic skill
        this.addOrUpgradeSkill('magic_missile');
    },

    update(dt, player, keys) {
        for (let skillId in this.playerSkills) {
            let pSkill = this.playerSkills[skillId];
            pSkill.cooldown -= dt;
            if (pSkill.cooldown <= 0) {
                let skillData = SKILLS_DB[skillId];
                skillData.fire(pSkill.level, player, keys);
                // Calculate cooldown based on level, maybe add CDR later
                pSkill.cooldown = skillData.baseCooldown * Math.max(0.2, (1 - pSkill.level * 0.05));
            }
        }
    },

    addOrUpgradeSkill(skillId) {
        if (this.playerSkills[skillId]) {
            if (this.playerSkills[skillId].level < SKILLS_DB[skillId].maxLevel) {
                this.playerSkills[skillId].level++;
            }
        } else {
            this.playerSkills[skillId] = {
                level: 1,
                cooldown: SKILLS_DB[skillId].baseCooldown
            };
        }
    },

    getUpgradeOptions() {
        // Return 3 random valid upgrades
        let options = [];
        let available = [];
        
        for (let key in SKILLS_DB) {
            if (!this.playerSkills[key] || this.playerSkills[key].level < SKILLS_DB[key].maxLevel) {
                available.push(key);
            }
        }
        
        // Shuffle and pick 3
        available.sort(() => 0.5 - Math.random());
        let picks = available.slice(0, 3);
        
        for (let p of picks) {
            let nextLevel = this.playerSkills[p] ? this.playerSkills[p].level + 1 : 1;
            options.push({
                id: p,
                name: SKILLS_DB[p].name,
                description: SKILLS_DB[p].description,
                nextLevel: nextLevel
            });
        }
        
        return options;
    }
};
