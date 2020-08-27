import DateUtil from "../DateUtil";

export default class CDUtil
{
    public static cdToSecTime(cdTime:number):number{
        var nowTime:number = DateUtil.getServerTimeInMS;
        var sec:number=0;
        if(cdTime>nowTime){
            sec =Math.floor((cdTime-nowTime)/1000);
        }
        return sec;
    }

    public static isInCd(cdTime:number):boolean{
        var nowTime:number = DateUtil.getServerTimeInMS;
        if(cdTime>nowTime){
            return true;
        }else{
            return false;
        }
    }
}