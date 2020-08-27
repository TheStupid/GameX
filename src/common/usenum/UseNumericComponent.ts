import Text = Laya.Text;
import EventDispatcher = Laya.EventDispatcher;
import Sprite = Laya.Sprite;
import Label = Laya.Label;
import Button = Laya.Button;
import Event = Laya.Event;
import TextInput = Laya.TextInput;
import UseNumericEvent from "./UseNumericEvent";
import DisplayUtil from "../../util/DisplayUtil";
import NumericKeypad from "../component/NumericKeypad";
import {LayoutType} from "../LayoutType";
import NotifyQueue from "../notification/NotifyQueue";
import TextAlign from "../TextAlign";

/**
 * 带增加、减小、直接输入功能的数量组件
 */
export default class UseNumericComponent extends EventDispatcher {
    private minValue: number = 1;
    private maxValue: number = 9;
    private _value: number = 1;

    private view: Sprite = null;
    private valueText: Text | Label = null;
    private addButton: Button = null;
    private decButton: Button = null;

    private firstButton: Button = null;
    private endButton: Button = null;
    private maxText: Text | Label = null;
    private minText: Text | Label = null;

    private _step: number = 1;

    public registerComponent(view: Sprite): void {
        if (null != this.view && this.view != view) {
            return;
        }
        this.init(view);
    }

    public initInputComponent(): void {
        this.valueText.on(Event.CLICK, this, this.showKeypad);
    }

    private showKeypad(): void {
        let keypad: NumericKeypad = new NumericKeypad(this.valueText, this.onKeypadInputChange.bind(this), this.maxValue);
        keypad.show(LayoutType.EAST, 10);
    }

    private onKeypadInputChange(valueStr: string): void {
        this.setValue(parseInt(valueStr));
    }

    public setLimit(min: number, max: number): void {
        this.minValue = min;
        this.maxValue = Math.max(min, max);
        if (null != this.maxText) {
            this.maxText.text = this.maxValue + "";
        }
        if (null != this.minText) {
            this.minText.text = this.minValue + "";
        }
        this.updateView();
    }

    public get value(): number {
        return this._value;
    }

    public changeValue(val: number): void {
        // if (val >= this.minValue && val <= this.maxValue) {
        this.setValue(val);
        // }
    }

    public dispose(): void {
        this.addButton.off(Event.CLICK, this, this.addButtonClick);
        this.decButton.off(Event.CLICK, this, this.decButtonClick);
        if (null != this.firstButton) {
            this.firstButton.off(Event.CLICK, this, this.firstButtonClick);
        }
        if (null != this.endButton) {
            this.endButton.off(Event.CLICK, this, this.endButtonClick);
        }
        this.valueText.off(Event.INPUT, this, this.onValueChange);
        this.offAll();
    }

    private init(view: Sprite): void {
        this.view = view;
        this.initPars();
        this.initFuns();
    }

    private initPars(): void {
        this.valueText = this.view.getChildByName("txtValue") as Label | Text | TextInput;
        if (this.valueText instanceof TextInput) {
            (this.valueText as TextInput).restrict = "0-9";
        }
        this.addButton = <Button>this.view.getChildByName("btnAdd");
        this.decButton = <Button>this.view.getChildByName("btnDec");
        this.firstButton = <Button>this.view.getChildByName("btnFirst");
        this.endButton = <Button>this.view.getChildByName("btnEnd");
        this.maxText = this.view.getChildByName("txtMax") as Label | Text;
        this.minText = this.view.getChildByName("txtMin") as Label | Text;
    }

    private initFuns(): void {
        this.addButton.on(Event.CLICK, this, this.addButtonClick);
        this.decButton.on(Event.CLICK, this, this.decButtonClick);
        if (null != this.firstButton) {
            this.firstButton.on(Event.CLICK, this, this.firstButtonClick);
        }
        if (null != this.endButton) {
            this.endButton.on(Event.CLICK, this, this.endButtonClick);
        }
        if (this.valueText instanceof TextInput) {
            this.valueText.on(Event.INPUT, this, this.onValueChange);
        }
    }

    private onValueChange(evt: Event): void {
        let str: string = this.valueText.text;
        if ("" == str || "0" == str) {
            this.valueText.text = this.minValue + "";
        }
        let nvalue: number = parseInt(this.valueText.text);
        nvalue = nvalue - (nvalue % this._step);
        this.setValue(nvalue);
    }

    private setValue(val: number): void {
        this._value = Math.max(this.minValue, Math.min(val, this.maxValue));
        this.updateView();
        this.event(UseNumericEvent.UPDATE);
        if (this.maxValue != this.minValue) {
            if (this._value == this.maxValue) {
                this.event(UseNumericEvent.UPPER_LIMIT);
            } else if (this._value == this.minValue) {
                this.event(UseNumericEvent.LOWER_LIMIT);
            }
        }
    }

    private addButtonClick(evt: MouseEvent): void {
        let nvalue: number = Math.min(this.maxValue, this._value + this._step);
        if (nvalue == this._value) {
            this.notifyMax();
            return;
        }
        this.setValue(nvalue);
    }

    private decButtonClick(evt: MouseEvent): void {
        let nvalue: number = Math.max(this.minValue, this._value - this._step);
        if (nvalue == this._value) {
            this.notifyMin();
            return;
        }
        this.setValue(nvalue);
    }

    private firstButtonClick(e: MouseEvent): void {
        if (this._value != this.minValue) {
            this.setValue(this.minValue);
        } else {
            this.notifyMin();
        }
    }

    private endButtonClick(e: MouseEvent): void {
        if (this._value != this.maxValue) {
            this.setValue(this.maxValue);
        } else {
            this.notifyMax();
        }
    }

    private notifyMin(): void {
        NotifyQueue.add("已经是最小值了。");
    }

    private notifyMax(): void {
        NotifyQueue.add("已经是最大值了。");
    }

    private updateView(): void {
        if (this._value > this.maxValue) {
            this._value = this.maxValue;
        }
        if (this._value < this.minValue) {
            this._value = this.minValue;
        }
        this.valueText.text = "" + this._value;
        this.setButtonView(this.decButton, this._value > this.minValue);
        this.setButtonView(this.addButton, this._value < this.maxValue);
        if (this.firstButton != null) {
            this.setButtonView(this.firstButton, this._value != this.minValue);
        }
        if (this.endButton != null) {
            this.setButtonView(this.endButton, this._value != this.maxValue);
        }
    }

    private setButtonView(btn: Button, canClick: boolean): void {
        btn.enabled = canClick;
        if (canClick) {
            DisplayUtil.clearFilters(btn);
        } else {
            DisplayUtil.applyGray(btn);
        }
    }

    public setStep(step: number): void {
        this._step = step;
    }
}
