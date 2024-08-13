import { PROTOCOL_VERSION } from '../constants';

export type AddressPacketPayload = {
  protoVersion: typeof PROTOCOL_VERSION;
  netSwitch: number;
  bindIndex: number;
  shortName: string;
  longName: string;
  swIn: number[];
  swOut: number[];
  netSubSwitch: number;
  swVideo: number; // deprecated
  command: number;
};
