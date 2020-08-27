import EventDispatcher = Laya.EventDispatcher;

export default class LayaEventDispatcher extends EventDispatcher {
    private static _instance: LayaEventDispatcher;

    public static get instance(): LayaEventDispatcher {
        if (LayaEventDispatcher._instance == null) {
            LayaEventDispatcher._instance = new LayaEventDispatcher();
        }

        return LayaEventDispatcher._instance;
    }

    private constructor() {
        super();
    }
}