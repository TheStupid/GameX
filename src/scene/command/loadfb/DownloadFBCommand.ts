import DownloadSceneCommand from "../loadscene/DownloadSceneCommand";
import SceneInfo from '../../SceneInfo';

export default class DownloadFBCommand extends DownloadSceneCommand {
	private userName: string;

	constructor() {
		super();
	}

	protected getSceneDesc(sceneName: string): void {
		var info: SceneInfo = this._content["SceneInfo"] as SceneInfo;
		this.onGetSceneDesc("正在进入" + info.sceneDesc + "……");
	}
}