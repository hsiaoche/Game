const fs = require('fs');
const emptyRow = '1000000000000000000000000000000000000001';
const solidRow = '1111111111111111111111111111111111111111';

function makeLevel(id, startRow, goalRow, platforms, saws = []) {
    let layout = [solidRow];
    for (let i = 1; i < 19; i++) layout.push(emptyRow.split(''));
    layout.push(solidRow.split(''));

    // S = start, 3 = goal
    layout[startRow.r][startRow.c] = 'S';
    layout[goalRow.r][goalRow.c] = '3';

    // Platforms
    for (let p of platforms) {
        for (let c = p.c1; c <= p.c2; c++) {
            layout[p.r][c] = p.type || '1';
        }
    }
    
    if (saws) {
        for (let s of saws) {
            layout[s.r][s.c] = s.type;
        }
    }

    return `export const ${id} = {
    id: '${id}',
    width: 40,
    height: 20,
    layout: [\n        ${layout.map(r => '\"' + (Array.isArray(r) ? r.join('') : r) + '\"').join(',\n        ')}\n    ]
};`;
}

let levels = [];

// Level 1: Simple platforming, completely safe
levels.push(makeLevel('level1', {r:17, c:2}, {r:17, c:37}, [
    {r:18, c:0, c2:39}, // floor
    {r:16, c:10, c2:13}, // platform 1
    {r:14, c:16, c2:19}, // platform 2 (gap of 2 blocks horizontal, 2 blocks vertical)
    {r:16, c:22, c2:26}, // platform 3 (gap of 2 blocks horizontal, 2 down)
]));

// Level 2: Introduce horizontal saw (H)
levels.push(makeLevel('level2', {r:17, c:2}, {r:17, c:37}, [
    {r:18, c:0, c2:10},
    {r:18, c:13, c2:20},
    {r:18, c:24, c2:39},
], [
    {r:17, c:16, type: 'H'} // saw on the middle island
]));

// Level 3: Vertical saws (V) and maze feel
levels.push(makeLevel('level3', {r:17, c:2}, {r:7, c:37}, [
    {r:18, c:0, c2:12},
    {r:15, c:14, c2:17},
    {r:12, c:19, c2:22},
    {r:12, c:26, c2:29},
    {r:9, c:31, c2:34},
    {r:8, c:36, c2:39},
], [
    {r:14, c:15, type: 'V'},
    {r:11, c:21, type: 'V'},
    {r:11, c:27, type: 'V'}
]));

// Level 4: Checkpoints and multiple saws
levels.push(makeLevel('level4', {r:17, c:2}, {r:17, c:37}, [
    {r:18, c:0, c2:8},
    {r:18, c:11, c2:16},
    {r:18, c:20, c2:26},
    {r:18, c:30, c2:39},
], [
    {r:17, c:13, type: 'H'},
    {r:17, c:23, type: 'H'},
    {r:17, c:18, type: 'C'} // Checkpoint on a safe island or gap? Wait, gap is c17-19. Let's make an island for C
]));
// Let's fix level 4 Checkpoint Island
levels[3] = makeLevel('level4', {r:17, c:2}, {r:17, c:37}, [
    {r:18, c:0, c2:8},
    {r:18, c:11, c2:16},
    {r:18, c:18, c2:20}, // Checkpoint island
    {r:18, c:23, c2:28},
    {r:18, c:31, c2:39},
], [
    {r:17, c:13, type: 'H'},
    {r:17, c:25, type: 'H'},
    {r:17, c:19, type: 'C'} // Checkpoint on the small island
]);

// Level 5: The exam
levels.push(makeLevel('level5', {r:17, c:2}, {r:4, c:37}, [
    {r:18, c:0, c2:8},
    {r:16, c:11, c2:13},
    {r:14, c:16, c2:18},
    {r:12, c:21, c2:24},
    {r:12, c:27, c2:29}, // checkpoint island
    {r:10, c:22, c2:24},
    {r:8, c:17, c2:19},
    {r:6, c:22, c2:24},
    {r:5, c:27, c2:39}
], [
    {r:11, c:28, type: 'C'}, // Checkpoint halfway up
    {r:15, c:12, type: 'V'},
    {r:13, c:17, type: 'V'},
    {r:9, c:23, type: 'H'},
    {r:7, c:18, type: 'V'},
    {r:4, c:30, type: 'H'},
    {r:4, c:34, type: 'H'}
]));

// 6-10 placeholders
for(let i=6; i<=10; i++) {
    levels.push(makeLevel('level'+i, {r:17, c:2}, {r:17, c:37}, [{r:18, c:0, c2:39}]));
}

const content = levels.join('\n\n');
fs.writeFileSync('src/games/maze/levels.js', content);
console.log('levels.js regenerated with more forgiving physics jumps.');
