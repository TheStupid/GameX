import Event from '../../egret/events/Event';

export default class CommonEvent extends Event {
	public params: any;

	constructor(type: string, params: any) {
		super(type);
		this.params = params;
	}
}