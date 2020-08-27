import NormalCharTranferResult from "./NormalCharTranferResult";
import ChineseDict from "./ChineseDict";

export default class WordHelper {
    private static DEFAULT_IGNORE_CHARS:string =  "勹灬冫屮辶刂匚阝廾丨虍彐卩钅冂冖宀疒肀丿攵凵犭亻彡饣礻扌氵纟亠囗忄讠衤廴尢夂丶";

    public static isIgnoreChar(c:string, ignoreLetterAndDigital:boolean):boolean {
        if(WordHelper.DEFAULT_IGNORE_CHARS.indexOf(c)!=-1){
            return true;
        }
        if((c>='A' && c<='Z') || (c>='a' && c<='z') || (c>='0' && c<='9')){
            return ignoreLetterAndDigital;
        }
        if(WordHelper.isChinese(c)){
            return false;
        }
        return false;
    }

    public static isChinese(textChar:string):boolean
    {
        var matchResult:any[]=textChar.match(/[\u4e00-\u9fa5]/g);
        return matchResult!=null && matchResult.length!=0;
    }

    public static convertToSimplifiedChinese(text:string):string
    {
        var newText:string="";
        for (var i:number = 0; i < text.length; i++)
        {
            var curChar:string=text.charAt(i);
            var jtChar:string=ChineseDict.FT_2_JT_MAP[curChar];
            newText=newText.concat(jtChar==null?curChar:jtChar);
        }
        return newText;
    }
    public static isBlankString(text:string):boolean
    {
        if( text==null ){
            return true;
        }
        for (var i:number = 0; i < text.length; i++)
        {
            if(text.charAt(i) != ' '){
                return false;
            }
        }
        return true;
    }

    /**
     * 全角转半角
     * @return
     */
    private static quanJiao2banJiao(c:string):string {
        var charCode:number=c.charCodeAt(0);
        if (charCode == 12288) {// 全角空格
            return String.fromCharCode(32);
        }
        if (charCode > 65280 && charCode < 65375) {// 其他全角字符
            return String.fromCharCode(charCode-65248);
        }
        return c;
    }
    /**
     * 转换字符为正常字符， 全角->半角,繁体->简体,大写->小写,中文数据
     * @param c 任意字符
     * @return
     */
    public static transferToNormalSimpleChar(c:string):string {
        c=WordHelper.quanJiao2banJiao(c);
        if(WordHelper.isChinese(c)){//中文
            var  jtC:string = WordHelper.convertToSimplifiedChinese(c);
            if (jtC != null) {
                c = jtC;
            }
            //var digitalNumber:string = CN_2_DIGIT_NUMBER[c];
            //if(digitalNumber!=null){  //中文数字转阿拉伯数字
            //	c=digitalNumber;
            //}
        }else{
            c=c.toLowerCase();
        }
        return c;
    }
    /**
     * 转换字符为正常字符， 全角->半角,繁体->简体,大写->小写,中文数据
     * @param src
     * @param useFilterAdv
     * @param ignoreLetterAndDigital true=则不会返回字母与数字,false=反之
     * @return
     */
    public static transferToNormalChar(str:string, ignoreLetterAndDigital:boolean):string {
        var result:NormalCharTranferResult = WordHelper.transferToNormalCharAndRecordIgnoreCharIndex(str, ignoreLetterAndDigital);
        return result==null?null:result.filteredText;
    }
    public static transferToNormalCharAndRecordIgnoreCharIndex(str:string, ignoreLetterAndDigital:boolean):NormalCharTranferResult {
        if(WordHelper.isBlankString(str)){
            return null;
        }
        var newStringChars:string="";
        var ignoreCharIndexs:number[]=[];
        for (var index:number = 0; index < str.length; index++) {
            var c:string = str.charAt(index);
            c=WordHelper.transferToNormalSimpleChar(c);
            if(WordHelper.isIgnoreChar(c, ignoreLetterAndDigital)){
                ignoreCharIndexs.push(index);
                continue;
            }
            newStringChars=newStringChars.concat(c);
        }
        return new NormalCharTranferResult(newStringChars, ignoreCharIndexs);
    }

    public static insertChar(text:string, index:number, addChar:string):string
    {
        return text.substring(0,index)+addChar+text.substring(index);
    }

    public static setCharAt(text:string, index:number, replaceChar:string):string
    {
        return text.substring(0,index)+replaceChar+text.substring(index+1);
    }

    public static readTxtToList(str:string):string[]
    {
        str = WordHelper.convertToSimplifiedChinese(str.toLocaleLowerCase());
        var list:string[]=str.split(/\n|\r\n/);
        return list;
    }

    public static listToMap(dictionaryWords:string[]):Object
    {
        var dictionaryWordObj:Object={};
        for(var word of dictionaryWords)
        {
            dictionaryWordObj[word]=1;
        }
        return dictionaryWordObj;
    }
}