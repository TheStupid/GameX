import FrameLabel from './FrameLabel';
export default class MovieData {

	private _name: string;
	private _urls: string[];
	private _width: number;
	private _height: number;
	private _pivotX: number;
	private _pivotY: number;
	private _frameLabels: FrameLabel[] = [];

	constructor(name: string, urls: string[], width: number, height: number, pivotX: number, pivotY: number, labels: Object = null) {
		this._name = name;
		this._urls = urls;
		this._width = width;
		this._height = height;
		this._pivotX = pivotX;
		this._pivotY = pivotY;
		if (labels) {
			for (let key in labels) {
				this._frameLabels.push(new FrameLabel(labels[key], parseInt(key)));
			}
		}
	}

	/**
	  * 动画名称
	  * @readonly
	  * @type {string}
	  */
	public get name(): string {
		return this._name;
	}

	/**
	  * 图片路径集合
	  * @readonly
	  * @type {string[]}
	  */
	public get urls(): string[] {
		return this._urls;
	}


	/**
	  * 宽
	  * @readonly
	  * @type {number}
	  */
	 public get width(): number {
		return this._width;
	}

	/**
	  * 高
	  * @readonly
	  * @type {number}
	  */
	public get height(): number {
		return this._height;
	}

	/**
	  * X轴 轴心点的位置，单位为像素，默认为0
	  * @readonly
	  * @type {number}
	  */
	public get pivotX(): number {
		return this._pivotX;
	}

	/**
	  * Y轴 轴心点的位置，单位为像素，默认为0
	  * @readonly
	  * @type {number}
	  */
	public get pivotY(): number {
		return this._pivotY;
	}

	/**
	  * 帧标签
	  */
	public get frameLabels(): FrameLabel[] {
		return this._frameLabels;
	}
}