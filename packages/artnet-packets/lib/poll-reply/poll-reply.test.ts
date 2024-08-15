import { describe, expect, test } from '@jest/globals';
import { PollReply } from './poll-reply';
import { PollReplyPacketPayload } from './poll-reply.interface';
import { ARTNET_PACKET_ID, ARTNET_PORT, OP_CODE } from '../constants';
import { Poll } from '../poll/poll';

const pollReplyPacketPayload: PollReplyPacketPayload = {
  ipAddress: [192, 168, 0, 1],
  port: ARTNET_PORT,
  firmwareVersion: 0xdead,
  netSwitch: 0,
  netSubSwitch: 0,
  oem: 0xbeef,
  ubeaVersion: 0x10,
  status1: 0b010100111,
  estaManufactorerCode: 0xfefe,
  shortName: 'AN-Controller',
  longName: 'ArtNet-Controller',
  nodeReport: 'Not Normal State',
  numPorts: 3,
  portTypes: [0b11001000, 0b10000100, 0b10000001, 0b11000010],
  goodInput: [1, 2, 3, 4],
  goodOutputA: [1, 2, 3, 4],
  swIn: [1, 2, 3, 4],
  swOut: [1, 2, 3, 4],
  acnPriority: 4,
  swMacro: 2,
  swRemote: 1,
  spare: [1, 2, 3],
  style: 1,
  macAddress: [0xff, 0xef, 0x1d, 0x32, 0xfa, 0xaa],
  bindIp: [192, 168, 1, 1],
  bindIndex: 2,
  status2: 0b01101011,
  goodOutputB: 1,
  status3: 3,
  defaultRespUID: [128, 192, 222, 224, 228, 255],
  filler: new Array<number>(15).fill(0),
};

describe('ArtNet PollReply tests', () => {
  test('PollReply encode decode test', () => {
    const pollReply = new PollReply(pollReplyPacketPayload);
    const udpData = pollReply.encode();
    expect(pollReply.decode(udpData)).toEqual({
      ID: ARTNET_PACKET_ID,
      opCode: OP_CODE.POLL_REPLY,
      ...pollReplyPacketPayload,
    });
  });

  test('PollReply static create method', () => {
    const udpData = new PollReply(pollReplyPacketPayload).encode();
    const packet = PollReply.create(udpData);
    const udpDataFromPacket = packet?.encode();
    expect(udpDataFromPacket).toEqual(udpData);
  });

  test('Test that entire udpPacket is not PollReply packet', () => {
    const udpPollPacket = new Poll().encode();
    expect(PollReply.is(udpPollPacket)).toBe(false);
    expect(PollReply.create(udpPollPacket)).toBe(null);
  });
});
