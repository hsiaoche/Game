/**
 * @file LevelValidator.js
 * @description 靜態分析與驗證關卡的合法性 (起終點、跳躍距離、無死區等)。
 */

export const LevelValidator = {
    validate(levelData) {
        const layout = levelData.layout;
        const height = layout.length;
        const width = layout[0].length;
        const errors = [];

        let startPos = null;
        let goalPos = null;

        // 1. Check Start & Goal existence
        for (let r = 0; r < height; r++) {
            for (let c = 0; c < width; c++) {
                if (layout[r][c] === 'S') startPos = { r, c };
                if (layout[r][c] === '3') goalPos = { r, c };
            }
        }

        if (!startPos) errors.push('Missing Start (S) point.');
        if (!goalPos) errors.push('Missing Goal (3) point.');

        // 2. Headroom Check (cannot have block directly above S or platforms if it traps)
        for (let r = 0; r < height; r++) {
            for (let c = 0; c < width; c++) {
                const val = layout[r][c];
                if (val === '1' || val === '2') {
                    // Check if there's a trapped space of 1 block height
                    if (r > 1 && layout[r-1][c] === '0' && layout[r-2][c] === '1') {
                        errors.push(`Trapped space (1 block height) at r:${r-1}, c:${c}. Player needs 2 blocks height.`);
                    }
                }
            }
        }

        // 3. Jump Height & Distance Checks (Heuristic)
        if (startPos && goalPos) {
            const reachable = this.calculateReachableTiles(layout, startPos, height, width);
            if (!reachable.has(`${goalPos.r},${goalPos.c}`)) {
                errors.push('Goal (3) is physically unreachable from Start (S).');
            }
        }

        return errors;
    },

    calculateReachableTiles(layout, start, height, width) {
        const queue = [{ r: start.r, c: start.c }];
        const visited = new Set();
        visited.add(`${start.r},${start.c}`);

        while(queue.length > 0) {
            const curr = queue.shift();
            
            const neighbors = this.getReachableNeighbors(layout, curr, height, width);
            for (let n of neighbors) {
                const key = `${n.r},${n.c}`;
                if (!visited.has(key)) {
                    visited.add(key);
                    queue.push(n);
                }
            }
        }

        return visited;
    },

    getReachableNeighbors(layout, curr, height, width) {
        const neighbors = [];
        
        // Walk left/right
        if (curr.c > 0 && layout[curr.r][curr.c - 1] !== '1') {
            neighbors.push(this.applyGravity(layout, {r: curr.r, c: curr.c - 1}, height));
        }
        if (curr.c < width - 1 && layout[curr.r][curr.c + 1] !== '1') {
            neighbors.push(this.applyGravity(layout, {r: curr.r, c: curr.c + 1}, height));
        }
        
        // Jump (up to 3 blocks high, 5 blocks horizontally)
        for (let dx = -5; dx <= 5; dx++) {
            for (let dy = -3; dy <= 5; dy++) {
                if (dx === 0 && dy === 0) continue;
                let targetC = curr.c + dx;
                let targetR = curr.r + dy; 
                
                if (targetR >= 0 && targetR < height && targetC >= 0 && targetC < width) {
                    if (layout[targetR][targetC] !== '1') {
                        if (this.hasLineOfSight(layout, curr, {r: targetR, c: targetC})) {
                            neighbors.push(this.applyGravity(layout, {r: targetR, c: targetC}, height));
                        }
                    }
                }
            }
        }
        
        const unique = [];
        const seen = new Set();
        for (let n of neighbors) {
            const key = `${n.r},${n.c}`;
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(n);
            }
        }
        return unique;
    },

    applyGravity(layout, pos, height) {
        let currentR = pos.r;
        while(currentR + 1 < height && layout[currentR + 1][pos.c] !== '1') {
            currentR++; // Fall down
        }
        return {r: currentR, c: pos.c};
    },
    
    hasLineOfSight(layout, p1, p2) {
        let rMin = Math.min(p1.r, p2.r);
        let rMax = Math.max(p1.r, p2.r);
        let cMin = Math.min(p1.c, p2.c);
        let cMax = Math.max(p1.c, p2.c);
        
        for(let r=rMin; r<=rMax; r++){
            for(let c=cMin; c<=cMax; c++){
                if(layout[r][c] === '1') {
                    if (c === p1.c && r < p1.r) return false;
                }
            }
        }
        return true;
    }
};
