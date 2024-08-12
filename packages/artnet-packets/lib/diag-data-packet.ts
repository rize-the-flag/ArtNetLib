import { ArtNetPacket } from './common/art-net-packet';
import { OP_CODE, PROTOCOL_VERSION } from './constants';
import { DiagDataPayload, PollPacketPayload } from './common/packet.interface';
import { decode, Schema } from '@rtf-dm/protocol';

export class DiagDataPacket extends ArtNetPacket<DiagDataPayload> {
  //order of schema fields make sense do not change it!!!
  private static schemaDefault = new Schema<DiagDataPayload>([
    ['protoVersion', { length: 2, type: 'number', byteOrder: 'BE' }],
    ['filler1', { length: 1, type: 'number' }],
    ['diagPriority', { length: 1, type: 'number' }],
    ['logicalPort', { length: 1, type: 'number' }],
    ['filler3', { length: 1, type: 'number' }],
    ['length', { length: 2, type: 'number', byteOrder: 'LE' }],
    ['data', { length: 512, type: 'string' }],
  ]);

  constructor(payload: Partial<DiagDataPayload> = {}) {
    const diagDataPacket: DiagDataPayload = {
      protoVersion: PROTOCOL_VERSION,
      diagPriority: 0x10,
      logicalPort: 0,
      data: "Don't push on me",
      length: 16,
      filler1: 0,
      filler3: 0,
      ...payload,
    };

    super(OP_CODE.DIAG_DATA, diagDataPacket, DiagDataPacket.schemaDefault);
  }

  static is(data: Buffer): boolean {
    return super.is(data) && ArtNetPacket.readPacketOpCode(data) === OP_CODE.DIAG_DATA;
  }

  public static create(data: Buffer, schema: Schema<PollPacketPayload>): DiagDataPacket | null {
    if (!DiagDataPacket.is(data)) return null;
    return new DiagDataPacket(decode(data, schema));
  }
}
