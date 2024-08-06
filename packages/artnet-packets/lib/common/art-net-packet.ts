import {ARTNET_PACKET_ID} from '../constants';
import {
    HeaderSchema,
    HeaderPayload,
    OpCode,
} from './packet.interface';
import {Packet, PacketPayload, PacketSchemaPublic} from '@rtf-dm/protocol';


const headerSchema: HeaderSchema = [
    ['ID', {length: 8, type: 'string'}],
    ['opCode', {length: 2, type: 'number', byteOrder: 'LE'}]
]


export abstract class ArtNetPacket<
    TPayload extends PacketPayload,
> extends Packet<TPayload & HeaderPayload> {

    protected constructor(opCode: OpCode, packetPayload: TPayload, packetSchema: PacketSchemaPublic<TPayload>) {
        const payloadWithHeader = {
            ID: ARTNET_PACKET_ID,
            opCode,
            ...packetPayload
        }

        const schemaWithHeader =[
                ...headerSchema,
                ...packetSchema,
            ]

        super(payloadWithHeader, schemaWithHeader);
    }

    public static is(data: Buffer): boolean {
        return ArtNetPacket.isArtNetPacket(data);
    };

    static getHeaderLength(): number | undefined {
        const ID = headerSchema[0][1]['length'];
        const opCode = headerSchema[1][1]['length']
        if (!ID || !opCode) throw new Error('ID or opCode wasn\'t found in header');
        return ID + opCode;
    }

    static readPacketID(buffer: Buffer): string {
        return buffer.subarray(0, ARTNET_PACKET_ID.length).toString();
    }

    static readPacketOpCode(buffer: Buffer): number {
        return buffer.readUInt16LE(ARTNET_PACKET_ID.length + 1);
    }

    static isArtNetPacket(data?: Buffer): boolean {
        if (!data) return false;
        return ArtNetPacket.readPacketID(data) === ARTNET_PACKET_ID;
    }
}
