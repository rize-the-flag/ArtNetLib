import { PROTOCOL_VERSION } from '../constants';

export type SyncPacketPayload = {
  protoVersion: typeof PROTOCOL_VERSION;
  aux1: number;
  aux2: number;
};
