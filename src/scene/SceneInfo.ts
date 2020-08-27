import RoomInfo from "./RoomInfo";
import SceneBase from './SceneBase';

export default class SceneInfo extends RoomInfo {

	/** 出生地名称 */
	public locationName: string;

	// /** 场景句柄 */
	public scene: SceneBase;

    /**
     *是否在农场
     */
    public inFarm:boolean = false;
    /**
     *是否在自己的农场
     */
    public inMyFarm:boolean = false;

	/**
	 * 场景名
	 */
	public sceneName: string;
	/**
	 * 场景描述
	 */
	public sceneDesc: string;

	/**
	 * 场景属性
	 */
	public properties: Object = {};

	/**
	 * 是否副本场景
	 */
	public isFB: boolean = false;

	public leaveSceneNeedValidate: boolean = false;

	public constructor() {
		super();
	}

	public dispose(): void {
		this.properties = null;
		this.scene = null;
	}
}