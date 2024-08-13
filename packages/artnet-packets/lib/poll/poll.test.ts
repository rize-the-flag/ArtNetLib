import { describe, expect, test } from '@jest/globals';
import { ARTNET_PACKET_ID, OP_CODE, PROTOCOL_VERSION } from '../constants';
import { Buffer } from 'node:buffer';
import { PollPacketPayload } from './poll.interface';
import { Poll } from './poll';
import { DIAG_PRIORITY } from './constants';

describe('DMX packet test', () => {
  test('Poll packet encode-decode test', () => {
    const pollPacketPayload: Partial<PollPacketPayload> = {
      protoVersion: PROTOCOL_VERSION,
      diagPriority: DIAG_PRIORITY.DpCritical,
      targetPortAddressBottom: 255,
      targetPortAddressTop: 255,
      flags: 0b00000110,
    };

    const pollPacket = new Poll(pollPacketPayload);
    const udpPacket = pollPacket.encode();
    const decodedPayload = pollPacket.decode(udpPacket);

    expect(decodedPayload).toEqual({
      ID: ARTNET_PACKET_ID,
      opCode: OP_CODE.POLL,
      ...pollPacketPayload,
    });
  });

  test('Create Poll packet using udp packet', () => {
    const length = 16;
    const pollPacketPayload: Partial<PollPacketPayload> = {
      protoVersion: PROTOCOL_VERSION,
      diagPriority: DIAG_PRIORITY.DpCritical,
      targetPortAddressBottom: 255,
      targetPortAddressTop: 255,
      flags: 0b00000110,
    };

    const udpPacket = new Poll(pollPacketPayload).encode();
    const newPacket = Poll.create(udpPacket);
    expect(newPacket?.encode()).toEqual(udpPacket);
  });

  test('Poll Packet functionality', () => {
    const poll = new Poll();

    const pollPacketPayload: Partial<PollPacketPayload> = {
      protoVersion: PROTOCOL_VERSION,
      diagPriority: DIAG_PRIORITY.DpHigh,
      flags: 0b00011010,
      targetPortAddressBottom: 44,
      targetPortAddressTop: 21504,
    };

    poll.setArtPollReplyPolicy('ON_NODE_CONDITION_CHANGE');
    poll.sendMeDiagnostics(false);
    poll.setDiagnosticsPolicy('UNICAST');
    poll.setDiagPriority('DpHigh');
    poll.setVlcTransmission(false);
    poll.setTargetPort(21548);

    const payload = poll.decode(poll.encode());
    expect(payload).toEqual({
      ID: ARTNET_PACKET_ID,
      opCode: OP_CODE.POLL,
      ...pollPacketPayload,
    });
  });
});
