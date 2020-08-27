/**
 * A node in the list of listeners in a signal.
 */
export default class ListenerNode {
	public previous: ListenerNode;
	public next: ListenerNode;
	public listener: Function;
	public caller: any;
	public once: boolean;
}