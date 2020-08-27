import WordSpliter from "./spliter/WordSpliter";
import WordHelper from "./WordHelper";
import Loader from "../../loader/Loader";
import NormalCharTranferResult from "./NormalCharTranferResult";
import WordSplitItem from "./spliter/WordSplitItem";

export default class WordFilter
{
    private static DEFAULT_KEY_WORD_REPLACER:string = '*';

    public dictionaryWords:any;
    public wordSpliter:WordSpliter;

    constructor(userDefSensiveDicts:string[],userDefSpliterDicts:string[]) {
        const URL:string = "config/common/sensive_dict.txt";
        var dictionaryWords:string[]=WordHelper.readTxtToList(Loader.getRes(URL));
        Loader.clearRes(URL);
        dictionaryWords = dictionaryWords.concat(userDefSensiveDicts);
        this.dictionaryWords=this.getDictionaryWords(dictionaryWords);

        var spliterWords:string[] = this.getNewDictArray(dictionaryWords);
        spliterWords = spliterWords.concat(userDefSpliterDicts);
        this.wordSpliter=new WordSpliter(spliterWords);
    }

    //获取新的Array
    private getNewDictArray(dictionaryWords:string[]):string[] {
        var list:string[] = [];
        for(var dict of dictionaryWords)
        {
            list.push(dict);
        }
        return list;
    }


    private getDictionaryWords(dictionaryWords:any[]):any {
        var newDictionaryWords:any={};
        for(var dict of dictionaryWords)
        {
            if(!WordHelper.isBlankString(dict)){
                newDictionaryWords[dict]=1;
            }
        }
        return newDictionaryWords;
    }

    //判断是否包含敏感词
    public isIllegalText(text:string):boolean{
        if (WordHelper.isBlankString(text)) {
            return false;
        }
        if(this.matchWithAnalysisResult(text)){
            return true;
        }
        if(this.matchWithAnalysisResult(this.preHandleText(text,true))){
            return true;
        }
        return this.matchWithAnalysisResult(this.preHandleText(text,false));
    }

    private matchWithAnalysisResult(text:string):boolean {
        var wordAnalysisResult:WordSplitItem[] = this.wordSpliter.splitWord(text);
        for(var term of wordAnalysisResult) {
            if(this.dictionaryWords[term.word]!=null){
                return true;
            }
        }
        return false;
    }

    private preHandleText(text:string, ignoreLetterAndDigital:boolean):string {
        return WordHelper.transferToNormalChar(text,ignoreLetterAndDigital);
    }

    //过滤敏感词
    public filterIllegalText(text:string):string{
        if (WordHelper.isBlankString(text)) {
            return text;
        }
        var defaultText:string = text;
        var result:string = "";
        text = this.replaceKeywordWithPrehandleText(text,false);
        for(var index:number = 0; index<text.length; index++){
            var char:string = text.charAt(index);
            if(char == "*"){
                result = result + char;
            }else{
                result = result + defaultText.charAt(index);
            }
        }
        return result;
    }

    private replaceKeywordWithPrehandleText(inputText:string, ignoreLetterAndDigital:boolean):string {
        var textResult:NormalCharTranferResult = WordHelper.transferToNormalCharAndRecordIgnoreCharIndex(inputText,ignoreLetterAndDigital);
        var filteredText:string = this.replacekeywordByText(textResult.filteredText);
        for(var ignoreCharIndex of textResult.ignoreCharIndexs) {
            var ignoreChar:string = inputText.charAt(ignoreCharIndex);
            filteredText=WordHelper.insertChar(filteredText,ignoreCharIndex, ignoreChar);
        }
        return filteredText.toString();
    }

    private replacekeywordByText(inputText:string):string {
        var filteredText:string=inputText;
        var wordAnalysisResult:WordSplitItem[] = this.wordSpliter.splitWord(filteredText);
        for(var term of wordAnalysisResult) {
            if(this.dictionaryWords[term.word]!=null){
                for (var i:number = term.offset; i < term.toOffset; i++) {
                    filteredText=WordHelper.setCharAt(filteredText,i, WordFilter.DEFAULT_KEY_WORD_REPLACER);
                }
            }
        }
        return filteredText;
    }
}