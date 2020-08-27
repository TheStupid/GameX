export default class NumsZone_Helper {
    /**
     * 在哪个区间内，arr[0]前为第一个区间，返回0。
     * @param num
     * @param arr
     * @param containLimit 是否包含边界值，由于实际写活动的时候发现有不需要包含边界值的情况，
     * 所以加了这个参数，这样子就不需要每个数组的值都减去1了。
     * @return
     *
     */
    public static getZone(num: number, arr: any[], containLimit: boolean = true): number {
        let zone: number = 0;
        for (let i: number = 0; i < arr.length; i++) {
            zone = i;
            if (containLimit) {
                if (num <= arr[i]) {
                    break;
                }
            } else {
                if (num < arr[i]) {
                    break;
                }
            }
        }
        return zone;
    }

    constructor() {
    }
}
