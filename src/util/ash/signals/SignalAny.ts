import SignalBase from "./SignalBase";
import ListenerNode from './ListenerNode';
/*
 * Based on ideas used in Robert Penner's AS3-signals - https://github.com/robertpenner/as3-signals
 */

/**
  * Provides a fast signal for use where any number of parameters are dispatched with the signal.
  */
export default class SignalAny extends SignalBase {
	protected classes: any[];

	constructor(...classes) {
		super();
		this.classes = classes;
	}

	public dispatch(...objects): void {
		this.startDispatch();
		var node: ListenerNode;
		for (node = this.head; node; node = node.next) {
			node.listener.call(node.caller, objects);
			if (node.once) {
				this.remove(node.listener, node.caller);
			}
		}
		this.endDispatch();
	}
}