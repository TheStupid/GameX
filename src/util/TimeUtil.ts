export default class TimeUtil {

    /** 分秒转换 */
    public static readonly SECOND_OF_MINUTE:number = 60;
    /** 时秒转换 */
    public static readonly SECOND_OF_HOUR:number = TimeUtil.SECOND_OF_MINUTE * 60;
    /** 天秒转换 */
    public static readonly SECOND_OF_DAY:number = TimeUtil.SECOND_OF_HOUR * 24;

    constructor() {

    }

    /**
     * 秒转为天、小时、分钟、秒的形式
     * @param second
     * @return Object{day:number, hour:number, min:number, second:number}
     */
    public static second2DHMS(second:number):any {
        var day:number = second / TimeUtil.SECOND_OF_DAY;

        var temp:number = second % TimeUtil.SECOND_OF_DAY;
        var hour:number = temp / TimeUtil.SECOND_OF_HOUR;

        temp = second % TimeUtil.SECOND_OF_HOUR;
        var min:number = temp / TimeUtil.SECOND_OF_MINUTE;

        var sec:number = second % TimeUtil.SECOND_OF_MINUTE;

        return {"day":day, "hour":hour, "min":min, "second":sec};
    }

    /**
     * 毫秒转为天、小时、分钟、秒的形式
     * @param millisecond
     * @return Object{day:number, hour:number, min:number, second:number}
     */
    public static millisecond2DHMS(millisecond:number):any {
        return TimeUtil.second2DHMS(millisecond / 1000);
    }

    /**
     * 分钟转为天、小时、分钟、秒的形式
     * @param minute
     * @return Object{day:number, hour:number, min:number, second:number}
     */
    public static minute2DHMS(minute:number):any {
        return TimeUtil.second2DHMS(minute * TimeUtil.SECOND_OF_MINUTE);
    }
}

