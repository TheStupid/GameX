import DialogBackground from './DialogBackground';
import DisplayUtil from '../../util/DisplayUtil';
import DialogManager from './DialogManager';
import PanelEvent from './PanelEvent';
import EventBinder from '../../util/common/EventBinder';
import PanelBase from "../panel/PanelBase";
import Sprite = Laya.Sprite;
import Box = Laya.Box;
import Resource = Laya.Resource;

export default class DialogContainer extends Box {

	private _movieLayer: Box;
	private _backgroundLayer: Box;

	private _mov: Sprite;
	private _layerName: string;
	private _isGrayBackground: boolean;
	private _clickBackgroundRemove: boolean;
	private _destroyChild:boolean;

	private _isActivited: boolean = true;//默认激活

	public constructor(mov: Sprite, layerName: string, isGrayBackground: boolean, clickBackgroundRemove: boolean, destroyChild: boolean) {
		super();
		this._mov = mov;
		this._layerName = layerName;
		this._isGrayBackground = isGrayBackground;
		this._clickBackgroundRemove = clickBackgroundRemove;
		this._destroyChild = destroyChild;
		this.initLayer();
		this.onStageResize();
	}

	private initLayer(): void {
		this._movieLayer = new Box();
		this._backgroundLayer = new Box();
		this._movieLayer.mouseThrough = true;
		this.addChild(this._backgroundLayer);
		this.addChild(this._movieLayer);
		this.addMovie();
		this.addBackground();
	}

	public addBackground(): void {
		var background: Sprite = DialogBackground.getInstance().getBackground(this._layerName, this._isGrayBackground);
		background.mouseEnabled = true;
		var binder = new EventBinder(background);
		binder.bind(background, Laya.Event.CLICK, (evt: Laya.Event) => {
			evt.stopPropagation();
			if (this._clickBackgroundRemove) {
				DialogManager.instance.removeDialog(this._mov);
			}
		}, this);
		this._backgroundLayer.addChild(background);
	}

	private addMovie(): void {
		this._movieLayer.addChild(this._mov);
	}

	public get mov(): Sprite {
		return this._mov;
	}

	public get layerName(): string {
		return this._layerName;
	}

	public get isGrayBackground(): boolean {
		return this._isGrayBackground;
	}

	public deactivate(): void {
		if (this._isActivited) {
			this._isActivited = false;
			this.onPanelDeactivated(this._mov);
		}
	}

	public activate(): void {
		if (!this._isActivited) {
			this._isActivited = true;
			this.onPanelActiveted(this._mov);
		}
	}

	public panelAdded(): void {
		this.onPanelAdded(this._mov);
	}

	/**
	  * 面板失去焦点
	  */
	private onPanelDeactivated(window: Sprite): void {
		DialogManager.instance.dispatchEvent(new PanelEvent(PanelEvent.WINDOW_DEACTIVATED, { "window": window }));
	}

	/**
	  * 面板获得焦点
	  */
	private onPanelActiveted(window: Sprite): void {
		DialogManager.instance.dispatchEvent(new PanelEvent(PanelEvent.WINDOW_ACTIVATED, { "window": window }));
	}


	/**
	  * 一个面板已被添加
	  */
	private onPanelAdded(window: Sprite): void {
		window.event(PanelEvent.ADDED);
		DialogManager.instance.dispatchEvent(new PanelEvent(PanelEvent.WINDOW_ADDED, { "window": window }));
		Laya.stage.on(Laya.Event.RESIZE, this, this.onStageResize);
	}

	/**
	  * 一个面板已被移除
	  */
	private onPanelRemoved(window: Sprite): void {
		window.event(PanelEvent.REMOVED);
		DialogManager.instance.dispatchEvent(new PanelEvent(PanelEvent.WINDOW_REMOVE, { "window": window }));
		Laya.stage.off(Laya.Event.RESIZE, this, this.onStageResize);
	}

	private onStageResize(): void {
		DisplayUtil.stretch(this);
		DisplayUtil.stretch(this._movieLayer);
		DisplayUtil.stretch(this._backgroundLayer);
		if (this._backgroundLayer.numChildren > 0) {
			var background: Sprite = this._backgroundLayer.getChildAt(0) as Sprite;
			DisplayUtil.stretch(background);
		}
	}

	public dispose(): void {
		if (!(this._mov instanceof PanelBase) && this._mov["dispose"] != null) {
			this._mov["dispose"]();
		}
		this.onPanelRemoved(this._mov);
        DialogBackground.getInstance().removeBackground(this._layerName, this._isGrayBackground);
		DisplayUtil.stopAndRemove(this, this._destroyChild);
	}
}