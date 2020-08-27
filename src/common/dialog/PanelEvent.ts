import Event from '../../egret/events/Event';

export default class PanelEvent extends Event {

	/** 面板已弹出 */
	public static readonly ADDED: string = "onPanelAdded";

	/** 面板已关闭 */
	public static readonly REMOVED: string = "onPanelRemoved";

	/** 面板已显示(DialogManager发出，window参数为弹出的面板) */
	public static readonly WINDOW_ADDED: string = "window_added";

	/** 面板已关闭(DialogManager发出，window参数为弹出的面板) */
	public static readonly WINDOW_REMOVE: string = "window_remove";

	/** ModalDialog面板失去焦点(DialogManager发出，window参数为弹出的面板) */
	public static readonly WINDOW_DEACTIVATED: string = "window_deactivate";

	/** ModalDialog面板获得焦点(DialogManager发出，window参数为弹出的面板) */
	public static readonly WINDOW_ACTIVATED: string = "window_activate";

	public static readonly CLEAR_ALL_CALL: string = "clear_all_call";
	public static readonly CLEAR_ALL_DONE: string = "clear_all_done";

	private _params: Object;

	public constructor(type: string, params?: Object) {
		super(type);
		this._params = params;
	}

	public get params(): Object {
		return this._params;
	}
}