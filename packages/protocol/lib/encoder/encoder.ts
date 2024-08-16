import {
  PacketPayload,
  PacketSchemaString,
  PacketSchemaNumber,
  PacketSchemaArray,
  PacketSchemaRecord,
  PacketSchemaArrayWithByteOrder,
} from '../types';
import { Schema } from '../schema/schema';

function writeNumberToBuffer(
  buffer: Buffer,
  schemaRecord: PacketSchemaNumber,
  numberValue: number,
  offset: number
): void {
  switch (schemaRecord.length) {
    case 1:
      buffer.writeUInt8(numberValue, offset);
      break;
    case 2:
      schemaRecord.byteOrder === 'LE'
        ? buffer.writeUInt16LE(numberValue, offset)
        : buffer.writeUInt16BE(numberValue, offset);
      break;
    case 4:
      schemaRecord.byteOrder === 'LE'
        ? buffer.writeUInt32LE(numberValue, offset)
        : buffer.writeUInt32BE(numberValue, offset);
      break;
  }
}

function writeStringToBuffer(
  buffer: Buffer,
  schemaRecord: PacketSchemaString,
  stringValue: string,
  offset: number
): number {
  return buffer.write(stringValue, offset, schemaRecord.length, schemaRecord.encoding);
}

function writeU16ArrayToBuffer(buffer: Buffer, arrayValues: number[], offset: number, byteOrder: 'LE' | 'BE'): void {
  const u16Array = new Uint16Array(arrayValues);
  const toBuffer = Buffer.from(u16Array.buffer);
  byteOrder === 'BE' && toBuffer.swap16();
  buffer.set(toBuffer, offset);
}

function writeU32ArrayToBuffer(buffer: Buffer, arrayValues: number[], offset: number, byteOrder: 'LE' | 'BE'): void {
  const u32Array = new Uint32Array(arrayValues);
  const toBuffer = Buffer.from(u32Array.buffer);
  if (byteOrder === 'BE') {
    toBuffer.swap32();
  }
  buffer.set(toBuffer, offset);
}

function writeArrayToBuffer(
  buffer: Buffer,
  schemaRecord: PacketSchemaArray,
  arrayValues: number[],
  offset: number
): number {
  switch (schemaRecord.size) {
    case 1:
      buffer.set(arrayValues, offset);
      break;
    case 2:
      writeU16ArrayToBuffer(buffer, arrayValues, offset, schemaRecord.byteOrder);
      break;
    case 4:
      writeU32ArrayToBuffer(buffer, arrayValues, offset, schemaRecord.byteOrder);
      break;
  }

  return offset + schemaRecord.length * schemaRecord.size;
}

function readNumberFromBuffer(buffer: Buffer, schemaRecord: PacketSchemaNumber, offset: number): number | bigint {
  let result;
  switch (schemaRecord.length) {
    case 1:
      result = buffer.readUint8(offset);
      break;
    case 2:
      schemaRecord.byteOrder === 'LE' ? (result = buffer.readUint16LE(offset)) : (result = buffer.readUInt16BE(offset));
      break;
    case 4:
      schemaRecord.byteOrder === 'LE' ? (result = buffer.readUint32LE(offset)) : (result = buffer.readUInt32BE(offset));
      break;
    case 8:
      schemaRecord.byteOrder === 'LE'
        ? (result = buffer.readBigUInt64LE(offset))
        : (result = buffer.readBigUInt64BE(offset));
      break;
  }
  return result;
}

function readStringFromBuffer(buffer: Buffer, schemeRecord: PacketSchemaString, offset: number): string {
  const nullTerminatedString = buffer.subarray(offset, offset + schemeRecord.length).toString();
  const lastIndex = nullTerminatedString.indexOf('\x00');
  return nullTerminatedString.substring(0, lastIndex !== -1 ? lastIndex : nullTerminatedString.length);
}

function readU16ArrayFromBuffer(data: Buffer, schemaRecord: PacketSchemaArrayWithByteOrder) {
  return schemaRecord.byteOrder === 'BE'
    ? Array.from(new Uint16Array(data.swap16().buffer, data.byteOffset, schemaRecord.length))
    : Array.from(new Uint16Array(data.buffer, data.byteOffset, schemaRecord.length));
}

function readU32ArrayFromBuffer(data: Buffer, schemaRecord: PacketSchemaArrayWithByteOrder) {
  return schemaRecord.byteOrder === 'BE'
    ? Array.from(new Uint32Array(data.swap32().buffer, data.byteOffset, schemaRecord.length))
    : Array.from(new Uint32Array(data.buffer, data.byteOffset, schemaRecord.length));
}

function readArrayFromBuffer(data: Buffer, schemaRecord: PacketSchemaArray, offset: number): number[] {
  const rawArray = data.subarray(offset, offset + schemaRecord.length * schemaRecord.size);
  switch (schemaRecord.size) {
    case 1:
      return Array.from(rawArray);
    case 2:
      return readU16ArrayFromBuffer(rawArray, schemaRecord);
    case 4:
      return readU32ArrayFromBuffer(rawArray, schemaRecord);
  }
}

export function getOffsetOf(currentOffset: number, record: PacketSchemaRecord) {
  if (record.type !== 'array') return currentOffset + record.length;
  return currentOffset + record.length * record.size;
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
        Array.isArray(payloadValue) && writeArrayToBuffer(packet, schemaRecord, payloadValue, offset);
        break;
      case 'number':
        typeof payloadValue === 'number' && writeNumberToBuffer(packet, schemaRecord, payloadValue, offset);
        break;
    }
    offset = getOffsetOf(offset, schemaRecord);
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
    }
    offset = getOffsetOf(offset, value);
  }
  return packetPayload as TPayload;
}
