import SimpleCommand from '../../../../util/command/SimpleCommand';
import SceneInfo from '../../../SceneInfo';
import LayerManager from '../../../../loader/layer/LayerManager';
import CustomLoader from '../../../../loader/CustomLoader';
import SceneCommandStep from '../../../SceneCommandStep';
import Loading from '../../../../common/Loading';
import SceneManager from '../../../SceneManager';
import SceneManagerEvent from '../../../SceneManagerEvent';

export default class RenderCommand extends SimpleCommand {

	private content: Object;

	constructor() {
		super();
	}

	public execute(content: Object): void {
		this.content = content;

		var info: SceneInfo = content["SceneInfo"] as SceneInfo;

		LayerManager.getBaseScene().addChild(info.scene.scrollPanel);
		LayerManager.getBaseScene().addChild(info.scene.topGround);
		LayerManager.switchLayer(LayerManager.BASE_LAYER);
		info.scene.handleJoinRoom();

		var loader: CustomLoader = content["Loader"];
		info.scene.executeCommands(SceneCommandStep.Render, { "loadingSprite": loader.loadingSprite }
			, this.onExecutedCommand, this);
		info.scene.executeSceneCommand();
	}

	private onExecutedCommand(success: boolean): void {
		var loader: CustomLoader = this.content["Loader"] as CustomLoader;
		loader.close();
		Loading.close();

		// 场景展示事件
		SceneManager.getInstance().dispatchEvent(
			new SceneManagerEvent(SceneManagerEvent.SCENE_RENDER, {}));

		this.succeed(this.content);
		this.content = null;
	}
}