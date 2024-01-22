import { ArtNetPacket } from './common/art-net-packet';
import { PROTOCOL_VERSION } from '../constants';
import { DmxPacketSchema, DmxPacketPayload } from './packet.interface';
import { OP_CODE } from './constants';
import {ThrowsException} from '../types';
import {Log} from '../logger';

export class DmxPacket extends ArtNetPacket<DmxPacketPayload, DmxPacketSchema> {
	static readonly DMX_CHANNEL_MAX = 512;
	static readonly DMX_VALUE_MAX = 255;

	static readonly schema: DmxPacketSchema = {
		//order of schema fields makes sense do not change it!!!
		protoVersion: { length: 2, type: 'number', byteOrder: 'BE' },
		sequence: { length: 1, type: 'number' },
		physical: { length: 1, type: 'number' },
		subNet: { length: 1, type: 'number' },
		net: { length: 1, type: 'number' },
		length: { length: 2, type: 'number', byteOrder: 'BE' },
		dmxData: { length: 512, type: 'array' },
	};


	constructor(payload: Partial<DmxPacketPayload> = {}) {
		const length = payload.length ?? DmxPacket.DMX_CHANNEL_MAX;
		super(
			OP_CODE.DMX,
			Object.assign<DmxPacketPayload, Partial<DmxPacketPayload>>(
				{
					protoVersion: PROTOCOL_VERSION,
					net: 0,
					length,
					subNet: 0,
					sequence: 0,
					physical: 0,
					dmxData: new Array<number>(length).fill(0, 0, length),
				},
				{ ...payload },
			),
			Object.assign<DmxPacketSchema, Partial<DmxPacketSchema>>(
				{ ...DmxPacket.schema },
				{ dmxData: { length, type: 'array' } },
			),
		);
	}

	@Log
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

	@Log
	public setSubnet(subNet = 0): this {
		this.payload.subNet = subNet;
		return this;
	}

	@Log
	public getSubnet(): number {
		return this.payload.subNet;
	}

	@Log
	public setPhysicalPort(port = 0): this {
		this.payload.physical = port;
		return this;
	}

	@Log
	public setChannel(channel: number, value: number): this {
		channel = Math.max(0, Math.min(DmxPacket.DMX_CHANNEL_MAX, channel));
		value = Math.max(0, Math.min(DmxPacket.DMX_VALUE_MAX, value));
		this.payload.dmxData[channel] = value;
		return this;
	}

	@Log
	public setChannels(data: number[]): ThrowsException<void> {
		if (data.some((value) => value > DmxPacket.DMX_VALUE_MAX)) {
			// FIXME: Throw ArtNet error
			throw new Error('Fix me with valid message');
		}
		if (data.length > DmxPacket.DMX_CHANNEL_MAX) {
			// FIXME: Throw ArtNet error
			throw new Error('Fix me with valid message');
		}

		this.payload.dmxData = [...data];
	}
}
