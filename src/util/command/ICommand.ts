import IEventDispatcher from '../../egret/events/IEventDispatcher';

export default interface ICommand extends IEventDispatcher {

	execute(content: Object): void;

	cancel(): void;
}