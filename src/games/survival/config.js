export const SurvivalConfig = {
    ARENA_WIDTH: 2000,
    ARENA_HEIGHT: 2000,
    PLAYER_SPEED: 250, // pixels per second (increased slightly for better feel)
    PLAYER_ACCEL: 1500, // For smooth acceleration
    PLAYER_FRICTION: 0.85,
    PLAYER_MAX_HP: 100,
    PLAYER_SIZE: 24,
    EXP_MAGNET_RANGE: 150, // Starts pulling towards player
    EXP_PICKUP_RADIUS: 30, // Actually gets picked up
    GRAVITY: 500,
    TERMINAL_VELOCITY: 400,
    LEVEL_UP_BASE: 10,
    LEVEL_UP_FACTOR: 1.5,
    COLORS: {
        PLAYER: '#38bdf8',
        BG: '#1e293b',
        GRID: '#334155',
        EXP_GEM: '#10b981',
        DAMAGE_TEXT: '#f8fafc',
    }
};
