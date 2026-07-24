const fs = require('fs');

const W = 40, H = 20;

function createLevel(id, startRow, startCol, goalRow, platforms) {
    let layout = Array(H).fill(null).map(() => "1" + "0".repeat(W-2) + "1");
    layout[0] = "1".repeat(W);
    layout[H-1] = "1".repeat(W);
    
    // Add goal
    let goalLine = layout[goalRow].split('');
    goalLine[W-3] = '3';
    goalLine[W-2] = '3';
    layout[goalRow] = goalLine.join('');

    // Add platforms
    platforms.forEach(p => {
        let line = layout[p.y].split('');
        for(let x=p.x1; x<=p.x2; x++) line[x] = '1';
        if (p.saw === 'H' || p.saw === 'V' || p.saw === 'F') {
            for(let x=p.sx1; x<=p.sx2; x+=p.sstep) {
                line[x] = p.saw;
            }
        }
        layout[p.y] = line.join('');
    });
    
    // Add start
    let startLine = layout[startRow].split('');
    startLine[startCol] = 'S';
    layout[startRow] = startLine.join('');

    return `export const ${id} = {
    id: "${id}",
    width: 40,
    height: 20,
    layout: [
${layout.map(l => `        "${l}"`).join(',\n')}
    ]
};`;
}

const levels = [];

// Level 1: Basics
levels.push(`export const level1 = {
    id: "level1",
    width: 40,
    height: 20,
    layout: [
        "1111111111111111111111111111111111111111",
        "1000000000000000000000000000000000000001",
        "1000000000000000000000000000000000000001",
        "1000000000000000000000000000000000000001",
        "1000000000000000000000000000000000000001",
        "1000000000000000000000000000000000000001",
        "1000000000000000000000000000000000000001",
        "1000000000000000000000000000000000000001",
        "1000000000000000000000000000000000000001",
        "1000000000000000000000000000000000000001",
        "1000000000000000000000000000000000000001",
        "1000000000000000000000000000000000000001",
        "1000000000000000000000000000000000000001",
        "1000000000000000000000000000000000000001",
        "1000000000000000000000000000000000000001",
        "1000000000000000000000000000000000000001",
        "100000000000000000F000000000000000000001",
        "1000000110000110000000000000011000000031",
        "1S00001111001111000F0000F000111100000001",
        "1111111111111111111111111111111111111111"
    ]
};`);

// Level 2: Overlapping platforms ascending to the right, then left, then right.
// Ys: 18, 15, 12, 9, 6, 3
levels.push(createLevel('level2', 18, 1, 2, [
    { y: 18, x1: 1, x2: 9 },      // ground floor left
    { y: 15, x1: 7, x2: 18 },     // jump up to x=7 (overlap 7-9)
    { y: 12, x1: 16, x2: 27 },    // jump up to x=16 (overlap 16-18)
    { y: 9,  x1: 25, x2: 38 },    // jump up to x=25 (overlap 25-27)
    { y: 6,  x1: 10, x2: 27, saw: 'H', sx1: 15, sx2: 25, sstep: 5 }, // jump LEFT to x=27 (overlap)
    { y: 3,  x1: 1, x2: 12 }      // jump LEFT to x=12 (overlap)
]));

// Level 3: Vertical zig zag with V saws.
levels.push(createLevel('level3', 18, 1, 2, [
    { y: 18, x1: 1, x2: 10 },
    { y: 15, x1: 8, x2: 18, saw: 'V', sx1: 9, sx2: 9, sstep: 1 }, 
    { y: 12, x1: 16, x2: 26, saw: 'V', sx1: 17, sx2: 17, sstep: 1 },
    { y: 9,  x1: 24, x2: 34, saw: 'V', sx1: 25, sx2: 25, sstep: 1 },
    { y: 6,  x1: 14, x2: 26, saw: 'V', sx1: 20, sx2: 20, sstep: 1 },
    { y: 3,  x1: 1, x2: 16 }
]));

// Level 4: Tighter jumps with F saws
levels.push(createLevel('level4', 18, 1, 2, [
    { y: 18, x1: 1, x2: 6 },
    { y: 15, x1: 4, x2: 9, saw: 'F', sx1: 7, sx2: 7, sstep: 1 },
    { y: 12, x1: 7, x2: 12, saw: 'F', sx1: 10, sx2: 10, sstep: 1 },
    { y: 9,  x1: 10, x2: 15, saw: 'F', sx1: 13, sx2: 13, sstep: 1 },
    { y: 6,  x1: 13, x2: 25, saw: 'F', sx1: 16, sx2: 22, sstep: 3 },
    { y: 3,  x1: 23, x2: 38 }
]));

// Level 5: Combination of wide platforms
levels.push(createLevel('level5', 18, 1, 2, [
    { y: 18, x1: 1, x2: 38 }, // full ground
    { y: 15, x1: 30, x2: 38 }, // right side up
    { y: 12, x1: 22, x2: 32, saw: 'V', sx1: 27, sx2: 27, sstep: 1 }, // middle
    { y: 9,  x1: 14, x2: 24, saw: 'V', sx1: 19, sx2: 19, sstep: 1 }, // left
    { y: 6,  x1: 1, x2: 16 }, // far left
    { y: 3,  x1: 1, x2: 38, saw: 'H', sx1: 10, sx2: 30, sstep: 5 } // final corridor
]));

// Level 6: Lots of F saws. 
levels.push(createLevel('level6', 18, 1, 2, [
    { y: 18, x1: 1, x2: 5 },
    { y: 15, x1: 3, x2: 38, saw: 'F', sx1: 8, sx2: 35, sstep: 2 },
    { y: 12, x1: 30, x2: 38 },
    { y: 9,  x1: 10, x2: 32, saw: 'F', sx1: 12, sx2: 28, sstep: 2 },
    { y: 6,  x1: 1, x2: 12 },
    { y: 3,  x1: 1, x2: 38 }
]));

// Level 7: Ascending spiral
levels.push(createLevel('level7', 18, 1, 2, [
    { y: 18, x1: 1, x2: 30 },
    { y: 15, x1: 28, x2: 38 },
    { y: 12, x1: 10, x2: 30 },
    { y: 9,  x1: 1, x2: 12 },
    { y: 6,  x1: 1, x2: 30 },
    { y: 3,  x1: 28, x2: 38 }
]));

// Level 8: Maze-like
levels.push(createLevel('level8', 18, 1, 2, [
    { y: 18, x1: 1, x2: 8 },
    { y: 15, x1: 6, x2: 14 },
    { y: 12, x1: 12, x2: 20 },
    { y: 9,  x1: 18, x2: 26 },
    { y: 6,  x1: 24, x2: 32 },
    { y: 3,  x1: 30, x2: 38 }
]));

// Level 9: H and V gauntlet
levels.push(createLevel('level9', 18, 1, 2, [
    { y: 18, x1: 1, x2: 8 },
    { y: 15, x1: 6, x2: 38, saw: 'H', sx1: 12, sx2: 35, sstep: 4 },
    { y: 12, x1: 30, x2: 38 },
    { y: 9,  x1: 1, x2: 32, saw: 'V', sx1: 5, sx2: 25, sstep: 5 },
    { y: 6,  x1: 1, x2: 10 },
    { y: 3,  x1: 8, x2: 38 }
]));

// Level 10: The ultimate test
levels.push(createLevel('level10', 18, 1, 2, [
    { y: 18, x1: 1, x2: 6 },
    { y: 15, x1: 4, x2: 12, saw: 'V', sx1: 8, sx2: 8, sstep: 1 },
    { y: 12, x1: 10, x2: 18, saw: 'H', sx1: 12, sx2: 16, sstep: 2 },
    { y: 9,  x1: 16, x2: 24, saw: 'F', sx1: 18, sx2: 22, sstep: 2 },
    { y: 6,  x1: 22, x2: 30, saw: 'V', sx1: 26, sx2: 26, sstep: 1 },
    { y: 3,  x1: 28, x2: 38 }
]));


fs.writeFileSync('/Users/hsiaoche/Desktop/Web/Game/src/game/levels.js', levels.join('\n\n'));
