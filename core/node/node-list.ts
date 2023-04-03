import {INode, INodeList, IPollReplyPacketPayload} from "../types";
import {Node} from './node'

export class NodeList implements INodeList {
    private readonly nodes: INode[];

    constructor(nodes: INode[] = []) {
        this.nodes = Array.from(nodes, node => Object.assign({}, node))
    }

    public addNode({shortName, ipAddress, macAddress}: Pick<IPollReplyPacketPayload, 'ipAddress' | 'shortName' | 'macAddress'>): INode {
        const node = new Node({
            nodeName: shortName,
            ipAddress: ipAddress.join('.'),
            macAddress: macAddress.join('.'),
            lastPollingTime: new Date()
        })
        this.nodes.push(node);
        return node;
    }

    public updateNode({shortName: nodeName, ipAddress, macAddress}: IPollReplyPacketPayload): INode | null {
        const node = this.getByName(nodeName);
        if (node) {
            node.ipAddress = ipAddress.join('.');
            node.macAddress = macAddress.join('.');
            node.lastPollingTime = new Date();
            return {...node}
        }
        return null
    }

    public get(conditionCb?: (node: INode) => boolean) {
        if(!conditionCb) return this.nodes
        return this.nodes.filter(conditionCb)
    }

    public getByName(nodeName: string): INode | null {
        const node = this.get(node => nodeName === node.nodeName).pop()
        if (node) return node
        return null
    }

    public removeNodes(conditionCb: (node: INode) => boolean): INode [] {
        const removedNodes: INode[] = [];
        for (const node of this.nodes) {
            if (conditionCb(node)) {
                removedNodes.push(...this.nodes.splice(this.nodes.indexOf(node), 1));
            }
        }
        return removedNodes;
    }

    * [Symbol.iterator](): Generator<INode> {
        for (const node of this.nodes) {
            yield node
        }
    }
}