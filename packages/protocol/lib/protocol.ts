import {PacketPayload, PacketSchemaPublic} from './types';
import { encode, decode } from './encoder/encoder'
import {Schema} from "./schema/schema";

export abstract class Packet<TPayload extends PacketPayload> {
    protected payload: TPayload;
    protected readonly schema: Schema<TPayload>;

    protected constructor(
        payload: TPayload,
        protected packetSchema: PacketSchemaPublic<TPayload>
    ) {
        this.payload = structuredClone(payload);
        this.schema = new Schema<TPayload>(packetSchema);
    }

    public encode(): Buffer {
        return encode(this.payload, this.schema);
    }

    public decode(buffer: Buffer): TPayload {
        return decode(buffer, this.schema);
    }
}

