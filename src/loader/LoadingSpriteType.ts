import ILoadingSprite from './loadingsprite/ILoadingSprite';
import CustomLoader from './CustomLoader';
import FullScreenLoadingSprite from './loadingsprite/FullScreenLoadingSprite';

/**
 * @author qianjiuquan
 */
export default class LoadingSpriteType {

    /**
     * 不显示下载提示
     */
    public static readonly NONE: number = 0;

    /**
     * 全屏方式
     */
    public static readonly FULL_SCREEN: number = 1;

    /**
     * 战斗专用LoadingSprite
     */
    public static readonly BATTLE: number = 2;

    constructor() {
    }

    /**
     * 获得加载提示框
     * */
    public static getLoadingSprite(type: number, loader: CustomLoader): ILoadingSprite {
        var loadingSprite: ILoadingSprite = null;
        switch (type) {
            case LoadingSpriteType.NONE:
                break;
            case LoadingSpriteType.FULL_SCREEN:
                loadingSprite = new FullScreenLoadingSprite();
                break;
        }
        return loadingSprite;
    }
}