export default class EnterFrameManager
{
    private static _instance:EnterFrameManager;

    public static get instance():EnterFrameManager
    {
        if (EnterFrameManager._instance == null)
        {
            EnterFrameManager._instance = new EnterFrameManager();
        }
        return EnterFrameManager._instance;
    }

    private constructor()
    {
    }

    /**
     * func:监听的方法
     * params:监听方法的参数数组，调用时使用apply(null, params)方法
     * frameRate:频率，表示多少帧执行一次
     * caller:执行域
     * */
    public registerFun(func:Function, params:any[] = null, frameRate:number = 10, caller:any):boolean
    {
        Laya.timer.frameLoop(frameRate, caller, func, params);
        return true;
    }

    /**
     * 注册下一帧需要执行的函数，仅执行一次，执行完自动删除
     * @param func
     * @param params
     * @param caller
     * @return
     *
     */
    public registerNextFrame(func:Function, params:any[] = null, caller:any):void{
        Laya.timer.frameOnce(1, caller, func, params);
    }

    /**
     * 移除事件监听
     * */
    public removeFun(func:Function, caller:any):boolean
    {
        Laya.timer.clear(caller, func);
        return true;
    }
}