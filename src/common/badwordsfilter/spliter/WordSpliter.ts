import WordHelper from "../WordHelper";
import WordSplitItem from "./WordSplitItem";
import WordTrieTreeNode from "./WordTrieTreeNode";
import Loader from "../../../loader/Loader";

export default class WordSpliter {
    private static UN_MATCH_INDEX:number = -1;

    private rootNode:WordTrieTreeNode;
    constructor(sensitiveWords:string[]) {
        const URL:string = "config/common/wordspliter_dict.txt";
        var dictionaryWords:Object=WordHelper.listToMap(WordHelper.readTxtToList(Loader.getRes(URL)));
        Loader.clearRes(URL);
        for(var sensitiveWord of sensitiveWords)
        {
            dictionaryWords[sensitiveWord]=1;
        }

        this.rootNode = WordTrieTreeNode.intiAcTrieTreeRootNode(dictionaryWords);
    }
    public splitWord(inputText:string):WordSplitItem[] {
        if (WordHelper.isBlankString(inputText)) {
            return [];
        }
        var wordSplitItems:WordSplitItem[]=[];
        var curState:WordTrieTreeNode = this.rootNode;
        var index:number = 0,lastAppendTextIndex:number=-1,len:number=inputText.length;
        var matchBeginIndex:number=WordSpliter.UN_MATCH_INDEX;
        for (; index < len; index++) {
            var c:string = WordHelper.transferToNormalSimpleChar(inputText.charAt(index));
            while(true){
                var node:WordTrieTreeNode = curState.getChildNode(c);
                if (node == null) { // 当前字符不匹配
                    if (curState.isRoot()) {//如果第一个字符就不匹配，直接到跳到下个字符
                        lastAppendTextIndex = this.appendSimpleWord(inputText, lastAppendTextIndex,index,wordSplitItems);
                        matchBeginIndex=WordSpliter.UN_MATCH_INDEX;
                        break;
                    }else{//如果不是第一个字符不匹配，尝试找它的待匹配的fail结点
                        curState = curState.fail;
                        matchBeginIndex=index-curState.height;
                        if (curState.isEnd) {// fail之后match
                            index--;
                            lastAppendTextIndex = this.appendMatchWord(inputText,matchBeginIndex,index,wordSplitItems);
                            break;
                        }

                    }
                }else{
                    if(matchBeginIndex==WordSpliter.UN_MATCH_INDEX){
                        matchBeginIndex=index;
                    }
                    curState = node;
                    if (curState.isEnd) {// 终结状态
                        lastAppendTextIndex = this.appendMatchWord(inputText,matchBeginIndex,index,wordSplitItems);
                    }
                    break;
                }
            }

        }
        lastAppendTextIndex = this.appendSimpleWord(inputText, lastAppendTextIndex,len-1, wordSplitItems);
        return wordSplitItems;
    }
    private appendMatchWord(inputText:string, matchBeginIndex:number, curIndex:number, wordSplitItems:WordSplitItem[]):number {
        var toOffset:number = curIndex+1;
        if(wordSplitItems.length!=0){
            var lastMatchItem:WordSplitItem = wordSplitItems[wordSplitItems.length-1];
            if(lastMatchItem.offset==matchBeginIndex){
                wordSplitItems.pop();
            }
            if(lastMatchItem.offset<matchBeginIndex){
                if(lastMatchItem.toOffset==toOffset || lastMatchItem.toOffset>matchBeginIndex){
                    return curIndex;
                }
            }
        }
        var wordItem:WordSplitItem = new WordSplitItem(inputText.substring(matchBeginIndex,toOffset), matchBeginIndex, toOffset);
        wordSplitItems.push(wordItem);
        return curIndex;
    }
    private appendSimpleWord(inputText:string, lastAppendTextIndex:number, curIndex:number,wordSplitItems:any[]):number {
        for (var index:number = lastAppendTextIndex+1; index <= curIndex; index++) {
            var c:string = inputText.charAt(index);
            if(!WordHelper.isIgnoreChar(WordHelper.transferToNormalSimpleChar(c),false)){
                wordSplitItems.push(new WordSplitItem(c, index, index+1));
            }
        }
        return curIndex;
    }
}