import { ArtNetPacket } from '../common/art-net-packet';
import { OP_CODE, PROTOCOL_VERSION } from '../constants';
import { decode, Schema } from '@rtf-dm/protocol';
import { DiagDataPayload } from './diag-data.interface';

export class DiagData extends ArtNetPacket<DiagDataPayload> {
  static readonly DIAG_CHANNEL_MAX = 512;
  //order of schema fields make sense do not change it!!!
  private static schemaDefault = new Schema<DiagDataPayload>([
    ['protoVersion', { size: 2, type: 'number', byteOrder: 'BE' }],
    ['filler1', { size: 1, type: 'number' }],
    ['diagPriority', { size: 1, type: 'number' }],
    ['logicalPort', { size: 1, type: 'number' }],
    ['filler3', { size: 1, type: 'number' }],
    ['length', { size: 2, type: 'number', byteOrder: 'BE' }],
    ['data', { length: 512, size: 1, type: 'string', encoding: 'utf8' }],
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

    DiagData.schemaDefault.setValue('data', { length, size: 1, type: 'string', encoding: 'utf8' });
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
    schemaWithHeader.setValue('data', { length: diagDataLength, size: 1, type: 'string', encoding: 'utf8' });

    return new DiagData(decode(data, schemaWithHeader));
  }
}
