import { describe, expect, test } from '@jest/globals';
import { CommandPayload } from './command.interface';
import { Command } from './command';
import { ARTNET_PACKET_ID, OP_CODE, PROTOCOL_VERSION } from '../constants';
import { Poll } from '../poll/poll';

describe('Command packet tests', () => {
  const payload: Partial<CommandPayload> = {
    protocolVersion: PROTOCOL_VERSION,
    estaManufactorer: 0x0006,
    data: 'TEST COMMAND',
    length: 'TEST COMMAND'.length,
  };

  test('Command encode decode test', () => {
    const packet = new Command(payload);
    const udpPacket = packet.encode();
    expect(packet.decode(udpPacket)).toEqual({
      ID: ARTNET_PACKET_ID,
      opCode: OP_CODE.COMMAND,
      ...payload,
    });
  });

  test('Create packet from raw data', () => {
    const udpPacket = new Command(payload).encode();
    const packet = Command.create(udpPacket);
    expect(packet?.encode()).toEqual(udpPacket);
  });

  test('Other packets is not Command packet', () => {
    const udpPoll = new Poll().encode();
    expect(Command.is(udpPoll)).toBe(false);
    expect(Command.create(udpPoll)).toBe(null);
  });
});
