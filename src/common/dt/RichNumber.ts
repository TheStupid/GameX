export default class RichNumber {

    private static UINT_TO_BOOL = function(...params:any[]): boolean {
        return params[0] > 0;
    };

    private _num: number;

    /**
     * <b>NOTE</b>: 由于AS不支持 64 位移位，所以这个是 32 位的，long 的高位会被干掉
     */
    public constructor(num: number) {
        this._num = num
    }

    public orgGet(): number {
        return this._num;
    }

    public orgSet(value: number): void {
        this._num = value;
    }

    /**
     * @param bit 右边第一位是 0
     */
    public binGet(bit: number): number {
        return 0x00000001 & (this._num >>> bit);
    }

    /**
     * @param bit 右边第一位是 0
     */
    public binSet(bit: number, value: number): void {
        var l: number = 0;
        var r: number = 0;
        if (bit < 32 - 1) {
            l = (0xFFFFFFFF >>> (bit + 1)) << (bit + 1);
        }
        if (bit > 0) {
            r = ~((0xFFFFFFFF >>> bit) << bit);
        }
        this._num = (this._num & (l | r | (value << bit))) | (value << bit);
    }

    /**
     * @param bit 右边第一位是 0
     */
    public decGet(bit: number): number {
        return Math.floor(this._num / Math.pow(10, bit)) % 10;
    }

    /**
     * @param bit 右边第一位是 0
     */
    public decSet(bit: number, value: number): void {
        var l: number = Math.floor(this._num / Math.pow(10, bit + 1));
        var r: number = this._num % Math.pow(10, bit);

        this._num = l * Math.pow(10, bit + 1) + (value % 10) * Math.pow(10, bit) + r;
    }

    public toString(radix: number = 10): String {
        return this._num.toString(radix);
    }

    /**
     * @param length 数组长度
     * @param radix 进制，现只支持 2 或 10
     */
    public static toUintArray(num: number, length: number, radix: number): number[] {
        var arr: number[] = new Array<number>(length);
        var numR: RichNumber = new RichNumber(num);
        for (var i: number = 0; i < arr.length; i++) {
            switch (radix) {
                case 2: arr[i] = numR.binGet(i); break;
                case 10: arr[i] = numR.decGet(i); break;
                default: throw new Error("Not support radix: " + radix);
            }
        }
        return arr;
    }

    /**
     * @param length 数组长度
     * @param radix 进制，现只支持 2 或 10
     */
    public static toUintVector(num: number, length: number, radix: number): number[] {
        return RichNumber.toUintArray(num, length, radix);
    }

    /**
     * @param length 数组长度
     * @param radix 进制，现只支持 2 或 10
     */
    public static toBoolArray(num: number, length: number, radix: number): boolean[] {
        return RichNumber.toUintArray(num, length, radix).map(RichNumber.UINT_TO_BOOL);
    }

    /**
     * @param length 数组长度
     * @param radix 进制，现只支持 2 或 10
     */
    public static toBoolVector(num: number, length: number, radix: number):  boolean[] {
        return RichNumber.toBoolArray(num, length, radix);
    }

}