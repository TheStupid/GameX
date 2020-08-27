import Event from '../egret/events/Event';

export default class CustomLoaderEvent extends Event {

	/**
	  * 单个文件下载完成
	  **/
	public static readonly onLoadedFile = "onLoadedFile";

	/**
	  * 所有文件下载完成
	  **/
	public static readonly onLoadCompleted = "onLoadCompleted";

	/**
	  * 用户取消
	  **/
	public static readonly onCancel = "onCancel";

	/**
	  * 下载错误
	  **/
	public static readonly onError = "onError";

	/**
	  * 下载出错时是否取消下载，默认为真
	  * */
	public cancel: boolean = true;

	constructor(type: string) {
		super(type)
	}
}