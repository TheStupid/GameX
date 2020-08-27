import ArrayUtil from "../../util/ArrayUtil";

export default class NormalCharTranferResult {
    /**过滤及转换之后的文本**/
    public  filteredText:string;
    /**被过滤字符所在过滤文本前的index**/
    public ignoreCharIndexs:number[];
    constructor(filteredText:string,ignoreCharIndexs:number[]) {
        ArrayUtil.sort(ignoreCharIndexs);
        this.filteredText = filteredText;
        this.ignoreCharIndexs = ignoreCharIndexs;
    }
}