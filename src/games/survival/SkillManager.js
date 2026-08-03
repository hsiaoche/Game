import { SurvivalEntityManager } from './SurvivalEntityManager.js';

import { SKILLS_DB } from './data/SkillsDB.js';

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
    },
    
    hasSynergy(skillA, skillB) {
        return this.playerSkills[skillA] && this.playerSkills[skillA].level >= 3 &&
               this.playerSkills[skillB] && this.playerSkills[skillB].level >= 3;
    }
};
