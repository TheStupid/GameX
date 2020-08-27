import ILoadingSprite from './ILoadingSprite';
import Loader from '../Loader';
import DisplayUtil from '../../util/DisplayUtil';
import CustomProgressBar from '../../common/component/CustomProgressBar';
import ProgressBar = Laya.ProgressBar;
import Sprite = Laya.Sprite;
import Image = Laya.Image;
import Text = Laya.Text;
import View = Laya.View;
import Box = Laya.Box;

export default class LoadingSprite extends Sprite implements ILoadingSprite {
	protected _res: View;
	protected _progressBar: ProgressBar | CustomProgressBar;
	protected _txtProgress: Text;
	protected _txtLoading: Text;

	constructor(url: string) {
		super();
		this.mouseEnabled = true;
		this._res = new View();
		this._res.createView(Loader.getRes(url));
		this.addChild(this._res);
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
		this._progressBar.value = progress / 100;
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
		this._txtProgress = this.centerBox.getChildByName("txtprogress") as Text;
		this._progressBar = this.centerBox.getChildByName("progressBar") as ProgressBar | CustomProgressBar;
		if (this._txtProgress != null) {
			this._txtProgress.text = "0%";
		}
		if (this._progressBar != null) {
			this._progressBar.value = 0;
		}
	}

	protected initLoadingText(): void {
		this._txtLoading = this.centerBox.getChildByName("txtloading") as Text;
	}

	protected disposeProgressComponent(): void {
		this._txtProgress = null;
		this._progressBar = null;
	}

	protected disposeLoadingText(): void {
		this._txtLoading = null;
	}

	protected get centerBox(): Box {
		return this._res.getChildByName("cBox") as Box;
	}

	protected get backgroundImg(): Image {
		return this._res.getChildByName("imgBg") as Image;
	}

	protected onStageResize(): void {
        DisplayUtil.stretch(this);
		DisplayUtil.stretch(this._res);
		DisplayUtil.stretch(this.backgroundImg);
	}
}