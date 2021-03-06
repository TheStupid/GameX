import SignalBase from "./SignalBase";
import ListenerNode from './ListenerNode';
/*
 * Based on ideas used in Robert Penner's AS3-signals - https://github.com/robertpenner/as3-signals
 */

/**
  * Provides a fast signal for use where two parameters are dispatched with the signal.
  */
export default class Signal2 extends SignalBase {
	private type1: any;
	private type2: any;

	constructor(type1: any, type2: any) {
		super();
		this.type1 = type1;
		this.type2 = type2;
	}

	public dispatch(object1: any, object2: any): void {
		this.startDispatch();
		var node: ListenerNode;
		for (node = this.head; node; node = node.next) {
			node.listener.call(node.caller, object1, object2);
			if (node.once) {
				this.remove(node.listener, node.caller);
			}
		}
		this.endDispatch();
	}
}