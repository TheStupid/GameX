import DialogBase from './DialogBase';
import InteractUtil from '../../util/InteractUtil';
import {AlignType} from "../AlignType";
import StringUtil from "../../util/StringUtil";
import Handler = Laya.Handler;
import Sprite = Laya.Sprite;
import Point = Laya.Point;
import Rectangle = Laya.Rectangle;
import ConfigReader from "../../loader/config/ConfigReader";

export default class NewDialog {
    private static readonly URLS = ["common/dialog.atlas"];
    private static readonly DEFAULT_NOT_ENOUGTH_GOLD_MSG: string = "你的金币不够哦！";
    private static readonly NOT_OPEN_MESSAGE_FORMAT: string = "亲爱的小奥拉，%1暂未在H5内开放，可使用电脑登录如下网址，前往PC端%2。\n%3";

    public static showSucceedMessage(message: string, callback: Function | Handler = null, isHtml: boolean = false, title?: string): void {
        NewDialog.showMessageDialog(true, message, callback, isHtml, title);
    }

    public static showFailMessage(message: string, callback: Function | Handler = null, isHtml: boolean = false, title?: string): void {
        NewDialog.showMessageDialog(false, message, callback, isHtml, title);
    }

    public static showComfirmDialog(message: string, confirmCall: Function | Handler = null, cancelCall: Function | Handler = null, isHtml: boolean = false, title?: string): void {
        let dialog = new DialogBase("common/dialog/ConfirmDialog.json",
            NewDialog.URLS);
        let onRemoved = () => {
            InteractUtil.applyCallback(cancelCall);
        };
        dialog.once(Laya.Event.REMOVED, this, onRemoved);
        if (isHtml) {
            dialog.setHtmlText("txtMessage", message);
        } else {
            dialog.setText("txtMessage", message);
        }
        if (title) {
            dialog.setText("txtTitle", title);
        } else {
            dialog.setText("txtTitle", "");
        }
        dialog.regClickFunc("btnConfirm", () => {
            dialog.off(Laya.Event.REMOVED, this, onRemoved);
            dialog.close();
            InteractUtil.applyCallback(confirmCall);
        }, this).regClickFunc("btnCancel", () => {
            dialog.off(Laya.Event.REMOVED, this, onRemoved);
            dialog.close();
            InteractUtil.applyCallback(cancelCall);
        }, this).show(AlignType.MIDDLE_CENTER);
    }

    private static getStageRect(dialog: DialogBase): Array<object> {
        let stageRects: Array<object> = new Array<object>();
        let btnConfirm: Sprite = dialog.res.getChildByName("btnConfirm") as Sprite;
        let btnConfirmPt: Point = new Point(btnConfirm.x, btnConfirm.y);
        let globalbtnConfirmPt = (<Sprite>btnConfirm.parent).localToGlobal(btnConfirmPt);
        let packageRect: Rectangle = new Rectangle(globalbtnConfirmPt.x - btnConfirm.width / 2, globalbtnConfirmPt.y - btnConfirm.height / 2, btnConfirm.width, btnConfirm.height);
        stageRects.push({"btnConfirmRect": packageRect});
        return stageRects;
    }

    public static showNotEnoughGoldDialog(callback: Function | Handler = null, message: string = NewDialog.DEFAULT_NOT_ENOUGTH_GOLD_MSG): void {
        NewDialog.showFailMessage("哎呀，你的金币不足哦！", callback);
    }

    public static showNotEnabledDialog(): void {
        new DialogBase("common/dialog/NotEnabledDialog.json", NewDialog.URLS).show(AlignType.MIDDLE_CENTER);
    }

    private static showMessageDialog(isSucceed: boolean, message: string, callback: Function | Handler = null, isHtml: boolean, title?: string): void {
        let dialog = new DialogBase("common/dialog/MessageDialog.json",
            NewDialog.URLS);
        let onRemoved = () => {
            InteractUtil.applyCallback(callback);
        };
        dialog.once(Laya.Event.REMOVED, this, onRemoved);
        if (isHtml) {
            dialog.setHtmlText("txtMessage", message);
        } else {
            dialog.setText("txtMessage", message);
        }
        if (title) {
            dialog.setText("txtTitle", title);
        } else {
            dialog.setText("txtTitle", "提示");
        }
        dialog.show(AlignType.MIDDLE_CENTER);
    }
}