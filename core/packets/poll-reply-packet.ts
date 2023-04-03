import {ArtNetPacket} from "./common/art-net-packet";
import {OP_CODE} from "../../constants";
import {PollReplyPacketSchema, IPollReplyPacketPayload} from "../types";
import {PacketDecoder} from './common/packet-decoder'

export class PollReplyPacket extends ArtNetPacket<IPollReplyPacketPayload, PollReplyPacketSchema> {

    static readonly schema: PollReplyPacketSchema = {
        ipAddress: {length: 4, type: 'array'},
        port: {length: 2, type: 'number', byteOrder: 'LE'},
        firmwareVersion: {length: 2, type: 'number', byteOrder: 'BE'},
        netSwitch: {length: 2, type: 'number', byteOrder: 'BE'},
        oem: {length: 2, type: 'number', byteOrder: 'BE'},
        ubeaVersion: {length: 1, type: 'number'},
        status1: {length: 1, type: 'number'},
        estaManufactorerCode: {length: 2, type: 'number', byteOrder: 'BE'},
        shortName: {length: 18, type: 'string'},
        longName: {length: 64, type: 'string'},
        nodeReport: {length: 64, type: 'string'},
        numPorts: {length: 2, type: 'number', byteOrder: 'BE'},
        portTypes: {length: 4, type: 'array'},
        goodInput: {length: 4, type: 'array'},
        goodOutputA: {length: 4, type: 'array'},
        swIn: {length: 4, type: 'array'},
        swOut: {length: 4, type: 'array'},
        acnPriority: {length: 1, type: 'number'},
        swMacro: {length: 1, type: 'number'},
        swRemote: {length: 1, type: 'number'},
        spare: {length: 3, type: 'array'},
        style: {length: 1, type: 'number'},
        macAddress: {length: 6, type: 'array'},
        bindIp: {length: 4, type: 'array'},
        bindIndex: {length: 1, type: 'number'},
        status2: {length: 1, type: 'number'},
        goodOutputB: {length: 1, type: 'number'},
        status3: {length: 1, type: 'number'},
        defaultRespUID: {length: 6, type: 'array'},
        filler: {length: 15, type: 'array'},
    }

    constructor(payload: Partial<IPollReplyPacketPayload> = {}) {
        super(OP_CODE.POLL_REPLY, PollReplyPacket.schema, payload);

        this.packetPayload.ipAddress = payload.ipAddress || [192, 168, 0, 88];
        this.packetPayload.port = payload.port || 6454;
        this.packetPayload.firmwareVersion = 0xDEED;
        this.packetPayload.netSwitch = payload.netSwitch || 0;
        this.packetPayload.oem = payload.oem || 0xBEEF;
        this.packetPayload.ubeaVersion = payload.ubeaVersion || 0x11;
        this.packetPayload.status1 = 0b010100111;
        this.packetPayload.estaManufactorerCode = 0xFEFE;
        this.packetPayload.shortName = payload.shortName || 'DENIS\x00';
        this.packetPayload.longName = payload.longName || 'PIZDUY SPAT\x00';
        this.packetPayload.nodeReport = payload.nodeReport || 'YA RABOTAU\x00';
        this.packetPayload.numPorts = payload.numPorts || 4;
        this.packetPayload.portTypes = payload.portTypes || [0b11000000, 0b11000000, 0b11000000, 0b11000000];
        this.packetPayload.goodInput = payload.goodInput || [1, 2, 3, 4];
        this.packetPayload.goodOutputA = payload.goodOutputA || [1, 2, 3, 4];
        this.packetPayload.swIn = [0, 0, 0, 0];
        this.packetPayload.swOut = [0, 0, 0, 0];
        this.packetPayload.acnPriority = 5;
        this.packetPayload.swMacro = 3;
        this.packetPayload.swRemote = 2;
        this.packetPayload.spare = [12, 13, 14];
        this.packetPayload.style = payload.style || 8;
        this.packetPayload.macAddress = payload.macAddress || [0xFF, 0xEF, 0x1D, 0x32, 0xFA, 0xAA];
        this.packetPayload.bindIp = payload.bindIp || [233, 233, 233, 233];
        this.packetPayload.bindIndex = payload.bindIndex || 1;
        this.packetPayload.status2 = payload.status2 || 0b11111111;
        this.packetPayload.goodOutputB = payload.goodOutputB || 0b00000000;
        this.packetPayload.status3 = payload.status3 || 0b00000000;
        this.packetPayload.defaultRespUID = payload.defaultRespUID || [1, 2, 3, 4, 5, 6];
        this.packetPayload.filler = new Array(15);

    }

    protected build(): Buffer {
        return PacketDecoder.encode<IPollReplyPacketPayload, PollReplyPacketSchema>(
            this.packetPayload,
            PollReplyPacket.schema
        )
    }
}