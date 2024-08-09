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

type TestPacketPayload = {
    ID: string,
    opCode: number,
    foo: number,
    bar: number[]
}

const schema: PacketSchemaPublic<TestPacketPayload> = [
    ['opCode', {length: 2, type: 'number', byteOrder: 'LE'}],
    ['ID', {length: 4, type: 'string'}],
    ['foo', {length: 2, type: 'number', byteOrder: 'BE'}],
    ['bar', {length: 10, type: 'array'}]
];

class TestPacket extends Packet<TestPacketPayload> {
    constructor(payload: Partial<TestPacketPayload>) {
        const testPacketPayload: TestPacketPayload = {
            ID: "Test",
            opCode: 0xFA,
            foo: 20,
            bar: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            ...payload
        }
        super(testPacketPayload, schema);
    }

     public make(payload: Buffer): TestPacket {
        return new TestPacket(this.decode(payload))
    }
}
