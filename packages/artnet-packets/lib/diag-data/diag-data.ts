import { ArtNetPacket } from '../common/art-net-packet';
import { OP_CODE, PROTOCOL_VERSION } from '../constants';
import { decode, Schema } from '@rtf-dm/protocol';
import { PollPacketPayload } from '../poll/poll.interface';
import { DiagDataPayload } from './diag-data.interface';
import Buffer from 'node:buffer';

export class DiagData extends ArtNetPacket<DiagDataPayload> {
  static readonly DIAG_CHANNEL_MAX = 512;
  //order of schema fields make sense do not change it!!!
  private static schemaDefault = new Schema<DiagDataPayload>([
    ['protoVersion', { length: 2, type: 'number', byteOrder: 'BE' }],
    ['filler1', { length: 1, type: 'number' }],
    ['diagPriority', { length: 1, type: 'number' }],
    ['logicalPort', { length: 1, type: 'number' }],
    ['filler3', { length: 1, type: 'number' }],
    ['length', { length: 2, type: 'number', byteOrder: 'BE' }],
    ['data', { length: 512, type: 'string' }],
  ]);

  constructor(payload: Partial<DiagDataPayload> = {}) {

    const length = payload.length ?? 16;

    const diagDataPacket: DiagDataPayload = {
      protoVersion: PROTOCOL_VERSION,
      diagPriority: 0x10,
      logicalPort: 0,
      data: "Don't push on me",
      length,
      filler1: 0,
      filler3: 0,
      ...payload,
    };

    DiagData.schemaDefault.setValue('data', {length, type: "string", byteOrder: 'BE'});
    super(OP_CODE.DIAG_DATA, diagDataPacket, DiagData.schemaDefault);
  }

  static is(data: Buffer): boolean {
    return super.is(data) && ArtNetPacket.readPacketOpCode(data) === OP_CODE.DIAG_DATA;
  }

  static getDiagDataLength(data: Buffer): number | null {
    if (!DiagData.is(data)) return null;

    const diagDataOffset = DiagData.schemaDefault.getOffsetOf('length');

    if (diagDataOffset === DiagData.schemaDefault.calcBytesInPacket()) return null;
    if (diagDataOffset === null) return null;

    return data.readUInt16BE(diagDataOffset + DiagData.getHeaderLength());
  }

  public static create(data: Buffer): DiagData | null {
    if (!DiagData.is(data)) return null;

    const diagDataLength = DiagData.getDiagDataLength(data);
    if (!diagDataLength) return null;

    const schemaWithHeader = new Schema([...DiagData.headerSchema, ...DiagData.schemaDefault]);
    schemaWithHeader.setValue('data', { length: diagDataLength, type: 'string' });

    return new DiagData(decode(data, schemaWithHeader));
  }
}
