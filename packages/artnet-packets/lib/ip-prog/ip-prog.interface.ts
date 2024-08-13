import { PROTOCOL_VERSION } from '../constants';

export type IpProgPayload = {
  protoVersion: typeof PROTOCOL_VERSION;
  filler1: 0;
  filler2: 0;
  command: number;
  filler4: 0;
  progIpHi: number;
  progIp1: number;
  progIp2: number;
  progIpLo: number;
  progSmHi: number;
  progSm1: number;
  progSm2: number;
  progSmLo: number;
  progPortHi: number; //deprecated
  progPortLo: number;
  progDgHi: number;
  progDg2: number;
  progDg1: number;
  progDgLo: number;
  spare4: 0;
  spare5: 0;
  spare6: 0;
  spare7: 0;
};
