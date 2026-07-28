import { level1, level2, level3, level4, level5, level6, level7, level8, level9, level10 } from './src/games/maze/levels.js';
import { LevelValidator } from './src/games/maze/LevelValidator.js';

const levels = [level1, level2, level3, level4, level5, level6, level7, level8, level9, level10];
let allValid = true;
levels.forEach((lvl, i) => {
    const errors = LevelValidator.validate(lvl);
    if (errors.length > 0) {
        console.error(`Level ${i+1} (${lvl.id}) failed validation:`);
        errors.forEach(e => console.error('  - ' + e));
        allValid = false;
    } else {
        console.log(`Level ${i+1} passed.`);
    }
});
if(allValid) console.log('All levels passed validation!');
