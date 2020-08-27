import Sprite = Laya.Sprite;
import ViewStack = Laya.ViewStack;
import Event = Laya.Event;
import Handler = Laya.Handler;
import Panel_Helper from "../panel/Panel_Helper";
import CallbackUtil from "../callback/CallbackUtil";

export default class TabHead {
    private static readonly MC_TAB_HEAD_NAME_PREFIX: string = "mcTabHead";
    private _tabHeadList: ViewStack[] = [];
    private _selectIndex: number = -1;
    private _verifyHandler: Handler = null;
    private _onTabChange: Handler = null;
    private _view: Sprite = null;

    constructor(view: Sprite) {
        this._view = view;
        this.init();
    }

    private init(): void {
        this.initTabs();
        this._view.once(Event.REMOVED, this, this.dispose);
    }

    private initTabs(): void {
        let numChildren: number = this._view.numChildren;
        for (let i: number = 0; i < numChildren; i++) {
            let child: Sprite = this._view.getChildAt(i) as Sprite;
            if (child.name.indexOf(TabHead.MC_TAB_HEAD_NAME_PREFIX) == 0 && child instanceof ViewStack) {
                let index: number = Panel_Helper.getNameIndex(child.name, TabHead.MC_TAB_HEAD_NAME_PREFIX);
                this._tabHeadList[index] = child;
                child.on(Event.CLICK, this, this.changeTab, [index]);
            }
        }

        if (this._selectIndex >= 0) {
            this.changeTab(this._selectIndex, true);
        }
    }

    private refresh(): void {
        let mcTabHead: ViewStack = null;
        for (let i: number = 0; i < this._tabHeadList.length; i++) {
            mcTabHead = this._tabHeadList[i];
            if (mcTabHead) {
                mcTabHead.selectedIndex = (i == this.selectIndex ? 1 : 0);
            }
        }
    }

    public changeTab(index: number, force?: boolean): void {
        if ((this._selectIndex == index) && !force) {
            return;
        }
        if (this._verifyHandler) {
            this._verifyHandler.runWith([index, () => {
                this.applyChange(index);
            }]);
        } else {
            this.applyChange(index);
        }
    }

    public changeTabWithoutCallback(index: number): void {
        this._selectIndex = index;
        this.refresh();
    }

    private applyChange(index: number): void {
        this._selectIndex = index;
        this.refresh();
        CallbackUtil.apply(this._onTabChange, [index]);
    }

    private dispose(): void {
        for (let i: number = 0; i < this._tabHeadList.length; i++) {
            if (this._tabHeadList[i]) {
                this._tabHeadList[i].off(Event.CLICK, this, this.changeTab);
            }
        }
        this._verifyHandler = null;
        this._onTabChange = null;
    }

    get selectIndex(): number {
        return this._selectIndex;
    }

    get verifyHandler(): Laya.Handler {
        return this._verifyHandler;
    }

    set verifyHandler(value: Laya.Handler) {
        this._verifyHandler = value;
    }

    get onTabChange(): Laya.Handler {
        return this._onTabChange;
    }

    set onTabChange(value: Laya.Handler) {
        this._onTabChange = value;
    }

    get totalTab(): number {
        return this._tabHeadList.length;
    }
}