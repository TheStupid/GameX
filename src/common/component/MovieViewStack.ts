import ViewStack = Laya.ViewStack;
import Event = laya.events.Event;

export default class MovieViewStack extends ViewStack {

   private _indexNow:number = 0;

    constructor() {
        super();
        this.once(Laya.Event.ADDED, this, () => {
            this.selectedIndex = 0;
            this.on(Event.REMOVED, this, this.onRemoved);
            Laya.timer.loop(1, this, this.loop);
        });
    }

    private loop():void {
        if ((++ this._indexNow) >= this.items.length) {
            this._indexNow = 0;
        }
        this.selectedIndex =  this._indexNow;
    }

    private onRemoved(evt:Event):void {
        this.off(Event.REMOVED, this, this.onRemoved);
        Laya.timer.clear(this, this.loop);
    }

}