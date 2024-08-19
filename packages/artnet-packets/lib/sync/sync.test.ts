import { describe, expect, test } from '@jest/globals';
import { SyncPacketPayload } from './sync.interface';
import { ARTNET_PACKET_ID, OP_CODE, PROTOCOL_VERSION } from '../constants';
import { Sync } from './sync';

describe('Sync packet tests', () => {
  const payload: SyncPacketPayload = {
    protoVersion: PROTOCOL_VERSION,
    aux1: 1,
    aux2: 2,
  };

  test('Encode decode sync packet test', () => {
    const packet = new Sync(payload);
    const udpPacket = packet.encode();
    expect(packet.decode(udpPacket)).toEqual({
      ID: ARTNET_PACKET_ID,
      opCode: OP_CODE.SYNC,
      ...payload,
    });
  });

  test('Create packet instance from upd buffer', () => {
    const udpPacket = new Sync(payload).encode();
    const packet = Sync.create(udpPacket);
    expect(packet?.encode()).toEqual(udpPacket);
  });
});
