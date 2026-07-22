# 專案發展藍圖 (Roadmap)

## ✅ Phase 1: 基礎建設與解耦 (Foundation & Decoupling) (已完成)
- 導入 Pub/Sub EventBus。
- Config 抽離 (Game, Physics)。
- StorageAdapter 實作。

## ✅ Phase 2: 核心引擎拆分 (Core Split & Input) (已完成)
- 拆解 `Core.js` 至 `GameLoop.js`, `Time.js`, `GameState.js`, `Camera.js`, `InputManager.js`。
- 將 `state` 封裝為模組化 Context (`GameContext`, `CameraState`)。

## ✅ Phase 3: 實體與物理層重構 (Entity & Physics) (已完成)
- 拆解 `Entities.js` 為獨立的 `Player.js`, `Saw.js`, `Particle.js`。
- 實作通用的 `ObjectPool.js` 來管理鋸片與特效，優化 GC。
- 物理引擎導入 Broad Phase (空間過濾) 與 Narrow Phase。

## ✅ Phase 4: 渲染與地圖系統重構 (Renderer & Map) (已完成)
- 建立渲染抽象層 (`Renderer.js`, `TileRenderer.js`, `EntityRenderer.js`)。
- 關卡資料 JSON 化。
- 導入 Offscreen Canvas 靜態地圖快取優化，大幅降低 `shadowBlur` 計算成本。

## ✅ Phase 5: UI 系統與資料庫層 (UI & Data) (已完成)
- `QuestionManager` 拆分為 `QuestionRepository` 與 `UIEngine` 模組。
- 建立 `AudioManager` 處理 BGM 與 SFX 介面。
- 建立 `SaveManager` 統一處理所有持久化資料。

## 🚀 未來展望 (Future Features)
- [ ] 支援手把 (Gamepad API)。
- [ ] 關卡編輯器 (Level Editor UI)。
- [ ] 老師後台介面 (匯出成績報表)。
