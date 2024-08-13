import { describe, expect, test } from '@jest/globals';
import { IpProgPacket } from './ip-prog';
import { IpProgPayload } from './ip-prog.interface';
import { ARTNET_PACKET_ID, OP_CODE, PROTOCOL_VERSION } from '../constants';

describe('IpProgPacket tests', () => {
  const defaultPayload: IpProgPayload = {
    protoVersion: PROTOCOL_VERSION,
    command: 0b11011111,
    filler1: 0,
    filler2: 0,
    filler4: 0,
    progIpHi: 10,
    progIp2: 11,
    progIp1: 12,
    progIpLo: 13,
    progSmHi: 0,
    progSm2: 1,
    progSm1: 2,
    progSmLo: 3,
    progPortHi: 0,
    progPortLo: 128,
    progDgHi: 10,
    progDg2: 10,
    progDg1: 1,
    progDgLo: 15,
    spare4: 0,
    spare5: 0,
    spare6: 0,
    spare7: 0,
  };

  test('Encode equal to decode with header test', () => {
    const packet = new IpProgPacket(defaultPayload);

    const data = packet.encode();

    expect(packet.decode(data)).toEqual({
      ID: ARTNET_PACKET_ID,
      opCode: OP_CODE.IP_PROG,
      ...defaultPayload,
    });
  });
});
