import Dictionary from '../../util/Dictionary';
import TipsInfo from './TipsInfo';
import LayerManager from '../../loader/layer/LayerManager';
import NotifyQueue from '../notification/NotifyQueue';
import Rectangle = Laya.Rectangle;
import Sprite = Laya.Sprite;
import Point = Laya.Point;

export default class TipsManager {

    private static _instance: TipsManager;
    private _tipsTable: Dictionary<Sprite, TipsInfo | string>;
    /** 当前显示Tips的元件 */
    private _currentTarget: Sprite;

    private constructor() {
        this._tipsTable = new Dictionary();
    }

    public static getInstance(): TipsManager {
        if (TipsManager._instance == null) {
            TipsManager._instance = new TipsManager();
        }
        return TipsManager._instance;
    }

    /**
     * 添加Tips
     * @param target 目标
     * @param content 内容（文字或元件）
     * @param title 标题
     */
    public addTips(target: Sprite, content: string | Sprite, title: string = null): void {
        if (this._tipsTable.containsKey(target)) {
            return;
        }
        this._tipsTable.setValue(target, new TipsInfo(content, title));
        target.on(Laya.Event.CLICK, this, this.onClickTarget);
        target.on(Laya.Event.REMOVED, this, this.onTargetRemoved, [target]);
    }

    public replaceTips(target: Sprite, content: string | Sprite, title: string = null):void{
        this.removeTips(target);
        this.addTips(target,content,title);
    }

    /**
     * 添加飘字提示
     * @param target 目标
     * @param content 内容
     */
    public addNotifyTips(target: Sprite, content: string): void {
        if (this._tipsTable.containsKey(target)) {
            return;
        }
        this._tipsTable.setValue(target, content);
        target.on(Laya.Event.CLICK, this, this.onClickTarget);
        target.on(Laya.Event.REMOVED, this, this.onTargetRemoved, [target]);
    }

    public addComplexTips(target:Sprite,title:string,content:string):void{
        this.addTips(target,content,title);
    }

    public addLongPressTips(target: Sprite, content: string | Sprite, title: string = null): void {
        if (this._tipsTable.containsKey(target)) {
            return;
        }
        this._tipsTable.setValue(target, new TipsInfo(content, title));
        target.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDownTarget);
        target.on(Laya.Event.REMOVED, this, this.onTargetRemoved, [target]);
    }

    private onMouseDownTarget(evt:Laya.Event):void {
        Laya.timer.frameOnce(25, this, this.onMouseDown, [evt]);
        Laya.stage.on(Laya.Event.MOUSE_UP, this, onMouseUp);

        function onMouseUp():void {
            evt.stopPropagation();
            Laya.stage.off(Laya.Event.MOUSE_UP, this, onMouseUp);
            Laya.timer.clear(this, this.onMouseDown);
        }
    }

    private onMouseDown(evt:Laya.Event):void {
        evt.stopPropagation();
        var target = evt.target;
        if (!this._tipsTable.containsKey(target)) {
            return;
        }
        var info = this._tipsTable.getValue(target);
        if (info instanceof TipsInfo) {
            if (this._currentTarget != null) {
                if (this._currentTarget == target) {
                    Laya.Tween.to(info.tips, { scaleX: 0, scaleY: 0 }, 300, Laya.Ease.strongOut, Laya.Handler.create(this, (tips: Laya.Sprite) => {
                        this.removeCurrentTips();
                    }, [info.tips]));
                    return;
                } else {
                    this.removeCurrentTips();
                }
                this._currentTarget = null;
            }
            this._currentTarget = target;
            var container: Sprite;
            if (LayerManager.getCurrentLayer() == LayerManager.BASE_LAYER) {
                container = LayerManager.getBaseTips();
            } else {
                container = LayerManager.getFightingTips();
            }
            var point = this.getPoint(target, info.tips);
            info.tips.pos(point.x, point.y);
            container.addChild(info.tips);
            info.tips.scale(info.scaleX, info.scaleY);
            Laya.Tween.from(info.tips, { scaleX: 0, scaleY: 0 }, 300, Laya.Ease.backOut);
            Laya.stage.on(Laya.Event.CLICK, this, this.onClickStage);
        } else {
            NotifyQueue.add(info);
        }
    }
    /**
     * 移除Tips
     * @param target 目标
     */
    public removeTips(target: Sprite): void {
        if (!this._tipsTable.containsKey(target)) {
            return;
        }
        var info = this._tipsTable.getValue(target);
        if (info instanceof TipsInfo) {
            var tips = info.tips;
            if (this._currentTarget == target) {
                this.removeCurrentTips();
            }
            if (tips["dispose"] != null) {
                tips["dispose"]();
            }
        }
        target.off(Laya.Event.CLICK, this, this.onClickTarget);
        target.off(Laya.Event.REMOVED, this, this.onTargetRemoved);

        target.off(Laya.Event.MOUSE_DOWN, this, this.onMouseDownTarget);

        this._tipsTable.remove(target);
    }

    /**
     * 移除当前弹出的Tips
     */
    public removeCurrentTips(): void {
        if (this._currentTarget != null) {
            var info = this._tipsTable.getValue(this._currentTarget);
            if (info instanceof TipsInfo) {
                var tips = info.tips;
                tips.removeSelf();
                this._currentTarget = null;
                Laya.stage.off(Laya.Event.CLICK, this, this.onClickStage);
            }
        }
    }

    private onClickTarget(evt: Laya.Event): void {
        evt.stopPropagation();
        var target = evt.currentTarget;
        if (!this._tipsTable.containsKey(target)) {
            return;
        }
        var info = this._tipsTable.getValue(target);
        if (info instanceof TipsInfo) {
            if (this._currentTarget != null) {
                if (this._currentTarget == target) {
                    Laya.Tween.to(info.tips, { scaleX: 0, scaleY: 0 }, 300, Laya.Ease.strongOut, Laya.Handler.create(this, (tips: Laya.Sprite) => {
                        this.removeCurrentTips();
                    }, [info.tips]));
                    return;
                } else {
                    this.removeCurrentTips();
                }
                this._currentTarget = null;
            }
            this._currentTarget = target;
            var container: Sprite;
            if (LayerManager.getCurrentLayer() == LayerManager.BASE_LAYER) {
                container = LayerManager.getBaseTips();
            } else {
                container = LayerManager.getFightingTips();
            }
            var point = this.getPoint(target, info.tips);
            info.tips.pos(point.x, point.y);
            container.addChild(info.tips);
            info.tips.scale(info.scaleX, info.scaleY);
            Laya.Tween.from(info.tips, { scaleX: 0, scaleY: 0 }, 300, Laya.Ease.backOut);
            Laya.stage.on(Laya.Event.CLICK, this, this.onClickStage);
        } else {
            NotifyQueue.add(info);
        }
    }

    private onTargetRemoved(target: Sprite): void {
        this.removeTips(target);
    }

    private getPoint(target: Sprite, tips: Sprite): Point {
        var rect1: Rectangle = target.getBounds();
        var rect2: Rectangle = tips.getSelfBounds();
        var point = (target.parent as Sprite).localToGlobal(new Point(rect1.right, rect1.y));//右上角的全局坐标
        if (point.x - rect1.width > Laya.stage.width / 2//目标在舞台右侧
            || point.x + rect2.width > Laya.stage.width - 5) {//tips超过舞台右侧
            tips.pivotX = rect2.width;
            point.x -= rect1.width;
        } else {
            tips.pivotX = 0;
        }
        if (point.y + rect2.height > Laya.stage.height - 5) {//tips超过舞台底部
            point.y = Laya.stage.height - 5 - rect2.height;
        }
        point.y += rect2.y;
        return point;
    }

    private onClickStage(evt: Laya.Event): void {
        evt.stopPropagation();
        this.removeCurrentTips();
    }
}