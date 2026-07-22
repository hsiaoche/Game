export const TILE_SIZE = 40;

export let currentMapData = [];
export let mapHeight = 0;
export let mapWidth = 0;

export function getTile(c, r) {
    if (r < 0 || r >= mapHeight || c < 0 || c >= mapWidth) return '1';
    let val = currentMapData[r][c];
    if (['S', 'H', 'V', 'C'].includes(val)) val = '0'; // treat as air for physics
    return val;
}

export function getRawTile(c, r) {
    if (r < 0 || r >= mapHeight || c < 0 || c >= mapWidth) return '1';
    return currentMapData[r][c];
}

export function loadMap(mapData, sawsArray) {
    currentMapData = mapData;
    mapHeight = mapData.length;
    mapWidth = mapData[0].length;
    
    let startPos = { x: 40, y: 40 };
    sawsArray.length = 0;
    
    for (let r = 0; r < mapHeight; r++) {
        for (let c = 0; c < mapWidth; c++) {
            const val = mapData[r][c];
            if (val === 'S') {
                startPos = { x: c * TILE_SIZE, y: r * TILE_SIZE };
            } else if (val === 'H' || val === 'V') {
                sawsArray.push({
                    x: c * TILE_SIZE + 8,
                    y: r * TILE_SIZE + 8,
                    type: val,
                    speed: val === 'H' ? 120 : 150, // pixels per second (adjusted for dt)
                    dir: 1,
                    size: 24,
                    rotation: 0
                });
            }
        }
    }
    return startPos;
}

export function drawWorld(ctx, cameraX, cameraY, canvasWidth, canvasHeight) {
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    const bgSize = 40;
    const offsetX = cameraX % bgSize;
    const offsetY = cameraY % bgSize;
    
    ctx.beginPath();
    for(let y = -offsetY; y < canvasHeight; y += bgSize) {
        ctx.moveTo(0, y); ctx.lineTo(canvasWidth, y);
    }
    for(let x = -offsetX; x < canvasWidth; x += bgSize) {
        ctx.moveTo(x, 0); ctx.lineTo(x, canvasHeight);
    }
    ctx.stroke();

    const startCol = Math.max(0, Math.floor(cameraX / TILE_SIZE));
    const endCol = Math.min(mapWidth, startCol + Math.ceil(canvasWidth / TILE_SIZE) + 1);
    const startRow = Math.max(0, Math.floor(cameraY / TILE_SIZE));
    const endRow = Math.min(mapHeight, startRow + Math.ceil(canvasHeight / TILE_SIZE) + 1);

    for (let r = startRow; r < endRow; r++) {
        for (let c = startCol; c < endCol; c++) {
            const tile = currentMapData[r][c];
            const px = c * TILE_SIZE - cameraX;
            const py = r * TILE_SIZE - cameraY;

            if (tile === '1') {
                ctx.fillStyle = '#475569'; 
                ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
                ctx.fillRect(px, py + TILE_SIZE - 4, TILE_SIZE, 4);
                ctx.fillRect(px + TILE_SIZE - 4, py, 4, TILE_SIZE);
            } else if (tile === '2') {
                ctx.fillStyle = '#f43f5e';
                ctx.shadowColor = '#f43f5e';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.moveTo(px, py + TILE_SIZE);
                ctx.lineTo(px + TILE_SIZE/2, py + 10);
                ctx.lineTo(px + TILE_SIZE, py + TILE_SIZE);
                ctx.fill();
                ctx.shadowBlur = 0;
            } else if (tile === '3') {
                ctx.fillStyle = '#10b981';
                ctx.shadowColor = '#10b981';
                ctx.shadowBlur = 20;
                ctx.fillRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
                ctx.shadowBlur = 0;
            } else if (tile === 'S') {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.lineWidth = 2;
                ctx.strokeRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            }
        }
    }
}
