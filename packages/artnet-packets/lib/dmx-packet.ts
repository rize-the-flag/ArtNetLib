import { ArtNetPacket } from './common/art-net-packet';
import { PROTOCOL_VERSION } from './constants';
import { DmxPacketSchema, DmxPacketPayload } from './common/packet.interface';
import { OP_CODE } from './constants';
import {ThrowsException} from './types';


export class DmxPacket extends ArtNetPacket<DmxPacketPayload> {
	static readonly DMX_CHANNEL_MAX = 512;
	static readonly DMX_VALUE_MAX = 255;

	constructor(payload: Partial<DmxPacketPayload> = {}) {
		const length = payload.length ?? DmxPacket.DMX_CHANNEL_MAX;
		const dmxPacket: DmxPacketPayload = {
			protoVersion: PROTOCOL_VERSION,
			net: 0,
			length,
			subNet: 0,
			sequence: 0,
			physical: 0,
			dmxData: new Array<number>(length).fill(0, 0, length),
			...payload
		}

		const schema: DmxPacketSchema =[
			//The order of schema fields make sense do not change it!!!
			['protoVersion', { length: 2, type: 'number', byteOrder: 'BE' }],
			['sequence', { length: 1, type: 'number' }],
			['physical', { length: 1, type: 'number' }],
			['subNet', { length: 1, type: 'number' }],
			['net', { length: 1, type: 'number' }],
			['length', { length: 2, type: 'number', byteOrder: 'BE' }],
			['dmxData', { length, type: 'array' }],
		];

		super(
			OP_CODE.DMX,
			dmxPacket,
			schema
		)
	}

	static is(data: Buffer): boolean {
		return super.is(data) && ArtNetPacket.readPacketOpCode(data) === OP_CODE.DMX;
	}

	public setNet(net = 0): this {
		this.payload.net = net;
		return this;
	}

	public getNet(): number {
		return this.payload.net;
	}

	public setSubnet(subNet = 0): this {
		this.payload.subNet = subNet;
		return this;
	}

	public getSubnet(): number {
		return this.payload.subNet;
	}

	public setPhysicalPort(port = 0): this {
		this.payload.physical = port;
		return this;
	}

	public setChannel(channel: number, value: number): this {
		channel = Math.max(0, Math.min(DmxPacket.DMX_CHANNEL_MAX, channel));
		value = Math.max(0, Math.min(DmxPacket.DMX_VALUE_MAX, value));
		this.payload.dmxData[channel] = value;
		return this;
	}

	public setChannels(data: number[]): ThrowsException<void> {
		if (data.some((value) => value > DmxPacket.DMX_VALUE_MAX)) {
			throw new Error(`DMX channel out of range max is ${DmxPacket.DMX_VALUE_MAX}` );
		}
		if (data.length > DmxPacket.DMX_CHANNEL_MAX) {
			throw new Error(`DMX Channel MAX is ${DmxPacket.DMX_CHANNEL_MAX}`);
		}

		this.payload.dmxData = [...data];
	}
}
