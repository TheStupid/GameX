import Sprite = Laya.Sprite;
import Clip = Laya.Clip;

export default class McDigitHelper {

	constructor() {
	}

	/**
	  * @param theInt
	  * @param mcs    从个位数开始,第一帧为0,后面递增
	  * @param vars    needZero:是否要填补"0"； numByRight 如果不填补"0", 真实数字是否居右
	  *
	  */
	public static intToMC(theInt: number, mcs: Clip[], vars: Object = null): void {
		var needZero: boolean = vars == null ? true : vars["needZero"];
		var numByRight = vars == null ? true : vars["numByRight"];

		var offset: number = 0;
		var theStr: string = theInt.toString();
		if (needZero) {
			while (theStr.length < mcs.length) {
				theStr = "0" + theStr;
			}
		}

		offset = mcs.length - theStr.length;

		for (var mc of mcs) {
			/** 因为从个位数开始,第一帧为0,后面递增，所以倒置元件的index */
			var mcIndex: number = mcs.length - mcs.indexOf(mc) - 1;
			/**真实数字居右， 左边的零位不在charAt查找范围类 */
			var index: number = numByRight == true ? mcIndex - offset : mcIndex;
			mc.visible = true;
			if (index < 0 || index >= theStr.length) {
				mc.visible = false;
			}
			else {
				mc.index = parseInt(theStr.charAt(index));
			}
		}
	}

	public static intToMCAuto(theInt: number, container: Sprite, vars: Object = null, tarNamePrefix: string = "md"): void {
		var mcs: Clip[] = [];
		McDigitHelper.pushToArray(tarNamePrefix, mcs, container);
		McDigitHelper.intToMC(theInt, mcs, vars);
	}

	public static updateMcNum(prefix: string, value: number, res: Sprite, numByRight: boolean = false): void {
		McDigitHelper.intToMCAuto(value, res, { "needZero": false, "numByRight": numByRight }, prefix);
	}

	/**
	  * @param tarNamePrefix
	  * @param tarArray
	  * @param container
	  * @param onGetTar (tar:DisplayObject, index:number)
	  */
	public static pushToArray(tarNamePrefix: string, tarArray: Clip[], container: Sprite, onGetTar: Function = null, thisArg: any = null): void {
		var index: number = 0;
		while (1) {
			var tar: Clip = container.getChildByName(tarNamePrefix + index) as Clip;
			if (tar == null) {
				break;
			}
			tarArray.push(tar);
			if (onGetTar != null) {
				onGetTar.apply(thisArg, [tar, index]);
			}
			index++;
		}
	}

	public static intToMCAutoFitCenter(prefix: string, value: number, container: Sprite): void {
		var numElement: Clip[] = [];
		McDigitHelper.pushToArray(prefix, numElement, container, function (tar: Clip, index: number) {
			McDigitHelper.initOriginalXY(tar);
		}, this);
		if (numElement.length == 0) {
			return
		}

		var maxNum: number = Math.pow(10, numElement.length) - 1;
		if (value > maxNum) {
			value = maxNum;
		}

		McDigitHelper.intToMC(value, numElement, { "needZero": false, "numByRight": false });
		var rightDigitX: number = 0;
		for (var num of numElement) {
			if (num.visible) {
				rightDigitX = num.x;
				break;
			}
		}
		var minDigit = numElement[0];
		var offset: number = (minDigit.x - rightDigitX) / 2;

		for (var digit of numElement) {
			digit.x = digit.x + offset;
		}
	}

	private static readonly OriginalXName: string = "McDigitHelperOriginalX";
	private static readonly OriginalYName: string = "McDigitHelperOriginalY";

	private static initOriginalXY(tar: Clip): void {
		if (tar.hasOwnProperty(McDigitHelper.OriginalXName)) {
			tar.x = tar[McDigitHelper.OriginalXName];
		}
		else {
			tar[McDigitHelper.OriginalXName] = tar.x
		}

		if (tar.hasOwnProperty(McDigitHelper.OriginalYName)) {
			tar.y = tar[McDigitHelper.OriginalYName];
		}
		else {
			tar[McDigitHelper.OriginalYName] = tar.y
		}
	}
}