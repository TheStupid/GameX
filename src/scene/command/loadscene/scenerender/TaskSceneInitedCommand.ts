import SimpleCommand from '../../../../util/command/SimpleCommand';
import SceneInfo from '../../../SceneInfo';
import SceneCommandStep from '../../../SceneCommandStep';
import SceneManager from '../../../SceneManager';
import SceneManagerEvent from '../../../SceneManagerEvent';

export default class TaskSceneInitedCommand extends SimpleCommand {

	private content: Object;

	constructor() {
		super();
	}

	public execute(content: Object): void {
		this.content = content;

		var info: SceneInfo = content["SceneInfo"] as SceneInfo;
		info.scene.executeCommands(SceneCommandStep.TaskSceneInited, {}
			, this.onExecutedCommand, this);
	}

	private onExecutedCommand(success: boolean): void {
		var info: SceneInfo = this.content["SceneInfo"] as SceneInfo;

		// 任务交互初始化完成事件
		SceneManager.getInstance().dispatchEvent(
			new SceneManagerEvent(SceneManagerEvent.TASK_SCENE_INITED, {}));

		this.succeed(this.content);
		this.content = null;
	}
}

