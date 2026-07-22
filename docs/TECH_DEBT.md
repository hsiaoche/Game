# 技術債 (Technical Debt)

## 1. 耦合問題 (Coupling)
- 目前已無嚴重耦合問題。MVC 架構、UI、渲染、邏輯皆已分離。

## 2. 效能瓶頸 (Performance Issues)
- **DOM 操作頻繁**: 雖然遊戲大部分在 Canvas 上，但 HUD 與部分特效綁定了 DOM 操作。預期影響不大。
- **字串解析**: 關卡讀取依然使用陣列。預計於 **Phase 4** 導入 JSON Loader。

## 3. 程式碼品質 (Code Quality)
- 欠缺 JSDoc 註解：大部分函式尚未標註標準的 JSDoc，不利於維護。
- Globals 汙染：`state` 暴露在全域。需封裝至 `GameContext` 中。
