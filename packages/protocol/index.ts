import { GPacketSchema, PacketPayload } from './types';
import { decode, encode } from './encoder';

export abstract class Packet<
	TPayload extends PacketPayload,
	TSchema extends GPacketSchema<TPayload>,
> {
	protected payload: TPayload;
	protected readonly schema: TSchema;

	protected constructor(payload: Partial<TPayload>, protected packetSchema: TSchema) {
		this.payload = Object.create(payload);
		this.schema = Object.create(packetSchema);
	}

	public encode(): Buffer {
		return encode(this.payload, this.packetSchema);
	}

	public decode(buffer: Buffer): TPayload {
		return decode(buffer, this.packetSchema);
	}
}

export * from './types';
