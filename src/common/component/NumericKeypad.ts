import ClickHelper from '../helper/ClickHelper';
import Loader from '../../loader/Loader';
import Loading from '../Loading';
import DialogManager from '../dialog/DialogManager';
import IDispose from '../../interfaces/IDispose';
import {PanelEffect} from '../dialog/PanelEffect';
import {LayoutType} from '../LayoutType';
import {AlignType} from '../AlignType';
import Handler = Laya.Handler;
import Sprite = Laya.Sprite;
import Point = Laya.Point;
import View = Laya.View;
import Text = Laya.Text;
import Label = Laya.Label;
import Event = Laya.Event;
import CallbackUtil from '../callback/CallbackUtil';

/**
 * 数字键盘
 * @author ligenhao
 * @export
 * @class NumericKeypad
 * @extends {View}
 * @implements {IDispose}
 */
export default class NumericKeypad extends View implements IDispose {
    private static readonly URL_VIEW: string = "common/component/NumericKeypad.json";
    private static readonly URL_RES: string = "common/component/numerickeypad.atlas";
    private static readonly ZERO: string = "0";

    private _target: Text | Label;
    private _callback: Function;
    private _clickHelper: ClickHelper;
    private _layoutType: LayoutType;
    private _xOffset: number;
    private _yOffset: number;
    private _maxValue: number = 0;
    private _isOK: boolean = false;
    private _originText: string = "";

    public constructor(target: Text | Label, onKeypadClosed: Function, maxValue: number) {
        super();
        this._target = target;
        this._originText = this._target.text;
        this._callback = onKeypadClosed;
        this._maxValue = maxValue;
    }

    public dispose(): void {
        if (this._clickHelper) {
            this._clickHelper.dispose();
            this._clickHelper = null;
        }
    }

    /**
     * @author ligenhao
     * @param {LayoutType} [layoutType=LayoutType.SOUTH] 相对文本布局方向
     * @param {number} [xOffset=0] x轴偏移坐标
     * @param {number} [yOffset=0] y轴偏移坐标
     * @memberof NumericKeypad
     */
    public show(layoutType: LayoutType = LayoutType.SOUTH, xOffset: number = 0, yOffset: number = 0): void {
        this._layoutType = layoutType;
        this._xOffset = xOffset;
        this._yOffset = yOffset;
        Loading.show();
        Loader.load([NumericKeypad.URL_VIEW, NumericKeypad.URL_RES], Handler.create(this, this.initComponents));
    }

    private initComponents(): void {
        Loading.close();
        this.createView(Loader.getRes(NumericKeypad.URL_VIEW));
        let point = this.getPoint();
        DialogManager.instance.addDialog(this, AlignType.NONE, PanelEffect.NONE, false,
            point.x + this._xOffset, point.y + this._yOffset, true);
        this.addListeners();
    }

    private addListeners(): void {
        this._clickHelper = new ClickHelper(this);
        this._clickHelper.regRegexFunc("btnNum[0-9]", this.onClickNumber, this);
        this._clickHelper.regClickFunc("btnBack", this.onClickBack, this);
        this._clickHelper.regClickFunc("btnOK", this.onClickOk, this);
        this.once(Event.REMOVED, this, () => {
            this._isOK = true;
            if (!this._isOK) {
                this._target.text = this._originText;
            }
            CallbackUtil.apply(this._callback, [this._target.text]);
            this._callback = null;
        });
    }

    private onClickNumber(targetName: string): void {
        var num: string = targetName.substr("btnNum".length);
        let str: string = this._target.text;
        if (str != NumericKeypad.ZERO) {
            str += num;
        } else {
            str = num;
        }
        this.setValue(parseInt(str));
    }

    private onClickBack(): void {
        let str: string = this._target.text;
        if (str.length > 1) {
            str = str.substr(0, str.length - 1);
        } else {
            str = NumericKeypad.ZERO;
        }
        this.setValue(parseInt(str));
    }

    private setValue(newValue: number): void {
        newValue = Math.min(this._maxValue, newValue);
        this._target.text = newValue.toString();
    }

    private onClickOk(): void {
        this._isOK = true;
        DialogManager.instance.removeDialog(this);
    }

    private getPoint(): Point {
        var point = (this._target.parent as Sprite).localToGlobal(new Point(this._target.x, this._target.y));
        //左边
        if (this._layoutType == LayoutType.WEST || this._layoutType == LayoutType.NORTHWEST || this._layoutType == LayoutType.SOUTHWEST) {
            point.x -= this.width;
        }
        //右边
        if (this._layoutType == LayoutType.EAST || this._layoutType == LayoutType.NORTHEAST || this._layoutType == LayoutType.SOUTHEAST) {
            point.x += this._target.width;
        }
        if (this._layoutType == LayoutType.WEST || this._layoutType == LayoutType.EAST) {//左中或右中
            point.y -= (this.height - this._target.height) / 2;
        }
        //上边
        if (this._layoutType == LayoutType.NORTH || this._layoutType == LayoutType.NORTHWEST || this._layoutType == LayoutType.NORTHEAST) {
            point.y -= this.height;
        }
        //下边
        if (this._layoutType == LayoutType.SOUTH || this._layoutType == LayoutType.SOUTHWEST || this._layoutType == LayoutType.SOUTHEAST) {
            point.y += this._target.height;
        }
        if (this._layoutType == LayoutType.NORTH || this._layoutType == LayoutType.SOUTH) {//上中或下中
            point.x -= (this.width - this._target.width) / 2;
        }
        return point;
    }
}