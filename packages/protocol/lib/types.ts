export type Encoding =
  | 'ascii'
  | 'utf8'
  | 'utf-8'
  | 'utf16le'
  | 'ucs2'
  | 'ucs-2'
  | 'base64'
  | 'base64url'
  | 'latin1'
  | 'binary'
  | 'hex';

export type PacketSchemaString = {
  type: 'string';
  size: 1 | 2;
  length: number;
  encoding: Encoding;
};

export type PacketSchemaNumberWithByteOrder = {
  type: 'number';
  size: 2 | 4;
  byteOrder: 'LE' | 'BE';
};

export type PacketSchemaNumberBigInt = {
  type: 'number';
  size: 8;
  byteOrder: 'LE' | 'BE';
};

export type PacketSchemaNumberWithoutByteOrder = {
  type: 'number';
  size: 1;
};

export type PacketSchemaNumber =
  | PacketSchemaNumberWithByteOrder
  | PacketSchemaNumberBigInt
  | PacketSchemaNumberWithoutByteOrder;

export type PacketSchemaArrayWithByteOrder = {
  type: 'array';
  length: number;
  size: 2 | 4;
  byteOrder: 'LE' | 'BE';
};

export type PacketSchemaArrayWithOutByteOrder = {
  type: 'array';
  length: number;
  size: 1;
};

export type PacketSchemaArray = PacketSchemaArrayWithByteOrder | PacketSchemaArrayWithOutByteOrder;

export type PacketSchemaRecord = PacketSchemaNumber | PacketSchemaArray | PacketSchemaString;

export type PacketPayloadType = string | number | number[] | bigint;

export type PacketPayload = Record<string, PacketPayloadType>;

export type PacketSchemaFromPayload<TPayload> = Map<keyof TPayload, PacketSchemaRecord>;
export type PacketSchemaPublic<TPayload> = [keyof TPayload, PacketSchemaRecord][];
