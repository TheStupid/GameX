export default class WordSplitItem {
    public word:string;
    public offset:number;//include
    public toOffset:number;//exclude
    constructor(word:string, offset:number, toOffset:number) {
        this.word = word;
        this.offset = offset;
        this.toOffset = toOffset;
    }
}