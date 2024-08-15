import { ARTNET_PACKET_ID } from '../constants';
import { HeaderPayload, OpCode } from './packet.interface';
import { Packet, PacketPayload, Schema } from '@rtf-dm/protocol';

export abstract class ArtNetPacket<TPayload extends PacketPayload> extends Packet<TPayload & HeaderPayload> {
  protected static headerSchema = new Schema([
    ['ID', { length: 8, type: 'string', encoding: 'utf8' }],
    ['opCode', { length: 2, type: 'number', byteOrder: 'LE' }],
  ]);

  protected constructor(opCode: OpCode, packetPayload: TPayload, packetSchema: Schema<TPayload>) {
    const payloadWithHeader = {
      ID: ARTNET_PACKET_ID,
      opCode,
      ...packetPayload,
    };

    const schemaWithHeader: Schema<TPayload & HeaderPayload> = new Schema([
      ...ArtNetPacket.headerSchema,
      ...packetSchema,
    ]);

    super(payloadWithHeader, schemaWithHeader);
  }

  public static is(data: Buffer): boolean {
    return ArtNetPacket.isArtNetPacket(data);
  }

  static getHeaderLength(): number {
    const ID = ArtNetPacket.headerSchema.getValue('ID')?.length;
    const opCode = ArtNetPacket.headerSchema.getValue('opCode')?.length;
    if (!ID || !opCode) throw new Error("ID or opCode wasn't found in header");
    return ID + opCode;
  }

  static readPacketID(buffer: Buffer): string {
    return buffer.subarray(0, ARTNET_PACKET_ID.length).toString();
  }

  static readPacketOpCode(buffer: Buffer): number {
    return buffer.readUInt16LE(ARTNET_PACKET_ID.length + 1);
  }

  static isArtNetPacket(data?: Buffer): boolean {
    if (!data) return false;
    return ArtNetPacket.readPacketID(data) === ARTNET_PACKET_ID;
  }
}
