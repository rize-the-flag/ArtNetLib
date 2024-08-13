import { describe, expect, test } from '@jest/globals';
import { Dmx } from './dmx';
import { DmxPacketPayload } from './dmx.interface';
import { ARTNET_PACKET_ID, OP_CODE, PROTOCOL_VERSION } from '../constants';
import { Buffer } from 'node:buffer';

describe('DMX packet test', () => {
  test('DMX snapshot test', () => {
    const length = 16;
    const CHANNEL_VALUE = 255;

    const dmxPacketPayload: DmxPacketPayload = {
      protoVersion: PROTOCOL_VERSION,
      net: 6,
      length,
      subNet: 1,
      sequence: 2,
      physical: 3,
      dmxData: new Array<number>(length).fill(CHANNEL_VALUE, 0, length),
    };

    const dataValid = Buffer.from([
      65, 114, 116, 45, 78, 101, 116, 0, 0, 80, 0, 14, 2, 3, 1, 6, 0, 16, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
      255, 255, 255,
    ]);
    const dataFromPayload = new Dmx(dmxPacketPayload);
    expect(dataFromPayload.encode()).toEqual(dataValid);
  });

  test('DMX packet encode-decode test', () => {
    const length = 16;
    const CHANNEL_VALUE = 255;

    const dmxPacketPayload: DmxPacketPayload = {
      protoVersion: PROTOCOL_VERSION,
      net: 6,
      length,
      subNet: 1,
      sequence: 2,
      physical: 3,
      dmxData: new Array<number>(length).fill(CHANNEL_VALUE, 0, length),
    };

    const dmxPacket = new Dmx(dmxPacketPayload);
    const udpPacket = dmxPacket.encode();
    const dmxPayload = dmxPacket.decode(udpPacket);
    const dmxPacketFromUdp = new Dmx(dmxPayload);

    expect(dmxPayload).toEqual({
      ID: ARTNET_PACKET_ID,
      opCode: OP_CODE.DMX,
      ...dmxPacketPayload,
    });

    expect(Dmx.getDmxDataLen(udpPacket)).toBe(length);

    expect(dmxPacketFromUdp.getChannelValue(5)).toBe(CHANNEL_VALUE);

    expect(dmxPacketFromUdp.getNet()).toBe(6);
    expect(dmxPacketFromUdp.getSubnet()).toBe(1);
  });

  test('Create DMX packet using udp packet', () => {
    const length = 16;
    const dmxPacketPayload: DmxPacketPayload = {
      protoVersion: PROTOCOL_VERSION,
      net: 6,
      length,
      subNet: 1,
      sequence: 2,
      physical: 3,
      dmxData: new Array<number>(length).fill(0, 0, length),
    };

    const udpPacket = new Dmx(dmxPacketPayload).encode();
    const newPacket = Dmx.create(udpPacket);
    expect(newPacket?.encode()).toEqual(udpPacket);
  });
});
