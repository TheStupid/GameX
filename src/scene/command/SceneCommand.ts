import MacroCommand from '../../util/command/MacroCommand';

export default class SceneCommand extends MacroCommand {

	constructor() {
		super();
	}

	/**
	  * 添加子命令
	  * 
	  * @param command	子命令
	  */
	public addCommand(command: any): void {
		this.addSubCommand(command);
	}
}