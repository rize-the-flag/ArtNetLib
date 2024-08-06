import {ArtNetPacket} from './common/art-net-packet';
import {AddressPacketSchema, AddressPacketPayload} from './common/packet.interface';
import {PROTOCOL_VERSION} from './constants';
import {OP_CODE} from './constants';



export class AddressPacket extends ArtNetPacket<AddressPacketPayload> {
    //order of schema fields makes sense do not change it!!!

    constructor(payload: Partial<AddressPacketPayload> = {}) {
        const addressPacketPayload: AddressPacketPayload = {
            protoVersion: PROTOCOL_VERSION,
            shortName: 'ArtNet-Node',
            longName: 'ArtNet-Node',
            swIn: [0, 0, 0, 0],
            swOut: [0, 0, 0, 0],
            netSwitch: 0,
            netSubSwitch: 0,
            bindIndex: 0,
            swVideo: 0,
            command: 0,
            ...payload
        };

        const schema: AddressPacketSchema = [
            ['protoVersion', {length: 2, type: 'number', byteOrder: 'BE'}],
            ['netSwitch', {length: 1, type: 'number'}],
            ['bindIndex', {length: 1, type: 'number'}],
            ['shortName', {length: 18, type: 'string'}],
            ['longName', {length: 64, type: 'string'}],
            ['swIn', {length: 4, type: 'array'}],
            ['swOut', {length: 4, type: 'array'}],
            ['netSubSwitch', {length: 1, type: 'number'}],
            ['swVideo', {length: 1, type: 'number'}],
            ['command', {length: 1, type: 'number'}],
        ];

        super(
            OP_CODE.ADDRESS,
            addressPacketPayload,
            schema,
        );
    }

    public applyPortsConfig(): AddressPacket {
        this.payload.netSwitch |= 0x80;
        this.payload.netSubSwitch |= 0x80;
        this.payload.swOut = this.payload.swOut.map(x => x | 0x80);
        this.payload.swIn = this.payload.swIn.map(x => x | 0x80);
        return this;
    }

    public resetToPhysicalPortsConfig(): AddressPacket {
        this.payload.netSwitch &= 0x7F;
        this.payload.netSubSwitch &= 0x7F;
        this.payload.swOut = this.payload.swOut.map(x => x & 0x7F);
        this.payload.swIn = this.payload.swIn.map(x => x & 0x7F);
        return this;
    }

    public static is(data: Buffer): boolean {
        return super.is(data) && ArtNetPacket.readPacketOpCode(data) === OP_CODE.ADDRESS;
    }
}
