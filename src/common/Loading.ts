import Loader from '../loader/Loader';
import DisplayUtil from "../util/DisplayUtil";
import MovieClip from "../flash/display/MovieClip";
import CommonRes from "../config/CommonRes";
import Handler = Laya.Handler;
import Label = Laya.Label;
import Box = Laya.Box;

export default class Loading {

    private static readonly MOVIE_URL = "common/res/img_loading.json";
    private static readonly IMG = "img";
    private static readonly TXT = "txt";
    private static readonly SPEED = 15;

    private static _sprite: Box = null;
    private static _mv: MovieClip = null;
    private static _count: number = 0;

    constructor() {
    }

    public static show(msg?: string): void {
        Loading._count++;
        if (Loading._sprite == null) {
            Loading.createSprite();
            // Laya.timer.frameLoop(1, null, Loading.rotate);
            Laya.stage.on(Laya.Event.RESIZE, null, Loading.onStageResize);
            Loading.onStageResize();

            Laya.stage.addChildAt(Loading._sprite, 1);
        }

        if (msg != null && msg.length > 0) {
            this.setTextContent(msg);
        }
    }

    public static close(): void {
        if (Loading._count > 0) {
            Loading._count--;
            if (Loading._count == 0) {
                Loading.removeSprite();
            }
        }
    }

    public static reset(): void {
        if (Loading._count > 0) {
            Loading._count = 0;
            Loading.removeSprite();
        }
    }

    public static load(url: any, complete?: Handler, type?: string): void {
        Loading.show();
        let txt = Loading._sprite.getChildByName(Loading.TXT) as Label;
        let onProgress = txt ? null : Loading.onProgress;
        if (!txt) {
            Loading.addText();
            Loading.onProgress(0);
        }
        Loader.load(url, Handler.create(this, () => {
            Loading.close();
            complete.run();
        }), Handler.create(this, onProgress, null, false), type);
    }

    private static createSprite(): void {
        Loading._sprite = new Box();
        Loading._sprite.mouseEnabled = true;
        Loading._sprite.mouseThrough = false;

        Loading._sprite.alpha = 0.7;
        Loading._sprite.texture = Loader.getRes(CommonRes.URL_IMG_BLACK);

        // let spBlackGround:Image = new Image();
        // spBlackGround.alpha = 0.7;
        // spBlackGround.texture = Loader.getRes(CommonRes.URL_IMG_BLACK);
        // DisplayUtil.stretch(spBlackGround);
        // Loading._sprite.addChild(spBlackGround);

        MovieClip.load(Loading.MOVIE_URL, Laya.Handler.create(this, () => {
            if (Loading._sprite) {
                Loading._mv = new MovieClip(Loading.MOVIE_URL);
                Loading._mv.name = Loading.IMG;
                Loading._mv.play();
                Loading._sprite.addChild(Loading._mv);
                DisplayUtil.align(Loading._mv);
            }
        }));
    }

    private static removeSprite(): void {
        // Laya.timer.clear(null, Loading.rotate);
        Laya.stage.off(Laya.Event.RESIZE, null, Loading.onStageResize);
        Loading._sprite.removeSelf();
        Loading._sprite.destroy(true);
        Loading._sprite = null;
        Loading._mv = null;
    }

    // private static rotate(): void {
    //     let img = Loading._sprite.getChildByName(Loading.IMG) as Image;
    //     img.rotation = (img.rotation + Loading.SPEED) % 360;
    // }

    private static onStageResize(): void {
        DisplayUtil.stretch(Loading._sprite);
        if (Loading._mv != null) {
            DisplayUtil.align(Loading._mv);
        }
    }

    private static addText(): Label {
        let txt: Label = new Label();
        txt.centerX = 0;
        txt.centerY = 50;
        txt.font = "Microsoft YaHei";
        txt.fontSize = 20;
        txt.color = "#9cf0ff";
        txt.strokeColor = "#2d3984";
        txt.stroke = 3;
        txt.name = Loading.TXT;
        Loading._sprite.addChild(txt);
        return txt;
    }

    private static onProgress(value: number): void {
        Loading.setTextContent(Math.floor(value * 100) + "%");
    }

    private static setTextContent(content: string): void {
        if (Loading._sprite != null) {
            let txt = Loading._sprite.getChildByName(Loading.TXT) as Label;
            if (txt == null) {
                txt = Loading.addText();
            }
            txt.text = content;
        }
    }
}