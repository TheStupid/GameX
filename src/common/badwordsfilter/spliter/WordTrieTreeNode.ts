export default class WordTrieTreeNode {
    public static ROOT_HEIGHT:number = 0;
    public character:string;
    // 用hashMap来代替数组
    public childrenNodes:Object = {};

    // 失败指针
    public fail:WordTrieTreeNode;

    // 树高
    public height:number;

    // true表示从root到this可以组成一个词(终结状态)
    public isEnd:boolean;

    public parentNodes:WordTrieTreeNode;

    constructor(character:string, height:number, isEnd:boolean) {
        this.character = character;
        this.height = height;
        this.isEnd=isEnd;
    }

    public getChildNode(c:string):WordTrieTreeNode {
        return this.childrenNodes[c];
    }

    public addNode(c:string,node:WordTrieTreeNode):void {
        this.childrenNodes[c]=node;
        node.parentNodes = this;
    }

    public characterEquals(node:WordTrieTreeNode):boolean {
        return node == null ? false : this.character==node.character;
    }

    public isRoot():boolean {
        return WordTrieTreeNode.ROOT_HEIGHT==this.height;
    }

    /**
     * 构造trie树
     */
    public static intiAcTrieTreeRootNode(dictionaryWords:any):WordTrieTreeNode {
        var root:WordTrieTreeNode = new WordTrieTreeNode(null, WordTrieTreeNode.ROOT_HEIGHT,false);
        for(var word in dictionaryWords) {
            WordTrieTreeNode.addWord(root,word);
        }
        WordTrieTreeNode.addFailNode(root);
        return root;
    }

    private static addWord(root:WordTrieTreeNode, word:string):void {
        var point:WordTrieTreeNode = root;
        for (var i:number = 0; i < word.length; ++i) {
            var c:string =word.charAt(i);
            var node:WordTrieTreeNode = point.getChildNode(c);
            if (node == null) {
                node = new WordTrieTreeNode(c, point.height + 1,false);
                point.addNode(c, node);
            }
            point = node;
        }
        point.isEnd = true;// terminal state node
    }

    /**
     * 构造失败指针的过程概括起来就一句话：设这个节点childNode上的字母为C，沿着他父亲的失败指针走，直到走到一个节点，
     * 他的儿子中也有字母为C的节点
     * 。然后把当前节点的失败指针指向那个字母也为C的儿子。如果一直走到了root都没找到，那就把失败指针指向root
     * @param root
     */
    private static addFailNode(root:WordTrieTreeNode):void {
        var queue:any[] = [root];
        root.fail = root;
        var index:number=0;
        while (queue.length>index) {
            var node:WordTrieTreeNode = queue[index++];
            for(var key in node.childrenNodes)
            {
            	var childNode = node.childrenNodes[key];
                var point:WordTrieTreeNode = node;
                while (point != root) {
                    var temp:WordTrieTreeNode = point.fail.getChildNode(childNode.character);
                    if (childNode.characterEquals(temp)) {
                        childNode.fail = temp;
                        break;
                    } else {
                        point = point.fail;
                    }
                }
                if (point == root) {
                    childNode.fail = root;
                }
                queue.push(childNode);
            }
        }
    }
}