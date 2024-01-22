import {ARTNET_PACKET_ID} from '../../constants';
import {
    HeaderSchema,
    HeaderPayload,
    OpCode,
} from '../packet.interface';
import {GPacketSchema, Packet, PacketPayload} from '@rtf-dm/protocol';

export abstract class ArtNetPacket<
    TPayload extends PacketPayload,
    TSchema extends GPacketSchema<TPayload>,
> extends Packet<TPayload & HeaderPayload, GPacketSchema<HeaderPayload & TPayload>> {
    static readonly headerSchema: HeaderSchema = {
        //order of schema fields makes sense do not change it!!!
        ID: {length: 8, type: 'string'},
        opCode: {length: 2, type: 'number', byteOrder: 'LE'},
    };

    protected constructor(opCode: OpCode, packetPayload: TPayload, packetSchema: TSchema) {
        const packetWithHeader = Object.assign(
            {},
            {
                ID: ARTNET_PACKET_ID,
                opCode,
            },
            {...packetPayload},
        );

        const schemaWithHeader = Object.assign(
            {},
            {...ArtNetPacket.headerSchema},
            {...packetSchema},
        );

        super(packetWithHeader, schemaWithHeader);
    }

    public static is(data: Buffer): boolean {
        return ArtNetPacket.isArtNetPacket(data);
    };

    static getHeaderLength(): number {
        const {ID, opCode} = ArtNetPacket.headerSchema;
        return ID.length + opCode.length;
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
