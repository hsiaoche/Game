/**
 * @file AudioManager.js
 * @description 統一管理遊戲內的音效播放 (防呆實作)。
 */

export const AudioManager = {
    isMuted: false,
    
    init() {
        // Future: Initialize AudioContext or load HTMLAudioElements here
    },
    
    playBGM(name) {
        if (this.isMuted) return;
        // console.log(`[Audio] Playing BGM: ${name}`);
    },
    
    stopBGM() {
        // console.log(`[Audio] Stopped BGM`);
    },
    
    playSFX(name) {
        if (this.isMuted) return;
        // console.log(`[Audio] Playing SFX: ${name}`);
    },
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopBGM();
        } else {
            this.playBGM('main'); // default resume
        }
    }
};
