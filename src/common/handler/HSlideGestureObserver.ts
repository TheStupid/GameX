import Sprite = Laya.Sprite;
import Event = Laya.Event;
import Handler = Laya.Handler;
import CallbackUtil from "../callback/CallbackUtil";

export default class HSlideGestureObserver {
    private _affectDistance: number = 100;
    private _watchTarget: Sprite = null;
    private _isSliding: boolean = false;
    private _mouseStartX: number = 0;
    private _slideHandler: Function | Handler = null;

    constructor(watchTarget: Sprite = null, affectDistance: number = 100) {
        this._watchTarget = watchTarget || Laya.stage;
        this._affectDistance = affectDistance;
        this.init();
    }

    private init(): void {
        this._watchTarget.on(Event.MOUSE_DOWN, this, this.onStartSlide);
    }

    private onStartSlide(e: Event): void {
        this._isSliding = true;
        this._mouseStartX = this._watchTarget.mouseX;

        Laya.stage.on(Event.MOUSE_UP, this, this.onEndSlide);
    }

    private onEndSlide(e: Event): void {
        Laya.stage.off(Event.MOUSE_UP, this, this.onEndSlide);

        if (this._isSliding) {
            let mouseEndX: number = this._watchTarget.mouseX;
            let distance: number = mouseEndX - this._mouseStartX;
            if (distance > this._affectDistance) {
                this.onSlide(false);
            } else if (distance < -this._affectDistance) {
                this.onSlide(true);
            }
        }
        this._isSliding = false;
    }

    private onSlide(toLeft: boolean): void {
        CallbackUtil.apply(this._slideHandler, toLeft);
    }

    get slideHandler(): Function | Laya.Handler {
        return this._slideHandler;
    }

    set slideHandler(value: Function | Laya.Handler) {
        this._slideHandler = value;
    }

    dispose(): void {
        Laya.stage.off(Event.MOUSE_UP, this, this.onEndSlide);
        this._watchTarget.off(Event.MOUSE_DOWN, this, this.onStartSlide);
        this._slideHandler = null;
    }
}