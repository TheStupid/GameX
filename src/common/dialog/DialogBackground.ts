import Dictionary from '../../util/Dictionary';
import Loader from '../../loader/Loader';
import CommonRes from "../../config/CommonRes";
import Sprite = Laya.Sprite;

export default class DialogBackground {

    private static _instance: DialogBackground;
    private _backgroundMap: Dictionary<string, Sprite>;

    private readonly GRAY_KEY: string = "gray";
    private readonly CLARITY_KEY: string = "clarity";

    public constructor() {
        this._backgroundMap = new Dictionary();
    }

    public static getInstance(): DialogBackground {
        if (DialogBackground._instance == null) {
            DialogBackground._instance = new DialogBackground();
        }
        return DialogBackground._instance;
    }

    public getBackground(layerName: string, isGrayBackground: boolean): Sprite {
        let key: string = isGrayBackground ? this.GRAY_KEY : this.CLARITY_KEY;
        let mapKey: string = layerName + "_" + key;
        let sp = this._backgroundMap.getValue(mapKey) as Sprite;
        if (sp == null) {
            sp = this.newBackground(isGrayBackground);
            this._backgroundMap.setValue(mapKey, sp);
        }
        this.removeBackground(layerName, isGrayBackground);
        return sp;
    }

    public removeBackground(layerName: string, isGrayBackground: boolean): void {
        if (isGrayBackground) {
            this.removeSprite(this._backgroundMap.getValue(layerName + "_" + this.GRAY_KEY));
        } else {
            this.removeSprite(this._backgroundMap.getValue(layerName + "_" + this.CLARITY_KEY));
        }
    }

    private newBackground(isGrayBackground: boolean): Sprite {
        let background: Sprite = new Sprite();
        background.texture = Loader.getRes(CommonRes.URL_IMG_BLACK);
        background.alpha = isGrayBackground ? 0.5 : 0;
        return background;
    }

    private removeSprite(sp: Sprite): void {
        if (sp) {
            sp.removeSelf();
        }
    }

    public dispose(): void {
        this._backgroundMap.clear();
    }
}