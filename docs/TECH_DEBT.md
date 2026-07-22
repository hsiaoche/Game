# 技術債 (Technical Debt)

這份文件紀錄了目前專案中已知但尚未處理的架構缺陷或效能瓶頸，以便在後續的重構階段 (Phases 2-5) 逐步清除。

## 1. 架構壞味道 (Architecture Smells)
- **God Object (Core.js)**: `Core.js` 目前依然負載過重，處理 GameLoop、Canvas Resize、全域 State。預計於 **Phase 2** 解決。
- **Entity Manager Overload**: `EntityManager.js` 同時管理所有實體與繪製邏輯。預計於 **Phase 3** 拆分為獨立 Manager。
- **UI 混合邏輯**: `QuestionManager.js` 包含太多直接操作 HTML DOM 的邏輯。預計於 **Phase 5** 拆分為 UI 與 Repository。

## 2. 效能瓶頸 (Performance Issues)
- **缺少完整的 Object Pool**: `Particle` 生成雖然已具備回收概念，但 `Saw` 與 `Player` 未全面實作 Pool。預計於 **Phase 3** 解決。
- **渲染快取 (Render Cache)**: `Map.js` 目前每幀都遍歷陣列並呼叫 `fillRect`。對於靜態背景，應該改為 Render to Offscreen Canvas 後繪製整張圖片。預計於 **Phase 4** 解決。
- **字串解析**: 關卡讀取依然使用陣列。預計於 **Phase 4** 導入 JSON Loader。

## 3. 程式碼品質 (Code Quality)
- 欠缺 JSDoc 註解：大部分函式尚未標註標準的 JSDoc，不利於維護。
- Globals 汙染：`state` 暴露在全域。需封裝至 `GameContext` 中。
