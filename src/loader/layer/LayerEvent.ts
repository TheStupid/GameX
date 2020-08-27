import Event from '../../egret/events/Event';

export default class LayerEvent extends Event {

	/** 层次被隐藏 */
	public static readonly HIDE: string = "onLayerHide";
	/** 层次重新显示 */
	public static readonly SHOW: string = "onLayerShow";

	/** 层次被从显示列表移除 */
	public static readonly REMOVE: string = "onLayerRemove";
	/** 层次被重新加入显示列表 */
	public static readonly ADD: string = "onLayerAdd";

	/** 层次被销毁 */
	public static readonly DESTROY: string = "onLayerDestroy";
	/** 层次被重建 */
	public static readonly CONSTRUCT: string = "onLayerConstruct";

	public static readonly CUSTOM_LOADER_SHOW: string = "onCustomLoaderShow";
	public static readonly CUSTOM_LOADER_ClOSE: string = "onCustomLoaderClose";

	public constructor(type: string, private _layerName: string) {
		super(type);
	}

	public get layerName(): string {
		return this._layerName;
	}
}