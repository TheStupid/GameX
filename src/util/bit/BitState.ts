import BitUtil from "./BitUtil";

export default class BitState {
    private _useBitNum: number = -1;
    private _value: number = 0;

    /**
     * 初始化值：value
     * 使用位数：useBitNum
     * */
    constructor(value: number = 0, useBitNum: number = 0) {
        this.setValue(value);
        this.setUseBitNum(useBitNum);
    }

    public setValue(value: number): void {
        this._value = value;
    }

    public getValue(): number {
        return this._value;
    }

    public isBitSet(index: number): boolean {
        return BitUtil.isFlagSet(this._value, index);
    }

    public setBit(index: number): void {
        this._value = BitUtil.setFlag(this._value, index);
    }

    public clearBit(index: number): void {
        this._value = BitUtil.unSetFlag(this._value, index);
    }

    /**
     *设置使用前useBitNum位
     */
    public setUseBitNum(useBitNum: number): void {
        this._useBitNum = useBitNum;
        this.checkUseBitNum();
    }

    /**
     * 获取使用位数
     * @return
     */
    public getUseBitNum(): number {
        return this._useBitNum;
    }

    /**
     *使用前请确保输入了 _useBitNum
     * @return
     */
    public isUseBitAllSet(): boolean {
        for (let i: number = 0; i < this._useBitNum; ++i) {
            if (!BitUtil.isFlagSet(this._value, i)) {
                return false;
            }

        }
        return true;
    }

    /**
     * 使用前请确保：useBitNum;
     *判断是否使用的位是否全部都是0.
     * @return
     */
    public isUseBitAllClear(): boolean {
        for (let i: number = 0; i < this._useBitNum; ++i) {
            if (BitUtil.isFlagSet(this._value, i)) {
                return false;
            }

        }
        return true;
    }

    /**
     * 设置使用位全部为1（ 将value设置为使用位全为1的）
     * */
    public setUseBitAllSet(): void {
        this._value = Math.pow(2, this._useBitNum) - 1;
    }

    /**
     * 清除所有使用位
     * */
    public clearAllUseBit(): void {
        this._value = 0;
    }

    /**
     * 清除所有位，只是将value设置为0
     * */
    public clearAllBit(): void {
        this._value = 0;
    }

    public isZero(): boolean {
        return this._value == 0;
    }

    protected checkUseBitNum(): void {
        if (this._useBitNum < 0 || this._useBitNum > 32) {
            throw new Error("使用位数的数值错误应该[0,32],当前值" + this._useBitNum);
        }
    }

    /**
     * @return 获取使用位中有多少个设置为1
     */
    public getTotalSetBit(): number {
        return this.getBitNum(true);
    }

    /**
     * @return  获取使用位中有多少个设置为0
     */
    public getTotalClearBit(): number {
        return this.getBitNum(false);
    }

    protected getBitNum(isSetBit: boolean): number {
        let targetNum: number = 0;
        for (let i: number = 0; i < this._useBitNum; ++i) {
            if (BitUtil.isFlagSet(this._value, i)) {
                ++targetNum;
            }
        }
        return isSetBit ? targetNum : this._useBitNum - targetNum;
    }
}
