import Sprite = Laya.Sprite;
import Clip = Laya.Clip;
import Dictionary from "../Dictionary";
import Event = Laya.Event;

export default class NumberUtil {

    private static _instance: NumberUtil;

    constructor() {
    }

    public static get instance(): NumberUtil {
        if (NumberUtil._instance == null) {
            NumberUtil._instance = new NumberUtil();
        }
        return NumberUtil._instance;
    }

    private _container2xArr:Dictionary<Sprite,number[]> = new Dictionary();
    /**
     * 构造由美术字拼成的数字，只处理元件跳帧的动作
     * @param container:DisplayObjectContainer 美术字资源容器。子元件为多帧MovieClip，0123456789对应其的1-10帧
     * @param value:number 要拼凑出的数字
     * @param isHide:Booelan 是否隐藏多余的数位
     * @param isAlignCenterWhenHide:Booelan 当隐藏时是否自动居中 默认不居中
     * <br>
     * <b>更新:不够位数时会自动向右补全(用的是BitmapMovieClip)，以防经常报错</b>
     */
    public setArtNum(container: Sprite, value: number, isHide: boolean = false, isAlignCenterWhenHide: boolean = false): void {
        var dataList: Clip[] = [];
        var mc: Clip = null;
        var length: number = container.numChildren;
        var i: number;
        for (i = 0; i < length; i++) {
            mc = container.getChildAt(i) as Clip;
            if (mc == null || mc.clipX < 10) {
                throw new Error("构造艺术数字失败，子元件必须为10帧MovieClip");
            }
            dataList.push(mc);
        }
        // 根据子元件的x坐标排序，
        dataList.sort((a, b): number => {
            return a.x - b.x;
        });
        var numString: string = value.toString();
        for (i = 1; i <= length; i++) {
            var index: number = length - i;
            mc = dataList[index];
            mc.visible=true;
            index = numString.length - i;
            if (index >= 0) {
                var digit: number = parseInt(numString.charAt(index));
                mc.index = digit;
            }
            else {
                mc.index = 0;
            }
        }

        if (isHide)
        {
            let numHideCount:number = length - numString.length;
            for (let j:number = 0; j < numHideCount; j++)
            {
                (dataList[j]).visible = false;
            }
        }
        // if(isHide&&isAlignCenterWhenHide){
        //     let numMcWidth:number = dataList[0].width;
        //     let containerWidth:number = container.width;
        //     let gap:number=0;
        //     let xArr:number[] = this._container2xArr.getValue(container);
        //     if(xArr==null){
        //         this.recordInitX(container,dataList);
        //     }
        //     xArr = this._container2xArr.getValue(container);
        //     this.resetPos(xArr,dataList);
        //     if(dataList.length>1){
        //         gap = (dataList[dataList.length-1].x-xArr[0])/(dataList.length-1)-numMcWidth;
        //     }
        //     let visibleWidth:number = numString.length*numMcWidth+gap*(numString.length-1);
        //     let allElementWidth:number = length*numMcWidth+gap*(numString.length-1);
        //     let allMoveOffest:number = (visibleWidth-allElementWidth)/2;
        //     for (let k:number = 0; k < dataList.length; k++)
        //     {
        //         (dataList[k]).x +=allMoveOffest;
        //     }
        // }
    }

    private resetPos(xArr:number[], dataList:Sprite[]):void
    {
        for (let i:number = 0; i < dataList.length; i++)
        {
            let mc = dataList[i];
            mc.x = xArr[i];
        }
    }

    private recordInitX(container:Sprite,dataList:Sprite[]):void
    {
        let xArr:number[]=[];
        for (let i:number = 0; i < dataList.length; i++)
        {
            let mc = dataList[i];
            xArr[i] = mc.x;
        }
        container.once(Event.REMOVED,this, this.onRemovedFromStage);
        this._container2xArr.setValue(container,xArr);
    }

    private onRemovedFromStage(evt:Event):void
    {
        let container:Sprite = evt.currentTarget;
        this._container2xArr.remove(container);
    }

    /**
     * 获取用美术字拼成的数字，最终的注册点在Sprite的居中下部
     * @param url Clip的url
     * @param num 要拼凑出的数字
     * @param isUnsigned 如果为假（默认为真），则根据num参数的正负，在数字前面添加符号
     * @return 美术字拼成的数字Sprite
     */
    public getArtNum(url:string, num:number, gap:number, isUnsigned:boolean = true):Sprite
    {
        var sp:Sprite = new Sprite();
        const CLIP_X = isUnsigned ? 10 : 12;
        var clip:Clip;
        var arr:Clip[] = [];
        if(!isUnsigned && num != 0){
            clip = new Clip(url, CLIP_X);
            clip.index = num > 0 ? 0 : 1;
            arr.push(clip);
        }
        var str:string = Math.abs(num) + "";
        for(var i = 0; i<str.length; i++){
            var digit:number = parseInt(str.charAt(i));
            clip = new Clip(url, CLIP_X);
            clip.index = isUnsigned ? digit : digit + 2;
            arr.push(clip);
        }
        var tmp:Clip;
        for(var j = 0; j<arr.length; j++){
            tmp = arr[j];
            tmp.x = (tmp.width + gap) * j;
            sp.addChild(tmp);
        }
        sp.width = tmp.width * arr.length + gap * (arr.length - 1);
        sp.height = tmp.height;
        sp.pivot(sp.width / 2, sp.height);
        return sp;
    }

    /**
     * 元件数字显示
     * @param numMc 显示的数字元件，由右到左依次命名 num0,num1,……
     * @param num   要显示的数字,必须为正数,否则置0
     * @param side  显示方式：0 完全显示，包括0;
     * 						 1 左边显示，右边去0;
     * 						 2 右边显示，左边去0;
     * 						 3 居中显示，去掉两边0;beta版。。。
     * @param leastCount 最少的占用个数，空缺的用0补充
     */
    public static setNumMc(numMc:Sprite, num:number, side:number = 3, leastCount:number = 1):void
    {
        if( numMc ==null ){
            return;
        }
        if(num < 0){
            num = 0;
        }

        let numMcArray:Clip[] =[];
        let oneNumMc:Clip;
        let numCount:number;
        let showStates:boolean[] = [];
        for(numCount = 0; numCount < 20; numCount++){
            oneNumMc = numMc.getChildByName("num"+numCount.toString()) as Clip;
            if(oneNumMc == null){
                break;
            }
            oneNumMc.visible = true;
            oneNumMc.index=0;
            numMcArray.push(oneNumMc);
            showStates.push(true);
        }

        numCount = 0;
        for(let reNum:number = num; reNum > 0;){
            if(numCount == numMcArray.length){
                break;
            }
            let lastNum:number = reNum % 10;
            numMcArray[numCount].index=lastNum;
            reNum = Math.floor(reNum/10);
            numCount ++;
        }

        numCount = (numCount < leastCount)?leastCount:numCount;

        let arrayLength:number = numMcArray.length;
        if(side == 2){
            for(;numCount < arrayLength; numCount ++){
                numMcArray[numCount].visible = false;
                showStates[numCount] = false;
            }
        }

        if(side == 1){
            numCount --;
            let downNum:number = arrayLength - 1;
            for(;numCount >= 0; numCount--){
                let numFrame:number = numMcArray[numCount].index;
                numMcArray[downNum].index=numFrame;
                downNum --;
            }
            for(;downNum >=0 ;downNum--){
                numMcArray[downNum].visible = false;
                showStates[downNum] = false;
            }
        }

        if(side == 3){
            let i:number;
            let startNum:number = Math.floor((arrayLength - numCount)/2 + numCount) - 1;

            for(i = arrayLength - 1; i > startNum; i--)
            {
                numMcArray[i].visible = false;
                showStates[startNum] = false;
            }

            numCount --;

            for(;numCount >= 0; numCount--){
                let goFrame:number = numMcArray[numCount].index;
                numMcArray[startNum].index=goFrame;
                startNum --;
            }

            for(;startNum >=0 ;startNum--){
                numMcArray[startNum].visible = false;
                showStates[startNum] = false;
            }
        }
    }

    /**
     *	时间显示（一般用于倒计时）
     * @param mcSecond 里面包含元件：mcHour-时，mcMin-分，mcSec-秒————(没有的话，可以不传)
     * @param second 秒数
     *
     */
    public static setSecondNumMc(mcSecond:Sprite, second:number):void{
        if( !mcSecond ){
            return;
        }
        let hour:number = Math.floor(second/(60*60));
        let min:number = Math.floor(second/60)%60;
        let sec:number = second%60;
        NumberUtil.setNumMc(mcSecond.getChildByName("mcHour") as Sprite, hour, 0);
        NumberUtil.setNumMc(mcSecond.getChildByName("mcMin") as Sprite, min, 0);
        NumberUtil.setNumMc(mcSecond.getChildByName("mcSec") as Sprite, sec, 0);
    }
}