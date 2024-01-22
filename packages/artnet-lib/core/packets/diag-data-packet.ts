import { ArtNetPacket } from './common/art-net-packet';
import { PROTOCOL_VERSION } from '../constants';
import { DiagDataPacketSchema, DiagDataPayload } from './packet.interface';
import { OP_CODE } from './constants';

export class DiagDataPacket extends ArtNetPacket<DiagDataPayload, DiagDataPacketSchema> {
	//order of schema fields make sense do not change it!!!
	static readonly schema: DiagDataPacketSchema = {
		protoVersion: { length: 2, type: 'number', byteOrder: 'BE' },
		filler1: { length: 1, type: 'number' },
		diagPriority: { length: 1, type: 'number' },
		logicalPort: { length: 1, type: 'number' },
		filler3: { length: 1, type: 'number' },
		length: { length: 2, type: 'number', byteOrder: 'LE' },
		data: { length: 512, type: 'string' },
	};

	constructor(payload: Partial<DiagDataPayload> = {}) {
		super(
			OP_CODE.DIAG_DATA,
			Object.assign(
				{
					protoVersion: PROTOCOL_VERSION,
					diagPriority: 0x10,
					logicalPort: 0,
					data: "Don't push on me",
					length: 16,
					filler1: 0,
					filler3: 0,
				},
				{ ...payload },
			),
			DiagDataPacket.schema,
		);
	}

	static is(data: Buffer): boolean {
		return super.is(data) && ArtNetPacket.readPacketOpCode(data) === OP_CODE.DIAG_DATA;
	}
}
