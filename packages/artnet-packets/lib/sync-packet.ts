import { ArtNetPacket } from './common/art-net-packet';
import { OP_CODE, PROTOCOL_VERSION } from './constants';
import { PollReplyPacketPayload, SyncPacketPayload } from './common/packet.interface';
import { decode, Schema } from '@rtf-dm/protocol';
import Buffer from 'node:buffer';

export class SyncPacket extends ArtNetPacket<SyncPacketPayload> {
  //order of schema fields make sense do not change it!!!
  private static schemaDefault = new Schema([
    ['protoVersion', { length: 2, type: 'number', byteOrder: 'BE' }],
    ['aux1', { length: 1, type: 'number' }],
    ['aux2', { length: 1, type: 'number' }],
  ]);

  constructor(payload: Partial<SyncPacketPayload> = {}) {
    const syncPacketPayload: SyncPacketPayload = {
      protoVersion: PROTOCOL_VERSION,
      aux1: 0,
      aux2: 0,
      ...payload,
    };

    super(OP_CODE.SYNC, syncPacketPayload, SyncPacket.schemaDefault);
  }

  static is(data: Buffer): boolean {
    return super.is(data) && ArtNetPacket.readPacketOpCode(data) === OP_CODE.SYNC;
  }

  public static create(data: Buffer, schema: Schema<SyncPacketPayload> = SyncPacket.schemaDefault): SyncPacket | null {
    if (SyncPacket.is(data)) return new SyncPacket(decode(data, schema));
    return null;
  }
}
