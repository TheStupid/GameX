export default class BitUtil {
    private static INT_MAX_LENGTH: number = 32;

    constructor() {
    }

    /**
     * 判断标记的某一位是否为1
     * @param flag 整型标记
     * @param pos 需要判断的位置
     * @return 该位为1返回true，反之false
     */
    public static isFlagSet(flag: number, pos: number): boolean {
        if (pos < 0 || pos >= BitUtil.INT_MAX_LENGTH) {
            throw new Error("设置位不是合法的位置：" + pos);
        }
        return (flag & (1 << pos)) != 0;
    }

    /**
     * 设置标记的某一位为1
     * @param flag 整型标记
     * @param pos 需要设置的位置
     * @return 被设置某位为1之后的标记副本
     */
    public static setFlag(flag: number, pos: number): number {
        if (pos < 0 || pos >= BitUtil.INT_MAX_LENGTH) {
            throw new Error("设置位不是合法的位置：" + pos);
        }
        return flag | (1 << pos);
    }

    /**
     * 设置标记的某一位为0
     * @param flag 整型标记
     * @param pos 需要设置的位置
     * @return 被设置某位为0之后的标记副本
     */
    public static unSetFlag(flag: number, pos: number): number {
        if (pos < 0 || pos >= BitUtil.INT_MAX_LENGTH) {
            throw new Error("设置位不是合法的位置：" + pos);
        }
        return flag & ~(1 << pos);
    }

    /**
     * 查看标记中含有多少个1
     * @param flag 整型标记
     * @return 标记中1的个数
     */
    public static bitCount(flag: number): number {
        let count: number = 0;
        while (flag != 0) {
            count += flag % 2;
            flag /= 2;
        }
        return count;
    }

    /**
     * 将标记拆分成01数组（从低位到高位）
     * @param flag 需要拆分的整型标记
     * @param length 拆分的长度
     * @return 拆分好的01数组
     */
    public static splitIntoIntArray(flag: number, length: number): any[] {
        let resArr: any[] = [];
        for (let i: number = 0; i < length; i++) {
            resArr.push(flag % 2);
            flag /= 2;
        }
        return resArr;
    }

    /**
     * 将数组转换成标记，非0的值都转换为1，数组第一个元素在最低位
     * @param arr 需要转换的数组
     * @return 数组对应的标记
     */
    public static arrayToFlag(arr: any[]): number {
        let flag: number = 0;
        for (let i: number = 0; i < arr.length; i++) {
            if (arr[i] != 0) {
                flag = BitUtil.setFlag(flag, i);
            }
        }
        return flag;
    }

    /**
     * 将标记拆分成用分隔符间隔的字符串，不传则没有分隔符的01字符串（从低位到高位）
     * @param flag
     * @param length
     * @param separator
     * @return
     */
    public static splitIntoString(flag: number, length: number, separator: string = ""): string {
        let resStr: string = "";
        for (let i: number = 0; i < length; i++) {
            resStr = resStr + (flag % 2) + separator;
            flag /= 2;
        }
        if (resStr.length > 0) {
            resStr = resStr.substr(0, resStr.length - separator.length);
        }
        return resStr;
    }
}
