export default class ResourceObject {
		private _resPath:string=null;
		private _clsName:string=null;
		private _pars:any[]=null;

		constructor(path:string, clsName:string, pars:any[]=null) {
			this._resPath=path;
			this._clsName=clsName;
			this._pars=pars;
		}

		public get resPath():string {
			return this._resPath;
		}

		public get clsName():string {
			return this._clsName;
		}

		public get pars():any[] {
			return this._pars;
		}
	}
