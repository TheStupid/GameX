import Browser = Laya.Browser;
import Event = Laya.Event;


export default class DateUtil {
    public static MILLISECOND: number = 1;
    public static SECOND_MS: number = DateUtil.MILLISECOND * 1000;
    public static MINUTE: number = DateUtil.SECOND_MS * 60;
    public static HOUR: number = DateUtil.MINUTE * 60;
    public static DAY: number = DateUtil.HOUR * 24;
    public static DAYOFWEEK: number = 7;
    public static WEEK: number = DateUtil.DAY * DateUtil.DAYOFWEEK;

    private static initServerMs: number;
    private static initTime: number;
    private static dayCountOfMonth: any[] = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    /*** 东8区和通用时间 (UTC) 之间的差值（以分钟为单位）。     */
    private static timezoneOffset = -480;

    /** 下面大量的使用到了initServerMs 和 initTime的差值，这里只计算一次，保存起来以供备用*/
    private static initServerMs_initTime: number;

    private static timezoneOffsetMs: number;

    /**返回今天00:00:00时刻的毫秒数。因为凌晨0点会重新拿服务器时间更新，所以这个时间一定是最新的今天 */
    public static todayUpdateTimeInMS: number = 0;

    /**返回明天00:00:00时刻的毫秒数。因为凌晨0点会重新拿服务器时间更新，所以这个时间一定是最新的明天 */
    public static tomorrowUpdateTimeInMS: number;

    /** 只读，每帧都会自动更新。返回最新的getTimer()*/
    public static getClientTime: number = 0;

    /** 只读，每帧都会自动更新。返回服务器时间的毫秒数，从1970年元旦凌晨开始的那个毫秒数*/
    public static getServerTimeInMS: number = 0;

//		/** 只读，帧时间差=getTimer()-last getTimer()*/
//		public static let getFrameTime:int;

    public static lastClientTime: number;

    constructor() {

    }

    public static init(timeMs: number) {
        DateUtil.initServerMs = timeMs;
        DateUtil.initTime = DateUtil.getTimer();
        DateUtil.initServerMs_initTime = DateUtil.initServerMs - DateUtil.initTime;
        let date: Date = new Date();
        DateUtil.timezoneOffsetMs = (date.getTimezoneOffset() - DateUtil.timezoneOffset) * 60 * 1000 + DateUtil.initServerMs_initTime;

        //生成本次登陆的凌晨0点的毫秒绝对值
        let da: Date = new Date();
        da.setTime(DateUtil.initTime + DateUtil.timezoneOffsetMs);
        DateUtil.todayUpdateTimeInMS = da.setHours(0, 0, 0, 0);
        console.log("今天0点的毫秒数=" + DateUtil.todayUpdateTimeInMS);
        DateUtil.tomorrowUpdateTimeInMS = DateUtil.todayUpdateTimeInMS + DateUtil.DAY; //明天0点时刻的值 = 今天0点时刻的值+一天的毫秒数
        console.log("明天0点的毫秒数=" + DateUtil.tomorrowUpdateTimeInMS);
        Laya.timer.frameLoop(1, this, this.onFrame);
    }

    /**为了减少getTimer()的使用，在这里统一每帧计算，其他地方直接读取@20180706         */
    private static onFrame(): void {
        DateUtil.getClientTime = DateUtil.getTimer();
        DateUtil.lastClientTime = DateUtil.getClientTime;
        DateUtil.getServerTimeInMS = DateUtil.timezoneOffsetMs + DateUtil.getClientTime;
    }

    /**服务器时区的服务器时间Date     */
    public static getServerTimeOnServerTimeZone(): Date {
        let currentTime: number = DateUtil.initServerMs_initTime + DateUtil.getClientTime;
        return new Date(currentTime);
    }

    /**客户端时区的服务器时间。如果仅仅需要毫秒数的，请使用getServerTimeInMS省new一个Data对象
     *日期是绝对准确的，时间如果使用变速齿轮外挂会失准
     * */
    public static getServerTime(): Date {
        return new Date(DateUtil.getServerTimeInMS);
    }

    public static getFrameTime(): number {
        return DateUtil.getTimer() - DateUtil.getClientTime;
    }

    public static getTimer(): number {
        return Browser.now();
    }

    public static isToday(year: number, month: number, date: number): boolean {
        let d: Date = DateUtil.getServerTime();
        return d.getFullYear() == year && d.getMonth() == month && d.getDate() == date;
    }

    public static isAfterToday(year: number, month: number, date: number): boolean {
        let d: Date = new Date(year, month, date);
        if (d.getTime() > DateUtil.initServerMs && !DateUtil.isToday(year, month, date)) {
            return true;
        } else {
            return false;
        }
    }

    public static isBeforeToday(year: number, month: number, date: number): boolean {
        return !DateUtil.isToday(year, month, date) && !DateUtil.isAfterToday(year, month, date);
    }

    public static formatDateYMD(date: Date = null): string {
        let d: Date = date != null ? date : DateUtil.getServerTime();
        return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
    }

    //计算星座
    public static getAstro(month: number, day: number): string {
        let s: string = "摩羯水瓶双鱼牧羊金牛双子巨蟹狮子处女天秤天蝎射手摩羯";
        let arr: any[] = [20, 19, 21, 21, 21, 22, 23, 23, 23, 23, 22, 22];
        return s.substr(month * 2 - (day < arr[month - 1] ? 2 : 0), 2);
    }

    /**
     * 判断当前时间是否在所给的一天之内的时间段内（闭区间）
     * @param timeAfter 时间上界，例如：19：30写作1930
     * @param timeBefore 时间上界，例如：19：30写作1930
     */
    public static betweenTimeInOneDay(timeAfter: number, timeBefore: number): boolean {
        let timeInt: number = DateUtil.getTimeInt();
        return timeInt >= timeAfter && timeInt <= timeBefore;
    }

    /**
     *判断当前时间是否在所给的时间段内（闭区间）
     * @param timeAfter开始时间
     * @param timeBefore结束时间
     * @return true是在闭区间
     */
    public static betweenFullTime(timeAfter: Date, timeBefore: Date): boolean {
        return DateUtil.getServerTimeInMS >= timeAfter.getTime() && DateUtil.getServerTimeInMS <= timeBefore.getTime();
    }

    /**
     * 判断当前时间是否在所给的一天之内的时间之前（开区间）
     * @param timeBefore 时间上界，例如：19：30写作1930
     */
    public static beforeTimeInOneDay(timeBefore: number): boolean {
        return DateUtil.getTimeInt() < timeBefore;
    }

    /**
     * 判断当前时间是否在所给的一天之内的时间之后（开区间）
     * @param timeAfter 时间上界，例如：19：30写作1930
     */
    public static afterTimeInOneDay(timeAfter: number): boolean {
        return DateUtil.getTimeInt() > timeAfter;
    }

    private static getTimeInt(): number {
        let time: Date = DateUtil.getServerTime();
        let timeInt: number = time.getHours() * 100 + time.getMinutes();
        return timeInt;
    }

    /**
     *获取发版日周五的日期
     * @return
     *
     */
    private static DAYARR: any[] = [5, 6, 0, 1, 2, 3, 4];

    public static getFridayDate(): Date {
        let date: Date = DateUtil.getServerTime();
        let passDays: number = DateUtil.DAYARR.indexOf(date.getDay());
        date.setDate(date.getDate() - passDays);
        return date;
    }

    public static validateYMD(year: string, month: string, day: string): boolean {
        if (year == null || month == null || day == null || year.length == 0 || month.length == 0 || day.length == 0) {
            return false;
        }

        let intYear = parseInt(year);
        let intMonth = parseInt(month);
        let intDay = parseInt(day);
        let date: Date = new Date();
        //判断日期范围是否有效
        if (intYear < 1900 || intYear > date.getFullYear() || intMonth < 1 || intMonth > 12 || intDay < 1 || intDay > 31) {
            return false;
        }
        //看看月份是否二月，再来决定要不要判断闰月
        if (intMonth != 2) {
            return !(intDay > DateUtil.dayCountOfMonth[intMonth - 1]);
        } else {
            if (intYear % 4 != 0) {
                //不能被四整除，不是闰年
                return !(intDay > 28);
            } else if (intYear % 100 != 0) {
                //能被四整除，但不能被100整除，是闰年
                return !(intDay > 29);
            } else if (intYear % 400 == 0) {
                //能被100和4整除，且能被400整除，是闰年
                return !(intDay > 29);
            } else if (intYear % 400 != 0) {
                //能被100和4整除，但不能被400整除，不是闰年
                return !(intDay > 28);
            } else if (intDay > 29) {
                //不应该到这里
                return false;
            }
        }
        return true;
    }

    public static formatLeftTime(seconds: number): string {
        let hour: number = seconds / 3600;
        let min: number = (seconds % 3600) / 60;
        let sec: number = seconds % 60;
        return DateUtil.getTimeNum(hour) + ":" + DateUtil.getTimeNum(min) + ":" + DateUtil.getTimeNum(sec);
    }

    public static formatLeftTimeWithoutHour(seconds: number): string {
        let min: number = (seconds) / 60;
        let sec: number = seconds % 60;
        return DateUtil.getTimeNum(min) + ":" + DateUtil.getTimeNum(sec);
    }

    private static getTimeNum(num: number): string {
        return num > 9 ? num.toString() : "0" + num;
    }

    private static weekCnList: any[] = ["日", "一", "二", "三", "四", "五", "六"];

    /**
     * 格式化输出时间<br>
     * 例子:yyyy年MM月dd日星期W hh:mm:ss<br>
     * 输出:2013年10月12日星期六 11:02:15
     * @param date
     * @param format
     * <ol>
     *    <li>yyyy 4位年份, yy 2位年份，例子:yyyy->2013</li>
     *    <li>M 月(1开始), MM 月(前面导0)</li>
     *    <li>d 日(1开始), dd 日(前面导0)</li>
     *    <li>w 星期，W大写的星期</li>
     *    <li>h 时, hh时(前面导0)</li>
     *    <li>m 分, mm分(前面导0)</li>
     *    <li>s 秒, ss秒(前面导0)</li>
     *    <li>f 毫米，ff毫秒(前面导0，3位)</li>
     * </ol>
     * @return
     */
    public static customFormat(date: Date, format: string): string {
        let res: string = format;
        res = DateUtil.formatNum(res, "yyyy", date.getFullYear(), 4);
        res = DateUtil.formatNum(res, "yy", date.getFullYear() % 100, 2);
        res = DateUtil.formatNum(res, "MM", date.getMonth() + 1, 2);
        res = DateUtil.formatNum(res, "M", date.getMonth() + 1);
        res = DateUtil.formatNum(res, "dd", date.getDate(), 2);
        res = DateUtil.formatNum(res, "d", date.getDate());
        res = DateUtil.formatNum(res, "w", date.getDay() + 1);
        res = DateUtil.formatChar(res, "W", DateUtil.weekCnList[date.getDay()]);
        res = DateUtil.formatNum(res, "hh", date.getHours(), 2);
        res = DateUtil.formatNum(res, "h", date.getHours());
        res = DateUtil.formatNum(res, "mm", date.getMinutes(), 2);
        res = DateUtil.formatNum(res, "m", date.getMinutes());
        res = DateUtil.formatNum(res, "ss", date.getSeconds(), 2);
        res = DateUtil.formatNum(res, "s", date.getSeconds());
        res = DateUtil.formatNum(res, "ff", date.getMilliseconds(), 3);
        res = DateUtil.formatNum(res, "f", date.getMilliseconds());
        return res;
    }

    private static formatNum(format: string, char: string, num: number, numLen: number = 1): string {
        let c: string = num + "";
        if (numLen > 1 && c.length < numLen) {
            for (let i: number = c.length; i < numLen; i++) {
                c = "0" + c;
            }
        }
        return DateUtil.formatChar(format, char, c);
    }

    private static formatChar(format: string, fchar: string, newChar: string): string {
        return format.replace(fchar, newChar);
    }

    public static parseDate(strDate: string): Date {
        if (strDate == null || strDate.length != 8) {
            throw new Error("参数错误！");
        }
        var year = parseInt(strDate.substr(0, 4));
        var month = parseInt(strDate.substr(4, 2));
        var day = parseInt(strDate.substr(6, 2));
        return new Date(year, month - 1, day);
    }

    /**
     * 将字符串转换成为Date格式，add by xiong 2011-11-24 15:52:19
     * @param strDate 格式要求：2011-11-16 16:32:49
     * @return 这里需要注意下，月份是0到11，所以不能直接用12代表12月，要减一哦
     */
    public static parse(strDate: String): Date {
        if (strDate == null || strDate == "") {
            return null;
        }
        var tmp: any[] = strDate.split(" ");

        var strDay: String = tmp[0];
        var dayTmp: any[] = strDay.split("-");
        var year: number = dayTmp[0];
        var month: number = dayTmp[1];
        var day: number = dayTmp[2];

        if (tmp.length > 1) {
            var strTime: String = tmp[1];
            var timeTmp: any[] = strTime.split(":");
            var hour: number = timeTmp[0];
            var min: number = timeTmp[1];
            var second: number = timeTmp[2];
            return new Date(year, month - 1, day, hour, min, second);
        }
        return new Date(year, month - 1, day, 0, 0, 0);
    }
}
