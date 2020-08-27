import Sprite = laya.display.Sprite;
import Clip = laya.ui.Clip;
import Label = Laya.Label;
import Text = Laya.Text;
import Button = Laya.Button;
import ViewStack = Laya.ViewStack;
import TextArea = Laya.TextArea;
import Node = Laya.Node;
import DisplayUtil from "../../util/DisplayUtil";
import TipsManager from "../tips/TipsManager";
import StringUtil from "../../util/StringUtil";

export default class Panel_Helper {
    /**
     * 获得子原件。
     * @param container
     * @param num
     * @param preKey
     * @return
     */
    public static getChildClips(container: Sprite, num: number, preKey: string = "mcNum"): Clip[] {
        let clips: Clip[] = [];
        for (let i: number = 0; i < num; i++) {
            clips.push(container.getChildByName(preKey + i) as Clip);
        }
        return clips;
    }

    /**
     * @param container
     * @param num
     * @param preKey
     * @return
     */
    public static getChildSprites(container: Sprite, num: number, preKey: string): Sprite[] {
        let sprites: Sprite[] = [];
        for (let i: number = 0; i < num; i++) {
            sprites.push(container.getChildByName(preKey + i) as Sprite);
        }
        return sprites;
    }

    /**
     * 取一个字符串去掉前缀后的int值，举例getNameIndex("abcd1","abcd")则返回1，
     * @param name 源字符串
     * @param subString 前缀
     * @return
     */
    public static getNameIndex(name: string, subString: string): number {
        return parseInt(name.substr(subString.length));
    }

    public static setTextValue(container: Sprite, txtName: string, value: string | number, autoSelectSub: boolean = false): void {
        if (container == null) {
            return;
        }

        if (autoSelectSub && (container instanceof ViewStack)) {
            var mc: Sprite = container.selection as Sprite;
        } else {
            mc = container;
        }

        let txt: Label | Text = mc.getChildByName(txtName) as Label | Text | TextArea;
        if (txt) {
            txt.text = value.toString();
        }
    }

    public static setEnabled(target: Sprite, enabled: boolean, disabledTips: string = null, isGray: boolean = true, isNotify: boolean = true): void {
        if (target) {
            if (target instanceof Button) {
                (target as Button).enabled = enabled;
            } else {
                target.mouseEnabled = enabled;
            }
            this.setTips(target, enabled ? null : disabledTips);
            DisplayUtil.clearFilters(target);
            if (!enabled && isGray) {
                DisplayUtil.applyGray(target);
            }
        }
    }

    public static setTips(target: Sprite, tips: string = null, isNotify: boolean = true): void {
        TipsManager.getInstance().removeTips(target);
        if (!StringUtil.isNullOrEmpty(tips)) {
            if (isNotify) {
                TipsManager.getInstance().addNotifyTips(target, tips);
            } else {
                TipsManager.getInstance().addTips(target, tips);
            }
        }
    }

    public static intelligentlyGetIndex(target: Node, ignoreViewStackItem: boolean = true): number {
        if (ignoreViewStackItem && target.parent != null && target.parent instanceof ViewStack) {
            return this.intelligentlyGetIndex(target.parent);
        }
        let reg: RegExp = new RegExp(/[\D]+(\d+)$/);
        let matchResult: RegExpMatchArray = target.name.match(reg);
        if (matchResult && !StringUtil.isNullOrEmpty(matchResult[1])) {
            return parseInt(matchResult[1]);
        } else if (target.parent != null) {
            return this.intelligentlyGetIndex(target.parent);
        } else {
            return 0;
        }
    }

    public static getChildFromViewStack(mcContainer:ViewStack,key:string):any{
        return (mcContainer.selection as Sprite).getChildByName(key);
    }

    constructor() {
    }
}

