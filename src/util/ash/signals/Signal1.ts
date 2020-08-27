import SignalBase from "./SignalBase";
import ListenerNode from './ListenerNode';
/*
 * Based on ideas used in Robert Penner's AS3-signals - https://github.com/robertpenner/as3-signals
 */

/**
  * Provides a fast signal for use where one parameter instanceof dispatched with the signal.
  */
export default class Signal1 extends SignalBase {
	private type: any;

	constructor(type: any) {
		super();
		this.type = type;
	}

	public dispatch(object: any): void {
		this.startDispatch();
		var node: ListenerNode;
		for (node = this.head; node; node = node.next) {
			node.listener.call(node.caller, object);
			if (node.once) {
				this.remove(node.listener, node.caller);
			}
		}
		this.endDispatch();
	}
}