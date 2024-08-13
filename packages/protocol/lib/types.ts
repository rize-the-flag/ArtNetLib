export type PacketSchemaString = {
  type: 'string';
  length: number;
};

export type PacketSchemaNumberWithByteOrder = {
  type: 'number';
  length: 2 | 4;
  byteOrder: 'LE' | 'BE';
};

export type PacketSchemaNumberBigInt = {
  type: 'number';
  length: 8;
  byteOrder: 'LE' | 'BE';
};

export type PacketSchemaNumberWithoutByteOrder = {
  type: 'number';
  length: 1;
};

export type PacketSchemaNumber = PacketSchemaNumberWithByteOrder | PacketSchemaNumberBigInt | PacketSchemaNumberWithoutByteOrder;

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
