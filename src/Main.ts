import GameConfig from "./GameConfig";
import LoaderContainer from "./loader/LoaderContainer";
import Loader from "./loader/Loader";
import Browser = Laya.Browser;

export default class Main {
    constructor() {
        //根据IDE设置初始化引擎
        Laya.init(GameConfig.width, Browser.clientHeight * GameConfig.width/ Browser.clientWidth, Laya["WebGL"]);
        window.onresize = () => {
            Laya.stage.height = Browser.clientHeight * GameConfig.width / Browser.clientWidth;
        };

        Laya["Physics"] && Laya["Physics"].enable();
        Laya["DebugPanel"] && Laya["DebugPanel"].enable();

        Laya.stage.scaleMode = Laya.Stage.SCALE_FIXED_WIDTH;

        Laya.stage.screenMode = GameConfig.screenMode;
        Laya.stage.alignH = GameConfig.alignH;
        Laya.stage.alignV = GameConfig.alignV;

        Laya.alertGlobalError = true;
        Laya.stage.frameRate = Laya.Stage.FRAME_SLOW;
        // Laya.stage.bgColor = "#FFFFFF";

        //兼容微信不支持加载scene后缀场景
        Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;

        //打开调试面板（通过IDE设置调试模式，或者url地址增加debug=true参数，均可打开调试面板）
        if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true") Laya.enableDebugPanel();
        if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"]) Laya["PhysicsDebugDraw"].enable();
        if (GameConfig.stat) Laya.Stat.show();
        Laya.alertGlobalError = true;

        let data: Object = window["aola_data"];
        delete window["aola_data"];
        Loader.initVersion(data["version"], data["versionMap"]);

        Laya.stage.addChild(new LoaderContainer());
    }

    public static fadeOutLogo(): void {
        let logo: Element = window.document.querySelector("#logoContainer");
        logo.addEventListener("animationend", () => {
            logo["style"]["zIndex"] = "-1";
        });
        logo.classList.add("fadeout");
    }
}
//激活启动类
new Main();
