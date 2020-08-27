import SimpleCommand from '../../../../util/command/SimpleCommand';
import SceneManager from '../../../SceneManager';
import SceneManagerEvent from '../../../SceneManagerEvent';
import SceneInfo from '../../../SceneInfo';
import CustomLoader from '../../../../loader/CustomLoader';
import SceneCommandStep from '../../../SceneCommandStep';

export default class PreRenderCommand extends SimpleCommand {

	private content: Object;

	constructor() {
		super();
	}

	public execute(content: Object): void {
		this.content = content;

		// 场景展示前事件
		SceneManager.getInstance().dispatchEvent(
			new SceneManagerEvent(SceneManagerEvent.SCENE_PRERENDER, {}));

		var info: SceneInfo = content["SceneInfo"] as SceneInfo;
		var loader: CustomLoader = content["Loader"];
		info.scene.executeCommands(SceneCommandStep.PreRender, { "loadingSprite": loader.loadingSprite }
			, this.onExecutedCommand, this);
	}

	private onExecutedCommand(success: boolean): void {
		var info: SceneInfo = this.content["SceneInfo"] as SceneInfo;

		this.succeed(this.content);
		this.content = null;
	}
}