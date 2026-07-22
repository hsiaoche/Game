# AI 開發交接文件 (AI Handover)

這份文件用於確保未來的 AI 助手能夠在最短時間內了解專案脈絡，避免破壞現有架構。

## 📍 目前專案狀態
目前處於 **Architecture Refactoring Phase 1 (基礎建設與解耦)** 完成狀態。
遊戲本身已具備 MVP 所有功能 (競速、復活、排行榜、題庫)，正在逐步翻新底層架構以符合企業級標準。

## 🛠️ 目前工作進度
- [x] Phase 1 完工：導入 EventBus 解決耦合、抽離 Config 消除 Magic Number、實作 StorageAdapter 隔離 localStorage 存取。

## 🚀 下一步 (Next Steps)
- 準備啟動 **Phase 2 (Core Split & Input)**。
- 需將 `Core.js` 拆分為 `GameLoop.js`, `Time.js`, `GameState.js`, `Camera.js`, `InputManager.js`。

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
