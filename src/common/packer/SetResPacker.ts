import NumberUtil from "../../util/common/NumberUtil";
import DisplayUtil from "../../util/DisplayUtil";
import TipsManager from "../tips/TipsManager";
import StringUtil from "../../util/StringUtil";
import CustomProgressBar from "../component/CustomProgressBar";
import Sprite = Laya.Sprite;
import Button = Laya.Button;
import Label = Laya.Label;
import Text = Laya.Text;
import ViewStack = Laya.ViewStack;
import Clip = Laya.Clip;
import ProgressBar = Laya.ProgressBar;
import MovieClip from "../../flash/display/MovieClip";
import TextArea = Laya.TextArea;

export default class SetResPacker {

    private _res: Sprite;
    /**
     * 设置资源失败是否抛出错误提示
     */
    public enabledThrowError: boolean = false;

    /**
     * 是否跳过ViewStack当前Selection
     */
    public enabledSkipSelection: boolean = true;

    constructor(res: Sprite) {
        this.res = res;
    }

    public set res(res: Sprite) {
        this._res = res;
    }

    /**
     * 设置文本内容
     * @param params Sprite|string|[string|Sprite, string...]
     * @param text string|number|number
     * @return
     */
    public setText(params: any, text: any): SetResPacker {
        let target = this.getChild(params) as Text | Label | TextArea;
        if (target) {
            target.text = text + "";
        } else {
            this.tryThrowError(params);
        }
        return this;
    }

    /**
     * 设置显示对象是否显示
     * @param params Sprite|string|[string|Sprite, string...]
     * @param visible
     * @return
     */
    public setVisible(params: any, visible: boolean = false): SetResPacker {
        let target: Sprite = this.getChild(params) as Sprite;
        if (target) {
            target.visible = visible;
        } else {
            this.tryThrowError(params);
        }
        return this;
    }

    /**
     * 设置MovieClip跳帧
     * @param params Sprite|string|[string|Sprite, string...]
     * @param frame string|number 帧数或标签
     * @return
     */
    public setFrame(params: any, frame: any): SetResPacker {
        let target = this.getChild(params) as MovieClip | ViewStack | Clip;
        if (target) {
            if (target instanceof MovieClip) {
                target.gotoAndStop(frame);
            } else if (target instanceof ViewStack) {
                target.selectedIndex = frame - 1;
            } else if (target instanceof Clip) {
                target.index = frame - 1;
            }
        } else {
            this.tryThrowError(params);
        }
        return this;
    }

    /**
     * 使用NumberUtil设置美术数字元件
     * @param params Sprite|string|[string|Sprite, string...]
     * @param value 数值
     * @param isHide 是否隐藏多余的数位
     * @param isAlignCenterWhenHide 当隐藏时是否自动居中 默认不居中
     * @return
     */
    public setArtNum(params: any, value: number, isHide: boolean = false, isAlignCenterWhenHide: boolean = false): SetResPacker {
        let target: Sprite = this.getChild(params) as Sprite;
        if (target) {
            NumberUtil.instance.setArtNum(target, value, isHide, isAlignCenterWhenHide);
        } else {
            this.tryThrowError(params);
        }
        return this;
    }

    /**
     * 设置尺寸（如果只想修改width或height，另外一个把原值传入）
     * @param params Sprite|string|[string|Sprite, string...]
     * @param width 宽
     * @param height 高
     * @return
     */
    public setSize(params: any, width: number, height: number): SetResPacker {
        let target: Sprite = this.getChild(params) as Sprite;
        if (target) {
            target.size(width, height);
        } else {
            this.tryThrowError(params);
        }
        return this;
    }

    /**
     * 设置坐标（如果只想修改x或y，另外一个把原值传入）
     * @param params Sprite|string|[string|Sprite, string...]
     * @param x
     * @param y
     * @return
     */
    public setPos(params: any, x: number, y: number): SetResPacker {
        let target: Sprite = this.getChild(params) as Sprite;
        if (target) {
            target.pos(x, y);
        } else {
            this.tryThrowError(params);
        }
        return this;
    }

    /**
     * 设置缩放比例（如果只想修改scaleX或scaleY，另外一个把原值传入）
     * @param params Sprite|string|[string|Sprite, string...]
     * @param scaleX
     * @param scaleY
     * @return
     */
    public setScale(params: any, scaleX: number, scaleY: number): SetResPacker {
        let target: Sprite = this.getChild(params) as Sprite;
        if (target) {
            target.scale(scaleX, scaleY);
        } else {
            this.tryThrowError(params);
        }
        return this;
    }

    /**
     * 设置鼠标状态
     * @param params Sprite|string|[string|Sprite, string...]
     * @param mouseEnabled 默认false
     * @param mouseThrough 默认false
     * @return
     */
    public setMouseState(params: any, mouseEnabled: boolean = false, mouseThrough: boolean = false): SetResPacker {
        let target: Sprite = this.getChild(params) as Sprite;
        if (target) {
            target.mouseEnabled = mouseEnabled;
            target.mouseThrough = mouseThrough;
        } else {
            this.tryThrowError(params);
        }
        return this;
    }

    /**
     * 设置按钮启用状态
     * @param params Sprite|string|[string|Sprite, string...]
     * @param value boolean|Object
     * @param disabledTips string 非启用状态添加的tips
     * @param isGray boolean 非启用状态灰掉
     * @param isNotify 是否使用飘字提示
     * @return
     */
    public setEnabled(params: any, value: any, disabledTips: string = null, isGray: boolean = true, isNotify: boolean = true): SetResPacker {
        let target: Sprite = this.getChild(params) as Sprite;
        if (target) {
            let enabled: boolean;
            if (typeof value === "boolean") {
                enabled = value;
            } else {
                enabled = value["enabled"];
                disabledTips = value["disabledTips"];
                isGray = value["isGray"];
            }
            if(target instanceof Button){
                (target as Button).enabled = enabled;
            }else{
                target.mouseEnabled = enabled;
            }
            this.setTips(target, enabled ? null : disabledTips);
            DisplayUtil.clearFilters(target);
            if (!enabled && isGray) {
                DisplayUtil.applyGray(target);
            }
        } else {
            this.tryThrowError(params);
        }
        return this;
    }

    /**
     * 设置旋转角度
     * @param params Sprite|string|[string|Sprite, string...]
     * @param value
     * @return
     */
    public setRotation(params: any, value: number): SetResPacker {
        let target: Sprite = this.getChild(params) as Sprite;
        if (target) {
            target.rotation = value;
        } else {
            this.tryThrowError(params);
        }
        return this;
    }

    /**
     * 设置透明度
     * @param params Sprite|string|[string|Sprite, string...]
     * @param value 0~1
     * @return
     */
    public setAlpha(params: any, value: number): SetResPacker {
        let target: Sprite = this.getChild(params) as Sprite;
        if (target) {
            target.alpha = value;
        } else {
            this.tryThrowError(params);
        }
        return this;
    }

    /**
     * 设置多个属性
     * @param params Sprite|string|[string|Sprite, string...]
     * @param props 如：{"x":0, "width"960}
     * @return
     */
    public setProperties(params: any, props: any): SetResPacker {
        let target: Sprite = this.getChild(params) as Sprite;
        if (target) {
            for (let name in props) {
                if (target.hasOwnProperty(name)) {
                    target[name] = props[name];
                }
            }
        } else {
            this.tryThrowError(params);
        }
        return this;
    }

    /**
     * 设置Tips
     * @param params Sprite|string|[string|Sprite, string...]
     * @param tips string tips内容(null移除tips)
     * @param isNotify boolean 是否使用飘字提示
     */
    public setTips(params: any, tips: string = null, isNotify: boolean = true): SetResPacker {
        let target: Sprite = this.getChild(params) as Sprite;
        TipsManager.getInstance().removeTips(target);
        if (!StringUtil.isNullOrEmpty(tips)) {
            if (isNotify) {
                TipsManager.getInstance().addNotifyTips(target, tips);
            } else {
                TipsManager.getInstance().addTips(target, tips);
            }
        }
        return this;
    }

    /**
     * 设置进度条(H5)
     * @param params DisplayObject|String|[String|DisplayObject, String...]
     * @param value 比例(0~1)，小于0或大于1会修正
     */
    public setProgressBar(params: any, value: number): SetResPacker {
        let target = this.getChild(params) as ProgressBar | CustomProgressBar;
        if (target) {
            target.value = Math.min(Math.max(value, 0), 1);
        } else {
            this.tryThrowError(params);
        }
        return this;
    }

    /**
     * @param params Sprite|string|[string|Sprite, string...]
     * @param value 可以是 function(view:&#42;):void，也可以是 Object 对象，<br>
     *                如果是 Object 对象，必须要有属性 func，<nobr>类型是 function(view:&#42;, value:any):void</nobr>
     */
    public setAnything(params: any, value: any, argArray: any[] = null): SetResPacker {
        let target: any = this.getChild(params);
        if (value instanceof Function) {
            (<Function>value).apply(null,
                argArray == null ? [target] : [target].concat(argArray));
        } else {
            (value["func"] as Function)(target, value);
        }
        return this;
    }

    /**
     * 为容器设定子元件
     * @param params Sprite|string|[string|Sprite, string...]
     * @param childOrInfo Sprite 或一个 Object，传 null 会清容器，如果是 Object，则有如下属性：
     *    <div style="margin-left:48">
     *        <table>
     *            <tr>
     *                <th>字段</th>
     *                <th>类型</th>
     *             <th>说明</th>
     *            </tr>
     *            <tr>
     *                <td>child</td>
     *                <td>Sprite or function():Sprite</td>
     *             <td>要加的子元件或其获取函数</td>
     *            </tr>
     *            <tr>
     *            <td>key</td>
     *                <td>string</td>
     *            <td>用于标记，同样名字不会再加，推荐使用全大写</td>
     *            </tr>
     *        </table>
     *    </div>
     */
    public setTheChild(params: any, childOrInfo: any): SetResPacker {
        let target: any = this.getChild(params);
        if (childOrInfo == null) {
            DisplayUtil.clearContainer(target);
        } else if (childOrInfo instanceof Sprite) {
            DisplayUtil.clearContainer(target);
            target.addChild(childOrInfo);
        } else {
            let key: string = childOrInfo["key"];
            if (key != null) {
                let childWrapperLast: Sprite = target.getChildByName(key);
                if (childWrapperLast != null && childWrapperLast.name == key) {
                    return this;
                }
            }
            let childWrapper: Sprite = new Sprite();
            let child: Sprite;
            if (childOrInfo["child"] instanceof Sprite) {
                child = childOrInfo["child"];
            } else if (childOrInfo["child"] instanceof Function) {
                child = (childOrInfo["child"] as Function)();
            } else {
                throw new Error("Invalid child type: " + (typeof childOrInfo["child"]));
            }
            if (key != null) {
                childWrapper.name = key;
            }
            childWrapper.addChild(child);

            DisplayUtil.clearContainer(target);
            target.addChild(childWrapper);
        }
        return this;
    }

    /**
     * 获取子元件
     * @param params Sprite|string|[string|Sprite, string...]
     * @return
     */
    public getChild(params: any): any {
        if (params == "" || params == []) {
            return this._res;
        }
        if (params instanceof Sprite) {
            return params;
        }
        let parent: Sprite = this._res;
        let child: Sprite;
        let arr = [];
        if (typeof params === "string") {
            arr = params.split(".");
        } else if (params instanceof Array) {
            if (params[0] instanceof Sprite) {
                if (params.length == 1) {
                    return params[0];
                }
                parent = params.shift();
            }
            for (let str of params) {
                arr = arr.concat(str.split("."));
            }
        }
        for (let name of arr) {
            if (parent instanceof ViewStack && this.enabledSkipSelection) {
                child = parent.selection.getChildByName(name) as Sprite;
            } else {
                child = parent.getChildByName(name) as Sprite;
            }
            if (!child) {
                break;
            }
            parent = child;
        }
        return child;
    }

    /**
     * 获取父元件
     * @param params Sprite|string|[string|Sprite, string...]
     * @return
     */
    public getParent(params: any): Sprite {
        let target = this.getChild(params) as Sprite;
        if (target) {
            if (this.enabledSkipSelection && target.parent.name.indexOf("item") == 0
                && target.parent.parent instanceof ViewStack) {
                return target.parent.parent;
            }
            return target.parent as Sprite;
        }
        return null;
    }

    private tryThrowError(params: any): void {
        if (this.enabledThrowError) {
            let msg: string;
            if (params instanceof Sprite) {
                msg = (<Sprite>params).name;
            } else if (typeof params === "string") {
                msg = params;
            } else if (params instanceof Array) {
                if (params[0] instanceof Sprite) {
                    let arr: any[] = [(params[0] as Sprite).name].concat(params.slice(1));
                    msg = arr.join(".");
                } else {
                    msg = params.join(".");
                }
            }
            throw new Error("getChild:" + msg + " is null!");
        }
    }
}