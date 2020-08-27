import Image = Laya.Image;
import Sprite = Laya.Sprite;
import UIComponent = Laya.UIComponent;

/**
 * 自定义进度条
 * ligenhao
 */
export default class CustomProgressBar extends UIComponent {
    private readonly X_KEY: Array<string> = ["centerX", "x", "left", "right"];
    private readonly Y_KEY: Array<string> = ["centerY", "y", "top", "bottom"];
    private static readonly BAR_TYPES: number = 4;
    private _bar: Image = null;
    private _type: number = 0;
    private _value: number = 0;
    private _originalX: number;
    private _originalY: number;
    private _isHorizontal: boolean;
    private _buoy: Image = null;//这个浮标的pivot是居中的
    private _buoyOriginX: number;
    private _buoyOriginY: number;

    constructor() {
        super();
    }

    init(): void {
        this.initComponents();
        if (this._type == ProgressBarType.PUSH_BY_SELF
            || this._type == ProgressBarType.PUSH_BY_RECT) {
            this._originalX = this._bar.x - this._bar.width;
            this._originalY = this._bar.y + this._bar.height;
        }

        if (this._isHorizontal) {
            this._buoyOriginX = this.getBarX();
            this._buoyOriginY = this.getBarY();
            this.setBuoyY(this._bar.height / 2);
        }

        this.changeValue();
    }

    protected initComponents(): void {
        for (let i = 0; i < CustomProgressBar.BAR_TYPES; i++) {
            this._bar = this.getChildByName("bar_" + i) as Image;
            if (this._bar) {
                this._type = i;
                break;
            }
        }
        this._isHorizontal = this._bar.width > this._bar.height;
        let mask = new Sprite();
        if (this._type == ProgressBarType.PUSH_BY_SELF
            || this._type == ProgressBarType.CUT_BY_SELF) {
            mask.graphics = this._bar.graphics;
        } else {
            mask.graphics.drawRect(0, 0, this._bar.width, this._bar.height, "#000000");
        }
        this._bar.mask = mask;

        this._buoy = this.getChildByName("imgBuoy") as Image;
    }

    /**
     *当前的进度量。
     *<p><b>取值：</b>介于0和1之间。</p>
     */
    public get value(): number {
        return this._value;
    }

    public set value(num: number) {
        if (this._value != num) {
            num = num > 1 ? 1 : num < 0 ? 0 : num;
            this._value = num;
            this.changeValue();
        }
    }

    private changeValue(): void {
        if (this._type == ProgressBarType.PUSH_BY_SELF
            || this._type == ProgressBarType.PUSH_BY_RECT) {
            if (this._isHorizontal) {
                this._bar.x = this._originalX + this._bar.width * this._value;
                this._bar.mask.x = this._bar.width * (1 - this._value);
                this.setBuoyX(this._bar.width * (1 - this._value));
            } else {
                this._bar.y = this._originalY - this._bar.height * this._value;
                this._bar.mask.y = this._bar.height * (this._value - 1);
                this._buoy && (this._buoy.y = this._buoyOriginY + this._bar.mask.y);
            }
        } else {
            if (this._isHorizontal) {
                this._bar.mask.x = this._bar.width * (this._value - 1);
                this.setBuoyX(this._bar.width * this._value);
            } else {
                this._bar.mask.y = this._bar.height * (1 - this._value);
                this._buoy && (this._buoy.y = this._buoyOriginY - this._bar.mask.y);
            }
        }
    }

    private setBuoyX(offsetX: number): void {
        if (this._buoy == null) {
            return;
        }

        let newX: number = this._buoyOriginX + offsetX;
        for (let key of this.X_KEY) {
            if (!isNaN(this._bar[key])) {
                this._buoy[key] = newX;
                break;
            }
        }
    }

    private setBuoyY(offsetY: number): void {
        if (this._buoy == null) {
            return;
        }

        let newY: number = this._buoyOriginY + offsetY;
        for (let key of this.Y_KEY) {
            if (!isNaN(this._bar[key])) {
                this._buoy[key] = newY;
                break;
            }
        }
    }

    private getBarY(): number {
        if (!isNaN(this._bar.centerY)) {
            return this._bar.centerY - this._bar.height / 2;
        } else if (!isNaN(this._bar.top)) {
            return this._bar.top;
        } else if (!isNaN(this._bar.bottom)) {
            return this._bar.bottom - this._bar.width;
        } else {
            return this._bar.y;
        }
    }

    private getBarX(): number {
        if (!isNaN(this._bar.centerX)) {
            return this._bar.centerX - this._bar.width / 2;
        } else if (!isNaN(this._bar.left)) {
            return this._bar.left;
        } else if (!isNaN(this._bar.right)) {
            return this._bar.right - this._bar.width;
        } else {
            return this._bar.x;
        }
    }
}

const enum ProgressBarType {
    PUSH_BY_SELF,//从右往左，根据bar.graphics的图形做遮罩
    PUSH_BY_RECT,//从右往左，直接应用矩形遮罩。
    CUT_BY_SELF,//
    CUT_BY_RECT
}