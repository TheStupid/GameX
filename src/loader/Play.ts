import BootLoader from './BootLoader';
import Event from '../egret/events/Event';
import SceneManager from "../scene/SceneManager";
import SceneManagerEvent from "../scene/SceneManagerEvent";

export default class Play {
    private boot: BootLoader;

    constructor() {
    }

    public start(): void {
        this.boot = new BootLoader();
        this.boot.addEventListener(BootLoader.COMPLETE, this.onBootComplete, this);
        this.boot.init();
    }

    private onBootComplete(evt: Event): void {
        var boot: BootLoader = evt.target;
        boot.removeEventListener(BootLoader.COMPLETE, this.onBootComplete, this);

        SceneManager.getInstance().addEventListener(SceneManagerEvent.SCENE_REMOVE_LOADER, this.onLoadedScene, this);
        SceneManager.getInstance().loadDefaultScene();
    }

    private onLoadedScene(evt: SceneManagerEvent): void {
        SceneManager.getInstance().removeEventListener(SceneManagerEvent.SCENE_REMOVE_LOADER, this.onLoadedScene, this);
        this.boot.closeLoadingSprite();
        this.boot = null;
    }
}