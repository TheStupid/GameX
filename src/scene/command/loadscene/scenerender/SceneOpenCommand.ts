import SimpleCommand from '../../../../util/command/SimpleCommand';
import SceneInfo from '../../../SceneInfo';
import SceneCommandStep from '../../../SceneCommandStep';
import SceneManager from '../../../SceneManager';
import SceneManagerEvent from '../../../SceneManagerEvent';

export default class SceneOpenCommand extends SimpleCommand {
	
	private content: Object;

	constructor() {
		super();
	}

	public execute(content: Object): void {
		this.content = content;

		var info: SceneInfo = content["SceneInfo"] as SceneInfo;
		info.scene.executeCommands(SceneCommandStep.SceneOpen, {}
			, this.onExecutedCommand, this);
	}

	private onExecutedCommand(success: boolean): void {
		var info: SceneInfo = this.content["SceneInfo"] as SceneInfo;

		// 场景开启事件
		SceneManager.getInstance().dispatchEvent(
			new SceneManagerEvent(SceneManagerEvent.SCENE_OPENED, {}));

		this.succeed(this.content);
		this.content = null;
	}
}