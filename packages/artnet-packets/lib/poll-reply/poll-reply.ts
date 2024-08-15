import { ArtNetPacket } from '../common/art-net-packet';
import { ARTNET_PORT, OP_CODE } from '../constants';
import { decode, Schema } from '@rtf-dm/protocol';
import { PollReplyPacketPayload } from './poll-reply.interface';

export class PollReply extends ArtNetPacket<PollReplyPacketPayload> {
  //order of schema fields make sense do not change it!!!
  static schemaDefault = new Schema([
    ['ipAddress', { length: 4, type: 'array', size: 1 }],
    ['port', { length: 2, type: 'number', byteOrder: 'LE' }],
    ['firmwareVersion', { length: 2, type: 'number', byteOrder: 'BE' }],
    ['netSwitch', { length: 1, type: 'number' }],
    ['netSubSwitch', { length: 1, type: 'number' }],
    ['oem', { length: 2, type: 'number', byteOrder: 'BE' }],
    ['ubeaVersion', { length: 1, type: 'number' }],
    ['status1', { length: 1, type: 'number' }],
    ['estaManufactorerCode', { length: 2, type: 'number', byteOrder: 'BE' }],
    ['shortName', { length: 18, type: 'string', encoding: 'utf8' }],
    ['longName', { length: 64, type: 'string', encoding: 'utf8' }],
    ['nodeReport', { length: 64, type: 'string', encoding: 'utf8' }],
    ['numPorts', { length: 2, type: 'number', byteOrder: 'BE' }],
    ['portTypes', { length: 4, type: 'array', size: 1 }],
    ['goodInput', { length: 4, type: 'array', size: 1 }],
    ['goodOutputA', { length: 4, type: 'array', size: 1 }],
    ['swIn', { length: 4, type: 'array', size: 1 }],
    ['swOut', { length: 4, type: 'array', size: 1 }],
    ['acnPriority', { length: 1, type: 'number' }],
    ['swMacro', { length: 1, type: 'number' }],
    ['swRemote', { length: 1, type: 'number' }],
    ['spare', { length: 3, type: 'array', size: 1 }],
    ['style', { length: 1, type: 'number' }],
    ['macAddress', { length: 6, type: 'array', size: 1 }],
    ['bindIp', { length: 4, type: 'array', size: 1 }],
    ['bindIndex', { length: 1, type: 'number' }],
    ['status2', { length: 1, type: 'number' }],
    ['goodOutputB', { length: 1, type: 'number' }],
    ['status3', { length: 1, type: 'number' }],
    ['defaultRespUID', { length: 6, type: 'array', size: 1 }],
    ['filler', { length: 15, type: 'array', size: 1 }],
  ]);

  constructor(payload: Partial<PollReplyPacketPayload> = {}) {
    const pollReplyPacketPayload: PollReplyPacketPayload = {
      ipAddress: [0, 0, 0, 0],
      port: ARTNET_PORT,
      firmwareVersion: 0xdead,
      netSwitch: 0,
      netSubSwitch: 0,
      oem: 0xbeef,
      ubeaVersion: 0x11,
      status1: 0b010100111,
      estaManufactorerCode: 0xfefe,
      shortName: 'AN-Controller',
      longName: 'ArtNet-Controller',
      nodeReport: 'Normal State',
      numPorts: 4,
      portTypes: [0b11001000, 0b10000100, 0b10000001, 0b11000010],
      goodInput: [1, 2, 3, 4],
      goodOutputA: [1, 2, 3, 4],
      swIn: [0, 0, 0, 0],
      swOut: [0, 0, 0, 0],
      acnPriority: 0,
      swMacro: 0,
      swRemote: 0,
      spare: [0, 0, 0],
      style: 0,
      macAddress: [0xff, 0xef, 0x1d, 0x32, 0xfa, 0xaa],
      bindIp: [0, 0, 0, 0],
      bindIndex: 0,
      status2: 0b11111111,
      goodOutputB: 0,
      status3: 0,
      defaultRespUID: [0, 0, 0, 0, 0, 0],
      filler: new Array<number>(15).fill(0),
      ...payload,
    };

    super(OP_CODE.POLL_REPLY, pollReplyPacketPayload, PollReply.schemaDefault);
  }

  static is(data: Buffer): boolean {
    return super.is(data) && ArtNetPacket.readPacketOpCode(data) === OP_CODE.POLL_REPLY;
  }

  public static create(data: Buffer): PollReply | null {
    if (!PollReply.is(data)) return null;

    const schemaWithHeader = new Schema([...PollReply.headerSchema, ...PollReply.schemaDefault]);

    return new PollReply(decode(data, schemaWithHeader));
  }
}
