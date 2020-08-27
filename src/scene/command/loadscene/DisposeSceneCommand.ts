import SimpleCommand from '../../../util/command/SimpleCommand';
import ICommand from '../../../util/command/ICommand';
import SceneManager from '../../SceneManager';
import SceneBase from '../../SceneBase';
import SceneManagerEvent from '../../SceneManagerEvent';
import DisplayUtil from '../../../util/DisplayUtil';

export default class DisposeSceneCommand extends SimpleCommand implements ICommand {

	constructor() {
		super();
	}

	public execute(content: Object): void {
		// 清除Player Manager
		//console.log("--------DisposeScene: ");
		if (SceneManager.getInstance().loadedSceneInfo != null) {
			if (SceneManager.getInstance().loadedSceneInfo["scene"] != null) {
				var scene: SceneBase = SceneManager.getInstance().loadedSceneInfo["scene"] as SceneBase;

				SceneManager.getInstance().dispatchEvent(new SceneManagerEvent(SceneManagerEvent.UNLOAD_SCENE));

				scene.handleDispose();

				DisplayUtil.stopAndRemove(scene.scrollPanel);
				DisplayUtil.stopAndRemove(scene.topGround);

				SceneManager.getInstance().loadedSceneInfo.dispose();

				SceneManager.getInstance().dispatchEvent(new SceneManagerEvent(SceneManagerEvent.DISPOSED_SCENE));
			}
		}

		this.succeed(content);
	}
}