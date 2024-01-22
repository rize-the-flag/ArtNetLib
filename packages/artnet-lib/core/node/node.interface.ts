import { NODE_STATUS } from '../constants';
import { valueOf } from '../types';
import {PollReplyPacketPayload} from "../packets/packet.interface";

export type NodeStatus = valueOf<typeof NODE_STATUS>;

export type NodeInfo = Pick<PollReplyPacketPayload,
	| 'netSwitch'
	| 'netSubSwitch'
	| 'swOut'
	| 'swIn'
	| 'nodeReport'
	| 'numPorts'
	| 'portTypes'
>
