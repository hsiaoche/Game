# 系統架構 (Architecture)

## 系統架構
本專案為純前端 HTML5 Canvas 遊戲，無後端伺服器，依賴瀏覽器的 `requestAnimationFrame` 進行渲染，並以 ES6 Modules (ESM) 組織程式碼。採用 MVC 與狀態機的混合架構，確保邏輯清晰且易於擴展。

## 目錄樹 (Directory Tree)
```text
/
├── index.html          # 遊戲進入點與 UI 結構
├── style.css           # 樣式表 (CSS Grid 佈局)
├── src/
│   ├── main.js         # 程式進入點，定義場景 (Scenes)
│   ├── engine/         # 遊戲底層引擎模組
│   │   ├── Core.js             # 遊戲主迴圈與共用狀態 (state)
│   │   ├── SceneManager.js     # 場景狀態機 (Scene Manager)
│   │   ├── EntityManager.js    # 實體與粒子管理器 (包含物件池)
│   │   ├── PhysicsEngine.js    # AABB 碰撞與穿隧修正 (Sub-stepping)
│   │   ├── LevelManager.js     # 關卡載入與解析
│   │   ├── QuestionManager.js  # Markdown 題庫載入與答題邏輯
│   │   ├── LeaderboardManager.js # LocalStorage 成績存取
│   │   └── DevOptions.js       # 開發者模式控制 (God mode, Speed)
│   ├── game/           # 遊戲業務邏輯模組
│   │   ├── Map.js              # 地圖繪製邏輯
│   │   ├── Entities.js         # Player 與 Saw 實體類別
│   │   └── levels.js           # 外部關卡資料檔
│   └── data/           # 靜態資料
│       └── questions.md        # 題庫資料檔
├── docs/               # 開發與架構文件
└── README.md           # 專案總說明
```

## 模組關係與設計模式
- **SceneManager (狀態機)**: 控制目前是主選單 (`MainMenuScene`)、遊戲中 (`GameplayScene`)、答題中 (`QuestionScene`) 或結束 (`GameOverScene`)。
- **Core.js (核心驅動)**: 負責統一調度 Update 與 Draw，並計算 Delta Time (`dt`)。維護全域 `state` (包含相機座標、生命值、遊戲時間)。
- **EntityManager (管理器)**: 統一調度並繪製所有鋸片、主角以及粒子特效，內部實作粒子物件池 (Object Pool) 解決 GC 卡頓。
- **QuestionManager (非同步互動)**: 使用 `Promise` 封裝 HTML UI 操作，在玩家撞死時彈出視窗但不中斷 Canvas 的 `requestAnimationFrame` 迴圈 (達成競速壓迫感)。

## 資料流程 (Data Flow)
1. **輸入**: `Core.js` 收集鍵盤/觸控訊號更新 `keys` 物件。
2. **更新**: `SceneManager` 呼叫目前場景的 `update(dt)`。
   - `GameplayScene` 會驅動 `EntityManager.player.update` 處理物理與位移。
   - `PhysicsEngine` 介入，進行 Sub-stepping 防止穿越牆壁。
   - `updateSaws` 更新敵人狀態。若撞擊玩家則呼叫 `handleDeath` 進入答題流程。
3. **渲染**: 呼叫 `draw(ctx)`，依照 `state.cameraX/Y` 進行視角偏移，依序繪製背景地圖 (`Map.js`) 與所有實體 (`EntityManager`)。

## 依賴關係
完全不依賴第三方 Library 或 Framework。僅使用 Vanilla JS 與 HTML5 APIs (`Canvas`, `localStorage`, `fetch`)。
