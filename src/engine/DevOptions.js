export const devOptions = {
    godMode: false,
    speedMultiplier: 1
};

export function initDevOptions() {
    window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyG') {
            devOptions.godMode = !devOptions.godMode;
            console.log(`[DEV] God Mode: ${devOptions.godMode ? 'ON' : 'OFF'}`);
        }
        if (e.code === 'KeyH') {
            if (devOptions.speedMultiplier === 1) devOptions.speedMultiplier = 2;
            else if (devOptions.speedMultiplier === 2) devOptions.speedMultiplier = 4;
            else devOptions.speedMultiplier = 1;
            console.log(`[DEV] Speed: ${devOptions.speedMultiplier}x`);
        }
    });
}

export function drawDevUI(ctx) {
    if (!devOptions.godMode && devOptions.speedMultiplier === 1) return;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 160, 40);
    
    ctx.fillStyle = '#10b981';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`[DEV] God Mode: ${devOptions.godMode ? 'ON' : 'OFF'}`, 20, 25);
    ctx.fillText(`[DEV] Speed: ${devOptions.speedMultiplier}x`, 20, 40);
}
