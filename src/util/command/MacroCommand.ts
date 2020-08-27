import SimpleCommand from './SimpleCommand';
import CommandEvent from './CommandEvent';
import ICommand from './ICommand';

export default class MacroCommand extends SimpleCommand {

	private _subCommands: any[];
	private _executeCommands: any[];

	/**
	  * 参数
	  */
	private _content: Object;

	/**
	  * 当前执行中的命令计数信号量
	  */
	private _semaphore: number;

	/**
	  * 当前执行中的命令的实例
	  */
	private _executingList: any[];

	constructor() {
		super();
		this._semaphore = 0;
		this._subCommands = [];
		this.initializeMacroCommand();
	}

	public execute(content: Object): void {
		if (this._semaphore > 0) {
			return;
		}

		this._executeCommands = this._subCommands.concat();
		this.executeNextCommand(content);
	}

	public cancel(): void {
		for (var command of this._executingList) {
			command.cancel();
		}
		this._semaphore = 0;

		this.dispatchEvent(new CommandEvent(CommandEvent.CANCELED, this));
	}

	protected initializeMacroCommand(): void {
	}

	/**
	  * 添加子命令
	  * @param commandClassRef	子命令（可以是Class，也可以是实例）
	  */
	protected addSubCommand(command: any): void {
		this.addParallelSubCommand([command]);
	}

	protected addParallelSubCommand(commands: any[]): void {
		this._subCommands.push(commands);
	}

	/**
	  * 添加子命令
	  * @param commandClassRef	子命令（可以是Class，也可以是实例）
	  */
	protected unshiftSubCommand(command: any): void {
		this.unshiftParallelSubCommand([command]);
	}

	protected unshiftParallelSubCommand(commands: any[]): void {
		this._subCommands.unshift(commands);
	}

	/**
	  * 插入命令
	  * @param commandDefine 子命令（可以是Class，也可以是实例）
	  * @param insertBefore 插入实际
	  * @param constuctParmas 命令的构造参数
	  */
	protected insertSubCommand(command: any, insertBefore: any): void {
		this.insertParallelSubCommand([command], insertBefore);
	}

	protected insertParallelSubCommand(commands: any[], insertBefore: any): void {
		var insertIndex: number = -1;
		if (insertBefore instanceof Array) {
			insertIndex = this.getSubCommandIndex(insertBefore);
		} else {
			insertIndex = this.getSubCommandIndex([insertBefore]);
		}
		if (insertIndex != -1) {
			this._subCommands.splice(insertIndex, 0, commands);
		} else {
			throw new Error("Can't locate insertBefore");
		}
	}

	/**
	  * 删除子命令
	  * @param commandClassRef	子命令
	  */
	protected removeSubCommand(commandDefine: any): void {
		this.removeParallelSubCommand([commandDefine]);
	}

	protected removeParallelSubCommand(commandClassRefs: any[]): void {
		var removeIndex: number = this.getSubCommandIndex(commandClassRefs);
		if (removeIndex != -1) {
			this._subCommands.splice(removeIndex, 1);
		}
	}

	private getSubCommandIndex(commands: any[]): number {
		var index: number = -1;
		for (var i = 0; i < this._subCommands.length; i++) {
			var list: any[] = this._subCommands[i];
			if (list.length != commands.length) {
				continue;
			}
			var j: number;
			for (j = 0; j < list.length; j++) {
				if (!this.isEqualCommand(list[j], commands[j])) {
					break;
				}
			}
			if (j == list.length) {
				index = i;
				break;
			}
		}
		return index;
	}

	private isEqualCommand(cmd1: any, cmd2: any): boolean {
		if (cmd1 == cmd2 || cmd1 instanceof cmd2 || cmd2 instanceof cmd1) {
			return true;
		}
		return false;
	}

	private executeNextCommand(content: Object): void {
		if (this._executeCommands.length > 0) {
			var subCommands: any[] = this._executeCommands.shift();

			this._executingList = [];
			this._semaphore = subCommands.length;
			this._content = {};
			for (var key in content) {
				this._content[key] = content[key];
			}
			
			for (var i: number = 0; i < subCommands.length; i++) {
				var command: any = subCommands[i];
				var commandInstance: ICommand = this.getCommandInstance(command);
				this._executingList.push(commandInstance);
				commandInstance.addEventListener(CommandEvent.SUCCEED, this.onCommandSucc, this);
				commandInstance.addEventListener(CommandEvent.FAILED, this.onCommandFail, this);
				commandInstance.execute(content);
			}
		} else {
			this._semaphore = 0;
			this.succeed(content);
		}
	}

	private getCommandInstance(command: any): ICommand {
		if (command instanceof SimpleCommand) {
			return command;
		} else {
			return new command();
		}
		return null;
	}

	private onCommandSucc(e: CommandEvent): void {
		var commandInstance: ICommand = e.command;

		var index: number = this._executingList.indexOf(commandInstance);
		this._executingList.splice(index, 1);

		commandInstance.removeEventListener(CommandEvent.FAILED, this.onCommandFail, this);
		commandInstance.removeEventListener(CommandEvent.SUCCEED, this.onCommandSucc, this);

		for (var key in e.params) {
			this._content[key] = e.params[key];
		}

		this.checkSemaphore();
	}
	;

	private onCommandFail(e: CommandEvent): void {
		var commandInstance: ICommand = e.command;

		var index: number = this._executingList.indexOf(commandInstance);
		this._executingList.splice(index, 1);

		commandInstance.removeEventListener(CommandEvent.FAILED, this.onCommandFail, this);
		commandInstance.removeEventListener(CommandEvent.SUCCEED, this.onCommandSucc, this);

		for (var key in e.params) {
			this._content[key] = e.params[key];
		}

		// 同一批执行的命令中，若一个失败，则取消其余命令
		for (var command of this._executingList) {
			command.cancel();
		}

		this.fail(this._content);
	}

	private checkSemaphore(): void {
		--this._semaphore;
		if (this._semaphore == 0) {
			this.executeNextCommand(this._content);
		}
	}

	protected succeed(content: Object): void {
		super.succeed(content);
		this._semaphore = 0;
	}

	protected fail(content: Object): void {
		super.fail(content);
		this._semaphore = 0;
	}
}