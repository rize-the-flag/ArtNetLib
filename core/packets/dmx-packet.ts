import {ArtNetPacket} from "./common/art-net-packet";
import {OP_CODE, PROTOCOL_VERSION} from "../../constants";
import {IDmxPacketPayload, DmxPacketSchema} from '../types'
import {PacketDecoder} from './common/packet-decoder'

export class DmxPacket extends ArtNetPacket<IDmxPacketPayload, DmxPacketSchema> {

    static readonly DMX_CHANNEL_MAX = 512;
    static readonly DMX_VALUE_MAX = 255;

    static readonly schema: DmxPacketSchema = {
        protoVersion: {length: 2, type: 'number', byteOrder: 'BE'},
        sequence: {length: 1, type: 'number'},
        physical: {length: 1, type: 'number'},
        subUniverse: {length: 1, type: 'number'},
        net: {length: 1, type: 'number'},
        length: {length: 2, type: 'number', byteOrder: 'BE'},
        dmxData: {length: DmxPacket.DMX_CHANNEL_MAX, type: 'array'}
    }

    constructor(packetPayload: Partial<IDmxPacketPayload> = {}) {
        super(OP_CODE.DMX, DmxPacket.schema, packetPayload);
        this.packetPayload.protoVersion = PROTOCOL_VERSION;
        this.packetPayload.net = packetPayload?.net || 0;
        this.packetPayload.length = packetPayload?.length || 512;
        this.packetPayload.subUniverse = packetPayload?.subUniverse || 0;
        this.packetPayload.sequence = packetPayload?.sequence || 0;
        this.packetPayload.physical = packetPayload?.physical || 0;
        this.packetPayload.dmxData = packetPayload?.dmxData || [];
    }

    protected build(): Buffer {
        return PacketDecoder.encode(this.packetPayload, DmxPacket.schema);
    }

    setChannel(channel: number, value: number) {
        channel = Math.max(0, Math.min(DmxPacket.DMX_CHANNEL_MAX, channel))
        value = Math.max(0, Math.min(DmxPacket.DMX_VALUE_MAX, value))
        if (this.packetPayload.dmxData) {
            this.packetPayload.dmxData[channel] = value;
        }
        return this;
    }
}