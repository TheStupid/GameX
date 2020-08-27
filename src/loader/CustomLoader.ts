import Loader from './Loader';
import CustomLoaderEvent from './CustomLoaderEvent';
import LayerManager from './layer/LayerManager';
import LayerEvent from './layer/LayerEvent';
import DisplayUtil from '../util/DisplayUtil';
import ILoadingSprite from './loadingsprite/ILoadingSprite';
import LoadingSpriteType from './LoadingSpriteType';
import EventDispatcher from '../egret/events/EventDispatcher';
import Sprite = Laya.Sprite;
import Handler = Laya.Handler;

export default class CustomLoader extends EventDispatcher {

	private loadList: Object[];

	/** 下载后是否自动关闭 */
	private autoClose: boolean;

	/** 提示框 */
	private _loadingSprite: ILoadingSprite;

	/** 下载提示语 */
	private message: string;

	constructor() {
		super();
	}

	public get loadingSprite(): ILoadingSprite {
		return this._loadingSprite;
	}

	/**
	  * 启动文件下载
	  * @param	loadList			要下载的文件列表
	  * @param	loadingSpritType	下载提示框类型
	  * @param	autoClose			下载完后自动关闭提示窗口，默认为true
	  * @param	message				下载提示语
	  * @param	name				下载需要获取的类名
	  **/
	public load(loadList: Object[],
		loadingSpritType: number = LoadingSpriteType.FULL_SCREEN,
		autoClose: boolean = true,
		message: string = "请稍等……"): void {
		var loadingSprite: ILoadingSprite = LoadingSpriteType.getLoadingSprite(loadingSpritType, this);
		this.LoadC(loadList, loadingSprite, autoClose, message);
	}

	/**
	  * 启动文件下载，此方法允许自定义提示框
	  * @param	loadList			要下载的文件列表
	  * @param	loadingSprite		下载提示框
	  * @param	autoClose			下载完后自动关闭提示窗口，默认为true
	  * @param	message				下载提示语
	  * @param	name				下载需要获取的类名
	  **/
	public LoadC(loadList: Object[],
		loadingSprite: ILoadingSprite,
		autoClose: boolean = true,
		message: string = "请稍等……"): void {

		this.loadList = loadList;
		this.message = message;
		this.autoClose = autoClose;

		this._loadingSprite = loadingSprite;

		if (this._loadingSprite != null) {
			this._loadingSprite.setLoadingText(message);
			LayerManager.getBaseTop().addChild(<any>this._loadingSprite);
			LayerManager.instance.dispatchEvent(new LayerEvent(LayerEvent.CUSTOM_LOADER_SHOW, null));
		}

		if (loadList.length > 0) {
			this.loadFiles();
		}else{
			this.onCompleted();
		}
	}

	public close(): void {
		if (this._loadingSprite != null) {
			this._loadingSprite.dispose();
			DisplayUtil.stopAndRemove(<any>this._loadingSprite);
			LayerManager.instance.dispatchEvent(new LayerEvent(LayerEvent.CUSTOM_LOADER_ClOSE, null));
			this._loadingSprite = null;
		}
	}

	private loadFiles(): void {
		Loader.load(this.loadList
			, Handler.create(this, this.onCompleted)
			, Handler.create(this, this.onProgress, null, false));
	}

	private onCompleted(): void {
		if (this.autoClose) {
			this.close();
		}
		this.dispatchEvent(new CustomLoaderEvent(CustomLoaderEvent.onLoadCompleted));
	}

	private onProgress(value: number): void {
		if (this._loadingSprite != null) {
			this._loadingSprite.setProgress(Math.floor(value * 100));
		}
	}
}