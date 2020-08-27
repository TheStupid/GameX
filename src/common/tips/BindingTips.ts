import Sprite = Laya.Sprite;
import Event = Laya.Event;

export default class BindingTips {
    private _responder: Sprite = null;
    private _tips: Sprite = null;
    private _hideWhenClickStage: boolean = true;

    constructor(responder: Sprite, tips: Sprite, hideWhenClickStage: boolean = true) {
        this._responder = responder;
        this._tips = tips;
        this._hideWhenClickStage = hideWhenClickStage;

        this._responder.on(Event.CLICK, this, this.onClickResponder);
        this._responder.once(Event.REMOVED, this, this.dispose);

        this.hideTips();
    }

    private onClickResponder(e: Event): void {
        this.switchTipsVisible();
    }

    private switchTipsVisible(): void {
        this._tips.visible = !this._tips.visible;

        if (this._tips.visible && this._hideWhenClickStage) {
            Laya.timer.frameOnce(1, this, () => {
                Laya.stage.once(Event.CLICK, this, this.hideTips);
            });
        }
    }

    private hideTips(): void {
        if (this._tips) {
            this._tips.visible = false;
        }
    }

    private dispose(): void {
        Laya.stage.off(Event.CLICK, this, this.hideTips);
        this._responder.off(Event.CLICK, this, this.onClickResponder);
        this._responder = null;
        this._tips = null;
    }
}