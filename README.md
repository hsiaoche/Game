# 教育小遊戲合集 (Educational Game Collection)

基於純前端 Vanilla JS 與 HTML5 Canvas 打造的教育小遊戲平台，內建多款共用底層架構的小遊戲。

## 🎮 遊戲特點

- **多遊戲平台**: 內建 Game Hub，可無縫切換不同小遊戲（目前包含：迷宮跑酷、怪獸生存）。
- **共用題庫系統**: 遊戲間共用死亡答題與事件答題系統。支援透過 Markdown (`questions.md`) 進行外部題庫擴充，將教育元素融入遊戲機制中。
- **獨立存檔與排行榜**: 透過 LocalStorage 提供各遊戲獨立的最速通關紀錄與進度保存。
- **跨平台響應式設計**: 自動適配桌機與行動裝置螢幕，支援虛擬搖桿與鍵鼠操作。

## 🛠️ 技術架構

本專案採用純原生前端技術，以達到極致輕量化與快速部署：

- **核心技術**: Vanilla JavaScript (ES Modules), HTML5 Canvas, CSS3
- **架構模式**: 基於 Scene (場景) 的狀態機架構，並輔以 Manager Pattern 與 Pub/Sub EventBus 進行模組解耦。
- **部署方式**: 無需建置工具 (No Build Tools)，可直接作為靜態網站部署於 GitHub Pages 或任何 Web Server。

## 📁 資料夾結構

```text
/
├── index.html          # 遊戲進入點與 UI 結構 (包含 Game Hub)
├── style.css           # 全域樣式表 (CSS Grid 佈局與 HUD 設計)
├── package.json        # NPM 設定 (僅用於開發依賴或腳本)
├── src/
│   ├── main.js         # 程式進入點，初始化 Game Hub
│   ├── engine/         # 遊戲底層引擎模組 (GameLoop, Camera, Input, EventBus)
│   ├── shared/         # 跨遊戲共用業務邏輯 (UI, Storage, Audio, 成就)
│   ├── games/          # 各遊戲獨立目錄 (Game Collection)
│   │   ├── hub/        # Game Hub (選單切換與主介面)
│   │   ├── maze/       # Maze Platformer (迷宮跑酷)
│   │   └── survival/   # Monster Survival (怪獸生存)
│   └── data/           
│       └── questions.md # 外部題庫資料檔
└── docs/               # 開發與架構文件 (請見下方說明)
```

## 🔄 核心資料流

1. **輸入 (Input)**: `InputManager.js` 統一攔截鍵盤、滑鼠與觸控（虛擬搖桿）事件。
2. **更新 (Update)**: `GameLoop.js` 透過 `requestAnimationFrame` 驅動，呼叫 `SceneManager` 觸發當前場景的 `update(dt)`。
3. **物理與碰撞 (Physics/Collision)**: 遊戲各自的邏輯模組（如 `MazePhysics` 或 `SurvivalEntityManager`）處理位移與 AABB 碰撞。
4. **事件 (Event)**: 當特定行為發生（如玩家死亡、過關），透過 `EventBus.emit()` 觸發共用系統（如 `SaveManager`, `AudioManager`）響應。
5. **渲染 (Render)**: 呼叫渲染模組將當前狀態繪製至 Canvas，並由 `UIEngine` 同步更新 DOM HUD。

## 📝 開發文件

關於系統設計與開發細節，請參閱 `docs/` 目錄：
- [AI 交接文件 (AI_HANDOVER.md)](docs/AI_HANDOVER.md)
- [系統架構 (ARCHITECTURE.md)](docs/ARCHITECTURE.md)
- [專案狀態 (PROJECT_STATUS.md)](docs/PROJECT_STATUS.md)
- [更新日誌 (CHANGELOG.md)](docs/CHANGELOG.md)
- [關卡設計 (LEVEL_DESIGN.md)](docs/LEVEL_DESIGN.md)
- [發展藍圖 (ROADMAP.md)](docs/ROADMAP.md)
- [技術債 (TECH_DEBT.md)](docs/TECH_DEBT.md)

## 🚀 執行方式

因採用 ES Modules，需要透過本地伺服器運行（避免 CORS 問題）：
1. 使用 VS Code 的 **Live Server** 擴充功能開啟 `index.html`。
2. 或在終端機執行 `npx serve .` / `python -m http.server 8000`。
