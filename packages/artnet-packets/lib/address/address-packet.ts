import { ArtNetPacket } from '../common/art-net-packet';
import { OP_CODE, PROTOCOL_VERSION } from '../constants';
import { decode, Schema } from '@rtf-dm/protocol';
import { DmxPacketPayload } from '../dmx/dmx.interface';
import { AddressPacketPayload } from './address.interface';

export class AddressPacket extends ArtNetPacket<AddressPacketPayload> {
  //order of schema fields makes sense do not change it!!!
  private static schemaDefault = new Schema<AddressPacketPayload>([
    ['protoVersion', { length: 2, type: 'number', byteOrder: 'BE' }],
    ['netSwitch', { length: 1, type: 'number' }],
    ['bindIndex', { length: 1, type: 'number' }],
    ['shortName', { length: 18, type: 'string' }],
    ['longName', { length: 64, type: 'string' }],
    ['swIn', { length: 4, type: 'array' }],
    ['swOut', { length: 4, type: 'array' }],
    ['netSubSwitch', { length: 1, type: 'number' }],
    ['swVideo', { length: 1, type: 'number' }],
    ['command', { length: 1, type: 'number' }],
  ]);

  constructor(payload: Partial<AddressPacketPayload> = {}) {
    const addressPacketPayload: AddressPacketPayload = {
      protoVersion: PROTOCOL_VERSION,
      shortName: 'ArtNet-Node',
      longName: 'ArtNet-Node',
      swIn: [0, 0, 0, 0],
      swOut: [0, 0, 0, 0],
      netSwitch: 0,
      netSubSwitch: 0,
      bindIndex: 0,
      swVideo: 0,
      command: 0,
      ...payload,
    };

    super(OP_CODE.ADDRESS, addressPacketPayload, AddressPacket.schemaDefault);
  }

  public applyPortsConfig(): this {
    this.payload.netSwitch |= 0x80;
    this.payload.netSubSwitch |= 0x80;
    this.payload.swOut = this.payload.swOut.map((x) => x | 0x80);
    this.payload.swIn = this.payload.swIn.map((x) => x | 0x80);
    return this;
  }

  public resetToPhysicalPortsConfig(): this {
    this.payload.netSwitch &= 0x7f;
    this.payload.netSubSwitch &= 0x7f;
    this.payload.swOut = this.payload.swOut.map((x) => x & 0x7f);
    this.payload.swIn = this.payload.swIn.map((x) => x & 0x7f);
    return this;
  }

  public static is(data: Buffer): boolean {
    return super.is(data) && ArtNetPacket.readPacketOpCode(data) === OP_CODE.ADDRESS;
  }

  public static create(data: Buffer): AddressPacket | null {
    const schemaWithHeader = new Schema([...AddressPacket.headerSchema, ...AddressPacket.schemaDefault]);

    if (AddressPacket.is(data)) {
      return new AddressPacket(decode(data, schemaWithHeader));
    }
    return null;
  }
}
