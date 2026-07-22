# AI 開發交接文件 (AI Handover)

這份文件用於確保未來的 AI 助手能夠在最短時間內了解專案脈絡，避免破壞現有架構。

## 📍 目前專案狀態
目前處於 **Architecture Refactoring Phase 5 (UI 系統與資料庫層)** 完成狀態。
遊戲的重構五大階段已經全部結束，專案架構符合現代化標準，沒有嚴重的緊耦合邏輯。

## 🛠️ 目前工作進度
- [x] Phase 1 完工：導入 EventBus 解決耦合、抽離 Config 消除 Magic Number、實作 StorageAdapter 隔離 localStorage 存取。
- [x] Phase 2 完工：將 God Object `Core.js` 拆分為 `GameLoop.js`, `Time.js`, `GameState.js`, `Camera.js`, `InputManager.js`。
- [x] Phase 3 完工：導入 Object Pool 模式，拆分 `Player`, `Saw`, `Particle` 為獨立實體，並將物理判定優化為 Broad/Narrow Phase。
- [x] Phase 4 完工：將繪圖邏輯從實體中分離，建立 `Renderer` 抽象層，並實作靜態地圖 Offscreen Canvas 快取，渲染效能巨幅提升。
- [x] Phase 5 完工：建立 `UIEngine` 將純 DOM 操作與遊戲邏輯脫鉤，建立 `QuestionRepository` 與 `SaveManager` 負責資料層持久化，建立 `AudioManager` 音效管理介面。

## 🚀 下一步 (Next Steps)
- 重構完成。可準備進入下個特徵開發階段 (例如：關卡編輯器、手把支援)。

## 🚫 不可修改項目 (Strict Rules)
1. 嚴禁使用大型 Framework (如 React, Vue, Phaser)。
2. 嚴禁加入 Server 端邏輯或關聯式資料庫。
3. 嚴禁一次性全盤重寫。必須遵循 **Incremental Refactoring** 精神。
4. 任何架構變更必須同步更新本 `docs/` 資料夾下的所有文件。

## 🧠 AI 注意事項 (Notes for Future AI)
- 本專案採用 **Scene-Based Architecture** 與 **Event-Driven (Pub/Sub)** 混合架構。
- 若需擴充新事件，請定義於 `src/engine/EventBus.js`。
- 若需增加物理常數，請定義於 `src/config/physicsConfig.js`。
- 切勿直接操作 `localStorage`，請透過 `StorageAdapter` 介面。
