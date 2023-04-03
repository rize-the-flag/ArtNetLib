import {ArtNetPacket} from "./common/art-net-packet";
import {PollPacketSchema, IPollPacketPayload} from '../types'
import {PacketDecoder} from './common/packet-decoder'
import {PROTOCOL_VERSION, OP_CODE} from '../../constants'


export class PollPacket extends ArtNetPacket<IPollPacketPayload, PollPacketSchema> {
    static readonly schema: PollPacketSchema = {
        protoVersion: {length: 2, type: 'number', byteOrder: 'BE'},
        flags: {length: 1, type: 'number'},
        diagPriority: {length: 1, type: 'number'},
        targetPortAddress: {length: 4, type: 'number', byteOrder: 'BE'},
    }

    constructor(payload: Partial<IPollPacketPayload> = {}) {
        super(OP_CODE.POLL, PollPacket.schema, payload);
        this.packetPayload.protoVersion = PROTOCOL_VERSION;
        this.packetPayload.flags = payload?.flags || 0b00000110;
        this.packetPayload.diagPriority = payload?.diagPriority || 0x10;
        this.packetPayload.targetPortAddress = payload?.targetPortAddress || 0;
    }

    protected build(): Buffer {
        return PacketDecoder.encode(this.packetPayload, PollPacket.schema);
    }
}
