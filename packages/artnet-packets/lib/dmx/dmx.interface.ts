import { PROTOCOL_VERSION } from '../constants';

export type DmxPacketPayload = {
  protoVersion: typeof PROTOCOL_VERSION;
  sequence: number;
  physical: number;
  net: number;
  subNet: number;
  length: number;
  dmxData: number[];
};
