import LocalStorage = Laya.LocalStorage;
import DateUtil from "../../util/DateUtil";
import UserInfo from "../user/UserInfo";

export default class LocalCache {
    private static DEFAULT_NAME = "aobiso";
    private static readonly TOTAL_WEEK_DAY: number = 7;
    private static readonly FRIDAY_VALUE: number = 5;
    private static _flagMap: any = {};

    public static getValue(key: string, userName: string = LocalCache.DEFAULT_NAME): any {
        return LocalStorage.getJSON(userName + "_" + key);
    }

    public static setValue(key: string, value: any, userName: string = LocalCache.DEFAULT_NAME): void {
        LocalStorage.setJSON(userName + "_" + key, value);
    }

    public static getWeeklyVersion(): string {
        const ONE_DAY_MILLISECOND_TIME: number = 1 * 24 * 60 * 60 * 1000;
        var version: string = "";
        var nowDate: Date = DateUtil.getServerTime();
        for (var i: number = 0; i < LocalCache.TOTAL_WEEK_DAY; i++) {
            var tempDate: Date = new Date(nowDate.getTime() - i * ONE_DAY_MILLISECOND_TIME);
            if (tempDate.getDay() == LocalCache.FRIDAY_VALUE) {
                version = DateUtil.formatDateYMD(tempDate);
                break;
            }
        }
        return version;
    }

    public static getLatestThursday(): string {
        let date: Date = DateUtil.getServerTime();
        while (date.getDay() != 4) {
            date.setDate(date.getDate() + 1);
        }
        return DateUtil.customFormat(date, "yyyyMMdd");
    }

    public static allowStore(): boolean {
        return true;
    }

    /**
     *
     * @param key
     * @param weekly 如果为true, 则key变成key+最近周五的日期yyyyMMdd
     * @return
     *
     */
    public static getAndSetFlag(key: string, weekly: boolean = false): boolean {
        if (weekly) {
            key += LocalCache.getLatestThursday();
        }
        if (LocalCache.getFlag(key)) {
            return true;
        }
        let fullKey: string = UserInfo.account + "_" + key;
        LocalCache._flagMap[fullKey] = 1;
        LocalCache.setValue(UserInfo.account + '', 1, key);
        return false;
    }

    /**
     *
     * @param key
     * @param weekly 如果为true, 则key变成key+最近周五的日期yyyyMMdd
     * @return
     *
     */
    public static getFlag(key: string, weekly: boolean = false): boolean {
        if (weekly) {
            key += LocalCache.getLatestThursday();
        }
        let fullKey: string = UserInfo.account + "_" + key;
        if (LocalCache._flagMap.hasOwnProperty(fullKey)) { // 内存有 true
            return true;
        }

        if (!LocalCache.allowStore()) { // 不能使用本地缓存，且内存没有，false
            return false;
        }

        let value: any = LocalCache.getValue(UserInfo.account + "", key);
        if (value == null) { // 本地缓存没有
            return false;
        } else {
            return true;
        }
    }
}