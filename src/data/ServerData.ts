export default class ServerData {
    private static _instance:ServerData = new ServerData();
    public static get instance(): ServerData{
        return this._instance;
    }
}
