export default class EnumSupport
{
    private specialConstructors:any;

    public lock:boolean = true;

    constructor(specialConstructors:any = null)
    {
        this.specialConstructors = specialConstructors;
    }

    public check():void
    {
        if (this.lock)
        {
            throw new Error("Can't not construct outer.");
        }
    }

    public initField(this_:any, define:any, key:string):any
    {
        return EnumSupport.initFieldS(this_, define, key, this.specialConstructors);
    }

    public static initFieldS(this_:any, define:any, key:string, specialConstructors:any):any
    {
        var constructorFunc:Function = specialConstructors != null ? specialConstructors[key] : null;
        if (constructorFunc != null)
        {
            if (constructorFunc.length == 1)
            {
                return constructorFunc(define[key]);
            }
            else if (constructorFunc.length == 2)
            {
                return constructorFunc(this_, define[key]);
            }
            else
            {
                throw new Error("Not support constructor with params length: " + constructorFunc.length);
            }
        }
        else
        {
            return define[key];
        }
    }

}