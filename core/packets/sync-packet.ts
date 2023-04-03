import {ArtNetPacket} from "./common/art-net-packet";
import {SyncPacketSchema, ISyncPacketPayload} from "../types";
import {PacketDecoder} from "./common/packet-decoder";
import {OP_CODE, PROTOCOL_VERSION} from "../../constants";

export class SyncPacket extends ArtNetPacket<ISyncPacketPayload, SyncPacketSchema> {
    static readonly schema: SyncPacketSchema = {
        protoVersion: {length: 2, type: 'number', byteOrder: 'BE'},
        aux1: {length: 1, type: 'number'},
        aux2: {length: 1, type: 'number'},
    }

    constructor(payload: Partial<ISyncPacketPayload> = {}) {
        super(OP_CODE.SYNC, SyncPacket.schema, payload)
        this.packetPayload.protoVersion = PROTOCOL_VERSION
        this.packetPayload.aux1 = 0
        this.packetPayload.aux2 = 0
    }

    protected build(): Buffer {
        return PacketDecoder.encode(this.packetPayload, SyncPacket.headerSchema)
    }
}