import { ArtNetPacket } from '../common/art-net-packet';
import { OP_CODE, PROTOCOL_VERSION } from '../constants';
import { decode, Schema } from '@rtf-dm/protocol';
import Buffer from 'node:buffer';
import { PollReplyPacketPayload } from '../poll-reply/poll-reply.interface';
import { SyncPacketPayload } from './sync.interface';

export class Sync extends ArtNetPacket<SyncPacketPayload> {
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

    super(OP_CODE.SYNC, syncPacketPayload, Sync.schemaDefault);
  }

  static is(data: Buffer): boolean {
    return super.is(data) && ArtNetPacket.readPacketOpCode(data) === OP_CODE.SYNC;
  }

  public static create(data: Buffer): Sync | null {
    if (!Sync.is(data)) return null;

    const schemaWithHeader = new Schema([...Sync.headerSchema, ...Sync.schemaDefault]);

    return new Sync(decode(data, schemaWithHeader));
  }
}
