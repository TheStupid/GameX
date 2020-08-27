export default class SceneCommandStep {
	/**
	  * 场景展示前，在Scene.onJoinRoom之前
	  */
	public static readonly PreRender: number = 0;

	/**
	  * 场景展示完成，在Scene.onJoinRoom之后
	  */
	public static readonly Render: number = 1;

	/**
	  * 场景开启(刷怪前)
	  */
	public static readonly SceneOpen: number = 10;

	/**
	  * 任务开启时在SceneOpen后，刷怪前
	  */
	public static readonly TaskSceneInited: number = 11;
	/**
	  * 离开场景前
	  * 增加离开场景的处理命令时，会开启场景离开的验证开关needValidateLeave = true;
	  */
	public static readonly LeaveScene: number = 101;
}