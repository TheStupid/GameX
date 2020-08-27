import SimpleCommand from '../../../util/command/SimpleCommand';
import SceneInfo from '../../SceneInfo';
import SceneManager from '../../SceneManager';
import SceneManagerEvent from '../../SceneManagerEvent';
import ICommand from '../../../util/command/ICommand';

export default class LoadSceneSuccCommand extends SimpleCommand implements ICommand {
	constructor() {
		super();
	}

	public execute(content: Object): void {
		var info: SceneInfo = content["SceneInfo"] as SceneInfo;
		var params = { "SceneInfo": info };

		info.scene.handleInited();
		SceneManager.getInstance().dispatchEvent(new SceneManagerEvent(SceneManagerEvent.SCENE_REMOVE_LOADER, params));
		SceneManager.getInstance().dispatchEvent(new SceneManagerEvent(SceneManagerEvent.SCENE_INITED, params));
		this.succeed(content);
	}
}