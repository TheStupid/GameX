import Sprite = Laya.Sprite;
import Tween = Laya.Tween;
import Handler = Laya.Handler;
import Event = Laya.Event;

export default class HShrinkableSprite {
    private _view: Sprite = null;
    private _mouseEnabledBefore: boolean = false;
    private _isPlaying: boolean = false;
    private _isShrink: boolean = false;
    private _ease: Function = Laya.Ease.backIn;

    constructor(view: Sprite, ease?: Function) {
        this._view = view;
        if (ease != null) {
            this._ease = ease;
        }

        this.shrink(false);
        this._view.once(Event.REMOVED, this, () => {
            Tween.clearTween(this);
        });
    }

    public stretch(withMovie: boolean = true): void {
        if (this._isPlaying || !this.isShrink()) {
            return;
        }
        this._isShrink = false;
        if (withMovie) {
            this.tween({scaleX: 1, alpha: 1});
        } else {
            this._view.scaleX = 1;
            this._view.alpha = 1;
        }
    }

    public shrink(withMovie: boolean = true): void {
        if (this._isPlaying || this.isShrink()) {
            return;
        }
        this._isShrink = true;
        if (withMovie) {
            this.tween({scaleX: 0, alpha: 0});
        } else {
            this._view.scaleX = 0;
            this._view.alpha = 0;
        }
    }

    private tween(props: object): void {
        this._mouseEnabledBefore = this._view.mouseEnabled;
        this._view.mouseEnabled = false;
        this._isPlaying = true;
        Tween.to(this._view, props, 200, this._ease, Handler.create(this, () => {
            this._view.mouseEnabled = this._mouseEnabledBefore;
            this._isPlaying = false;
        }));
    }

    public isShrink(): boolean {
        return this._isShrink;
    }
}