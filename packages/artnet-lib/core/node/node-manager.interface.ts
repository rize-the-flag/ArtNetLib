import {GEventHandler} from "@rtf-dm/typed-emitter";
import {NodeInfo} from "./node.interface";

export type NodeStatusPayload = {
    ipAddress: string;
    macAddress: string;
    name: string;
    lastResponseTime: Date;
    portInfo: NodeInfo;
    isAlive: boolean;
}


export type NodeManagerEvents = {
    NODE_STATUS_UPDATED: GEventHandler<NodeStatusPayload>;
    NEW_NODE_REGISTERED: GEventHandler<NodeStatusPayload>;
    NODE_IS_DEAD: GEventHandler<NodeStatusPayload>;
}

