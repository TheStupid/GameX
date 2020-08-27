import EventDispatcher from '../../egret/events/EventDispatcher';

export default class CommonEventDispatcher extends EventDispatcher {

	public static readonly onShowModifyInfo = "onShowModifyInfo";
	private static _instance: CommonEventDispatcher;

	public static get instance(): CommonEventDispatcher {
		if (CommonEventDispatcher._instance == null) {
			CommonEventDispatcher._instance = new CommonEventDispatcher();
		}

		return CommonEventDispatcher._instance;
	}

	private constructor() {
		super();
	}
}