import Loader from "./Loader";

export default class Domain {

    /**
     * 资源路径列表
     */
    private _urlList:string[] = null;

    private static _domainList:Domain[] = [];

    public constructor()
    {
    }

    public add(url: string|(Object|string)[]):void
    {
        this.reset();
        if(typeof url === "string"){
            this.addOne(url);
        }else{
            for(var obj of url){
                if(typeof obj === "string"){
                    this.addOne(obj);
                }else{
                    this.addOne(obj["url"]);
                }
            }
        }
    }

    public remove(url: string|(Object|string)[]):void
    {
        if(this._urlList){
            if(typeof url === "string"){
                this.removeOne(url);
            }else{
                for(let obj of url){
                    if(typeof obj === "string"){
                        this.removeOne(obj);
                    }else{
                        this.removeOne(obj["url"]);
                    }
                }
            }
        }
    }

    public contains(url:string):boolean
    {
        return this._urlList ? this._urlList.indexOf(url) != -1 : false;
    }

    public isEmpty():boolean
    {
        return this._urlList ? this._urlList.length == 0 : true;
    }

    public clear():void
    {
        if(this._urlList){
            let index = Domain._domainList.indexOf(this);
            Domain._domainList.splice(index, 1);
            for(let domain of Domain._domainList){
                if(!domain.isEmpty()){
                    for(let i = this._urlList.length - 1; i >=0; i--){//倒序遍历
                        let url = this._urlList[i];
                        if(domain.contains(url)){
                            this.removeOne(url);
                        }
                    }
                }
            }
            Loader.clearRes(this._urlList);
            this._urlList = null;
        }
    }

    private reset():void
    {
        if(this._urlList == null){
            this._urlList = [];
            Domain._domainList.push(this);
        }
    }

    private addOne(url:string):void
    {
        if(!this.contains(url)){
            this._urlList.push(url);
        }
    }

    private removeOne(url:string):void
    {
        let index = this._urlList.indexOf(url);
        if(index != -1){
            this._urlList.splice(index, 1);
        }
    }
}