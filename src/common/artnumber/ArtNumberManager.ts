import Clip = laya.ui.Clip;

export default class ArtNumberManager {
    constructor() {
    }

    /**
     * @param artnums    [Clip,Clip,...]，和页游不同，这里第1帧是0
     * @param value    待刷新的数字
     * @param zeroCanSee    前置的零是否保留
     */
    public static setNumber(artnums: Clip[], value: number, zeroCanSee: boolean = true): void {
        if (null == artnums || 0 == artnums.length) {
            return;
        }
        let maxNum: number = Number.MAX_VALUE;
        value = Math.max(0, value);
        value = Math.min(value, maxNum);
        let numstr: string = "" + value;
        let mc: Clip = null;
        let num: number = 0;
        let mis: number = artnums.length - numstr.length;
        numstr = ArtNumberManager.getZeros(mis) + numstr;
        for (let i: number = 0; i < artnums.length; i++) {
            mc = artnums[i] as Clip;
            num = parseInt(numstr.charAt(i));
            // num = num == 0 ? 10 : num;
            ArtNumberManager.gotoAndStop(mc,num);
            if (!zeroCanSee && i < mis) {
                mc.visible = false
            } else {
                mc.visible = true;
            }
        }
    }

    private static getZeros(count: number): string {
        let rs: string = "";
        for (let i: number = 0; i < count; i++) {
            rs = rs.concat("0");
        }
        return rs;
    }
    /**
     * 设置对齐数，左对齐或者右对齐，自动隐藏0。
     * @param nums [MovieClip,MovieClip,...]，其中MovieClip共10帧，第1帧为数字1，第2帧为数字2，如此类推，第10帧为数字0
     * @param value 待设置的数字,数字的位数不能超过数组的长度。
     * @param baseLeft 是否靠左对齐，false表示靠右对齐
     */
    public static setAlignNumbers(nums: any[], value: number, baseLeft: boolean): void {
        let maxNum: number = Math.pow(10, nums.length) - 1;
        value = Math.max(0, value);
        value = Math.min(value, maxNum);

        let strValue: string = value.toString();
        let offset: number = baseLeft ? 0 : nums.length - strValue.length;
        let mcNum: Clip = null;
        let charValue: string = "";
        let num: number = 0;
        strValue = ArtNumberManager.fillString(strValue, nums.length, baseLeft);

        for (let i: number = 0; i < nums.length; i++) {
            charValue = strValue.charAt(i);
            mcNum = nums[i];
            if (charValue == "A") {
                ArtNumberManager.gotoAndStop(mcNum,1);
                mcNum.visible = false;
            } else {
                mcNum.visible = true;
                num = parseInt(charValue);
                // num = num == 0 ? 10 : num;
                ArtNumberManager.gotoAndStop(mcNum,num);
            }
        }
    }

    /**
     * 居中显示数字，当数字为负数或者位数大于元件数量时  不显示
     * @param nums [MovieClip,MovieClip,...]，其中MovieClip共10帧，第1帧为数字1，第2帧为数字2，如此类推，第10帧为数字0
     * @param value 待设置的数字,数字的位数不能超过数组的长度。
     */
    public static setMidNumbers(nums: any[], value: number): void {
        let maxNum: number = Math.pow(10, nums.length) - 1;
        value = Math.max(0, value);
        value = Math.min(value, maxNum);
        let strValue: string = value.toString();
        let dis: number = (nums.length - strValue.length) / 2;
        let start: number = dis;
        let end: number = (start + strValue.length);
        let mcNum: Clip = null;
        let charValue: string = "";
        let num: number = 0;
        for (let i: number = 0; i < nums.length; i++) {
            mcNum = nums[i];
            if (i < start || i >= end) {
                ArtNumberManager.gotoAndStop(mcNum,1);
                mcNum.visible = false;
            } else {
                charValue = strValue.charAt((i - start));
                mcNum.visible = true;
                num = parseInt(charValue);
                // num = num == 0 ? 10 : num;
                ArtNumberManager.gotoAndStop(mcNum,num);
            }
        }
    }

    /**
     * 补全
     * @param str 字符串
     * @param targetLength 希望补全到的长度
     * @param isLeft 靠左还是靠右。
     * @return
     *
     */
    private static fillString(str: string, targetLength: number, isLeft: boolean): string {
        let add: string = "";
        for (let i: number = 0; i < (targetLength - str.length); i++) {
            add += "A";
        }
        return isLeft ? (str + add) : (add + str);
    }

    private static gotoAndStop(mc:Clip,frame:number):void{
        // mc.index = frame-1;
        mc.index = frame;
    }
}

