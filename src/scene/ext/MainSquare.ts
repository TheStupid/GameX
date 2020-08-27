import SceneBase from '../SceneBase';
import CallbackUtil from "../../common/callback/CallbackUtil";
import Event = Laya.Event;
import Button = Laya.Button;

export default class MainSquare extends SceneBase {
    private static readonly ACT_BTN_NAME_PREFIX: string = "btnAct_";

    private _clickMap: object = {};

    protected onJoinRoom(): void {
        super.onJoinRoom();
        this.addClickListener();
    }

    addClickListener(): void {
        this.container.on(Event.CLICK, this, this.onClickScene);
        this.backGround.on(Event.CLICK, this, this.onClickScene);
    }

    private onClickScene(e: Event): void {
        if (!(e.target instanceof Button)) {
            return;
        }
        let btn: Button = e.target as Button;
        if (!btn.enabled) {
            return;
        }
        let btnName: string = e.target.name;
        if (this._clickMap.hasOwnProperty(btnName)) {
            CallbackUtil.apply(this._clickMap[btnName]);
        }
    }

    regClickFunc(btnName, func: Function): void {
        this._clickMap[btnName] = func;
    }
}