/**
 * @file Camera.js
 * @description 封裝 Canvas 相關的 DOM 取得、尺寸重置與攝影機座標管理。
 */

export const canvas = document.getElementById('gameCanvas');
export const ctx = canvas ? canvas.getContext('2d') : null;

export const CameraState = {
    x: 0,
    y: 0
};

export function resizeCanvas() {
    if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
    }
}

// 綁定 Resize 事件
if (typeof window !== 'undefined') {
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
}
