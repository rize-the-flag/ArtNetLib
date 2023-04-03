import {ArtNetPacket} from "./common/art-net-packet";
import {DiagDataPacketSchema, IDiagDataPayload} from "../types";
import {OP_CODE, PROTOCOL_VERSION} from "../../constants";
import {PacketDecoder} from "./common/packet-decoder";

export class DiagDataPacket extends ArtNetPacket<IDiagDataPayload, DiagDataPacketSchema> {
    static readonly schema: DiagDataPacketSchema = {
        protoVersion: {length: 2, type: 'number', byteOrder: 'BE'},
        filler1: {length: 1, type: 'number'},
        diagPriority: {length: 1, type: 'number'},
        logicalPort: {length: 1, type: 'number'},
        filler3: {length: 1, type: 'number'},
        length: {length: 2, type: 'number', byteOrder: 'LE'},
        data: {length: 512, type: 'string'}
    }

    constructor(payload: Partial<IDiagDataPayload> = {}) {
        super(OP_CODE.DIAG_DATA, DiagDataPacket.schema, payload);
        payload.protoVersion = payload.protoVersion || PROTOCOL_VERSION
        payload.diagPriority = payload.diagPriority || 0x10
        payload.logicalPort = payload.logicalPort || 0;
        payload.data = payload.data || `Don't push on me`;
        payload.length = DiagDataPacket.headerSchema.data.length;

        payload.filler1 = 0;
        payload.filler3 = 0;
    }

    protected build(): Buffer {
        return PacketDecoder.encode(this.packetPayload, DiagDataPacket.schema)
    }
}