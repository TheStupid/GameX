import ILoadingSprite from './ILoadingSprite';
import Loader from '../Loader';
import DisplayUtil from '../../util/DisplayUtil';
import CustomProgressBar from '../../common/component/CustomProgressBar';
import Sprite = Laya.Sprite;
import Image = Laya.Image;
import Text = Laya.Text;
import View = Laya.View;
import Label = Laya.Label;

export default class FullScreenLoadingSprite extends View implements ILoadingSprite {
    private static readonly CLS: string = "loader/loadingsprite/FullScreenLoadingSprite.json";

    protected _progressBar: CustomProgressBar;
    protected _txtProgress: Label;
    protected _txtLoading: Label;

    constructor() {
        super();
        this.mouseEnabled = true;
        this.createView(Loader.getRes(FullScreenLoadingSprite.CLS));
        this.initProgressComponent();
        this.initLoadingText();
        Laya.stage.on(Laya.Event.RESIZE, this, this.onStageResize);
        this.onStageResize();
    }

    /**
     * 设置进度
     */
    public setProgress(progress: number): void {
        this._txtProgress.text = progress + "%";
        if(this._progressBar){
            this._progressBar.value = progress / 100;
        }
    }

    /**
     * 设置加载信息
     */
    public setLoadingText(text: string): void {
        if (this._txtLoading == null) {
            return;
        }
        this._txtLoading.text = text;
    }

    public dispose(): void {
        this.disposeProgressComponent();
        this.disposeLoadingText();
        Laya.stage.off(Laya.Event.RESIZE, this, this.onStageResize);
    }

    protected initProgressComponent(): void {
        let mcProgress: Sprite = this.getChildByName("mcProgress") as Sprite;
        this._txtProgress = mcProgress.getChildByName("txtProgress") as Label;

        if (this._txtProgress != null) {
            this._txtProgress.text = "0%";
        }
        if (this._progressBar != null) {
            this._progressBar.value = 0;
        }
    }

    protected initLoadingText(): void {
        let mcProgress: Sprite = this.getChildByName("mcProgress") as Sprite;
        this._txtLoading = mcProgress.getChildByName("txtLoading") as Label;
    }

    protected disposeProgressComponent(): void {
        this._txtProgress = null;
        this._progressBar = null;
    }

    protected disposeLoadingText(): void {
        this._txtLoading = null;
    }

    protected get backgroundImg(): Image {
        return this.getChildByName("mcBG") as Image;
    }

    protected onStageResize(): void {
        DisplayUtil.stretch(this);
        DisplayUtil.stretch(this.backgroundImg);
    }
}