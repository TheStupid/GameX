import ICommand from './ICommand';
import Event from '../../egret/events/Event';

export default class CommandEvent extends Event {

    public static readonly SUCCEED:string = "onCommandSucceed";

    public static readonly FAILED:string = "onCommandFailed";

    public static readonly CANCELED:string = "onCommandCanceled";

    private _params:any;

    private _command:ICommand;

    constructor(type:string, command:ICommand, params:any = null) {
        super(type);
        this._command = command;
        this._params = params;
    }

    public get params():any {
        return this._params;
    }

    public get command():ICommand {
        return this._command;
    }
}