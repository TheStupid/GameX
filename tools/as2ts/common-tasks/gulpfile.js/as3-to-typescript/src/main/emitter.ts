
import Token = require('./token');
import NodeKind = require('./nodeKind');
import Operators = require('./operators');
import KeyWords = require('./keywords');
import Node = require('./node');
import glob = require('glob');
import path = require('path');
import toolConfig = require('../../tool_config');

var CAN_NOT_FIND_ANY_TS_FILE:string = " can not find any match ts file";
//Utils
function assign(target: any, ...items: any[]): any {
    return items.reduce(function (target: any, source: any) {
        return Object.keys(source).reduce((target: any, key: string) => {
            target[key] = source[key];
            return target;
        }, target);
    }, target);
}


var keywordsCheck: { [index: string]: boolean } 
    = Object.keys(KeyWords).reduce(
        (result: { [index: string]: boolean}, key: string) => {
            var keyword: string = (<any>KeyWords)[key];
            result[keyword] = true;
            return result;
        }, <{ [index: string]: boolean}>{}
    );

function isKeyWord(text: string): boolean {
    return !!keywordsCheck[text];
}





function transformAST(node:Node, parentNode: Node): Node {
    //we don't care about comment
    var newNode=  new Node(
        node.kind, 
        node.start,
        node.end,
        node.text,
        [],
        parentNode
    );
    
    newNode.children = node.children.filter(
        child => !!child && 
            child.kind !== NodeKind.AS_DOC && 
            child.kind !== NodeKind.MULTI_LINE_COMMENT
    ).map(child => transformAST(child, newNode))
    
    return newNode;
}


interface Scope {
    parent: Scope;
    declarations: Declaration[];
    isTopLevel: boolean;
}
var globVars = [
    'undefined', 'NaN', 'Infinity',
    'Array',  'Boolean',  'decodeURI',  'decodeURIComponent',  'encodeURI',  'encodeURIComponent',  'escape',  
    'int',  'isFinite',  'isNaN',  'isXMLName',  'Number',  'Object',  
    'parseFloat', 'parseInt',  'String',  'trace',  'uint',  'unescape',  'Vector',  'XML',  'XMLList',
    'ArgumentError',  'arguments',  'Class',  'Date',  'DefinitionError',  'Error',  'EvalError',  'Function',  'Math',  'Namespace',                       'QName',  'RangeError',  'ReferenceError',  'RegExp',  'SecurityError',  'SyntaxError',  'TypeError',  'URIError',  'VerifyError'
];


interface Declaration { 
    bound?: string; 
    name: string; 
}

export interface EmitterOptions { 
    lineSeparator: string;
}

var defaultEmitterOptions = {
    lineSeparator: '\n'
}

var data: {
    source: string;
    options: EmitterOptions;
    filePath:string;
}

var state: {
    index: number;
    currentClassName: string;
    scope: Scope;
    isNew: boolean;
    emitThisForNextIdent: boolean;
    parentNode?: Node
};

var output: string;
export function emit(ast: Node, source: string, filePath?:string,options?: EmitterOptions) {
    data = {
        source: source,
        filePath:filePath,
        options: assign(defaultEmitterOptions, options || {})
    };
    Object.freeze(data);
    
    
    state = {
        index: 0,
        currentClassName: '',
        scope: null,
        isNew: false,
        emitThisForNextIdent: true
    }
    output = '';
    
    
    
    enterScope([]);
    var packageNode = ast.findChild(NodeKind.PACKAGE);
    visitNode(transformAST(packageNode, ast));
    catchup(packageNode.end);
    //record index where the last package } located.
    var lastBracketIndex:number = output.lastIndexOf("}");
    var contentNode = ast.findChild(NodeKind.CONTENT);
    visitNode(transformAST(contentNode, ast));
    // visitNode(transformAST(ast, null));
    catchup(data.source.length);
    //remove the last package }
    var tmpOutput = output.substring(0,lastBracketIndex);
    output =tmpOutput+output.substring(lastBracketIndex+1);
    exitScope();
    return output;
}

function visitNodes(nodes: Node[]) {
    if (!nodes) {
        return;
    }
    nodes.forEach(node =>  visitNode(node));
}

var visitors: {[kind: string]: (node: Node) => void } = {};

visitors[NodeKind.PACKAGE] = emitPackage;
visitors[NodeKind.META] = emitMeta;
visitors[NodeKind.IMPORT] = emitImport;
visitors[NodeKind.INCLUDE] = visitors[NodeKind.USE] = emitInclude;
visitors[NodeKind.FUNCTION] = emitFunction;
visitors[NodeKind.LAMBDA] = emitFunction;
visitors[NodeKind.INTERFACE] = emitInterface;
visitors[NodeKind.CLASS] = emitClass;
visitors[NodeKind.VECTOR] = emitVector;
visitors[NodeKind.SHORT_VECTOR] = emitShortVector;
visitors[NodeKind.TYPE] = emitType;
visitors[NodeKind.CALL] = emitCall;
visitors[NodeKind.NEW] = emitNew;
visitors[NodeKind.RELATION] = emitRelation;
visitors[NodeKind.OP] = emitOp;
visitors[NodeKind.IDENTIFIER] = emitIdent;
visitors[NodeKind.XML_LITERAL] = emitXMLLiteral;
visitors[NodeKind.CONST_LIST] = emitConstList;


function visitNode(node: Node) {
    if (!node) {
        return;
    }
    if (visitors.hasOwnProperty(node.kind)) {
        visitors[node.kind](node);
    } else {
        catchup(node.start);
        visitNodes(node.children);
    }
}

function emitPackage(node: Node) {
    catchup(node.start);
    skip(NodeKind.PACKAGE.length);
    //aoqih5 去除package node
    var fisrtChildNode: Node = node.findChildren("name")[0];
    if(fisrtChildNode){
        skip(fisrtChildNode.end-fisrtChildNode.start+1);
    }
    var contetChildNode: Node = node.findChildren("content")[0];
    skipTo(contetChildNode.start);//跳过换行符和最外层的{
    // skip(2);//跳过换行符和最外层的{
    visitNodes(node.children.concat().slice(1));

    // catchup(node.start);
    // skip(NodeKind.PACKAGE.length);
    // insert('module');
    // visitNodes(node.children);
}

function emitMeta(node: Node) {
    catchup(node.start);
    commentNode(node, false);
}

function emitInclude(node: Node) {
    catchup(node.start);
    commentNode(node, true);
}

function emitImport(node: Node) {
    var split = node.text.split('.');
    var name = split[split.length -1];
    var importClassForAoqi:string = findTheImportClassForAoqiH5(name);
    var hasImport:boolean = output.indexOf(importClassForAoqi)!=-1;
    // console.log("hasImport:"+hasImport +" node text:"+node.text)
    if(importClassForAoqi.indexOf(CAN_NOT_FIND_ANY_TS_FILE)!=-1 || hasImport ){
        //if can not find any match ts file, skip this import node.
        catchup(node.start-1);
        skipTo(node.start);
        skip(node.end-node.start+NodeKind.IMPORT.length+2);
    }else{
        catchup(node.start + NodeKind.IMPORT.length + 1);
        insert(importClassForAoqi);
        skip(node.end-node.start);
        state.scope.declarations.push({ name: name });
    }
    // catchup(node.start + NodeKind.IMPORT.length + 1);
    // var split = node.text.split('.');
    // var name = split[split.length -1];
    // insert(name + ' = ');
    // catchup(node.end);
    // state.scope.declarations.push({ name: name });
}

var FLASH_NATIVE_CLASS:Object = {
    "Sprite": "Sprite = Laya.Sprite",
    "TextField": "Text = Laya.Text",
    "SimpleButton": "Button = Laya.Button",
    "Point" : "Point = Laya.Point",
    "MovieClip": "ViewStack = Laya.ViewStack"
}

function findTheImportClassForAoqiH5(name):string {
    var flashNativeClass = FLASH_NATIVE_CLASS[name];
    if(flashNativeClass){
        return flashNativeClass;
    }else{
        var exsitsFileNames = glob.sync('**/'+name+'+(.ts|.as)', {
            "cwd": path.join(toolConfig.sourcePath),
            "nodir": true
        });
        if(exsitsFileNames.length==0){
            var resultStr:string = name+CAN_NOT_FIND_ANY_TS_FILE;
            console.log(resultStr)
            return resultStr;
        }else{
            var firstClassPath = findTheNearestClass(exsitsFileNames);
            // console.log("firstClassPath:"+path.join(toolConfig.sourcePath,firstClassPath))
            // console.log("data.filePath:"+data.filePath)
            // firstClassPath = path.relative(path.dirname(data.filePath), path.join(toolConfig.sourcePath,firstClassPath));
            console.log("find import relative:"+firstClassPath);
            firstClassPath = firstClassPath.replace(/\\/g,"/");
            firstClassPath = firstClassPath.replace(".ts","");
            firstClassPath = firstClassPath.replace(".as","");
            if(firstClassPath.indexOf("..")==-1){
                return name +" from \"./"+firstClassPath+"\"";
            }else{
                return name +" from \""+firstClassPath+"\"";
            }

        }
    }
}

function findTheNearestClass(exsitsFileNames) :string{
    var relativeFilePaths = [];
    exsitsFileNames.forEach((fileName,index:number,arr)=>{
        relativeFilePaths[index] = path.relative(path.dirname(data.filePath), path.join(toolConfig.sourcePath,fileName));
    })
    relativeFilePaths.sort((a:string,b:string)=>{
        if(a.length==b.length){
            return 0;
        }else if(a.length<b.length){
            return -1;
        }else{
            return 0;
        }
    })
    return relativeFilePaths[0];
}

function emitInterface(node: Node) {
    emitDeclaration(node);


    //we'll catchup the other part
    state.scope.declarations.push({ name: node.findChild(NodeKind.NAME).text });
    var content = node.findChild(NodeKind.CONTENT)
    var contentsNode = content && content.children;
    if (contentsNode) {
        contentsNode.forEach(node => {
            visitNode(node.findChild(NodeKind.META_LIST));
            catchup(node.start);
            if (node.kind === NodeKind.FUNCTION) {
                emitInterfacesNormalFunction(node);
            } else if (node.kind === NodeKind.GET || node.kind === NodeKind.SET) {
                emitInterfacesGetAndSetFunction(node);
            } else {
                //include or import in interface content not supported
                commentNode(node, true);
            }
        })
    }
}

function emitInterfacesNormalFunction(node:Node) {
    skip(NodeKind.FUNCTION.length);
    var name = node.findChild(NodeKind.NAME);
    catchup(name.end);
    var paramerterList = node.findChild(NodeKind.PARAMETER_LIST);
    if (paramerterList && paramerterList.children.length) {
        var params:Node[]  = paramerterList.findChildren(NodeKind.PARAMETER);
        params.forEach(param =>  {
            var nameTypeInit = param.findChild(NodeKind.NAME_TYPE_INIT);
            if(nameTypeInit){
                var nameTypeInit_name_node = nameTypeInit.findChild(NodeKind.NAME);
                // console.log("nameTypeInit_name_node:"+nameTypeInit_name_node.text);
                catchup(nameTypeInit_name_node.end);
                var nameTypeInit_type_node = nameTypeInit.findChild(NodeKind.TYPE);
                var nameTypeInit_init_node = nameTypeInit.findChild(NodeKind.INIT);
                if(nameTypeInit_init_node){
                    // console.log("has nameTypeInit_init_node:"+state.index+" "+nameTypeInit_init_node.text);
                    insert("?");
                    if(nameTypeInit_type_node){
                        emitType(nameTypeInit_type_node);
                    }
                    skipTo(nameTypeInit_init_node.end);
                }else{
                    // console.log("no nameTypeInit_init_node:"+state.index);
                    if(nameTypeInit_type_node){
                        emitType(nameTypeInit_type_node);
                    }
                }
            }
        });
    }
    var type = node.findChild(NodeKind.TYPE);
    if (type) {
        emitType(type);
    }
}


function emitInterfacesGetAndSetFunction(node) {
    var foundVariables: { [name: string]: boolean } = {};
    var name = node.findChild(NodeKind.NAME),
        paramerterList = node.findChild(NodeKind.PARAMETER_LIST);
    if (!foundVariables[name.text]) {
        skipTo(name.start);
        catchup(name.end);
        foundVariables[name.text] = true;
        if (node.kind === NodeKind.GET) {
            skipTo(paramerterList.end);
            var type = node.findChild(NodeKind.TYPE);
            if (type) {
                emitType(type);
            }
        } else if (node.kind === NodeKind.SET) {
            var setParam = paramerterList
                .findChild(NodeKind.PARAMETER).children[0];
            skipTo(setParam.findChild(NodeKind.NAME).end)
            var type = setParam.findChild(NodeKind.TYPE);
            if (type) {
                emitType(type);
            }
            skipTo(node.end);
        }
    } else {
        commentNode(node, true);
    }
}

function emitFunction(node: Node) {
    emitDeclaration(node);
    enterFunctionScope(node);
    var rest = node.getChildFrom(NodeKind.MOD_LIST);
    // exitScope();
    visitNodes(rest);
    exitScope();
}

function emitClass(node: Node) {
    emitDeclaration(node);
    var name = node.findChild(NodeKind.NAME);
    state.currentClassName = name.text;
    var content = node.findChild(NodeKind.CONTENT)
    var contentsNode = content && content.children;
    if (contentsNode) {
        //collects declarations
        enterClassScope(contentsNode);
        contentsNode.forEach(node => {
            visitNode(node.findChild(NodeKind.META_LIST));
            catchup(node.start);
            switch (node.kind) {
                case NodeKind.SET:
                    emitSet(node);
                    break;
                case NodeKind.GET:
                case NodeKind.FUNCTION:
                    emitMethod(node);
                    break;
                case NodeKind.VAR_LIST:
                    emitPropertyDecl(node);
                    break;
                case NodeKind.CONST_LIST:
                    emitPropertyDecl(node, true);
                    break;
                default:
                    visitNode(node);
            }
        });
        exitScope();
    }
    state.currentClassName = null;
}


function emitSet(node: Node) {
    emitClassField(node);
    var name = node.findChild(NodeKind.NAME);
    consume('function', name.start);
    var params = node.findChild(NodeKind.PARAMETER_LIST)
    visitNode(params);
    catchup(params.end)
    var type = node.findChild(NodeKind.TYPE);
    if (type) {
        skipTo(type.end);
    }
    enterFunctionScope(node);
    visitNodes(node.getChildFrom(NodeKind.TYPE));
    exitScope();
}

function emitConstList(node: Node) {
    catchup(node.start);
    var nameTypeInit = node.findChild(NodeKind.NAME_TYPE_INIT);
    skipTo(nameTypeInit.start);
    insert('var ');
    visitNode(nameTypeInit);
}

function emitMethod(node: Node) {
    var name = node.findChild(NodeKind.NAME);
    if (node.kind !== NodeKind.FUNCTION || name.text !== state.currentClassName) {
        emitClassField(node);
        consume('function', name.start);
        catchup(name.end)
    } else {
        var mods = node.findChild(NodeKind.MOD_LIST);
        if (mods) {
            catchup(mods.start);
        }
        insert('constructor');
        skipTo(name.end)
    }
    enterFunctionScope(node);
    visitNodes(node.getChildFrom(NodeKind.NAME));
    exitScope();
}

function emitPropertyDecl(node: Node, isConst = false) {
    emitClassField(node);
    var name = node.findChild(NodeKind.NAME_TYPE_INIT);
    consume(isConst ? 'const': 'var', name.start);
    visitNode(name);
}

function emitClassField(node: Node) {
    var mods = node.findChild(NodeKind.MOD_LIST);
    if (mods) {
        catchup(mods.start);
        mods.children.forEach(node => {
            catchup(node.start);
            if (node.text !== 'private' && node.text !== 'public' && node.text !== 'protected' && node.text !== 'static') {
                commentNode(node, false);
            }  
            catchup(node.end);
        });
    }
}

function emitDeclaration(node: Node) {
    catchup(node.start);
    visitNode(node.findChild(NodeKind.META_LIST));
    var mods = node.findChild(NodeKind.MOD_LIST);
    if (mods && mods.children.length) {
        catchup(mods.start);
        var insertExport = false;
        mods.children.forEach(node => {
            if (node.text !== 'private') {
                insertExport = true;
            }  
            skipTo(node.end);
        }) 
        if (insertExport) {
            insert('export default');
        }
    }
}

function emitType(node: Node) {
    catchup(node.start);
    skip(node.text.length);
    var type: string;
    switch(node.text) {
        case 'String':
            type = 'string'
            break;
        case 'Boolean': 
            type= 'boolean'
            break;
        case 'Number':
        case 'int':
        case 'uint':
            type = 'number'
            break;
        case 'Object'://for aoqi h5
        case '*':
            type = 'any'
            break;
        case 'Array':
            type = 'any[]'
            break;
        default:
            type = node.text;
    }
    insert(type);
}

function emitVector(node: Node) {
    catchup(node.start);
    var type = node.findChild(NodeKind.TYPE);
    if (type) {
        skipTo(type.start);
        emitType(type);
        insert('[]');
    } else {
        insert('any[]');
    }
    skipTo(node.end);
}

function emitShortVector(node: Node) {
    catchup(node.start);
    var vector = node.findChild(NodeKind.VECTOR);
    insert('Array');
    var type = vector.findChild(NodeKind.TYPE);
    if(type) {
        emitType(type);
    } else {
        insert('any');
    }
    catchup(vector.end);
    insert('(');
    var arrayLiteral = node.findChild(NodeKind.ARRAY)
    if (arrayLiteral.children && arrayLiteral.children.length) {
        skipTo(arrayLiteral.children[0].start)
        visitNodes(arrayLiteral.children)
        catchup(arrayLiteral.lastChild.end);
    }
    insert(')');
    skipTo(node.end);
}

function emitNew(node:Node) {
    catchup(node.start);
    state.isNew = true;
    state.emitThisForNextIdent = false;
    visitNodes(node.children);
    state.isNew = false;
}

function emitCall(node: Node) {
    catchup(node.start);
    var isNew = state.isNew;
    state.isNew = false;
    if (node.children[0].kind === NodeKind.VECTOR) {
        if (isNew) {
            var vector = node.children[0];
            catchup(vector.start);
            insert('Array');
            insert('<')
            var type = vector.findChild(NodeKind.TYPE);
            if (type) {
                skipTo(type.start);
                emitType(type);
            } else {
                insert('any');
            }
            skipTo(vector.end);
            insert('>');
            visitNodes(node.getChildFrom(NodeKind.VECTOR));
            return;
        }

        var args = node.findChild(NodeKind.ARGUMENTS);
        //vector conversion lets just cast to array
        if (args.children.length === 1) {
            insert('(<');
            emitVector(node.children[0]);
            insert('>');
            skipTo(args.children[0].start);
            visitNode(args.children[0]);
            catchup(node.end);
            return;
        }
    }
    else  if (node.children[0].kind === NodeKind.IDENTIFIER&&node.children[0].text=="int") {
        skipTo(node.children[0].start);
        insert("Number");
        skip(node.children[0].end-node.children[0].start);
        var restNodes = node.children.concat();
        restNodes.shift();
        visitNodes(restNodes);
        return;
    }
    visitNodes(node.children);
}

function emitRelation(node: Node) {
    catchup(node.start);
    var as = node.findChild(NodeKind.AS);
    if (as) {
        if (node.lastChild.kind === NodeKind.IDENTIFIER) {
            insert('<');
            insert(node.lastChild.text);
            insert('>');
            visitNodes(node.getChildUntil(NodeKind.AS));
            catchup(as.start);
            skipTo(node.end);
        } else {
            commentNode(node, false);
        }
        return;
    }
    visitNodes(node.children)
}

function emitOp(node: Node) {
    catchup(node.start);
    if (node.text === "is") {
        insert('instanceof');
        skipTo(node.end);
        return;
    }
    catchup(node.end);
}


function emitIdent(node: Node) {
    catchup(node.start);
    if (node.parent && node.parent.kind === NodeKind.DOT) {
        //in case of dot just check the first
        if(node.parent.children[0] !== node) {
            return;
        }
    }
    
    if (isKeyWord(node.text)) {
        return;
    }
    
    var def = findDefInScope(node.text);
    // console.log("findDefInScope:"+node.text+" def:"+def);
    if (def && def.bound) {
        // console.log( "def.bound"+def.bound);
        insert(def.bound + '.');
    }
    if (!def && state.currentClassName && globVars.indexOf(node.text) === -1 && state.emitThisForNextIdent && node.text !== state.currentClassName) {
        var isMayBeClassIdent:boolean = node.text.match(/[A-Z]{1}[a-z_A-Z]+/g)!=null;
        //if ident is Class name that not exsit ,do not insert this.
        if(!isMayBeClassIdent){
            // console.log("before output:"+output +" "+"output length:"+output.length);
            // console.log("insert this:"+node.text+" "+node.kind+" "+node.start);
            insert('this.');
            // console.log("after output:"+output +" "+"output length:"+output.length);
        }
    }
    state.emitThisForNextIdent = true;
}

function emitXMLLiteral(node: Node) {
    catchup(node.start);
    insert(JSON.stringify(node.text))
    skipTo(node.end);
}


function enterClassScope(contentsNode: Node[]) {
    var found: {[name: string]: boolean } = {};

    var declarations = contentsNode.map(node => {
        var nameNode: Node;
        var isStatic: boolean;

        switch (node.kind) {
            case NodeKind.SET:
            case NodeKind.GET:
            case NodeKind.FUNCTION:
                nameNode = node.findChild(NodeKind.NAME);
                break;
            case NodeKind.VAR_LIST:
            case NodeKind.CONST_LIST:
                nameNode = node.findChild(NodeKind.NAME_TYPE_INIT).findChild(NodeKind.NAME);
                break;
        }
        if (!nameNode || found[nameNode.text]) {
            return null;
        }
        found[nameNode.text] = true;
        if (nameNode.text === state.currentClassName) {
            return;
        }
        var modList = node.findChild(NodeKind.MOD_LIST);
        var isStatic = modList && 
            modList.children.some(mod => mod.text === 'static');
        return {
            name: nameNode.text,
            bound: isStatic ? state.currentClassName : 'this'
        };
    }).filter(el => !!el);

    enterScope(declarations);
}

function enterFunctionScope(node: Node) {
    var decls: Declaration[]  = [];
    var params = node.findChild(NodeKind.PARAMETER_LIST);
    if (params && params.children.length) {
        decls = params.children.map(param => {
            var nameTypeInit  = param.findChild(NodeKind.NAME_TYPE_INIT);
            if (nameTypeInit) {
                return {name: nameTypeInit.findChild(NodeKind.NAME).text}
            } 
            var rest = param.findChild(NodeKind.REST)
            return { name: rest.text };
        });
    }
    var block = node.findChild(NodeKind.BLOCK);
    if (block) {
        function traverse(node: Node): Declaration[] {
            var result = new Array<Declaration>();
            if (node.kind === NodeKind.VAR_LIST || node.kind === NodeKind.CONST_LIST ||
                node.kind === NodeKind.VAR || node.kind === NodeKind.CONST) {
                result = result.concat(
                    node
                        .findChildren(NodeKind.NAME_TYPE_INIT)
                        .map(node => ({ name: node.findChild(NodeKind.NAME).text }))
                );
            }
            if (node.kind !== NodeKind.FUNCTION && node.children && node.children.length) {
                result = Array.prototype.concat.apply(result, node.children.map(traverse));
            }
            return result.filter(decl => !!decl);
        }
        decls = decls.concat(traverse(block));
    }
    
    enterScope(decls);
}

function enterScope(decls: Declaration[]) {
    state.scope = {
        parent: state.scope,
        declarations: decls,
        get isTopLevel() {
            return !state.scope;
        }
    };
}

function exitScope() {
    state.scope = state.scope && state.scope.parent;
}

function findDefInScope(text: string) {
    var scope = state.scope;
    while(scope) {
        for (var i = 0; i< scope.declarations.length; i++) {
            if (scope.declarations[i].name === text) {
                return scope.declarations[i];
            }
        }
        scope = scope.parent;
    }
    return null;
}

function commentNode(node: Node, catchSemi:boolean) {
    insert('/*');
    catchup(node.end);
    var index = state.index;
    if (catchSemi) {
        while(true) {
            if (index >= data.source.length) {
                break;
            }
            if (data.source[index] === '\n') {
                catchup(index);
                break;
            }
            if (data.source[index] === ';') {
                catchup(index + 1);
                break;
            }
            index++;
        }
    }
    insert('*/'); 
}

function catchup(index: number) {
    if (state.index > index) {
        return;
    }
    while (state.index !== index) {
        output += data.source[state.index];
        state.index++;
    }
}

function skipTo(index: number) {
    state.index = index;
}

function skip(number: number) {
    state.index += number;
}

function insert(string: string) {
    output += string;
}

function consume(string: string, limit: number) {
    var index = data.source.indexOf(string, state.index) + string.length;
    if (index > limit || index < state.index) {
        throw new Error('invalid consume');
    }
    state.index = index;
}
