import {PacketPayload} from './types';
import {decode, encode} from './encoder/encoder'
import {Schema} from "./schema/schema";

export abstract class Packet<TPayload extends PacketPayload> {
    protected payload: TPayload;
    protected schema: Schema<TPayload>;

    protected constructor(
        payload: TPayload,
        protected packetSchema: Schema<TPayload>
    ) {
        this.payload = structuredClone(payload);
        this.schema = packetSchema;
    }

    public encode(): Buffer {
        return encode(this.payload, this.schema);
    }

    public decode(buffer: Buffer): TPayload {
        return decode(buffer, this.schema);
    }
}
