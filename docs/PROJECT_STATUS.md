# 專案狀態 (Project Status)

## 目前版本
v2.0.0-alpha (Educational Game Collection Architecture)

## 目前完成度
正在開發中 (Phase 1 & Phase 2 重構已完成，即將進入 Phase 3：Monster Survival)

## 目前可運作功能
- **Educational Game Collection 架構**: 具備擴展性的多遊戲平台架構。
- **Game Hub**: 可切換不同遊戲的主選單 (`HubSceneManager`)。
- **成就與存檔隔離**: 全域的成就系統 (`AchievementManager`) 與依照 `gameId` 隔離的存檔、排行榜機制。
- **Maze Platformer 完整封裝**: 原先的迷宮跑酷遊戲邏輯已完全抽離並封裝於 `src/games/maze/` 之下。
- 物理引擎重構 (Broad Phase 空間過濾 / Narrow Phase)
- 獨立的 Renderer 抽象層 (分離繪圖與邏輯，支援 Offscreen Canvas 地圖快取)
- 完整的 MVC 架構分離
- 玩家物理引擎與碰撞偵測 (AABB + Tunneling 修正)
- 移動式裝置虛擬搖桿支援
- 獨立的 UI 引擎 (`UIEngine`) 與資料庫抽象層 (`QuestionRepository`, `SaveManager`)
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

## 目前未完成功能 (Future Goals)
- 教學模式

## 目前 Bug
- 已知 Bug (包含無法顯示多行題目、關卡設計不合理導致無法通關、層數重設等) 均已於 v1.9.1 修正完畢。目前無已知嚴重 Bug。

## 待完成 (TODO)
- **Phase 3**: 開發第二款遊戲 Monster Survival。
  - 實作 WaveManager、EnemyManager、SkillManager 等機制。
  - 設計生存遊戲 UI、波次與技能系統。

## 技術債 (Technical Debt)
- 已記錄於 `docs/TECH_DEBT.md`。重構的五大階段已將大部份的耦合與效能問題清理完畢，目前 codebase 極度乾淨。

## 下一步計畫
- **功能擴充**: 考慮支援手把、編輯器等進階功能。
- [ ] 實作基於 `performance.now()` 的 GameLoop 迴圈。
