import Handler = Laya.Handler;
import DialogManager from '../dialog/DialogManager';
import ConfigReader from '../../loader/config/ConfigReader';
import InteractUtil from '../../util/InteractUtil'


/**
 *    需要一个杂物堆，存放一些常用方法
 *  @author hanjun
 *
 */
export default class ActUtil {
    /** 没找到怎么区分专属源兽的标记，只能从开始id处理 **/
    public static SpecEqStartId: number = 12;

    constructor() {
    }

    /** 是不是测试环境 **/
    public static isDebug(): boolean {
        return ConfigReader.instance.debug;
    }

    public static getIntNumber( num:number ):number{
        return Math.floor(num);
    }

    public static getHpString(hp: number): string {
        if (hp < 0) {
            return "0";
        }
        var hpStr: string = hp + "";
        if (hp >= 10000) {
            hpStr = ActUtil.getIntNumber(hp / 10000) + "万";
        }
        return hpStr;
    }
    public static getSecondString( second:number ):String{
        var hour:number = ActUtil.getIntNumber(second/(60*60));
        var min:number = ActUtil.getIntNumber(second/60)%60;
        var sec:number = ActUtil.getIntNumber(second%60);
        if( hour>0){
            return ActUtil.getNumberString(hour)+":"+ActUtil.getNumberString(min)+":"+ActUtil.getNumberString(sec);
        }
        return ActUtil.getNumberString(min)+":"+ActUtil.getNumberString(sec);
    }

    public static getNumberString( num:number):String{
        if( num >9 ){
            return num+"";
        }
        return "0"+num;
    }

    public static applyCallback(func: Function | Handler, argArray: any = null, thisArg: any = null): void {
        InteractUtil.applyCallback(func, argArray, thisArg);
    }

    /** 关闭所有面板 **/
    public static closeAll(): void {
        DialogManager.instance.clearAll();
    }

    /** num在arrayData里面大于哪一档 **/
    public static getNumberNearIndexInArray(num:number, arrayData:number[]):number {
        if (arrayData == null) {
            return 0;
        }
        var len:number = arrayData.length;
        for (var i:number = 0; i < len; i++) {
            if (num < arrayData[i]) {
                return i - 1;
            }
        }
        return len - 1;
    }
}
