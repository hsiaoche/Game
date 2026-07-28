# Educational Game Collection
> 一個基於純前端 Vanilla JS 與 HTML5 Canvas 打造的教育小遊戲平台，內建「迷宮跑酷」與「怪獸生存(開發中)」。

## 🎮 遊戲特點 (Features)

- 🕹️ **多遊戲平台**: 內建 Game Hub，自由切換不同小遊戲 (Maze Platformer, Monster Survival)。
- 🧠 **共用題庫系統**: 各種小遊戲可共用死亡答題或事件答題系統。支援 Markdown (`questions.md`) 外部題庫擴充。
- 🏆 **各遊戲獨立排行榜與存檔**: 提供 LocalStorage 存檔與各遊戲獨立的最速通關排行榜。
- 📱 **RWD 與跨平台**: 完美適配桌機與手機螢幕，無論直式橫式都能遊玩。

## 🛠️ 技術架構 (Tech Stack)

技術棧採用 Vanilla JavaScript, CSS3, ES Modules，不依賴任何大型 Framework，可直接部署於 GitHub Pages。

## 🏛️ Architecture (系統架構)
本系統採用 **Scene-Based Architecture**，混合 **Finite State Machine (FSM)** 管理場景，並大量應用 **Manager Pattern** 與 **Pub/Sub EventBus** 解耦模組。

## 📁 資料夾結構 (Directory Structure)
```text
/
├── index.html          # 遊戲進入點與 UI 結構 (包含 Game Hub)
├── style.css           # 樣式表 (CSS Grid 佈局)
├── package.json        # NPM 設定 (ES Modules)
├── src/
│   ├── main.js         # 程式進入點，初始化 Game Hub
│   ├── engine/         # 遊戲底層引擎模組 (純底層機制)
│   ├── shared/         # 跨遊戲共用業務邏輯 (UI, Storage, Audio, 成就)
│   ├── games/          # 各遊戲獨立目錄 (Game Collection)
│   │   ├── hub/        # Game Hub (選單切換)
│   │   ├── maze/       # Maze Platformer (迷宮跑酷)
│   │   └── survival/   # Monster Survival (怪獸生存 - 開發中)
│   └── data/           
│       └── questions.md # 題庫資料檔
└── docs/               # 開發與架構文件
```

## 🔄 Data Flow (資料流)
1. **Input**: `InputManager.js` 攔截鍵盤與觸控事件。
2. **Update**: `GameLoop.js` 驅動 `SceneManager` 調用當前場景的 `update(dt)`。
3. **Physics**: `MazePhysics` 等獨立物理引擎處理碰撞。
4. **Event**: 觸發事件時，呼叫 `EventBus.emit()`，交由對應的系統 (`AchievementManager`, `SaveManager`) 處理。
5. **Render**: `Renderer` 系統調用 `draw()`，將畫面與特效繪製至 `Canvas`。

## 🚀 目前狀態
- **v2.0.0-alpha**：已完成底層重構與模組抽離，升級為 Educational Game Collection 多遊戲平台架構。
- 迷宮跑酷 (Maze Platformer) 已完全封裝，並修正了所有物理與破圖 Bug。
- Monster Survival (怪獸生存) 現正開發中。

## 📝 開發文件
詳見 `docs/` 資料夾下的說明文件。