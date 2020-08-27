import ListenerNode from './ListenerNode';
import ListenerNodePool from './ListenerNodePool';
import ListenerNodeList from './ListenerNodeList';
/*
 * Based on ideas used in Robert Penner's AS3-signals - https://github.com/robertpenner/as3-signals
 */


/**
  * The base class for all the signal classes.
  */
export default class SignalBase {
	public head: ListenerNode;
	public tail: ListenerNode;

	private nodeList: ListenerNodeList;
	private listenerNodePool: ListenerNodePool;
	private toAddHead: ListenerNode;
	private toAddTail: ListenerNode;
	private dispatching: boolean;
	private _numListeners: number = 0;

	constructor() {
		this.nodeList = new ListenerNodeList();
		this.listenerNodePool = new ListenerNodePool();
	}

	protected startDispatch(): void {
		this.dispatching = true;
	}

	protected endDispatch(): void {
		this.dispatching = false;
		if (this.toAddHead) {
			if (!this.head) {
				this.head = this.toAddHead;
				this.tail = this.toAddTail;
			}
			else {
				this.tail.next = this.toAddHead;
				this.toAddHead.previous = this.tail;
				this.tail = this.toAddTail;
			}
			this.toAddHead = null;
			this.toAddTail = null;
		}
		this.listenerNodePool.releaseCache();
	}

	public get numListeners(): number {
		return this._numListeners;
	}

	public add(listener: Function, caller: any): void {
		if (this.nodeList.get(listener, caller)) {
			return;
		}
		var node: ListenerNode = this.listenerNodePool.get();
		node.listener = listener;
		node.caller = caller;
		this.nodeList.add(node);
		this.addNode(node);
	}

	public addOnce(listener: Function, caller: any): void {
		if (this.nodeList.get(listener, caller)) {
			return;
		}
		var node: ListenerNode = this.listenerNodePool.get();
		node.listener = listener;
		node.caller = caller;
		node.once = true;
		this.nodeList.add(node);
		this.addNode(node);
	}

	protected addNode(node: ListenerNode): void {
		if (this.dispatching) {
			if (!this.toAddHead) {
				this.toAddHead = this.toAddTail = node;
			}
			else {
				this.toAddTail.next = node;
				node.previous = this.toAddTail;
				this.toAddTail = node;
			}
		}
		else {
			if (!this.head) {
				this.head = this.tail = node;
			}
			else {
				this.tail.next = node;
				node.previous = this.tail;
				this.tail = node;
			}
		}
		this._numListeners++;
	}

	public remove(listener: Function, caller: any): void {
		var node: ListenerNode = this.nodeList.get(listener, caller);
		if (node) {
			if (this.head == node) {
				this.head = this.head.next;
			}
			if (this.tail == node) {
				this.tail = this.tail.previous;
			}
			if (this.toAddHead == node) {
				this.toAddHead = this.toAddHead.next;
			}
			if (this.toAddTail == node) {
				this.toAddTail = this.toAddTail.previous;
			}
			if (node.previous) {
				node.previous.next = node.next;
			}
			if (node.next) {
				node.next.previous = node.previous;
			}
			this.nodeList.remove(node);
			if (this.dispatching) {
				this.listenerNodePool.cache(node);
			}
			else {
				this.listenerNodePool.dispose(node);
			}
			this._numListeners--;
		}
	}

	public removeAll(): void {
		while (this.head) {
			var node: ListenerNode = this.head;
			this.head = this.head.next;
			this.nodeList.remove(node);
			this.listenerNodePool.dispose(node);
		}
		this.tail = null;
		this.toAddHead = null;
		this.toAddTail = null;
		this._numListeners = 0;
	}

	private getListenerNode(listener: Function, caller: any): ListenerNode {
		return null;
	}
}