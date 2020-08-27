import SignalBase from "./SignalBase";
import ListenerNode from './ListenerNode';
/*
 * Based on ideas used in Robert Penner's AS3-signals - https://github.com/robertpenner/as3-signals
 */

/**
  * Provides a fast signal for use where no parameters are dispatched with the signal.
  */
export default class Signal0 extends SignalBase {
	constructor() {
		super();
	}

	public dispatch(): void {
		this.startDispatch();
		var node: ListenerNode;
		for (node = this.head; node; node = node.next) {
			node.listener.call(node.caller);
			if (node.once) {
				this.remove(node.listener, node.caller);
			}
		}
		this.endDispatch();
	}
}