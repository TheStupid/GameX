import SimpleCommand from '../../../util/command/SimpleCommand';
import ICommand from '../../../util/command/ICommand';
import SceneInfo from '../../SceneInfo';
import SceneManager from '../../SceneManager';
import SceneConfig from '../../SceneConfig';
import Loader from '../../../loader/Loader';

export default class InitDataCommand extends SimpleCommand implements ICommand {

	constructor() {
		super();
	}

	public execute(content: Object): void {
		var sceneInfo = content["SceneInfo"] as SceneInfo;
		var sceneConfig = SceneConfig.getConfig(sceneInfo.sceneName);
		sceneInfo.scene = new sceneConfig.classRef();
		sceneInfo.scene.createView(Loader.getRes(sceneConfig.dataUrl));
		//console.log("------InitDataCommand");
		SceneManager.getInstance().loadedSceneInfo = sceneInfo;

		this.succeed(content);
	}

}

