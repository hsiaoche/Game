export class SceneManager {
    static currentScene = null;
    
    static changeScene(scene) {
        if (this.currentScene && this.currentScene.exit) {
            this.currentScene.exit();
        }
        this.currentScene = scene;
        if (this.currentScene && this.currentScene.enter) {
            this.currentScene.enter();
        }
    }

    static update(dt) {
        if (this.currentScene && this.currentScene.update) {
            this.currentScene.update(dt);
        }
    }

    static draw(ctx) {
        if (this.currentScene && this.currentScene.draw) {
            this.currentScene.draw(ctx);
        }
    }
}
