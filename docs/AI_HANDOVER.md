# AI 開發交接文件

本文件旨在為 AI 開發助手提供專案的核心脈絡、架構限制與開發慣例，確保後續擴充與重構能保持一致性。

## 專案背景與願景

這是一個「教育小遊戲合集 (Educational Game Collection)」。
目標是透過不同的輕量級 HTML5 Canvas 遊戲，將教育問答機制（如玩家死亡時需答題復活）融入遊戲循環中。
目前包含兩款核心遊戲：
1. **迷宮跑酷 (Maze Platformer)**：2D 橫向卷軸解謎平台跳躍遊戲。
2. **怪獸生存 (Monster Survival)**：限制為 1D 橫向移動、2D 游標瞄準的生存射擊遊戲。

## 技術棧與架構限制

- **純原生開發 (Vanilla JS)**：不使用 React, Vue, Phaser 或任何大型第三方遊戲框架。
- **模組系統 (ES Modules)**：全面採用原生 ESM (`import` / `export`)。
- **無建置流程 (No Build Tools)**：為了維持輕量化與易於部署，目前未導入 Webpack 或 Vite 進行打包或轉譯。開發時請直接撰寫瀏覽器可原生執行的語法。
- **狀態機架構 (Scene-Based)**：遊戲的切換依賴 `SceneManager.js` 進行場景流轉（例如：HubScene -> GameplayScene -> GameOverScene）。
- **依賴注入與全域狀態**：目前依賴許多靜態物件 (Static Singletons，如 `SurvivalEntityManager`) 儲存狀態，這在未來重構中已被列為技術債，新增功能時應盡量避免加重全域狀態的耦合。

## 行動優先與輸入處理

- 遊戲必須支援跨平台操作。所有移動與行動設計必須考量到虛擬搖桿與按鈕。
- DOM 中的 `#mobile-controls` (包含 `btn-jump`, `joystick-left`, `joystick-right`) 受 `InputManager.js` 統一監聽，並將其轉換為虛擬的按鍵狀態 (`keys.left`, `keys.right`, 等)。
- 擴充任何需操作的功能時，必須同步處理鍵盤與觸控螢幕的邊界情況。

## 現有系統狀態 (Phase 3)

專案近期完成了核心引擎的抽離與怪獸生存機制的重構：
- **UI 與渲染分離**：畫布繪製 (Canvas) 與 HUD 顯示 (DOM) 已分離，HUD 交由 `UIEngine.js` 統一管理。
- **怪獸生存系統**：
  - 導入了資料驅動的技能系統 (`SkillsDB.js` 與 `SkillManager.js`)。
  - 經驗值 (EXP) 採用重力掉落與磁吸機制。
  - 導入 Wave 難度曲線與 Wave 5 的 Boss 生成邏輯 (`WaveManager.js`)。
- **迷宮跑酷**：完成基礎物理引擎調校，並建立了基於字串陣列的關卡解析器。

## 待解決的重要開發任務

在您接手開發時，請留意以下已知的架構缺陷，並在適當時機進行**漸進式重構 (Incremental Refactoring)**：
1. **解除 God Object**：`SurvivalSceneManager.js` 等場景管理器目前承擔了過多的渲染與 DOM 綁定職責。
2. **解除 Singleton 依賴**：Manager 應該要能被安全地初始化與銷毀，避免多次進入遊戲時發生狀態殘留的 Bug。
3. **消除 UI DOM Thrashing**：優化 `UIEngine.updateHUD`，避免每幀無條件更新 DOM。
