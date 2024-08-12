export interface PacketSchemaRecord {
  length: number;
  byteOrder?: 'LE' | 'BE';
  type: 'string' | 'number' | 'array';
  default?: number | string | number[] | bigint;
}

export type PacketPayloadType = string | number | number[] | bigint;

export type PacketPayload = Record<string, PacketPayloadType>;

export type PacketSchemaFromPayload<TPayload> = Map<keyof TPayload, PacketSchemaRecord>;
export type PacketSchemaPublic<TPayload> = [keyof TPayload, PacketSchemaRecord][];
