# 發展藍圖 (Roadmap)

本專案的發展藍圖旨在展示未來的核心功能規劃、架構升級計畫與預計發布的里程碑。

*(過去的開發歷史與已完成項目，請參閱 [CHANGELOG.md](CHANGELOG.md) 或 [PROJECT_STATUS.md](PROJECT_STATUS.md))*

## 📍 近期規劃 (Short-Term: Q3 2026)

目前的短期目標在於還還技術債、優化效能，並提升既有兩款遊戲的體驗穩定度。

- **架構解耦 (Architecture Refactoring)**：
  - 將 SceneManager 中的 DOM 控制邏輯完全抽離，落實 Event-Driven UI 更新機制。
  - 將 Canvas 繪圖邏輯從業務邏輯層抽出，建立獨立的 `Renderer` 模組，解決目前的 God Object 問題。
- **UI 效能優化 (Performance)**：
  - 為 `UIEngine` 導入 Dirty Flag 檢查機制，避免每幀執行 DOM 更新造成的 Layout/Paint 浪費 (解決 DOM Thrashing)。
- **關卡品質提升 (Level Design Polish)**：
  - 修正 Maze Platformer 後期關卡 (Level 8-10) 的盲跳問題。
  - 為長度超過一定限制的關卡新增適當的 Checkpoint。

## 📍 中期規劃 (Mid-Term: Q4 2026)

中期目標為擴展遊戲內容與提升跨平台支援度。

- **怪獸生存 (Monster Survival) 擴展**：
  - 實作新的技能與升級路徑 (Skill Trees)。
  - 加入動態難度調整機制 (Dynamic Difficulty Adjustment, DDA)，平衡 Wave 5 Boss 戰的體驗。
  - 新增更多種類的敵人 AI (如會閃避的敵人、遠程攻擊敵人)。
- **操作體驗優化**：
  - 導入 Gamepad API 支援，允許玩家使用 Xbox/PlayStation 控制器遊玩。
  - 強化行動裝置的虛擬雙搖桿手感。

## 📍 長期願景 (Long-Term: 2027 及以後)

長期目標是將此專案擴充為一個具備社交與教育管理的完整平台。

- **Web 關卡編輯器 (Level Editor UI)**：
  - 提供視覺化介面，讓社群或教師能夠自己設計 Maze Platformer 關卡。
  - 支援匯出/匯入 JSON 格式的關卡資料。
- **教師後台介面 (Teacher Dashboard)**：
  - 實作簡單的後端或匯出功能，統整學生的答題正確率與遊戲通關報表。
- **渲染層升級 (WebGL Migration)**：
  - 考慮使用 WebGL 或 Pixi.js 重寫底層 Renderer，支援更高品質的光影特效與粒子數量，徹底發揮 Object Pool 的潛力。
