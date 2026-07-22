# 專案狀態 (Project Status)

## 目前版本
v1.5.0 (Architecture Refactor Phase 1 完成)

## 目前完成度
100% (MVP 功能皆已完成，正進行底層架構重構)

## 目前可運作功能
- Event-Driven Architecture (EventBus)
- Config 抽離 (避免 Magic Numbers)
- Storage Adapter 模式
- 基礎的 Canvas 渲染
- 完整的 MVC 架構分離
- 玩家物理引擎與碰撞偵測 (AABB + Tunneling 修正)
- 移動式裝置虛擬搖桿支援
- 開發者除錯模式 (God Mode, Speed Multiplier)
- 外部關卡資料 (`levels.js`)
- 題庫系統 (`questions.md` Markdown 解析)
- 死亡後答對復活機制 (無敵時間、生命值、背景時間不暫停)
- 破關排行榜系統 (Local Storage Top 5 競速紀錄)
- 答題復活機制
- Checkpoint 儲存點
- 學生設定與進度存檔 (LocalStorage)
- 排行榜與老師管理介面
- 音效與動畫優化

## 目前未完成功能 (Phase 2~5 目標)
- 多關卡系統 (10關)
- 答題復活機制
- Checkpoint 儲存點
- 學生設定與進度存檔 (LocalStorage)
- 排行榜與老師管理介面
- 音效與動畫優化
- 教學模式

## 目前 Bug
- 無已知嚴重 Bug (待模組化後進一步驗證)

## 待完成 (TODO)
- 依據 `ROADMAP.md` 進行 Phase 2 重構。

## 技術債 (Technical Debt)
- 已記錄於 `docs/TECH_DEBT.md`，主要包含 Core.js 的 God Object 狀態、EntityManager 未完全分離、以及缺發獨立 Renderer 層等問題。

## 下一步計畫
- **Phase 2 重構**: 將 `Core.js` 拆分為 `GameLoop.js`, `Time.js`, `GameState.js`, `Camera.js`, `InputManager.js`。
- [ ] 實作基於 `performance.now()` 的 GameLoop 迴圈。
