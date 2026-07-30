# 專案狀態報告 (Project Status)

## 目前階段 (Current Phase)

**Phase: Beta / Refactoring (重構與優化期)**

本專案已完成從單一遊戲過渡為「多遊戲合集 (Educational Game Collection)」的底層建設。目前迷宮跑酷與怪獸生存的核心玩法皆已實裝，當前重點為修復架構技術債、優化效能，以及關卡體驗的打磨。

## 已完成的重大里程碑

- **底層引擎拆分**：成功實作 Game Loop、EventBus、Object Pool 與 Scene Manager，所有遊戲共享同一套底層機制。
- **UI 與渲染分離**：HUD 與選單完全由 `UIEngine` 操作 DOM，遊戲畫面則由 Canvas 負責，兩者解耦。
- **迷宮跑酷 (Maze Platformer)**：
  - 完成 10 個基礎關卡設計。
  - 完善 2D 物理碰撞與邊緣判定 (Coyote Time, Jump Buffer)。
- **怪獸生存 (Monster Survival)**：
  - 實裝 1D 橫向移動與 2D 搖桿/滑鼠瞄準機制的結合。
  - 完成基於重力與距離判定磁吸的經驗值 (EXP) 掉落系統。
  - 完成資料驅動的升級技能庫 (`SkillsDB.js`)。
  - 實裝 Wave 難度生成系統，並包含 Wave 5 的 Boss 挑戰與專屬 UI 演出。

## 已知問題與技術債 (Known Issues & Tech Debt)

目前存在數個影響擴充性與效能的架構問題，需在正式釋出前解決：
1. **SceneManager 過載**：`SurvivalSceneManager` 包攬了過多職責，包含 DOM 綁定與 Canvas 繪製，違反單一職責原則。
2. **全域狀態汙染**：使用靜態物件 (Static Singletons) 作為管理器，導致遊戲重啟時極易發生狀態未清空的 Bug。
3. **DOM 效能浪費**：HUD 每一幀都會被強制更新，造成不必要的 Layout 重繪。
4. **關卡設計瑕疵**：迷宮跑酷後期的垂直關卡缺乏引導，存在「盲跳」問題；部分長路線缺乏 Checkpoint。

## 下一步計畫 (Next Steps)

1. **技術文件同步**：全面翻新 docs 目錄，確保文件與程式碼現況一致（進行中）。
2. **架構解耦**：將 UI DOM 控制權與繪圖邏輯從 SceneManager 中抽離。
3. **關卡優化**：為迷宮跑酷後期關卡加入 Checkpoint 與安全落腳點。
4. **效能優化**：實作 UI 更新的 Dirty Flag 機制。
5. **發佈準備**：最終的音效打磨與 GitHub Pages 部署準備。
