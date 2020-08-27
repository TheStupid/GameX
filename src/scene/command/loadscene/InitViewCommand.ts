import MacroCommand from '../../../util/command/MacroCommand';
import PreRenderCommand from './scenerender/PreRenderCommand';
import RenderCommand from './scenerender/RenderCommand';

export default class InitViewCommand extends MacroCommand {

	constructor() {
		super();
	}

	protected initializeMacroCommand(): void {
		this.addSubCommand(PreRenderCommand);
		this.addSubCommand(RenderCommand);
	}
}