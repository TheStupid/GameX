/**
  * 范围最大最好不要超过10的9次方
  * */
export default class ConfuseInteger {
	private static RANGE: number = 715827882;
	private value: number;
	private offset: number;

	public constructor(value: number = 0) {
		this.setValue(value);
	}

	/**
	  * 返回实际值
	  * */
	public setValue(value: number): number {
		this.offset = Math.random() * ConfuseInteger.RANGE + ConfuseInteger.RANGE;
		this.value = value + this.offset;
		return this.value;
	}

	public getValue(): number {
		return this.value - this.offset;
	}

	/**
	  * 加减法。减法则传入负数
	  * 返回实际值
	  * */
	public add(value: number): number {
		return this.setValue(this.getValue() + value);
	}

	/**
	  * 乘除法
	  * 返回实际值
	  * */
	public multi(value: number): number {
		return this.setValue(this.getValue() * value);
	}
}