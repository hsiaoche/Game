# 系統架構 (Architecture)

## 系統架構
本專案為純前端 HTML5 Canvas 遊戲，無後端伺服器，依賴瀏覽器的 `requestAnimationFrame` 進行渲染，並以 ES6 Modules (ESM) 組織程式碼。採用 MVC 與狀態機的混合架構，確保邏輯清晰且易於擴展。

## 目錄樹 (Directory Tree)
```text
/
├── index.html          # 遊戲進入點與 UI 結構 (包含 Game Hub)
├── style.css           # 樣式表 (CSS Grid 佈局)
├── package.json        # NPM 設定 (ES Modules)
├── src/
│   ├── main.js         # 程式進入點，初始化 Game Hub
│   ├── engine/         # 遊戲底層引擎模組 (純底層機制)
│   │   ├── core/               # 核心引擎 (GameLoop, Time, Camera, Input, State)
│   │   ├── pool/               # 物件池 (ObjectPool)
│   │   ├── renderer/           # 渲染器層 (Renderer, TileRenderer, EntityRenderer)
│   │   ├── SceneManager.js     # 全域場景狀態機切換
│   │   └── EventBus.js         # 全局事件匯流排 (Pub/Sub)
│   ├── shared/         # 跨遊戲共用業務邏輯
│   │   ├── config/             # 全域共用設定檔
│   │   ├── ui/                 # UI 控制引擎 (UIEngine)
│   │   ├── data/               # 資料庫存取 (QuestionRepository)
│   │   ├── storage/            # 持久化層 (SaveManager 依 gameId 隔離存檔)
│   │   ├── audio/              # 音效模組 (AudioManager)
│   │   ├── utils/              # 工具庫 (DevOptions 等)
│   │   └── AchievementManager.js # 成就系統
│   ├── games/          # 各遊戲獨立目錄 (Game Collection)
│   │   ├── hub/                # Game Hub (選單切換)
│   │   │   └── HubSceneManager.js
│   │   ├── maze/               # Maze Platformer (迷宮跑酷)
│   │   │   ├── MazeSceneManager.js
│   │   │   ├── MazeEntityManager.js
│   │   │   ├── MazePhysics.js
│   │   │   ├── MazeLevelManager.js
│   │   │   ├── Map.js, levels.js
│   │   │   └── entities/       # Player, Saw, Particle
│   │   └── survival/           # Monster Survival (怪獸生存 - 開發中)
│   └── data/           # 靜態資料
│       └── questions.md        # 題庫資料檔
├── docs/               # 開發與架構文件
└── README.md           # 專案總說明
```

## 模組關係與設計模式
- **Educational Game Collection 模式**: `AppManager/SceneManager` 處理遊戲間切換，底層共用 `engine/` 與 `shared/`，每個子遊戲封裝在自己的 `games/<game_name>/` 內部。
- **SceneManager (狀態機)**: 控制目前是主選單 (`HubScene`), Maze 遊戲 (`MazeGameplayScene`), 還是 Survival。
- **GameLoop / Time / GameState (核心驅動)**: 統一調度 Update 與 Draw，並計算 Delta Time (`dt`)。維護全域狀態 (包含相機座標)。
- **獨立的 EntityManager 與 PhysicsEngine**: 為了分離不同遊戲的機制，例如 Maze 有自己專屬的 `MazeEntityManager` 與 `MazePhysics`，而 Survival 將有 `EnemyManager`。
- **Shared Repository & UI (題庫與UI)**: 題庫資料拉取與 Markdown 解析由 `shared/data/QuestionRepository` 負責。而 DOM 操作則全權由 `shared/ui/UIEngine` 代理。
- **Renderer (渲染器抽象)**: 將繪圖邏輯從實體抽離，提供 `TileRenderer` (支援 Offscreen Canvas 技術) 與 `EntityRenderer`。

## 資料流程 (Data Flow)
1. **輸入**: `InputManager.js` 收集鍵盤/觸控訊號。
2. **更新**: `GameLoop` 呼叫目前場景的 `update(dt)`。
   - `MazeGameplayScene` 會驅動實體處理物理與位移。
   - `MazePhysics` 介入，進行 Broad Phase 過濾與 Narrow Phase 碰撞判定，防止穿越牆壁。
   - 若實體觸發事件 (如擊殺、死亡)，呼叫 `EventBus.emit()` 發出事件，交由對應的系統 (`AchievementManager`, `SaveManager`) 處理。
3. **渲染**: 呼叫 `Renderer` 模組，依照相機偏移，繪製背景地圖與所有實體特效。

## 依賴關係
完全不依賴第三方 Library 或 Framework。僅使用 Vanilla JS 與 HTML5 APIs (`Canvas`, `localStorage`, `fetch`)。
