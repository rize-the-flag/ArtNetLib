import { PROTOCOL_VERSION } from '../constants';

export type DiagDataPayload = {
  protoVersion: typeof PROTOCOL_VERSION;
  filler1: number;
  diagPriority: number;
  logicalPort: number;
  filler3: number;
  length: number;
  data: string;
};
