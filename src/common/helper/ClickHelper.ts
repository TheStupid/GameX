import Dictionary from '../../util/Dictionary';
import IDispose from '../../interfaces/IDispose';
import StringUtil from "../../util/StringUtil";
import Sprite = Laya.Sprite;
import Button = Laya.Button;
import Event = Laya.Event;

export default class ClickHelper implements IDispose {
    private _clickFuncDictionary = new Dictionary<string, IArguments>();
    private _regexFuncDictionary = new Dictionary<any, IArguments>();

    public constructor(private _res: Sprite) {
        this._res.on(Event.REMOVED, this, this.onRemoved);
        this._res.on(Event.CLICK, this, this.onClick);
    }

    public dispose(): void {
        if (this._res == null) {
            return;
        }
        this._res.off(Event.REMOVED, this, this.onRemoved);
        this._res.off(Event.CLICK, this, this.onClick);
        this._clickFuncDictionary.clear();
        this._regexFuncDictionary.clear();
        this._clickFuncDictionary = null;
        this._regexFuncDictionary = null;
        this._res = null;
    }

    public regClickFunc(targetName: string, callBack: Function, thisArg: any, argArray: any[] = null, withTarget:boolean = false): void {
        this._clickFuncDictionary.setValue(targetName, arguments);
    }

    public regRegexFunc(pattern: any, callBack: Function, thisArg: any, argArray: any[] = null, withTarget:boolean = false): void {
        this._regexFuncDictionary.setValue(pattern, arguments);
    }

    private onRemoved(): void {
        this.dispose();
    }

    private onClick(evt: Event): void {
        let target = evt.target;
        if (!(target instanceof Button)) {
            return;
        }
        if (this._clickFuncDictionary.containsKey(target.name)) {
            this.applyCallback(this._clickFuncDictionary.getValue(target.name), target);
        } else {
            this._regexFuncDictionary.forEach((key, args): void => {
                if (target.name.match(key)) {
                	this.applyCallback(args, target, target.name);
                }
            });
        }
    }

    private applyCallback(args:IArguments, target:Sprite, targetName:string = null):void
	{
        let argArray:any[] = [];
        if(args[4]){
            argArray.push(target);
        }else if(!StringUtil.isNullOrEmpty(targetName)){
        	argArray.push(targetName);
		}
        if(args[3]){
            argArray = argArray.concat(args[3]);
        }
        (<Function>args[1]).apply(args[2], argArray);
	}
}