# 技術債 (Technical Debt)

本文件紀錄專案中已知的架構缺陷、未完善的設計以及妥協之處。開發者在擴充新功能或進行重構時，應參考此文件以避免技術債進一步惡化，並尋找機會償還。

## 1. 架構設計缺陷 (Architecture Flaws)

### 1.1 God Object (全能物件)
- **問題描述**：`SurvivalSceneManager.js` 與 `MazeSceneManager.js` 承擔了過多職責。它們不僅管理場景生命週期，還直接處理 DOM 綁定與解綁、攝影機邏輯、以及遍歷呼叫所有 Entity 的 `draw` 渲染方法。
- **影響**：程式碼極度肥大（超過 300 行），違反單一職責原則。難以在不影響邏輯的情況下抽換或升級渲染層（例如未來升級 WebGL）。
- **償還計畫**：將畫布繪製邏輯抽離至獨立的 `Renderer`（例如 `SurvivalRenderer.js`）；將 DOM 的顯示/隱藏交由 `UIEngine` 的事件監聽處理。

### 1.2 全域狀態單例 (Global Static Singletons)
- **問題描述**：系統大量依賴靜態物件（如 `SurvivalEntityManager`, `WaveManager`, `SkillManager`）來儲存遊戲狀態。
- **影響**：這是經典的反模式 (Anti-Pattern)。當玩家死亡重新開始，或是退回主選單再進入遊戲時，若沒有手動呼叫 `init()` 完美清除所有變數，極易產生狀態殘留的 Bug。此外，這也導致專案無法進行單元測試，且未來無法支援分割畫面雙人遊玩。
- **償還計畫**：導入依賴注入 (Dependency Injection) 或建立 `GameContext` 實例。這些 Manager 應該在 Scene 初始化時被 `new` 出來，並隨 Scene 銷毀而回收。

### 1.3 邏輯與渲染的緊密耦合 (Tight Coupling)
- **問題描述**：在 `SurvivalEntityManager.js` 的碰撞偵測 (`checkCollisions`) 中，除了運算幾何碰撞，還直接處理了扣血、經驗值增加、甚至呼叫 `spawnDamageText` 等渲染或業務邏輯。
- **影響**：模組間高度依賴，牽一髮動全身。
- **償還計畫**：應善用現有的 `EventBus`，在碰撞發生時發送 `ENEMY_HIT` 或 `GEM_PICKUP` 事件，由各自負責的系統去監聽並執行扣血或顯示傷害數字的邏輯。

## 2. 效能與最佳化 (Performance & Optimization)

### 2.1 DOM Thrashing (不必要的 DOM 更新)
- **問題描述**：`SurvivalSceneManager.js` 中的 `updateHUD()` 方法在主迴圈的每一幀 (`update(dt)`) 都會被呼叫，並無條件更新 DOM 元素的 innerText 或寬度。
- **影響**：即使血量或時間沒有變更，仍會觸發瀏覽器的 Layout/Paint，在行動裝置上造成無謂的效能損耗與發熱。
- **償還計畫**：在 `UIEngine` 中實作 Dirty Flag 模式，或者在更新 DOM 前比對舊數值，僅在數值改變時才觸發 DOM 操作。

### 2.2 物理引擎限制 (Physics Limitations)
- **問題描述**：目前的碰撞偵測僅依賴基礎的 AABB (Axis-Aligned Bounding Box) 靜態重疊判定，缺乏連續碰撞偵測 (Continuous Collision Detection, CCD)。
- **影響**：若未來玩家或子彈速度過快，可能會發生「穿牆」現象 (Tunneling)。
- **償還計畫**：目前速度限制下尚可接受。若未來擴充高速機制，需導入射線檢測 (Raycasting) 或掃掠 AABB (Swept AABB)。

## 3. 程式碼品質 (Code Quality)

### 3.1 缺乏 JSDoc 註解
- **問題描述**：目前大部分函式與類別缺乏標準的 JSDoc 註解。
- **影響**：現代 IDE (如 VS Code) 無法提供準確的 IntelliSense 型別提示，增加多人協作與 AI 輔助開發的難度。
- **償還計畫**：逐步在核心模組（特別是 `engine` 資料夾下）補上參數與回傳值的 JSDoc 宣告。

### 3.2 Magic Numbers (魔術數字)
- **問題描述**：部分邏輯中寫死了數值，例如 `SurvivalEntityManager` 碰撞判定內的 `shrink = 4`。
- **影響**：數值意義不明確，難以統一調整與平衡。
- **償還計畫**：將所有與 Gameplay 相關的數值抽取至各遊戲的 `config.js` 中集中管理。
