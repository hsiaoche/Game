export const TILE_SIZE = 40;

export let currentMapData = [];
export let mapHeight = 0;
export let mapWidth = 0;

export function getTile(c, r) {
    if (r < 0 || r >= mapHeight || c < 0 || c >= mapWidth) return '1';
    let val = currentMapData[r][c];
    if (['S', 'H', 'V', 'F', 'C', 'B', 'D', 'P', 'Q', 'R', 'T'].includes(val)) val = '0'; // treat as air for physics
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
    const checkpointConfigs = [];
    const bounceConfigs = [];
    const dropConfigs = [];
    const portalConfigs = [];
    
    for (let r = 0; r < mapHeight; r++) {
        for (let c = 0; c < mapWidth; c++) {
            const val = currentMapData[r][c];
            if (val === 'S') {
                startPos = { x: c * TILE_SIZE, y: r * TILE_SIZE };
            } else if (val === 'C') {
                checkpointConfigs.push({
                    x: c * TILE_SIZE,
                    y: r * TILE_SIZE,
                    active: false
                });
            } else if (val === 'H' || val === 'V' || val === 'F') {
                sawConfigs.push({
                    x: c * TILE_SIZE + 8,
                    y: r * TILE_SIZE + 8,
                    type: val === 'F' ? 'H' : val,
                    speed: val === 'F' ? 0 : (val === 'H' ? 120 : 150),
                    dir: 1,
                    size: 24,
                    rotation: 0
                });
            } else if (val === 'B') {
                bounceConfigs.push({
                    x: c * TILE_SIZE,
                    y: r * TILE_SIZE,
                    width: TILE_SIZE,
                    height: TILE_SIZE
                });
            } else if (val === 'D') {
                dropConfigs.push({
                    x: c * TILE_SIZE,
                    y: r * TILE_SIZE,
                    width: TILE_SIZE,
                    height: TILE_SIZE,
                    state: 'idle', // idle, shaking, dropped
                    timer: 0
                });
            } else if (val === 'P' || val === 'Q' || val === 'R' || val === 'T') {
                portalConfigs.push({
                    id: val,
                    x: c * TILE_SIZE,
                    y: r * TILE_SIZE,
                    width: TILE_SIZE,
                    height: TILE_SIZE,
                    cooldown: 0
                });
            }
        }
    }
    return { startPos, sawConfigs, checkpointConfigs, bounceConfigs, dropConfigs, portalConfigs };
}


