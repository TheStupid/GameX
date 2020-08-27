import Event from '../egret/events/Event';

export default class SceneManagerEvent extends Event {

	/**
	 * 准备加载场景时触发
	 * @param SceneInfo:SceneInfo 
	 */
	public static readonly ON_LOADING_SCENE: string = "onLoadingScene";

	/**
	 * 场景准备显示前事件，此事件响应函数中可增加Render及以后阶段的Command，在Scene.onJoinRoom之前
	 */
	public static readonly SCENE_PRERENDER: string = "onScenePreRender";

	/**
	 * 场景显示时事件，在Scene.onJoinRoom之后
	 */
	public static readonly SCENE_RENDER: string = "onSceneRender";

	/**
	 * 场景初始化完成，移除loader事件 
	 */
	public static readonly SCENE_REMOVE_LOADER: string = "onSceneRemoveLoader";

	/**
	 * 场景初始化完成，此事件后开始场景开启交互
	 */
	public static readonly SCENE_INITED: string = "onSceneInited";

	/**
	 * 场景构造完成 
	 */
	public static readonly SCENE_CONSTRUCTED: string = "onSceneConstructed";

	/**
	 * 场景开启交互完成，此事件后进行任务的场景初始化交互
	 */
	public static readonly SCENE_OPENED: string = "onSceneOpened";

	/**
	 * 任务的场景初始化交互完成，在此事件后才开始刷怪
	 */
	public static readonly TASK_SCENE_INITED: string = "onTaskSceneInited";

	/**
	 * 场景卸载前
	 */
	public static readonly UNLOAD_SCENE: string = "onUnloadScene";

	/**
	 * 场景卸载完成 
	 */
	public static readonly DISPOSED_SCENE: string = "onDisposedScene";

	/**
	 * 游戏初始化完成
	 */
	public static readonly GAME_INITED: string = "onGameInited";

	/**
	 * 已经在该场景 
	 */
	public static readonly ALREADY_IN_SCENE: string = "alreadyInScene";

	/**
	 * 游戏结束 (在unload scene 后面抛出)
	 * @param.gameKey 游戏标识
	 * @param.highestScore 游戏过程中所获得的最高分数
	 * @param.highestLevelPassed 游戏过程中通过的最高关卡数
	 */
	public static readonly GAME_OVER: string = "onGameOver";

	/**
	 * 卸载游戏完成
	 */
	public static readonly UNLOAD_GAME: string = "onUnloadGame";

	/**
	 * 卸载游戏成功，比UNLOAD_GAME要晚
	 */
	public static readonly UNLOAD_GAME_SUCC = "onUnloadGameSucc";

	public static readonly SUSPEND_STATE_CHANGED: string = "SuspendStateChanged";

	public constructor(type: string, private _params?: Object) {
		super(type);
	}

	public get params(): Object {
		return this._params;
	}
}