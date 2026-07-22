# 專案發展藍圖 (Roadmap)

## ✅ Phase 1: 基礎建設與解耦 (Foundation & Decoupling) (已完成)
- 導入 Pub/Sub EventBus。
- Config 抽離 (Game, Physics)。
- StorageAdapter 實作。

## 🚧 Phase 2: 核心引擎拆分 (Core Split & Input) (即將啟動)
- 拆解 `Core.js` 至 `GameLoop.js`, `Time.js`, `GameState.js`, `Camera.js`, `InputManager.js`。
- 將 `state` 封裝為模組化 Context。

## ⏳ Phase 3: 實體與物理層重構 (Entity & Physics)
- 拆分 `EntityManager`，實作嚴格的 Object Pool。
- 物理引擎導入 Broad Phase (如空間分割) 與 Narrow Phase。

## ⏳ Phase 4: 渲染與地圖系統 (Renderer & Map)
- 建立渲染抽象層 (`TileRenderer`, `EntityRenderer`)。
- 關卡資料 JSON 化。
- 導入 Offscreen Canvas 快取優化。

## ⏳ Phase 5: UI 與音效 (Question System & Audio)
- `QuestionManager` 拆分為 Repository 與 UI 模組。
- 建立 `AudioManager` 處理 BGM 與 SFX。
- 建立 `SaveManager` 處理所有持久化資料。

## 🚀 未來展望 (Future Features)
- [ ] 支援手把 (Gamepad API)。
- [ ] 關卡編輯器 (Level Editor UI)。
- [ ] 老師後台介面 (匯出成績報表)。
