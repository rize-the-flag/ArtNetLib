import {HeaderSchema, IPacketPayload, IHeaderPayload, IPacketSchemaRecord} from '../../types'
import {PacketDecoder} from './packet-decoder'
import {ARTNET_PACKET_ID, OP_CODE} from '../../../constants'

export abstract class ArtNetPacket<
    TPayload extends IPacketPayload,
    TSchema extends Record<keyof TPayload, IPacketSchemaRecord>
> {

    static readonly headerSchema: HeaderSchema = {
        ID: {length: 8, type: 'string'},
        opCode: {length: 2, type: 'number', byteOrder: 'LE'},
    }

    protected constructor(
        private opCode: OP_CODE,
        protected readonly packetSchema: TSchema,
        protected packetPayload: Partial<TPayload>,
    ) {}

    encode(): Buffer {
        const header = PacketDecoder.encode<IHeaderPayload, HeaderSchema>({
            ID: ARTNET_PACKET_ID,
            opCode: this.opCode,
        }, ArtNetPacket.headerSchema)
        return Buffer.from([...header, ...this.build()])
    }

    decode(data: Buffer): TPayload {
        return PacketDecoder.decode<TPayload, TSchema>(data, this.packetSchema, ArtNetPacket.getHeaderLength())
    }

    static getHeaderLength(): number {
        const {ID, opCode} = this.headerSchema;
        return ID.length + opCode.length;
    }

    static getPacketID(buffer: Buffer): string {
        return buffer.subarray(0, ARTNET_PACKET_ID.length).toString()
    }

    static getPacketOpCode(buffer: Buffer): number {
        return buffer.readUInt16LE(ARTNET_PACKET_ID.length + 1)
    }

    static isArtNetPacket(data?: Buffer): boolean {
        if (!data) return false
        const ID = ArtNetPacket.getPacketID(data)
        return ID === ARTNET_PACKET_ID
    }

    protected abstract build(): Buffer;
}