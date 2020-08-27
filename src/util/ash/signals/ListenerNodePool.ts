import ListenerNode from './ListenerNode';
/**
  * This export default class maintains a pool of deleted listener nodes for reuse by framework. This reduces 
  * the overhead from object creation and garbage collection.
  */
export default class ListenerNodePool {
	private tail: ListenerNode;
	private cacheTail: ListenerNode;

	public get(): ListenerNode {
		if (this.tail) {
			var node: ListenerNode = this.tail;
			this.tail = this.tail.previous;
			node.previous = null;
			return node;
		}
		else {
			return new ListenerNode();
		}
	}

	public dispose(node: ListenerNode): void {
		node.listener = null;
		node.caller = null;
		node.once = false;
		node.next = null;
		node.previous = this.tail;
		this.tail = node;
	}

	public cache(node: ListenerNode): void {
		node.listener = null;
		node.previous = this.cacheTail;
		this.cacheTail = node;
	}

	public releaseCache(): void {
		while (this.cacheTail) {
			var node: ListenerNode = this.cacheTail;
			this.cacheTail = node.previous;
			node.next = null;
			node.previous = this.tail;
			this.tail = node;
		}
	}
}