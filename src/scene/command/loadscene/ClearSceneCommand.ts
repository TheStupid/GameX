import SimpleCommand from '../../../util/command/SimpleCommand';
import ICommand from '../../../util/command/ICommand';
import DialogManager from '../../../common/dialog/DialogManager';

export default class ClearSceneCommand extends SimpleCommand implements ICommand {

	constructor() {
		super();
	}

	public execute(content: Object): void {
		DialogManager.instance.clearAll();
		// FloatPanelManager.getInstance().clearAll();

		this.succeed(content);
	}
}