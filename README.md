# Maze Platformer (迷宮跑酷)

本專案是一款專為教育設計的 HTML5 Canvas 跑酷遊戲。目標使用者包含老師 1 人與學生 7 人。
技術棧採用 Vanilla JavaScript, CSS3, ES Modules，不依賴任何大型 Framework，可直接部署於 GitHub Pages。

## 🏛️ Architecture (系統架構)
本系統採用 **Scene-Based Architecture**，混合 **Finite State Machine (FSM)** 管理場景，並大量應用 **Manager Pattern** 與 **Pub/Sub EventBus** 解耦模組。

## 📂 Directory Tree (目錄樹)
```text
/
├── index.html                  # 遊戲 UI 進入點
├── style.css                   # 樣式與 CSS Grid
├── src/
│   ├── main.js                 # 程式進入點與 Scene 定義
│   ├── config/                 # [Config]
│   │   ├── gameConfig.js       # 全域遊戲參數
│   │   └── physicsConfig.js    # 物理常數
│   ├── engine/                 # [Engine]
│   │   ├── Core.js             # GameLoop, Camera, Input, State (待 Phase 2 拆分)
│   │   ├── SceneManager.js     # FSM
│   │   ├── EntityManager.js    # 實體管理 (待 Phase 3 拆分)
│   │   ├── PhysicsEngine.js    # 物理引擎
│   │   ├── LevelManager.js     # 關卡控制
│   │   ├── QuestionManager.js  # 題庫控制
│   │   ├── LeaderboardManager.js
│   │   ├── DevOptions.js       
│   │   ├── EventBus.js         # Pub/Sub 事件系統
│   │   └── storage/            # 儲存適配器
│   │       ├── StorageAdapter.js
│   │       └── LocalStorageAdapter.js
│   ├── game/                   # [Game Logic]
│   │   ├── Map.js
│   │   ├── Entities.js
│   │   └── levels.js
│   └── data/
│       └── questions.md        # Markdown 題庫
├── docs/                       # [Documentation]
│   ├── PROJECT_STATUS.md
│   ├── ARCHITECTURE.md
│   ├── CHANGELOG.md
│   ├── AI_HANDOVER.md
│   ├── TECH_DEBT.md
│   └── ROADMAP.md
└── README.md
```

## 🔄 Data Flow (資料流)
1. **Input**: `Core.js` 攔截 DOM 事件，更新全域 `keys`。
2. **Update**: `SceneManager` 調用當前場景的 `update(dt)`。`GameplayScene` 會驅動 `EntityManager` 更新物理。
3. **Physics**: `PhysicsEngine` 套用 AABB 與 Tunneling 修復。
4. **Event**: `Entities.js` 若判定死亡或破關，呼叫 `EventBus.emit()`。
5. **Render**: `SceneManager` 調用 `draw()`，將畫面繪製至 `Canvas`。

## 🎭 Scene Flow (場景流)
`MainMenuScene` -> `GameplayScene` -> (Death -> `QuestionScene` -> (Correct) -> `GameplayScene`) -> (Wrong or Win) -> `GameOverScene`

## 🕹️ Game Flow (遊戲流)
玩家透過方向鍵與跳躍鍵穿梭於迷宮，躲避巡邏鋸片。抵達綠色方塊即破關。撞到鋸片將觸發答題，答對原地復活並有無敵時間，答錯則遊戲結束。

## 📦 Module (模組)
所有模組均為 ES6 Module，嚴格禁止透過 `window` 互相溝通，均透過 import 或 `EventBus` 進行通訊。

## 💾 Storage & Leaderboard (儲存與排行榜)
透過 `StorageAdapter` 介面將儲存實作抽離，目前由 `LocalStorageAdapter` 負責寫入瀏覽器。
`LeaderboardManager` 會自動保存通關時間並維持 Top 5 最佳紀錄。

## ❓ Question System (題庫系統)
`QuestionManager` 負責載入 `questions.md` 並以 Promise 封裝 UI 互動。撞死時呼叫 `showQuestion()` 暫停操控但不暫停背景時間。

## 👨‍🏫 Teacher Mode (教師模式)
目前題庫開放於 `questions.md` 供教師自由維護。未來將加入後台與匯出報表功能。

## 🚩 Checkpoint & Achievement (存檔與成就)
原 Checkpoint 設計已廢棄，改為「答對題目原地復活」。成就系統將於未來規劃。

## 🗺️ Roadmap (開發藍圖)
詳見 `docs/ROADMAP.md`。

## 🏷️ Version (版本)
目前版本: **v1.5.0-refactor-phase-1**

## 📝 Change Log (更新紀錄)
詳見 `docs/CHANGELOG.md`。