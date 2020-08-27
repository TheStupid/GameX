import SimpleCommand from '../../../util/command/SimpleCommand';
import SceneManager from '../../SceneManager';
import SceneBase from '../../SceneBase';
import SceneInfo from '../../SceneInfo';
import SceneCommandStep from '../../SceneCommandStep';
import Loading from '../../../common/Loading';

export default class LeaveSceneValidateCommand extends SimpleCommand {
	constructor() {
		super();
	}

	public execute(content: Object): void {
		// 未加载过场景，不需要验证离开
		if (SceneManager.getInstance().loadedSceneInfo == null) {
			this.succeed(content);
			return;
		}

		var scene: SceneBase = SceneManager.getInstance().loadedSceneInfo.scene;
		if (scene == null) {
			this.succeed(content);
			return;
		}

		//console.log("scene.needValidateLeave" + scene.needValidateLeave);
		// 当前场景不需要验证离开
		if (!scene.needValidateLeave) {
			this.succeed(content);
			return;
		}

		var targetSceneInfo: SceneInfo = content["SceneInfo"] as SceneInfo;
		// 验证是否可以离开当前场景到目标场景
		scene.executeCommands(SceneCommandStep.LeaveScene, { "targetScene": targetSceneInfo }
			, function (leavable: boolean): void {
				//console.log("onValidateLeavable" + leavable);
				if (leavable) {
					this.succeed(content);
				} else {
					Loading.close();
					this.fail(content);
				}
			}, this);
	}
}

