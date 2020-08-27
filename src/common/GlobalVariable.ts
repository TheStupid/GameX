export default class GlobalVariable {

	private static _instance: GlobalVariable;
	private _obj: Object = {};

	public constructor() {
	}

	public static get instance(): GlobalVariable {
		if (GlobalVariable._instance == null) {
			GlobalVariable._instance = new GlobalVariable();
		}
		return GlobalVariable._instance;
	}

	public setVar(key: string, value: Object): void {
		this._obj[key] = value;
	}

	public getVar(key: string): Object {
		return this._obj[key];
	}

	public remove(key: string): void {
		delete this._obj[key];
	}
}