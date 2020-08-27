import Event = laya.events.Event;

export default class ConfigReadEvent extends Event {

	public static readonly onConfigLoadSuccess: string = "onConfigLoadSuccess";
	public static readonly onConfigLoadFailure: string = "onConfigLoadFailure";

	public constructor(public type: string, public params?: Object) {
		super();
	}
}