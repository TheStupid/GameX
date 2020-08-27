import EventBinder from '../../util/common/EventBinder';
import DisplayUtil from '../../util/DisplayUtil';
import Button = Laya.Button;
import Tween = Laya.Tween;
import Handler = Laya.Handler;

/**
 * 自定义按钮
 * 用法：把脚本文件拖放到Button的runtime
 * ligenhao
 */
export default class CustomButton extends Button {

    public downStateScale: number = 0.9;
    private _originalScaleX: number;
    private _originalScaleY: number;
    private _isDown: boolean = false;

    public constructor(skin?: string, label?: string) {
        super(skin, label);
        this.once(Laya.Event.ADDED, this, () => {
            this._originalScaleX = this.scaleX;
            this._originalScaleY = this.scaleY;
            this.initComponents();
            this.addListeners();
        });
    }

    protected initComponents(): void {
        if (!((this.anchorX > 0 && this.anchorY > 0)
            || (this.pivotX > 0 && this.pivotY > 0))) {
            let pivotX:number = Math.ceil(this.width / 2);
            let pivotY:number = Math.ceil(this.height / 2);
            this.pivot(pivotX, pivotY);
            this.x = Math.round(this.x + pivotX);
            this.y = Math.round(this.y + pivotY);
        }
    }

    protected addListeners(): void {
        let binder: EventBinder = new EventBinder(this);
        binder.bind(this, Laya.Event.MOUSE_DOWN, (evt: Laya.Event) => {
            if (!this._isDown && this.enabled) {
                this._isDown = true;
                Tween.to(evt.target, {
                    scaleX: this.downStateScale * this._originalScaleX,
                    scaleY: this.downStateScale * this._originalScaleY
                }, 100);
                DisplayUtil.setBrightHalf(this);
            }
        }, this);
        let refresh = (evt: Laya.Event) => {
            if (this._isDown) {
                Tween.to(evt.target, {
                    scaleX: this._originalScaleX,
                    scaleY: this._originalScaleY
                }, 100, null, Handler.create(this, () => this._isDown = false));
                DisplayUtil.clearFilters(this);
            }
        };
        binder.bind(this, Laya.Event.MOUSE_UP, refresh, this);
        binder.bind(this, Laya.Event.MOUSE_OUT, refresh, this);
    }
}