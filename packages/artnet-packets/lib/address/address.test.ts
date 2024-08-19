import { describe, expect, test } from '@jest/globals';
import { AddressPacketPayload } from './address.interface';
import { ARTNET_PACKET_ID, OP_CODE, PROTOCOL_VERSION } from '../constants';
import { Address } from './address';

describe('Sync packet tests', () => {
  const payload: Partial<AddressPacketPayload> = {
    protoVersion: PROTOCOL_VERSION,
    shortName: 'short',
    longName: 'Very long name',
    swIn: [1, 2, 3, 4],
    swOut: [4, 3, 2, 1],
    netSwitch: 5,
    netSubSwitch: 10,
    bindIndex: 1,
    command: 3,
    swVideo: 0,
  };

  test('Encode decode sync packet test', () => {
    const packet = new Address(payload);
    const udpPacket = packet.encode();
    expect(packet.decode(udpPacket)).toEqual({
      ID: ARTNET_PACKET_ID,
      opCode: OP_CODE.ADDRESS,
      ...payload,
    });
  });

  test('Create packet instance from upd buffer', () => {
    const udpPacket = new Address(payload).encode();
    const packet = Address.create(udpPacket);
    expect(packet?.encode()).toEqual(udpPacket);
  });
});
