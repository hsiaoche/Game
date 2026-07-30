# 系統架構設計

本專案採用自製的 HTML5 Canvas 引擎，核心架構圍繞著「場景狀態機 (Scene-Based FSM)」與「模組化管理器 (Manager Pattern)」建構。

## 1. 核心引擎層 (`src/engine/`)

這是專案的最底層，不依賴任何特定的遊戲業務邏輯。
- **`Core.js`**: 系統入口與 Facade，負責觸發 `GameLoop` 與 `InputManager` 的初始化。
- **`GameLoop.js`**: 管理 `requestAnimationFrame` 迴圈，計算 Delta Time (dt)，並驅動當前場景的 `update` 與 `draw`。
- **`GameState.js`**: 儲存跨場景的全域上下文 (如 gameTime, lives)。
- **`SceneManager.js`**: 狀態機核心，處理場景 (Scene) 之間的切換與生命週期 (`enter`, `exit`, `update`, `draw`)。
- **`Camera.js`**: 提供基礎的 Canvas context 管理、視窗 Resize 處理與基礎座標位移狀態 (`CameraState`)。
- **`InputManager.js`**: 統一攔截並抽象化實體鍵盤、滑鼠點擊與虛擬搖桿 (Touch) 的輸入狀態。
- **`EventBus.js`**: 實作 Pub/Sub 模式，用於系統間的鬆耦合通訊。
- **`ObjectPool.js`**: 提供泛用的物件池功能，降低高頻率產生物件 (如子彈、敵人) 時的垃圾回收 (GC) 壓力。

## 2. 共用系統層 (`src/shared/`)

跨越多款小遊戲共用的業務邏輯與子系統。
- **`UIEngine.js`**: 專門處理 DOM 元素的操作與 HUD 更新。將 UI 邏輯從 Canvas 渲染中抽離。
- **`SaveManager.js` / `StorageAdapter.js`**: 封裝 LocalStorage 操作，處理玩家的存檔、解鎖進度與各遊戲排行榜。
- **`AudioManager.js`**: 統一管理背景音樂 (BGM) 與音效 (SFX) 的預載與播放。
- **`QuestionRepository.js`**: 解析 `data/questions.md` 並提供隨機抽題功能，支撐所有遊戲的「死亡答題」機制。

## 3. 遊戲業務層 (`src/games/`)

各遊戲的具體實作，互相獨立，透過 `SceneManager` 進入。

### 3.1 迷宮跑酷 (Maze Platformer)
- **`MazeSceneManager.js`**: 管理跑酷遊戲的主要生命週期。
- **`MazePhysics.js`**: 處理 2D 平台跳躍的 AABB 碰撞偵測、重力與速度運算。
- **`MazeLevelManager.js` / `levels.js` / `Map.js`**: 負責解析字串陣列構成的網格地圖，處理碰撞 Tile 與實體生成。
- **`MazeEntityManager.js`**: 管理 Player 與場景陷阱 (如 Saw) 的更新與繪製。

### 3.2 怪獸生存 (Monster Survival)
- **`SurvivalSceneManager.js`**: 管理生存遊戲的主迴圈。
- **`SurvivalEntityManager.js`**: 依賴物件池管理敵人、經驗寶石、子彈與傷害文字，並負責執行碰撞判定（目前存在過度耦合的技術債）。
- **`WaveManager.js`**: 控制敵人生成的頻率與數值縮放，包含特定 Wave 的 Boss 觸發邏輯。
- **`SkillManager.js` / `SkillsDB.js`**: 資料驅動的技能系統，管理玩家取得的技能與冷卻時間，並負責觸發子彈生成。
- **`SurvivalPlayer.js`**: 處理被限制的 1D 水平移動、生命值、經驗值吸收與升級邏輯。

## 4. 資料流 (Data Flow) 範例

以「玩家受傷死亡並觸發答題」為例：
1. `SurvivalEntityManager` (或 `MazePhysics`) 的碰撞偵測發現玩家血量歸零。
2. 該系統改變玩家狀態，並呼叫 `SceneManager.changeScene()` 切換至對應的 QuestionScene。
3. `QuestionScene.enter()` 呼叫 `UIEngine.showQuestion()` 顯示 DOM 答題介面。
4. `UIEngine` 從 `QuestionRepository` 取得題目並渲染。
5. 玩家點擊選項，`UIEngine` 解析結果並回傳 Promise。
6. `QuestionScene` 根據結果，若正確則恢復玩家血量並切回 GameplayScene，若錯誤則切換至 GameOverScene。
7. `GameOverScene` 呼叫 `SaveManager` 紀錄成績，並透過 `UIEngine` 顯示結算畫面。
