import ServiceContainer from '../interfaces/ServiceContainer';
import DialogManager from '../common/dialog/DialogManager';
import Loading from '../common/Loading';
import IService from '../interfaces/IService';
import Text = Laya.Text;
import Handler = Laya.Handler;

export default class InteractUtil {
	public static applyCallback(func: Function | Handler, argArray: any = null, thisArg: any = null): void {
		if (func) {
			if (func instanceof Handler) {
				if (argArray != null) {
					func.runWith(argArray);
				} else {
					func.run();
				}
			} else {
				func.apply(thisArg, argArray);
			}
		}
	}

	public static setText(textField: Text, text: any): void {
		if (textField == null) {
			return;
		}
		let t: string;
		if (text == null) {
			t = "";
		} else if (typeof text === "string") {
			t = text;
		} else {
			t = text.toString();
		}
		textField.text = t;
	}

	/**
	  * 根据第一个“_”分割之后的字符串解析，调用对应Serivce的接口方法
	  * @param targetName 以“_”分割，从第0位无意义
	  * 
	  */
	public static getService(targetName: string): void {
		let values: string[] = targetName.split("_");

		/** "clearAll" 后的数组作参数传入*/
		let extParamsName: string = values[3];
		if (extParamsName == "clearAll") {
			DialogManager.instance.clearAll();
		}
		let serviceName: string = values[1];
		let functionName: string = values[2];
		Loading.show();
		ServiceContainer.tryGetService(serviceName, (service: IService, params: any) => {
			Loading.close();
			let callFun: Function = <Function>service[functionName];
			let funParams: any[] = [];

			if (extParamsName == "clearAll") {
				funParams = values.concat().splice(4, values.length - 1);
			} else {
				funParams = values.concat().splice(3, values.length - 1);
			}
			callFun.apply(service, funParams);
		});
	}
}