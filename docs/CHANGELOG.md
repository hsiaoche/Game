# 更新紀錄 (Changelog)

所有本專案的變更紀錄將遵守 [Semantic Versioning](https://semver.org/)。

## [v1.9.0] - 2026-07-23
### Refactored
- Architecture Refactor Phase 5 (UI 系統與資料庫層重構)。
- 建立 `UIEngine.js`，將所有 `document.getElementById` 和 `innerHTML` 等 DOM 變更操作集中管理。
- 拆分原先的 `QuestionManager.js`，將負責網路抓取的邏輯獨立至 `QuestionRepository.js`。
- 建立 `SaveManager.js` 取代 `LeaderboardManager` 來統一管理遊戲的持久化。
- 建立 `AudioManager.js` 提供基礎音效播放介面。

## [v1.8.0] - 2026-07-23
### Refactored
- Architecture Refactor Phase 4 (渲染與地圖系統重構)。
- 建立 `Renderer.js`, `TileRenderer.js`, `EntityRenderer.js` 將繪圖邏輯從模型物件完全剝離。
- 引入 Offscreen Canvas 快取技術 (`TileRenderer`) 將地圖渲染效能從 O(N²) 降為 O(1)。
- 關卡資料 `levels.js` 重構為 JSON 物件格式。

## [v1.7.0] - 2026-07-23
### Refactored
- Architecture Refactor Phase 3 (實體與物理層重構)。
- 建立 `ObjectPool.js` 管理頻繁生成的粒子與鋸片，消除記憶體 GC 壓力。
- 獨立 `Player.js`, `Saw.js`, `Particle.js`，並為 `PhysicsEngine.js` 實作 Broad Phase。

## [v1.6.0] - 2026-07-23
### Refactored
- Architecture Refactor Phase 2 (核心引擎拆分)。
- 將 `Core.js` God Object 拆解為 `GameLoop.js`, `Time.js`, `GameState.js`, `Camera.js`, `InputManager.js`。
- 模組化 `GameContext` 與 `CameraState`，全面更新 `main.js` 等相依模組的 Import 邏輯。

## [v1.5.0] - 2026-07-23
### Refactored
- Architecture Refactor Phase 1 (基礎建設與解耦)。
- 建立 `EventBus.js`，實作 Publish/Subscribe 模式取代回呼函數 (Callbacks)。
- 抽離遊戲常數至 `config/gameConfig.js` 與 `config/physicsConfig.js`，消除 Magic Numbers。
- 建立 `StorageAdapter` 介面，隔離 `LocalStorage` 存取，提高擴充性。
- 新增完整的 `ROADMAP.md`, `TECH_DEBT.md`, `AI_HANDOVER.md` 說明文件。
- 大幅重寫 `README.md`。

## [v1.4.0] - 2026-07-23
### Added
- Phase 4 & 5: 競速答題復活與歷史排行榜系統。
- `QuestionManager` 實作答題視窗，支援自定義 Markdown (`questions.md`) 題庫。
- 死亡答題時背景不暫停，強制施加時間壓力。
- 實作答對復活後的「3秒無敵狀態 (Invincibility Frames)」。
- 實作 `LeaderboardManager`，使用 `localStorage` 保存並排序歷史 Top 5 最快通關成績。
- UI 重構：改用 CSS Grid 重疊顯示畫面，修復隱藏元素造成的排版擠壓 Bug。
- 新增左上角遊戲時間與剩餘生命值 (三顆方塊) 顯示。

## [v1.3.0] - 2026-07-23
### Added
- Phase 3: 關卡系統外部化。
- 新增 `LevelManager` 處理關卡切換與生成。
- 將地圖資料從程式碼抽離至獨立的 `levels.js` 設定檔。
- 開發者模式再進化，支援按 `H` 切換 1倍/2倍/4倍速 進行極速測試。

## [v1.2.0] - 2026-07-22
### Fixed
- Phase 2: 物理引擎修復與架構優化。
- 修復 Sub-stepping (穿隧效應) 造成的碰撞 Bug。
- 優化粒子系統效能，實作物件池 (Object Pool) 避免 GC 停頓。
### Added
- 開發者模式：按 `G` 開啟無敵模式 (God Mode)。

## [v1.1.0] - 2026-07-22
### Changed
- Phase 1: 遊戲引擎模組化。
- 將龐大的單一檔案拆分為 `Core.js`, `Map.js`, `Entities.js`, `EntityManager.js`, `SceneManager.js`, `PhysicsEngine.js`。
- 導入完整的 Scene 狀態機 (MainMenuScene, GameplayScene, GameOverScene)。

## [v1.0.0] - 2026-07-22
### Added
- 迷宮跑酷原型完成。
- HTML5 Canvas 渲染。
- 單一固定 Z 字型迷宮。
- 巡邏鋸片 (水平與垂直)。
- 手機虛擬按鍵支援。
