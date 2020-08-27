import Event from '../egret/events/Event';

export default class InitServiceEvent extends Event {

	public static readonly onInited = "onInited";
	public params: Object;

	constructor(type: string, params: Object = null) {
		super(type)
		this.params = params;
	}

	public clone(): Event {
		return new InitServiceEvent(this.type, this.params);
	}

	public toString(): string {
		return "";
	}
}