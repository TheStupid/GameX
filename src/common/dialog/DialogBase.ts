import {AlignType} from "../AlignType";
import ClickHelper from '../helper/ClickHelper';
import Loader from '../../loader/Loader';
import Loading from '../Loading';
import DialogManager from './DialogManager';
import MovieClip from '../../flash/display/MovieClip';
import NumberUtil from '../../util/common/NumberUtil';
import {PanelEffect} from "./PanelEffect";
import DisplayUtil from '../../util/DisplayUtil';
import GameConfig from '../../GameConfig';
import LoadingSpriteType from '../../loader/LoadingSpriteType';
import CustomLoader from '../../loader/CustomLoader';
import CustomLoaderEvent from '../../loader/CustomLoaderEvent';
import IDispose from '../../interfaces/IDispose';
import Domain from "../../loader/Domain";
import CommonRes from "../../config/CommonRes";
import HTMLDivElement = Laya.HTMLDivElement;
import ViewStack = Laya.ViewStack;
import Handler = Laya.Handler;
import Sprite = Laya.Sprite;
import Label = Laya.Label;
import Image = Laya.Image;
import Text = Laya.Text;
import View = Laya.View;
import Clip = Laya.Clip;
import Box = Laya.Box;

/**
 * 面板基类
 * @author ligenhao
 */
export default class DialogBase extends Box implements IDispose {

    private _cls: string;
    private _url: any[];
    private _alignType: AlignType = AlignType.NONE;
    private _showEffect: boolean;
    private _loadingType: number;
    private _clickBackgroundRemove: boolean;
    private _clickHelper: ClickHelper;
    private _strategies = [];
    private _tempObj: Object = {};
    private _fileLoader: CustomLoader;
    protected _res: Sprite;
    private _endShowCallback: Function;
    private _blackSprite: Sprite;

    protected domain: Domain;
    protected autoClearRes: boolean = true;

    constructor(clsOrRes: string | Sprite, url: string | any[] = [], domain: Domain = null) {
        super();
        this.domain = domain || new Domain();
        if (typeof clsOrRes === "string") {
            this._cls = clsOrRes;
            this._url = typeof url === "string" ? [url] : url;
            if (this._url != null) {
                this._url.push(clsOrRes);
                if (domain) {
                    domain.add(this._url);
                }
            }
        } else {
            this._res = clsOrRes;
        }
    }

    /**
     * 显示面板
     */
    public show(alignType: AlignType = AlignType.NONE,
                showEffect: boolean = true, loadingType: number = LoadingSpriteType.NONE,
                clickBackgroundRemove: boolean = true,
                blackBackground: boolean = false): void {
        this._alignType = alignType;
        this._showEffect = showEffect;
        this._loadingType = loadingType;
        this._clickBackgroundRemove = clickBackgroundRemove;
        if (blackBackground) {
            this._blackSprite = Sprite.fromImage(CommonRes.URL_IMG_BLACK);
        }
        if (this._res) {
            this.beforeInitDialog();
        } else if (Loader.getRes(this._cls)) {
            this.beforeInitDialog();
        } else if (loadingType == LoadingSpriteType.NONE) {
            Loading.load(this._url, Handler.create(this, this.onLoaded));
        } else {
            this._fileLoader = new CustomLoader();
            this._fileLoader.once(CustomLoaderEvent.onLoadCompleted, this.onLoaded, this);
            this._fileLoader.load(this._url, loadingType, true, "正在加载相关文件……");
        }
    }

    public addShowPanelEndFunc(callback: Function): void {
        this._endShowCallback = callback;
        if (this._res != null && this._res.displayedInStage) {
            this.applyShowPanelEndFunc();
            this._endShowCallback = null;
        }
    }

    public applyShowPanelEndFunc(): void {
        if (this._endShowCallback != null) {
            this._endShowCallback.apply(null);
        }
    }

    /**
     * 关闭面板
     */
    public close(): void {
        DialogManager.instance.removeDialog(this);
    }

    public get res(): Sprite {
        return this._res;
    }

    public regClickFunc(targetName: string, callBack: Function, thisArg: any = null, argArray: any[] = null, withTarget: boolean = false): this {
        if (this._clickHelper == null) {
            this._clickHelper = new ClickHelper(this._res == null ? this : this._res);
        }
        this._clickHelper.regClickFunc(targetName, callBack, thisArg ? thisArg : this, argArray, withTarget);
        return this;
    }

    public regRegexFunc(pattern: any, callBack: Function, thisArg: any = null, argArray: any[] = null, withTarget: boolean = false): this {
        if (this._clickHelper == null) {
            this._clickHelper = new ClickHelper(this._res == null ? this : this._res);
        }
        this._clickHelper.regRegexFunc(pattern, callBack, thisArg ? thisArg : this, argArray, withTarget);
        return this;
    }

    public setText(nameOrself: string | string[] | Sprite, text: any, container: Sprite = null): this {
        if (this.res) {
            let txt = this.getTarget(nameOrself, container) as Text | Label;
            if (txt) txt.text = String(text);
        } else {
            this.addArgumentsToTempObj("setText", arguments);
        }
        return this;
    }

    public setHtmlText(nameOrself: string | string[] | Sprite, text: any, container: Sprite = null): this {
        if (this.res) {
            let txt = this.getTarget(nameOrself, container) as Text | HTMLDivElement;
            if (txt instanceof Text) {
                let txtHtml = DisplayUtil.createHtmlText(txt);
                txtHtml.innerHTML = String(text);
                let index = txt.parent.getChildIndex(txt);
                if (nameOrself instanceof Sprite) {
                    //do nothing
                } else if (typeof nameOrself === "string") {
                    txtHtml.name = nameOrself;
                } else {
                    txtHtml.name = nameOrself[nameOrself.length - 1];
                }
                txt.parent.addChildAt(txtHtml, index);
                txt.removeSelf();
            } else {
                if (txt) txt.innerHTML = text;
            }
        } else {
            this.addArgumentsToTempObj("setHtmlText", arguments);
        }
        return this;
    }

    public setFrame(nameOrself: string | string[] | Sprite, frame: number | string, container: Sprite = null): this {
        if (this.res) {
            let mc = this.getTarget(nameOrself, container);
            if (mc instanceof Clip) {
                mc.index = <number>frame - 1;
            } else if (mc instanceof ViewStack) {
                mc.selectedIndex = <number>frame - 1;
            } else if (mc instanceof MovieClip) {
                mc.gotoAndStop(frame);
            }
        } else {
            this.addArgumentsToTempObj("setFrame", arguments);
        }
        return this;
    }

    public setVisible(nameOrself: string | string[] | Sprite, visible: boolean = false, container: Sprite = null): this {
        if (this.res) {
            let target = this.getTarget(nameOrself, container);
            if (target) target.visible = visible;
        } else {
            this.addArgumentsToTempObj("setVisible", arguments);
        }
        return this;
    }

    public setArtNum(nameOrself: string | string[] | Sprite, value: number, container: Sprite = null): this {
        if (this.res) {
            let target = this.getTarget(nameOrself, container);
            if (target) NumberUtil.instance.setArtNum(target, value);
        } else {
            this.addArgumentsToTempObj("setArtNum", arguments);
        }
        return this;
    }

    public setImageSkin(nameOrself: string | string[] | Sprite, url: string, container: Sprite = null): this {
        if (this.res) {
            let target = this.getTarget(nameOrself, container) as Image;
            if (target) {
                target.skin = url;
            }
        } else {
            this.addArgumentsToTempObj("setImageSkin", arguments);
        }
        return this;
    }

    public dispose(): void {
        this._clickHelper = null;
        if (this._fileLoader) {
            this._fileLoader.close();
        }
        if (this.autoClearRes) {
            this.domain.clear();
            this.domain = null;
        }
    }

    protected initComponents(): void {
    }

    protected onStageResize(): void {
        DisplayUtil.stretch(this);
        if (this._blackSprite) {
            DisplayUtil.stretch(this._blackSprite);
        }
        if (this._alignType == AlignType.NONE) {
            DisplayUtil.stretch(this.res);
            DisplayUtil.stretch(this.res.getChildByName("imgBg") as Sprite);
            for (let i: number = 0; i < this.res.numChildren; i++) {
                let imgBgX: Sprite = this.res.getChildByName("imgBgX_" + i) as Sprite;
                if (!imgBgX) {
                    break;
                }
                imgBgX.scale(Laya.stage.width / imgBgX.width, Laya.stage.height / imgBgX.height);
            }
            let lBox = this.leftBox;
            let cBox = this.centerBox;
            let rBox = this.rightBox;
            let width = 0;
            let count = 1;
            if (lBox) {
                if (!isNaN(lBox.left)) {
                    if (isNaN(lBox.centerY)) {
                        lBox.centerY = 0;
                    }
                } else {
                    count++;
                }
                width += lBox.width;
            }
            if (cBox) {
                if (!isNaN(cBox.centerX)) {
                    if (isNaN(cBox.centerY)) {
                        cBox.centerY = 0;
                    }
                } else {
                    count++;
                }
                width += cBox.width;
            }
            if (rBox) {
                if (!isNaN(rBox.right)) {
                    if (isNaN(rBox.centerY)) {
                        rBox.centerY = 0;
                    }
                } else {
                    count++;
                }
                width += rBox.width;
            }
            let scale;
            if (width > Laya.stage.width) {
                scale = Laya.stage.width / width;
            } else {
                scale = GameConfig.height / Laya.stage.height;
            }
            let interval = (Laya.stage.width - width * scale) / count;
            if (lBox) lBox.scale(scale, scale);
            if (cBox) cBox.scale(scale, scale);
            if (rBox) rBox.scale(scale, scale);
            let x = interval;
            if (lBox) {
                if (isNaN(lBox.left)) {
                    lBox.x = x;
                    x += interval;
                }
                x += lBox.width * scale;
            }
            if (cBox) {
                if (isNaN(cBox.centerX)) {
                    cBox.x = x;
                    x += interval;
                }
                x += cBox.width * scale;
            }
            if (rBox && isNaN(rBox.right)) rBox.x = x;
        } else {
            let scale;
            if (this._res.width > Laya.stage.width) {
                scale = Laya.stage.width / this._res.width;
            } else if (Laya.stage.width < Laya.stage.height) {
                scale = Laya.stage.width / GameConfig.height;
            } else {
                scale = GameConfig.height / Laya.stage.height;
            }
            this._res.scale(scale, scale);
            DisplayUtil.align(this._res, this._alignType);
        }
    }

    protected addListeners(): void {
        this.on(Laya.Event.REMOVED, this, this.onRemovedFromStage);
        Laya.stage.on(Laya.Event.RESIZE, this, this.onStageResize);
        this.regClickFunc("btnClose", this.onClickClose);
    }

    protected removeListeners(): void {
        this.off(Laya.Event.REMOVED, this, this.onRemovedFromStage);
        Laya.stage.off(Laya.Event.RESIZE, this, this.onStageResize);
        if (this._clickHelper != null) {
            this._clickHelper.dispose();
            this._clickHelper = null;
        }
        for (let strategy of this._strategies) {
            strategy.dispose();
        }
        this._strategies = null;
    }

    protected beforeInitDialog(): void {
        this.initDialog();
    }

    protected beforeAddToStage(): void {
        this.addToStage();
    }

    protected initDialog(): void {
        this.mouseThrough = true;
        if (this._blackSprite) {
            this.addChild(this._blackSprite);
        }
        if (!this._res) {
            this._res = new View();
            (<View>this.res).createView(Loader.getRes(this._cls));
        }
        this.addChild(this.res);
        this.initComponents();
        this.setComponents();
        this.onStageResize();
        this.addListeners();
        this.beforeAddToStage();
    }

    protected addToStage(): void {
        DialogManager.instance.addDialog(this, this._alignType, this._showEffect ? PanelEffect.POP : PanelEffect.NONE,
            true, 0, 0, this._clickBackgroundRemove, Handler.create(this, this.onEffectEnd));
        this.applyShowPanelEndFunc();
    }

    protected onEffectEnd(): void {
    }

    /**
     * 点击关闭按钮
     */
    protected onClickClose(): void {
        this.close();
    }

    /**
     * 左边框
     */
    protected get leftBox(): Box {
        return this.res.getChildByName("lBox") as Box;
    }

    /**
     * 中间框
     */
    protected get centerBox(): Box {
        return this.res.getChildByName("cBox") as Box;
    }

    /**
     * 右边框
     */
    protected get rightBox(): Box {
        return this.res.getChildByName("rBox") as Box;
    }

    protected addUrl(url: Object | Object[]): void {
        if (url instanceof Array) {
            this._url = this._url.concat(url);
        } else {
            this._url.push(url);
        }
    }

    protected getTarget(nameOrself: string | string[] | Sprite, container: Sprite = null): Sprite {
        if (!container) container = this.res;
        if (nameOrself instanceof Sprite) {
            return nameOrself;
        }
        if (typeof nameOrself === "string") {
            container = container.getChildByName(nameOrself) as Sprite;
        } else {
            for (let str of nameOrself) {
                container = container.getChildByName(str) as Sprite;
                // h5: ViewStack 直接跳一层 from XPanel
                if (container instanceof ViewStack) {
                    container = <Sprite>(<ViewStack>container).getChildByName("item" + (<ViewStack>container).selectedIndex);
                }
            }
        }
        return container;
    }

    private onLoaded(evt: CustomLoaderEvent = null): void {
        if (this._loadingType != LoadingSpriteType.NONE) {
            this._fileLoader = null;
        }
        this.beforeInitDialog();
    }

    private addArgumentsToTempObj(key: string, argArray: IArguments): void {
        if (this._tempObj.hasOwnProperty(key)) {
            (this._tempObj[key] as IArguments[]).push(argArray);
        } else {
            this._tempObj[key] = [argArray];
        }
    }

    private onRemovedFromStage(): void {
        this.removeListeners();
        this._res = null;
    }

    private setComponents(): void {
        if (this._strategies) {
            for (let strategy of this._strategies) {
                if (!strategy.isInited()) {
                    strategy.preload(this);
                }
            }
        }
        if (this._tempObj) {
            for (let key in this._tempObj) {
                let argArrays: IArguments[] = this._tempObj[key];
                for (let argArray of argArrays) {
                    (this[key] as Function).apply(this, argArray);
                }
            }
            this._tempObj = null;
        }
    }
}