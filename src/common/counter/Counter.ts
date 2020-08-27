import EventDispatcher from '../../egret/events/EventDispatcher';
import CounterEvent from './CounterEvent';
import Sprite = Laya.Sprite;
import Clip = Laya.Clip;
import Text = Laya.Text;

/**
 * 形如00:00:00的计时器，支持的最小单位为秒
 * <br>构造参数的显示孩子请按照以下规范命名：
 * <br>秒的个位：sec0 秒的十位：sec1
 * <br>分的个位：min0 分的十位：min1
 * <br>时的个位：hour0 时的十位：hour1
 * <br>天的个位：day0 天的十位：day1
 * -------------------------------------
 * <br>文本: txt
 * -------------------------------------
 * @author qianjiuquan
 */
export default class Counter extends EventDispatcher {
    private _curNum: number = 0;
    private _endNum: number = 0;
    private _interval: number = 0;
    private _intervalCounter: number = 0;
    private _isDown: boolean = true;
    //Components
    private _sec0: Clip;
    private _sec1: Clip;
    private _min0: Clip;
    private _min1: Clip;
    private _hour0: Clip;
    private _hour1: Clip;
    private _day0: Clip;
    private _day1: Clip;
    private _txt: Text;
    private _isRunning: boolean = false;

    /**
     * 使用计时器请务必先设置好所需参数，再调用start方法
     * @param container
     * @param autoGenMc 是否自动创建缺失的数字movieclip
     *
     */
    public constructor(container: Sprite) {
        super();
        this.initComponent(container);
    }

    /** 开始计时*/
    public start(): void {
        if (this._isRunning) {
            return;
        }
        this._isRunning = true;
        Laya.timer.loop(1000, this, this.onTick);
    }

    /** 停止计时*/
    public stop(): void {
        if (!this._isRunning) {
            return;
        }
        this._isRunning = false;
        Laya.timer.clear(this, this.onTick);
    }

    /** 当前计时器上的数值，单位为秒*/
    public get curNum(): number {
        return this._curNum;
    }

    public set curNum(num: number) {
        this._curNum = num;
        this.updateComponent();
    }

    /** 对外发出（事件）通知的时间间隔*/
    public get interval(): number {
        return this._interval;
    }

    public set interval(itv: number) {
        this._interval = itv;
    }

    /** true表示倒计时，false表示累加计时*/
    public get isDown(): boolean {
        return this._isDown;
    }

    public set isDown(down: boolean) {
        this._isDown = down;
    }

    /** 停止的时间*/
    public get endNum(): number {
        return this._endNum;
    }

    public set endNum(num: number) {
        this._endNum = num;
    }

    private initComponent(container: Sprite): void {
        this._txt = container.getChildByName("txt") as Text;
        if(this._txt){
            this._txt.text = "0";
        }else{
            this._sec0 = container.getChildByName("sec0") as Clip;
            this._sec1 = container.getChildByName("sec1") as Clip;
            this._min0 = container.getChildByName("min0") as Clip;
            this._min1 = container.getChildByName("min1") as Clip;
            this._hour0 = container.getChildByName("hour0") as Clip;
            this._hour1 = container.getChildByName("hour1") as Clip;
            this._day0 = container.getChildByName("day0") as Clip;
            this._day1 = container.getChildByName("day1") as Clip;

            this.gotoAndStopHelper(this._sec0, 1);
            this.gotoAndStopHelper(this._sec1, 1);
            this.gotoAndStopHelper(this._min0, 1);
            this.gotoAndStopHelper(this._min1, 1);
            this.gotoAndStopHelper(this._hour0, 1);
            this.gotoAndStopHelper(this._hour1, 1);
            this.gotoAndStopHelper(this._day0, 1);
            this.gotoAndStopHelper(this._day1, 1);
        }
    }

    private gotoAndStopHelper(mc: Clip, frame: number): void {
        if (mc != null) {
            mc.index = frame - 1;
        }
    }

    private onTick(): void {
        var delta: number = this._isDown ? -1 : 1;
        this._curNum += delta;
        this.updateComponent();
        this.plusIntervalCounter();
        if (this._curNum == this._endNum) {
            this.stop();
            if (this.hasEventListener(CounterEvent.COUNTER_END)) {
                this.dispatchEvent(new CounterEvent(CounterEvent.COUNTER_END, null));
            }
        }
    }

    public updateComponent(): void {
        var day: number = Math.floor(this._curNum / 86400);
        var hour:number = Math.floor((this._curNum - day * 86400) / 3600);
        var min:number = Math.floor((this._curNum - day * 86400 - hour * 3600) / 60);
        var sec:number = Math.floor(this._curNum - day * 86400 - hour * 3600 - min * 60);
        if(this._txt){
        	let arr = [day, hour, min, sec];
        	while (arr.length > 1 && arr[0] == 0){
        		arr.shift();
			}
        	this._txt.text = arr.join(":");
		}else{
            if (this._day0 != null && this._day1 != null) {
                this.updateComponentHelper(this._day0, this._day1, day);
            }
            if (this._hour0 != null && this._hour1 != null) {
                this.updateComponentHelper(this._hour0, this._hour1, hour);
            }
            if (this._min0 != null && this._min1 != null) {
                this.updateComponentHelper(this._min0, this._min1, min);
            }
            if (this._sec0 != null && this._sec1 != null) {
                this.updateComponentHelper(this._sec0, this._sec1, sec);
            }
		}
    }

    private updateComponentHelper(mc0: Clip, mc1: Clip, num: number): void {
        var num0: number = num % 10;
        var num1: number = ((num - num0) % 100) / 10;
        mc0.index = num0;
        mc1.index = num1;
    }

    private plusIntervalCounter(): void {
        if (this._interval == 0) {
            return;
        }
        this._intervalCounter++;
        if (this._intervalCounter >= this._interval) {
            if (this.hasEventListener(CounterEvent.COUNTER_INTERVAL)) {
                this.dispatchEvent(new CounterEvent(CounterEvent.COUNTER_INTERVAL, null));
            }
            this._intervalCounter = 0;
        }
    }
}