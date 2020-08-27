export default class ServiceConfig {

    private static _configs: Object = {};
    // public static readonly LoginService = new ServiceConfig("LoginService", LoginService);

    private _name: string;
    private _classRef: any;

    private constructor(name: string, classRef: any) {
        this._name = name;
        this._classRef = classRef;
        ServiceConfig._configs[name] = this;
    }

    public static getConfig(name: string): ServiceConfig {
        return ServiceConfig._configs[name];
    }

    public get name(): string {
        return this._name;
    }

    public get classRef(): any {
        return this._classRef;
    }
}