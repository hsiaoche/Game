# 更新日誌 (Changelog)

所有關於本專案的顯著變更將記錄於此文件中。

本文件的格式基於 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.1.0/) 規範，且本專案採用 [Semantic Versioning](https://semver.org/spec/v2.0.0.html) 進行版本控制。

## [Unreleased]

### 預定重構與優化 (Planned)
- 重構 `SurvivalSceneManager.js` 與 `MazeSceneManager.js`，將 Canvas 繪製邏輯抽離至獨立的 Renderer。
- 優化 `UIEngine.updateHUD`，導入 Dirty Flag 機制以減少不必要的 DOM 操作 (解決 DOM Thrashing 問題)。
- 優化關卡設計，為 Maze Platformer 的高難度關卡 (Level 6-10) 加入安全平台與 Checkpoint。

## [2.0.0-beta] - 2026-07-29

### Added (新增)
- **多遊戲架構**: 建立 Game Hub，實作 `SceneManager` 支援多款遊戲無縫切換。
- **怪獸生存 (Monster Survival)**: 全新遊戲模式。
  - 實作 1D 橫向移動與 2D 搖桿/滑鼠瞄準雙搖桿機制。
  - 導入 Wave Difficulty 生成器，包含 Wave 5 Boss 戰鬥。
  - 實作經驗值重力掉落與動態磁吸機制。
  - 新增資料驅動的升級技能庫 (`SkillsDB.js`)，提供隨機 3 選 1 升級體驗。
- **共用題庫系統**: 死亡或特定事件觸發，統一由 `QuestionRepository` 讀取 `questions.md` 產生題目。
- **UI HUD**: 新增暫停選單 (Pause Menu)、Boss 警告與結算畫面 (Victory/GameOver)。

### Changed (變更)
- 移除舊版 `Core.js` 的耦合，將時間控制、攝影機、輸入狀態抽象為 `GameLoop.js`, `Camera.js`, `InputManager.js`。
- 重構實體 (Entities) 渲染，導入 `ObjectPool` 以降低垃圾回收 (GC) 效能負擔。
- 物理引擎導入 Broad Phase (空間過濾) 與 Narrow Phase (AABB 碰撞)，提升碰撞偵測效能。

### Fixed (修復)
- 修復 Maze Platformer 中，玩家出生在空中與物件重疊的問題。
- 修復手機版雙搖桿操控時，快速多點觸控可能導致搖桿卡死的邊界情況。

## [1.0.0] - 2023-10-25

### Added (新增)
- 初始版本：迷宮跑酷 (Maze Platformer)。
- 建立基礎網格地圖解析器 (`levels.js`) 與 10 個基礎關卡。
- 實作基礎 2D 平台物理引擎（跳躍、重力、摩擦力）。
- 實作基礎 AABB 碰撞偵測機制。
