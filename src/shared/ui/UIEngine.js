/**
 * @file UIEngine.js
 * @description 統一管理所有與 DOM 相關的畫面操作，將邏輯與顯示解耦。
 */

import { QuestionRepository } from '../data/QuestionRepository.js';

export const UIEngine = {
    _lastState: {},
    screens: {
        hub: document.getElementById('hub-screen'),
        start: document.getElementById('start-screen'),
        gameOver: document.getElementById('game-over-screen'),
        question: document.getElementById('question-screen'),
        mobileControls: document.getElementById('mobile-controls'),
        hud: document.getElementById('hud'),
        survivalHud: document.getElementById('survival-hud'),
        levelUp: document.getElementById('level-up-screen'),
        pauseScreen: document.getElementById('pause-screen'),
        bossWarning: document.getElementById('boss-warning')
    },
    
    elements: {
        timer: document.getElementById('time-display'),
        lives: document.getElementById('lives-display'),
        questionTitle: document.getElementById('question-title'),
        questionOptions: document.getElementById('question-options'),
        endTitle: document.getElementById('end-title'),
        endMsg: document.getElementById('end-msg'),
        leaderboardContainer: document.getElementById('leaderboard-container'),
        leaderboardList: document.getElementById('leaderboard-list'),
        levelIndicator: document.getElementById('level-indicator'),
        
        // Survival UI
        survivalTime: document.getElementById('survival-time'),
        survivalLevel: document.getElementById('survival-level'),
        expFill: document.getElementById('exp-fill'),
        hpFill: document.getElementById('hp-fill'),
        hpText: document.getElementById('hp-text'),
        levelUpOptions: document.getElementById('level-up-options'),
        skillList: document.getElementById('skill-list'),
        
        // Controls
        jumpBtn: document.getElementById('btn-jump'),
        joystickRight: document.getElementById('joystick-right'),
        joystickLeft: document.getElementById('joystick-left'),
        btnLeft: document.getElementById('btn-left'),
        btnRight: document.getElementById('btn-right'),
        pauseBtn: document.getElementById('btn-pause')
    },

    setupSurvivalControls() {
        if (this.elements.jumpBtn) this.elements.jumpBtn.classList.add('d-none');
        if (this.elements.joystickRight) this.elements.joystickRight.classList.remove('d-none');
        if (this.elements.joystickLeft) this.elements.joystickLeft.classList.remove('d-none');
        if (this.elements.btnLeft) this.elements.btnLeft.classList.add('d-none');
        if (this.elements.btnRight) this.elements.btnRight.classList.add('d-none');
    },

    teardownSurvivalControls() {
        if (this.elements.jumpBtn) this.elements.jumpBtn.classList.remove('d-none');
        if (this.elements.joystickRight) this.elements.joystickRight.classList.add('d-none');
        if (this.elements.joystickLeft) this.elements.joystickLeft.classList.add('d-none');
        if (this.elements.btnLeft) this.elements.btnLeft.classList.remove('d-none');
        if (this.elements.btnRight) this.elements.btnRight.classList.remove('d-none');
        if (this.elements.pauseBtn) this.elements.pauseBtn.onclick = null;
    },

    setupMazeControls() {
        if (this.elements.jumpBtn) this.elements.jumpBtn.classList.remove('d-none');
        if (this.elements.joystickRight) this.elements.joystickRight.classList.add('d-none');
        if (this.elements.joystickLeft) this.elements.joystickLeft.classList.add('d-none');
        if (this.elements.btnLeft) this.elements.btnLeft.classList.remove('d-none');
        if (this.elements.btnRight) this.elements.btnRight.classList.remove('d-none');
    },

    bindPauseButton(onPause) {
        if (this.elements.pauseBtn) {
            this.elements.pauseBtn.onclick = onPause;
        }
    },

    updateHUD(time, lives, maxLives = 3, levelIndex = 0) {
        const timeStr = time.toFixed(2); // Use toFixed(2) to allow millisecond updates
        const stateKey = `hud_${timeStr}_${lives}_${maxLives}_${levelIndex}`;
        
        if (this._lastState.hud === stateKey) return;
        this._lastState.hud = stateKey;

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

    updateSurvivalHUD(timeStr, level, exp, maxExp, hp, maxHp, skills) {
        // Create a fast hash/string representation of current state
        let skillsHash = skills ? skills.map(s => `${s.name}${s.level}`).join('') : '';
        let hpInt = Math.ceil(hp);
        const stateKey = `survhud_${timeStr}_${level}_${exp}_${maxExp}_${hpInt}_${maxHp}_${skillsHash}`;
        
        if (this._lastState.survivalHud === stateKey) return;
        this._lastState.survivalHud = stateKey;

        if (this.elements.survivalTime) this.elements.survivalTime.innerText = timeStr;
        if (this.elements.survivalLevel) this.elements.survivalLevel.innerText = `Lv. ${level}`;
        
        if (this.elements.expFill) {
            let pct = (exp / maxExp) * 100;
            this.elements.expFill.style.width = `${pct}%`;
        }
        
        if (this.elements.hpFill) {
            let pct = Math.max(0, (hp / maxHp) * 100);
            this.elements.hpFill.style.width = `${pct}%`;
            if (this.elements.hpText) this.elements.hpText.innerText = `${hpInt} / ${maxHp}`;
        }

        if (this.elements.skillList && skills) {
            this.elements.skillList.innerHTML = '';
            skills.forEach(s => {
                const badge = document.createElement('div');
                badge.className = 'skill-badge';
                badge.innerText = `${s.name} Lv.${s.level}`;
                this.elements.skillList.appendChild(badge);
            });
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

    showSurvivalLevelUp(options) {
        return new Promise((resolve) => {
            this.screens.levelUp.classList.remove('hidden');
            this.elements.levelUpOptions.innerHTML = '';
            
            options.forEach((opt) => {
                const btn = document.createElement('button');
                btn.className = 'level-up-btn';
                btn.innerHTML = `
                    <div class="skill-name">${opt.name} <span class="skill-level">Lv.${opt.nextLevel}</span></div>
                    <div class="skill-desc">${opt.description}</div>
                `;
                btn.addEventListener('pointerdown', (e) => {
                    e.stopPropagation(); // prevent handleStartTap in main.js
                });
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.screens.levelUp.classList.add('hidden');
                    resolve(opt.id);
                });
                this.elements.levelUpOptions.appendChild(btn);
            });
        });
    },

    showPauseScreen(onResume, onQuit) {
        this.screens.pauseScreen.classList.remove('hidden');
        document.getElementById('btn-resume').onclick = () => {
            this.screens.pauseScreen.classList.add('hidden');
            if (onResume) onResume();
        };
        document.getElementById('btn-quit').onclick = () => {
            this.screens.pauseScreen.classList.add('hidden');
            if (onQuit) onQuit();
        };
    },

    showBossWarning() {
        this.screens.bossWarning.classList.remove('hidden');
        setTimeout(() => {
            this.screens.bossWarning.classList.add('hidden');
        }, 3000); // Hide after 3 seconds
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
