import {ARTNET_PACKET_ID} from '../constants';
import {HeaderPayload, OpCode,} from './packet.interface';
import {Packet, PacketPayload, PacketSchemaFromPayload, Schema} from '@rtf-dm/protocol';
import Buffer from "node:buffer";

export abstract class ArtNetPacket<
    TPayload extends PacketPayload,
> extends Packet<TPayload & HeaderPayload> {

    private static headerSchema: PacketSchemaFromPayload<HeaderPayload> = new Map([
        ['ID', {length: 8, type: 'string'}],
        ['opCode', {length: 2, type: 'number', byteOrder: 'LE'}]
    ]);

    protected constructor(opCode: OpCode, packetPayload: TPayload, packetSchema: Schema<TPayload>) {
        const payloadWithHeader = {
            ID: ARTNET_PACKET_ID,
            opCode,
            ...packetPayload
        }

        const schemaWithHeader: Schema<TPayload & HeaderPayload> = new Schema([
                ...ArtNetPacket.headerSchema.entries(),
                ...packetSchema,
            ])

        super(payloadWithHeader, schemaWithHeader);
    }

    public static is(data: Buffer): boolean {
        return ArtNetPacket.isArtNetPacket(data);
    };

    static getHeaderLength(): number | undefined {
        const ID = ArtNetPacket.headerSchema.get('ID')?.length;
        const opCode = ArtNetPacket.headerSchema.get('opCode')?.length
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