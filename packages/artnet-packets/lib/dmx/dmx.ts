import { ArtNetPacket } from '../common/art-net-packet';
import { OP_CODE, PROTOCOL_VERSION } from '../constants';
import { ThrowsException } from '../types';
import { decode, Schema } from '@rtf-dm/protocol';
import { DmxPacketPayload } from './dmx.interface';
import { clamp } from '@rtf-dm/common';

export class Dmx extends ArtNetPacket<DmxPacketPayload> {
  static readonly DMX_CHANNEL_MAX = 512;
  static readonly DMX_VALUE_MAX = 255;

  static readonly schemaDefault = new Schema([
    //The order of schema fields make sense do not change it!!!
    ['protoVersion', { size: 2, type: 'number', byteOrder: 'BE' }],
    ['sequence', { size: 1, type: 'number' }],
    ['physical', { size: 1, type: 'number' }],
    ['subNet', { size: 1, type: 'number' }],
    ['net', { size: 1, type: 'number' }],
    ['length', { size: 2, type: 'number', byteOrder: 'BE' }],
    ['dmxData', { size: 1, length: Dmx.DMX_CHANNEL_MAX, type: 'array' }],
  ]);

  constructor(payload: Partial<DmxPacketPayload> = {}) {
    const length = payload.length ?? Dmx.DMX_CHANNEL_MAX;
    const dmxPacket: DmxPacketPayload = {
      protoVersion: PROTOCOL_VERSION,
      net: 0,
      length,
      subNet: 0,
      sequence: 0,
      physical: 0,
      dmxData: new Array<number>(length).fill(0, 0, length),
      ...payload,
    };

    Dmx.schemaDefault.setValue('dmxData', { length, type: 'array', size: 1 });

    super(OP_CODE.DMX, dmxPacket, Dmx.schemaDefault);
  }

  static is(data: Buffer): boolean {
    return super.is(data) && ArtNetPacket.readPacketOpCode(data) === OP_CODE.DMX;
  }

  static getDmxDataLen(data: Buffer) {
    if (!Dmx.is(data)) return null;

    const dmxDataLengthOffset = Dmx.schemaDefault.getOffsetOf('length');

    if (!dmxDataLengthOffset || dmxDataLengthOffset === Dmx.schemaDefault.calcBytesInPacket()) return null;

    return data.readUInt16BE(dmxDataLengthOffset + Dmx.getHeaderLength());
  }

  public setNet(net = 0): this {
    this.payload.net = net;
    return this;
  }

  public getNet(): number {
    return this.payload.net;
  }

  public setSubnet(subNet = 0): this {
    this.payload.subNet = subNet;
    return this;
  }

  public getSubnet(): number {
    return this.payload.subNet;
  }

  public incSequence(): number {
    this.payload.sequence = this.payload.sequence >= 255 ? 0 : this.payload.sequence++;

    return this.payload.sequence;
  }

  public setPhysicalPort(port = 0): this {
    this.payload.physical = port;
    return this;
  }

  public static clampToDmxRange(channel: number, value: number): [number, number] {
    const channelInRange = clamp(0, Dmx.DMX_CHANNEL_MAX, channel);
    const valueInRange = clamp(0, Dmx.DMX_VALUE_MAX, value);
    return [channelInRange, valueInRange];
  }

  checkChannelInRange(channel: number): void {
    if (channel > this.payload.length) {
      throw new Error(`Max allowed channel for current packet is ${this.payload.length}`);
    }
  }

  public setChannel(channel: number, value: number): this {
    const [channelInRange, valueInRange] = Dmx.clampToDmxRange(channel, value);
    this.checkChannelInRange(channel);
    this.payload.dmxData[channelInRange] = valueInRange;
    return this;
  }

  public setChannels(data: number[]): ThrowsException<void> {
    this.payload.dmxData = data.map((x) => {
      const inRange = clamp(0, Dmx.DMX_CHANNEL_MAX, x);
      this.checkChannelInRange(inRange);
      return inRange;
    });
  }

  public getChannelValue(channel: number): number {
    this.checkChannelInRange(channel);
    return this.payload.dmxData[channel];
  }

  public static create(data: Buffer): Dmx | null {
    if (!Dmx.is(data)) return null;

    const dmxDataLength = Dmx.getDmxDataLen(data);

    if (!dmxDataLength) return null;

    const schemaWithHeader = new Schema([...Dmx.headerSchema, ...Dmx.schemaDefault]);

    schemaWithHeader.setValue('dmxData', { length: dmxDataLength, type: 'array', size: 1 });
    return new Dmx(decode(data, schemaWithHeader));
  }
}
