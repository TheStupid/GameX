import SimpleCommand from "../../../util/command/SimpleCommand";
import ICommand from '../../../util/command/ICommand';
import SceneInfo from '../../SceneInfo';
import CustomLoader from '../../../loader/CustomLoader';
import CustomLoaderEvent from '../../../loader/CustomLoaderEvent';
import NewDialog from '../../../common/dialog/NewDialog';
import SceneConfig from '../../SceneConfig';
import LoadingSpriteType from '../../../loader/LoadingSpriteType';

export default class DownloadSceneCommand extends SimpleCommand implements ICommand {

	//~ fields ------------------------------------------------------------

	protected _content: Object;

	//~ public methods ----------------------------------------------------

	constructor() {
		super();
	}

	public execute(content: Object): void {
		this._content = content;

		var info: SceneInfo = content["SceneInfo"] as SceneInfo;
		this.getSceneDesc(info.sceneName);
	}

	protected getSceneDesc(sceneName: string): void {
		var desc: string = SceneConfig.getConfig(sceneName).description;
		var info: SceneInfo = this._content["SceneInfo"] as SceneInfo;
		info.sceneDesc = desc;
		this.onGetSceneDesc("正在进入" + desc + "……");
	}

	protected onGetSceneDesc(processMsg: string): void {
		var info: SceneInfo = this._content["SceneInfo"] as SceneInfo;

		var loader: CustomLoader = new CustomLoader();
		loader.addEventListener(CustomLoaderEvent.onLoadCompleted, this.onLoadScene, this);
		loader.addEventListener(CustomLoaderEvent.onError, this.onLoadError, this);

		this._content["Loader"] = loader;
		let sceneConfig = SceneConfig.getConfig(info.sceneName);
		let urls = sceneConfig.resUrls.slice();
		urls.push(sceneConfig.dataUrl);
		loader.load(urls, LoadingSpriteType.FULL_SCREEN, false, processMsg);
	}

	//~ private methods ---------------------------------------------------

	private onLoadError(e: CustomLoaderEvent): void {
		var loader = e.target as CustomLoader;

		loader.removeEventListener(CustomLoaderEvent.onLoadCompleted, this.onLoadScene, this);
		loader.removeEventListener(CustomLoaderEvent.onError, this.onLoadError, this);

		NewDialog.showFailMessage("加载失败，请重试。");

		loader.close();
		this.fail(this._content);

		this._content = null;
	}

	private onLoadScene(e: CustomLoaderEvent): void {
		//console.log("-----onLoadScene");

		var loader = e.target as CustomLoader;

		loader.removeEventListener(CustomLoaderEvent.onLoadCompleted, this.onLoadScene, this);
		loader.removeEventListener(CustomLoaderEvent.onError, this.onLoadError, this);

		this.succeed(this._content);

		this._content = null;
	}
}