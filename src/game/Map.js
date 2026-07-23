export const TILE_SIZE = 40;

export let currentMapData = [];
export let mapHeight = 0;
export let mapWidth = 0;

export function getTile(c, r) {
    if (r < 0 || r >= mapHeight || c < 0 || c >= mapWidth) return '1';
    let val = currentMapData[r][c];
    if (['S', 'H', 'V', 'F', 'C'].includes(val)) val = '0'; // treat as air for physics
    return val;
}

export function getRawTile(c, r) {
    if (r < 0 || r >= mapHeight || c < 0 || c >= mapWidth) return '1';
    return currentMapData[r][c];
}

export function loadMap(mapData) {
    currentMapData = mapData.layout;
    mapHeight = mapData.height;
    mapWidth = mapData.width;
    
    let startPos = { x: 40, y: 40 };
    const sawConfigs = [];
    
    for (let r = 0; r < mapHeight; r++) {
        for (let c = 0; c < mapWidth; c++) {
            const val = currentMapData[r][c];
            if (val === 'S') {
                startPos = { x: c * TILE_SIZE, y: r * TILE_SIZE };
            } else if (val === 'H' || val === 'V' || val === 'F') {
                sawConfigs.push({
                    x: c * TILE_SIZE + 8,
                    y: r * TILE_SIZE + 8,
                    type: val === 'F' ? 'H' : val,
                    speed: val === 'F' ? 0 : (val === 'H' ? 120 : 150), // pixels per second
                    dir: 1,
                    size: 24,
                    rotation: 0
                });
            }
        }
    }
    return { startPos, sawConfigs };
}


