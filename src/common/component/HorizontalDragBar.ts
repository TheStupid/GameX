import Sprite = Laya.Sprite;
import UIComponent = Laya.UIComponent;
import Event = Laya.Event;
import Handler = Laya.Handler;

/**
 * 拉动条
 */
export default class HorizontalDragBar extends UIComponent {
    private _left: number = 0;
    private _barWidth: number = 0;
    private _right:number = 0;
    private _value: number = 0;

    public onValueChange:Handler = null;

    private _mcBottom:Sprite = null;
    private _workable:boolean = false;

    constructor() {
        super();
        this.once(Laya.Event.ADDED, this, () => {
            this.init();
            this.addListeners();
        });
    }

    private addListeners(): void {
        this.once(Event.REMOVED, this, this.onRemoved);
    }

    private onRemoved(e: Event): void {
        this.dispose();
    }

    init(): void {
        this._mcBottom = this.getChildByName("mcBottom") as Sprite;
        this._left = 0;
        this._barWidth = this._mcBottom.width;
        this._right = this._left + this._barWidth;

        let btnBuoy: Sprite = this.getChildByName("btnBuoy") as Sprite;
        btnBuoy.on(Event.MOUSE_DOWN, this, this.onStartDrag);

        this._mcBottom.on(Event.CLICK,this,this.onClickBottom);
    }

    private onClickBottom(e:Event):void{
        let pos:number = this._mcBottom.mouseX;
        this.setBuoyPos(pos);
    }

    private setBuoyPos(pos:number):void{
        if(!this._workable){
            return;
        }

        this.value = pos / this._barWidth;
    }

    private onStartDrag(e: Event): void {
        this.setBuoyPos(this._mcBottom.mouseX);

        Laya.stage.on(Event.MOUSE_MOVE, this, this.onMouseMove);
        Laya.stage.on(Event.MOUSE_UP, this, this.onMouseUp);
    }

    private onMouseUp(e: Event): void {
        Laya.stage.off(Event.MOUSE_MOVE, this, this.onMouseMove);
        Laya.stage.off(Event.MOUSE_UP, this, this.onMouseUp);
    }

    private onMouseMove(e: Event): void {
        this.setBuoyPos(this._mcBottom.mouseX);
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
            this.refreshView();
            this.onValueChange && this.onValueChange.run();
        }
    }

    private refreshView(): void {
        let mcBar: Sprite = this.getChildByName("mcBar") as Sprite;
        mcBar.scaleX = this._value;

        let btnBuoy: Sprite = this.getChildByName("btnBuoy") as Sprite;
        btnBuoy.x = this._left + this._barWidth * this._value;
    }

    get workable(): boolean {
        return this._workable;
    }

    set workable(value: boolean) {
        this._workable = value;
    }

    dispose(): void {
        Laya.stage.off(Event.MOUSE_MOVE, this, this.onMouseMove);
        Laya.stage.off(Event.MOUSE_UP, this, this.onMouseUp);
        this._mcBottom.off(Event.CLICK,this,this.onClickBottom);

        let btnBuoy: Sprite = this.getChildByName("btnBuoy") as Sprite;
        btnBuoy.off(Event.MOUSE_DOWN, this, this.onStartDrag);
    }
}