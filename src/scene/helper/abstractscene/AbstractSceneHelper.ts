import IAbstractSceneHelper from './IAbstractSceneHelper';
import LayerManager from '../../../loader/layer/LayerManager';

export default class AbstractSceneHelper implements IAbstractSceneHelper {

	private static _instance: AbstractSceneHelper;

	public constructor() {
	}

	public static getInstance(): IAbstractSceneHelper {
		if (AbstractSceneHelper._instance == null) {
			AbstractSceneHelper._instance = new AbstractSceneHelper();
		}
		return AbstractSceneHelper._instance;
	}

	public getGridSize(): number {
		return 8;
	}

	public getSceneWidth(): number {
		return Laya.stage.width;
	}

	public getSceneHeight(): number {
		return Laya.stage.height;
	}

	public isScrolledMap(): boolean {
		return false;
	}
}