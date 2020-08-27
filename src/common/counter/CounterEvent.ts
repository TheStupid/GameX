import Event from '../../egret/events/Event';

export default class CounterEvent extends Event {
	/** 计时到了设定的时间间隔*/
	public static readonly COUNTER_INTERVAL: string = "counter_interval_notify";
	/** 计时结束*/
	public static readonly COUNTER_END: string = "counter_end_notify";

	private _params: Object;

	constructor(type: string, params: Object) {
		super(type);
		this._params = params;
	}

	public get params(): Object {
		return this._params;
	}
}