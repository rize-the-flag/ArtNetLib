import { PacketSchemaRecord, PacketPayload } from '../types';
import { Schema } from '../schema/schema';

function assertUnreachable(x: never): never {
  throw new Error('Exhaustive check failed');
}

function writeNumberToBuffer(buffer: Buffer, schemaRecord: PacketSchemaRecord, numberValue: number, offset: number): void {
  if (schemaRecord.length == 2) {
    schemaRecord.byteOrder === 'LE' ? buffer.writeUInt16LE(numberValue, offset) : buffer.writeUInt16BE(numberValue, offset);
  } else if (schemaRecord.length == 4) {
    schemaRecord.byteOrder === 'LE' ? buffer.writeUInt32LE(numberValue, offset) : buffer.writeUInt32BE(numberValue, offset);
  } else {
    buffer.writeUInt8(numberValue, offset);
  }
}

function writeStringToBuffer(buffer: Buffer, schemaRecord: PacketSchemaRecord, stringValue: string, offset: number): number {
  return buffer.write(stringValue, offset, schemaRecord.length, 'utf8');
}

function writeArrayToBuffer(buffer: Buffer, arrayValues: number[], offset: number): number {
  const raw = Buffer.from(arrayValues);
  buffer.set(raw, offset);
  return offset + raw.length;
}

function readNumberFromBuffer(buffer: Buffer, schemeRecord: PacketSchemaRecord, offset: number): number | bigint {
  let result;
  if (schemeRecord.length === 2) {
    schemeRecord.byteOrder === 'LE' ? (result = buffer.readUint16LE(offset)) : (result = buffer.readUInt16BE(offset));
  } else if (schemeRecord.length === 4) {
    schemeRecord.byteOrder === 'LE' ? (result = buffer.readUint32LE(offset)) : (result = buffer.readUInt32BE(offset));
  } else if (schemeRecord.length === 8) {
    schemeRecord.byteOrder === 'LE' ? (result = buffer.readBigUInt64LE(offset)) : (result = buffer.readBigUInt64BE(offset));
  } else {
    result = buffer.readUint8(offset);
  }

  return result;
}

function readStringFromBuffer(buffer: Buffer, schemeRecord: PacketSchemaRecord, offset: number): string {
  const nullTerminatedString = buffer.subarray(offset, offset + schemeRecord.length).toString();
  const lastIndex = nullTerminatedString.indexOf('\x00');
  return nullTerminatedString.substring(0, lastIndex !== -1 ? lastIndex : nullTerminatedString.length);
}

function readArrayFromBuffer(buffer: Buffer, schemeRecord: PacketSchemaRecord, offset: number): number[] {
  return Array.from(buffer.subarray(offset, offset + schemeRecord.length));
}

export function encode<TPayload extends PacketPayload>(payload: TPayload, schema: Schema<TPayload>): Buffer | never {
  const packetByteLength = schema.calcBytesInPacket();
  const packet: Buffer = Buffer.alloc(packetByteLength);
  let offset = 0;

  for (const [key, schemaRecord] of schema) {
    if (!(key in payload)) throw new Error(`Schema key:[ ${String(key)} ] doesn't exist in packet`);
    const payloadValue = payload[key];

    switch (schemaRecord.type) {
      case 'string':
        typeof payloadValue === 'string' && writeStringToBuffer(packet, schemaRecord, payloadValue, offset);
        break;
      case 'array':
        Array.isArray(payloadValue) && writeArrayToBuffer(packet, payloadValue, offset);
        break;
      case 'number':
        typeof payloadValue === 'number' && writeNumberToBuffer(packet, schemaRecord, payloadValue, offset);
        break;
      default:
        return assertUnreachable(schemaRecord.type);
    }
    offset += schemaRecord.length;
  }
  return packet;
}

export function decode<TPayload extends PacketPayload>(buffer: Buffer, schema: Schema<TPayload>): TPayload {
  const packetPayload: Record<keyof TPayload, unknown> = {} as Record<keyof TPayload, unknown>;
  let offset = 0;

  const payloadByteLength = schema.calcBytesInPacket();

  if (payloadByteLength !== buffer.length) throw new Error('packet size mismatch');

  for (const [key, value] of schema) {
    switch (value.type) {
      case 'string':
        packetPayload[key] = readStringFromBuffer(buffer, value, offset);
        break;
      case 'number':
        packetPayload[key] = readNumberFromBuffer(buffer, value, offset);
        break;
      case 'array':
        packetPayload[key] = readArrayFromBuffer(buffer, value, offset);
        break;
      default:
        return assertUnreachable(value.type);
    }
    offset += value.length;
  }
  return packetPayload as TPayload;
}
