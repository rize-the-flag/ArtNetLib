import {EventHandler} from "@rtf-dm/typed-emitter";
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
    NODE_STATUS_UPDATED: EventHandler<NodeStatusPayload>;
    NEW_NODE_REGISTERED: EventHandler<NodeStatusPayload>;
    NODE_IS_DEAD: EventHandler<NodeStatusPayload>;
}

