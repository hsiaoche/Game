/**
 * @file UIEngine.js
 * @description 統一管理所有與 DOM 相關的畫面操作，將邏輯與顯示解耦。
 */

import { QuestionRepository } from '../data/QuestionRepository.js';

export const UIEngine = {
    screens: {
        start: document.getElementById('start-screen'),
        gameOver: document.getElementById('game-over-screen'),
        question: document.getElementById('question-screen'),
        mobileControls: document.getElementById('mobile-controls'),
        hud: document.getElementById('hud')
    },
    
    elements: {
        timer: document.getElementById('timer'),
        lives: document.getElementById('lives'),
        questionTitle: document.getElementById('question-title'),
        questionOptions: document.getElementById('question-options'),
        endTitle: document.getElementById('end-title'),
        endMsg: document.getElementById('end-msg'),
        leaderboardContainer: document.getElementById('leaderboard-container'),
        leaderboardList: document.getElementById('leaderboard-list'),
        levelIndicator: document.getElementById('level-indicator')
    },

    updateHUD(time, lives, maxLives = 3, levelIndex = 0) {
        if (this.elements.levelIndicator) {
            this.elements.levelIndicator.innerText = `Level ${levelIndex + 1}`;
        }
        
        const minutes = Math.floor(time / 60).toString().padStart(2, '0');
        const seconds = (time % 60).toFixed(2).padStart(5, '0');
        this.elements.timer.innerText = `${minutes}:${seconds}`;
        
        this.elements.lives.innerHTML = '';
        for(let i=0; i < maxLives; i++) {
            const div = document.createElement('div');
            div.className = 'life-box' + (i >= lives ? ' lost' : '');
            this.elements.lives.appendChild(div);
        }
    },

    showScreen(screenName) {
        Object.keys(this.screens).forEach(key => {
            if (key === screenName) {
                this.screens[key].classList.remove('hidden');
            }
        });
    },

    hideScreen(screenName) {
        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('hidden');
        }
    },
    
    hideAllScreens() {
        Object.values(this.screens).forEach(screen => screen.classList.add('hidden'));
    },

    showQuestion() {
        return new Promise((resolve) => {
            this.screens.question.classList.remove('hidden');
            
            const q = QuestionRepository.getRandomQuestion();
            if (!q) {
                resolve({ isCorrect: true }); // Failsafe
                this.screens.question.classList.add('hidden');
                return;
            }
            
            this.elements.questionTitle.innerText = q.question;
            this.elements.questionOptions.innerHTML = '';
            
            q.options.forEach((optText, idx) => {
                const btn = document.createElement('button');
                btn.className = 'option-btn';
                btn.innerText = optText;
                btn.onclick = () => {
                    this.screens.question.classList.add('hidden');
                    resolve({
                        isCorrect: idx === q.answerIndex,
                        correctAnswer: q.options[q.answerIndex]
                    });
                };
                this.elements.questionOptions.appendChild(btn);
            });
        });
    },

    showGameOver(isWin, deathInfo = null, finalTimeStr = null, topRecords = []) {
        this.hideScreen('hud');
        this.hideScreen('mobileControls');
        
        this.elements.endTitle.className = isWin ? 'win-title' : 'lose-title';
        this.elements.endTitle.innerText = isWin ? 'MISSION CLEAR!' : 'GAME OVER';
        
        if (isWin) {
            this.elements.endMsg.innerHTML = `成功逃出迷宮！<br><span style="color:var(--accent-color); font-weight:bold; font-size:1.2rem; display:inline-block; margin-top:10px;">本次時間: ${finalTimeStr}</span>`;
            
            this.elements.leaderboardList.innerHTML = '';
            topRecords.forEach((record, index) => {
                const li = document.createElement('li');
                li.className = `rank-${index + 1}`;
                li.innerHTML = `<span>#${index + 1}</span> <span>${record.formatted}</span>`;
                this.elements.leaderboardList.appendChild(li);
            });
            
            this.elements.leaderboardContainer.classList.remove('hidden');
        } else {
            if (deathInfo && deathInfo.reason === 'WRONG_ANSWER') {
                this.elements.endMsg.innerHTML = `答錯了！<br>正確答案是：<span style="color:var(--success-color); font-weight:bold; font-size:1.1rem; display:inline-block; margin-top:5px;">${deathInfo.correctAnswer}</span>`;
            } else if (deathInfo && deathInfo.reason === 'OUT_OF_LIVES') {
                this.elements.endMsg.innerHTML = `復活方塊已耗盡...`;
            } else {
                this.elements.endMsg.innerText = '你碰到了陷阱/鋸片...';
            }
            this.elements.leaderboardContainer.classList.add('hidden');
        }
        
        this.screens.gameOver.classList.remove('hidden');
    }
};
