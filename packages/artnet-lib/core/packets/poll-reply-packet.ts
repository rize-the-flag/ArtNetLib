import { ArtNetPacket } from './common/art-net-packet';
import { ARTNET_PORT } from '../constants';
import { PollReplyPacketPayload, PollReplyPacketSchema } from './packet.interface';
import { OP_CODE } from './constants';

export class PollReplyPacket extends ArtNetPacket<PollReplyPacketPayload, PollReplyPacketSchema> {
	//order of schema fields make sense do not change it!!!
	static readonly schema: PollReplyPacketSchema = {
		ipAddress: { length: 4, type: 'array' },
		port: { length: 2, type: 'number', byteOrder: 'LE' },
		firmwareVersion: { length: 2, type: 'number', byteOrder: 'BE' },
		netSwitch: { length: 1, type: 'number' },
		netSubSwitch: { length: 1, type: 'number' },
		oem: { length: 2, type: 'number', byteOrder: 'BE' },
		ubeaVersion: { length: 1, type: 'number' },
		status1: { length: 1, type: 'number' },
		estaManufactorerCode: { length: 2, type: 'number', byteOrder: 'BE' },
		shortName: { length: 18, type: 'string' },
		longName: { length: 64, type: 'string' },
		nodeReport: { length: 64, type: 'string' },
		numPorts: { length: 2, type: 'number', byteOrder: 'BE' },
		portTypes: { length: 4, type: 'array' },
		goodInput: { length: 4, type: 'array' },
		goodOutputA: { length: 4, type: 'array' },
		swIn: { length: 4, type: 'array' },
		swOut: { length: 4, type: 'array' },
		acnPriority: { length: 1, type: 'number' },
		swMacro: { length: 1, type: 'number' },
		swRemote: { length: 1, type: 'number' },
		spare: { length: 3, type: 'array' },
		style: { length: 1, type: 'number' },
		macAddress: { length: 6, type: 'array' },
		bindIp: { length: 4, type: 'array' },
		bindIndex: { length: 1, type: 'number' },
		status2: { length: 1, type: 'number' },
		goodOutputB: { length: 1, type: 'number' },
		status3: { length: 1, type: 'number' },
		defaultRespUID: { length: 6, type: 'array' },
		filler: { length: 15, type: 'array' },
	};

	constructor(payload: Partial<PollReplyPacketPayload> = {}) {
		super(
			OP_CODE.POLL_REPLY,
			Object.assign(
				{
					ipAddress: [0, 0, 0, 0],
					port: ARTNET_PORT,
					firmwareVersion: 0xdead,
					netSwitch: 0,
					netSubSwitch: 0,
					oem: 0xbeef,
					ubeaVersion: 0x11,
					status1: 0b010100111,
					estaManufactorerCode: 0xfefe,
					shortName: 'AN-Controller',
					longName: 'ArtNet-Controller',
					nodeReport: 'Normal State',
					numPorts: 4,
					portTypes: [0b11001000, 0b10000100, 0b10000001, 0b11000010],
					goodInput: [1, 2, 3, 4],
					goodOutputA: [1, 2, 3, 4],
					swIn: [0, 0, 0, 0],
					swOut: [0, 0, 0, 0],
					acnPriority: 0,
					swMacro: 0,
					swRemote: 0,
					spare: [0, 0, 0],
					style: 0,
					macAddress: [0xff, 0xef, 0x1d, 0x32, 0xfa, 0xaa],
					bindIp: [0, 0, 0, 0],
					bindIndex: 0,
					status2: 0b11111111,
					goodOutputB: 0,
					status3: 0,
					defaultRespUID: [0, 0, 0, 0, 0, 0],
					filler: new Array(15).fill(0),
				},
				{ ...payload },
			),
			PollReplyPacket.schema,
		);
	}

	static is(data: Buffer): boolean {
		return super.is(data) && ArtNetPacket.readPacketOpCode(data) === OP_CODE.POLL_REPLY;
	}
}
