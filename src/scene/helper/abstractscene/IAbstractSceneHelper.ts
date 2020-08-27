export default interface IAbstractSceneHelper {

	/**
	 * 获得地图栅格化大小
	 * virtual method
	 */
	getGridSize(): number;

	/**
	 * 获得场景宽度
	 * virtual method
	 */
	getSceneWidth(): number;

	/**
	 * 获得场景高度
	 * virtual method
	 */
	getSceneHeight(): number;

	/**
	 * 是否为滚动地图
	 * true=滚动，false=不滚动
	 */
	isScrolledMap(): boolean;
}