export type PacketSchemaRecord = {
	length: number;
	byteOrder?: 'LE' | 'BE';
	type: 'string' | 'number' | 'array';
	default?: number | string | number[] | bigint;
};

export type PacketPayloadType = string | number | number[] | bigint;

export type PacketPayload = {
	[field: string]: PacketPayloadType;
};

export type GPacketSchema<TPayload> = {
	[TKey in keyof TPayload]: PacketSchemaRecord;
};
