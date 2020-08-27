import UIComponent = Laya.UIComponent;
import ViewStack = Laya.ViewStack;
import Sprite = Laya.Sprite;
import Handler = Laya.Handler;

/**
 * 自定义下拉列表
 * ligenhao
 */
export default class CustomComboBox extends UIComponent {

    public selectHandler: Handler = null;
    private _items: Sprite[] = null;
    private _selectedIndex: number = -1;
    private _selector: Sprite;
    private _finger: Sprite;
    private _arrow: Sprite;
    private _background: Sprite;
    private _isSelecting: boolean = false;
    private _isShowing: boolean = false;

    constructor() {
        super();
        this.once(Laya.Event.ADDED, this, () => {
            this.initComponents();
            this.addListeners();
        });
    }

    public get selectedIndex(): number {
        return this._selectedIndex;
    }

    public set selectedIndex(value: number) {
        this.changeSelectedIndex(value, true);
    }

    public reset(): void {
        this.changeSelectedIndex(0, false);
    }

    private changeSelectedIndex(value: number, withRunHandler: boolean): void {
        if (this._selectedIndex != value) {
            this._selectedIndex = value;
            if (this._selector instanceof ViewStack) {
                this._selector.selectedIndex = value;
                this.refreshSelector();
            }
            if (this._finger && value != -1) {
                let item = this._items[value];
                this._finger.pos(item.x, item.y);
                // this._finger.size(item.width, item.height);
            }

            if (withRunHandler) {
                this.selectHandler && this.selectHandler.runWith(this._selectedIndex);
            }
        }
    }

    protected initComponents(): void {
        this.mouseThrough = true;
        this._items = [];
        let i = 0;
        while (true) {
            let item = this.getChildByName("item" + i) as Sprite;
            if (item == null) {
                break;
            }
            this._items.push(item);
            i++;
        }
        this._selector = this.getChildByName("selector") as ViewStack;
        this._finger = this.getChildByName("finger") as Sprite;
        this._arrow = this._selector.getChildByName("arrow") as Sprite;
        this._background = this.getChildByName("background") as Sprite;
        if (this._finger) {
            this._finger.mouseThrough = true;
        }
        if (this._background) {
            this._background.mouseEnabled = true;
        }
        this.showSelection(false);
    }

    protected addListeners(): void {
        this.on(Laya.Event.REMOVED, this, this.removeListeners);
        for (var item of this._items) {
            item.mouseThrough = false;
            item.on(Laya.Event.CLICK, this, this.itemClick);
        }

        this._selector.on(Laya.Event.CLICK, this, this.selectorClick);
        Laya.stage.on(Laya.Event.CLICK, this, this.onClickStage);
    }

    protected removeListeners(): void {
        this.off(Laya.Event.REMOVED, this, this.removeListeners);
        for (let item of this._items) {
            item.off(Laya.Event.CLICK, this, this.itemClick);
        }
        this._selector.off(Laya.Event.CLICK, this, this.selectorClick);
        Laya.stage.off(Laya.Event.CLICK, this, this.onClickStage);
    }

    private itemClick(evt: Laya.Event): void {
        evt.stopPropagation();
        this.selectedIndex = parseInt(evt.currentTarget.name.substr("item".length));
        this.showSelection(this._isSelecting = false);
    }

    private selectorClick(evt: Laya.Event): void {
        evt.stopPropagation();
        this.showSelection(this._isSelecting = !this._isSelecting);
    }

    private onClickStage(evt: Laya.Event): void {
        this.showSelection(this._isSelecting = false);
    }

    refreshSelector(): void {
        if (this._selector instanceof ViewStack && this._selector.selection instanceof ViewStack) {
            (this._selector.selection as ViewStack).selectedIndex = this._isShowing ? 1 : 0;
        }
    }

    private showSelection(isShow: boolean): void {
        this._isShowing = isShow;

        this.refreshSelector();

        for (let item of this._items) {
            item.visible = isShow;

            if (isShow && (item instanceof ViewStack)) {
                let itemIndex: number = Number(item.name.substr("item".length));
                (item as ViewStack).selectedIndex = (this._selectedIndex == itemIndex) ? 1 : 0;
            }
        }
        if (this._finger) {
            this._finger.visible = isShow && this._selectedIndex != -1;
        }
        if (this._arrow) {
            if (this._arrow instanceof ViewStack) {
                (this._arrow as ViewStack).selectedIndex = isShow ? 1 : 0;
            } else {
                this._arrow.scaleY = isShow ? -1 : 1;
            }
        }
        if (this._background) {
            this._background.visible = isShow;
        }
    }
}