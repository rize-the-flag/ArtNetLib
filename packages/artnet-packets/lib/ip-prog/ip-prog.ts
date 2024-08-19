import { ArtNetPacket } from '../common/art-net-packet';
import { IpProgPayload } from './ip-prog.interface';
import { decode, Schema } from '@rtf-dm/protocol';
import { OP_CODE, PROTOCOL_VERSION } from '../constants';

export class IpProgPacket extends ArtNetPacket<IpProgPayload> {
  private static readonly defaultSchema = new Schema<IpProgPayload>([
    ['protoVersion', { size: 2, type: 'number', byteOrder: 'BE' }],
    ['filler1', { size: 1, type: 'number' }],
    ['filler2', { size: 1, type: 'number' }],
    ['command', { size: 1, type: 'number' }],
    ['filler4', { size: 1, type: 'number' }],
    ['progIpHi', { size: 1, type: 'number' }],
    ['progIp2', { size: 1, type: 'number' }],
    ['progIp1', { size: 1, type: 'number' }],
    ['progIpLo', { size: 1, type: 'number' }],
    ['progSmHi', { size: 1, type: 'number' }],
    ['progSm2', { size: 1, type: 'number' }],
    ['progSm1', { size: 1, type: 'number' }],
    ['progSmLo', { size: 1, type: 'number' }],
    ['progPortHi', { size: 1, type: 'number' }],
    ['progPortLo', { size: 1, type: 'number' }],
    ['progDgHi', { size: 1, type: 'number' }],
    ['progDg2', { size: 1, type: 'number' }],
    ['progDg1', { size: 1, type: 'number' }],
    ['progDgLo', { size: 1, type: 'number' }],
    ['spare4', { size: 1, type: 'number' }],
    ['spare5', { size: 1, type: 'number' }],
    ['spare6', { size: 1, type: 'number' }],
    ['spare7', { size: 1, type: 'number' }],
  ]);

  constructor(payload: Partial<IpProgPayload>) {
    const defaultPayload: IpProgPayload = {
      protoVersion: PROTOCOL_VERSION,
      command: 0b11011111,
      filler1: 0,
      filler2: 0,
      filler4: 0,
      progIpHi: 192,
      progIp2: 168,
      progIp1: 0,
      progIpLo: 10,
      progSmHi: 255,
      progSm2: 255,
      progSm1: 255,
      progSmLo: 0,
      progPortHi: 0,
      progPortLo: 0,
      progDgHi: 192,
      progDg2: 168,
      progDg1: 0,
      progDgLo: 1,
      spare4: 0,
      spare5: 0,
      spare6: 0,
      spare7: 0,
      ...payload,
    };

    super(OP_CODE.IP_PROG, defaultPayload, IpProgPacket.defaultSchema);
  }

  static is(data: Buffer): boolean {
    return super.is(data) && ArtNetPacket.readPacketOpCode(data) === OP_CODE.IP_PROG;
  }

  static create(data: Buffer): IpProgPacket | null {
    if (!IpProgPacket.is(data)) return null;

    const schemaWithHeader = new Schema([...IpProgPacket.headerSchema, ...IpProgPacket.defaultSchema]);

    return new IpProgPacket(decode(data, schemaWithHeader));
  }
}
