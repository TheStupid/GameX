import ListenerNode from './ListenerNode';
export default class ListenerNodeList {

    private nodes: ListenerNode[];

    constructor() {
        this.nodes = [];
    }

    public add(node: ListenerNode): void {
        this.nodes.push(node);
    }

    public get(listener: Function, caller: any): ListenerNode {
        for (var node of this.nodes) {
            if (node.listener == listener && node.caller == caller) {
                return node;
            }
        }
        return null;
    }

    public remove(node: ListenerNode): void {
        var index: number = this.nodes.indexOf(node);
        if (index != -1) {
            this.nodes.splice(index, 1);
        }
    }
}