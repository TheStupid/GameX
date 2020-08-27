import EventBinder from '../../util/common/EventBinder';
import List = Laya.List;
import Node = Laya.Node;

/**
 * 自定义列表
 * 用法：把脚本文件拖放到List的runtime
 * ligenhao
 */
export default class CustomList extends List {

    private _tweenSign: boolean = false;
    private _binder: EventBinder;

    protected _childChanged(child?: Node): void {
        super._childChanged(child);
        if (!this._binder && this.getChildByName("scrollBar")) {
            this._binder = new EventBinder(this);
            this._binder.bind(this.scrollBar, Laya.Event.END, () => {
                if (this._tweenSign) {
                    this._tweenSign = false;
                    return;
                }
                let line = Math.floor(this.scrollBar.value / this.scrollBar.scrollSize);//当前停留在第几行或第几列(0开始)
                let num = line * this.scrollBar.scrollSize +
                    (this.scrollBar.scrollSize - (this._isVertical ? this.spaceY : this.spaceX)) / 2;
                let index = line * (this._isVertical ? this.repeatX : this.repeatY);
                if (this.scrollBar.value > num) {//超过一半，去到下一行
                    index += (this._isVertical ? this.repeatX : this.repeatY);
                }
                this._tweenSign = true;
                this.tweenTo(index, 100);
            }, this);
        }
    }
}