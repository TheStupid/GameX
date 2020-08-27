import CommandEvent from './CommandEvent';
import ICommand from './ICommand';
import EventDispatcher from '../../egret/events/EventDispatcher';

export default class SimpleCommand extends EventDispatcher implements ICommand {

	constructor() {
		super();
	}

	public execute(content: Object): void {
	}

	public cancel(): void {
		this.dispatchEvent(new CommandEvent(CommandEvent.CANCELED, this));
	}

	protected succeed(content: Object): void {
		this.dispatchEvent(new CommandEvent(CommandEvent.SUCCEED, this, content));
	}

	protected fail(content: Object): void {
		this.dispatchEvent(new CommandEvent(CommandEvent.FAILED, this, content));
	}
}