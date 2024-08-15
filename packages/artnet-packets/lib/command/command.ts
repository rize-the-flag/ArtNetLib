import { ArtNetPacket } from '../common/art-net-packet';
import { CommandPayload } from './command.interface';
import { decode, Schema } from '@rtf-dm/protocol';
import { OP_CODE } from '../constants';
import { Buffer } from 'node:buffer';

export class Command extends ArtNetPacket<CommandPayload> {
  private static MAX_COMMAND_DATA_LENGTH = 512;
  private static schemaDefault = new Schema<CommandPayload>([
    ['protocolVersion', { type: 'number', length: 2, byteOrder: 'BE' }],
    ['estaManufactorer', { type: 'number', length: 2, byteOrder: 'BE' }],
    ['length', { type: 'number', length: 2, byteOrder: 'BE' }],
    ['data', { type: 'string', length: Command.MAX_COMMAND_DATA_LENGTH, encoding: 'ascii' }],
  ]);

  constructor(payload: Partial<CommandPayload>) {
    const length = payload.length ?? Command.MAX_COMMAND_DATA_LENGTH;
    const commandPayload: CommandPayload = {
      estaManufactorer: 0x1234,
      length,
      protocolVersion: 14,
      data: '1'.repeat(length),
      ...payload,
    };

    console.log(commandPayload);

    Command.schemaDefault.setValue('data', { type: 'string', length, encoding: 'ascii' });

    super(OP_CODE.COMMAND, commandPayload, Command.schemaDefault);
  }

  static is(data: Buffer): boolean {
    return ArtNetPacket.is(data) && ArtNetPacket.readPacketOpCode(data) === OP_CODE.COMMAND;
  }

  static getDataLength(data: Buffer): number | null {
    if (!Command.is(data)) return null;
    const offset = Command.schemaDefault.getOffsetOf('length');
    if (!offset || offset === Command.schemaDefault.calcBytesInPacket()) return null;
    return data.readUInt16BE(offset + ArtNetPacket.getHeaderLength());
  }

  static create(data: Buffer) {
    if (!Command.is(data)) return null;
    const length = Command.getDataLength(data);
    if (!length) return null;

    Command.schemaDefault.setValue('data', { type: 'string', length, encoding: 'ascii' });
    return new Command(decode(data, Command.schemaDefault));
  }
}
