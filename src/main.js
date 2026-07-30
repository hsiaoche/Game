import { Core } from './engine/Core.js';
import { GameContext as state } from './engine/core/GameState.js';
import { GameLoop } from './engine/core/GameLoop.js';
import { Renderer } from './engine/renderer/Renderer.js';
import { SceneManager } from './engine/SceneManager.js';
import { initDevOptions } from './shared/utils/DevOptions.js';
import { MazeLevelManager } from './games/maze/MazeLevelManager.js';
import { UIEngine } from './shared/ui/UIEngine.js';
import { QuestionRepository } from './shared/data/QuestionRepository.js';
import { SaveManager } from './shared/storage/SaveManager.js';
import { AudioManager } from './shared/audio/AudioManager.js';
import { EventBus, Events } from './engine/EventBus.js';
import { GameConfig } from './shared/config/gameConfig.js';

// Scene Managers
import { HubScene, MainMenuScene } from './games/hub/HubSceneManager.js';
import { MazeGameplayScene, MazeGameOverScene } from './games/maze/MazeSceneManager.js';
import { SurvivalGameplayScene } from './games/survival/SurvivalSceneManager.js';

function init() {
    Core.init();
    initDevOptions();
    Renderer.init();
    AudioManager.init();
    QuestionRepository.load(); // 預載入 Markdown 題庫
    
    // Subscribe to Global Events
    EventBus.on(Events.PLAYER_DEATH, () => {
        if (SceneManager.currentScene && typeof SceneManager.currentScene.handleDeath === 'function') {
            SceneManager.currentScene.handleDeath();
        }
    });

    EventBus.on(Events.LEVEL_COMPLETE, () => {
        if (SceneManager.currentScene instanceof MazeGameplayScene) {
            if (MazeLevelManager.loadNextLevel()) {
                state.lives = GameConfig.INITIAL_LIVES;
                SaveManager.saveProgress('maze', { levelIndex: MazeLevelManager.currentLevelIndex, gameTime: state.gameTime });
                SceneManager.changeScene(new MazeGameplayScene(false));
            } else {
                SaveManager.clearProgress('maze');
                SceneManager.changeScene(new MazeGameOverScene(true));
            }
        }
    });
    
    let resetTimeout = null;
    function handleStartTap(e) {
        if (SceneManager.currentScene instanceof MainMenuScene) {
            SceneManager.changeScene(new MazeGameplayScene(true));
        } else if (SceneManager.currentScene instanceof MazeGameOverScene) {
            if (resetTimeout) clearTimeout(resetTimeout);
            resetTimeout = setTimeout(() => {
                SceneManager.changeScene(new MazeGameplayScene(true));
            }, 100);
        }
    }
    
    window.focus(); // Ensure window has focus for keyboard events
    
    document.getElementById('btn-play-maze').addEventListener('click', () => {
        if (SceneManager.currentScene instanceof HubScene) {
            SceneManager.changeScene(new MazeGameplayScene(true));
        }
    });

    document.getElementById('btn-play-survival').addEventListener('click', () => {
        if (SceneManager.currentScene instanceof HubScene) {
            SceneManager.changeScene(new SurvivalGameplayScene(true));
        }
    });
    
    UIEngine.screens.start.addEventListener('pointerdown', handleStartTap);
    UIEngine.screens.gameOver.addEventListener('pointerdown', handleStartTap);
    window.addEventListener('pointerdown', (e) => {
        if (e.target.tagName !== 'BUTTON') handleStartTap(e);
    });
    
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.key === ' ' || e.code === 'Enter') {
            if (SceneManager.currentScene instanceof MainMenuScene) {
                SceneManager.changeScene(new MazeGameplayScene(true));
            } else if (SceneManager.currentScene instanceof MazeGameOverScene) {
                SceneManager.changeScene(new MazeGameplayScene(true));
            }
        }
    });

    SceneManager.changeScene(new HubScene());
    
    // We start the loop once, and it never stops, it just updates the current scene
    state.isPlaying = true; 
    GameLoop.start(
        (dt) => {
            SceneManager.update(dt);
        },
        (ctx) => SceneManager.draw(ctx)
    );
}

window.onload = init;
