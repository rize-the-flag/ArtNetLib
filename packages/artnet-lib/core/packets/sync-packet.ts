import { ArtNetPacket } from './common/art-net-packet';
import { PROTOCOL_VERSION } from '../constants';
import { SyncPacketPayload, SyncPacketSchema } from './packet.interface';
import { OP_CODE } from './constants';

export class SyncPacket extends ArtNetPacket<SyncPacketPayload, SyncPacketSchema> {
	//order of schema fields make sense do not change it!!!
	static readonly schema: SyncPacketSchema = {
		protoVersion: { length: 2, type: 'number', byteOrder: 'BE' },
		aux1: { length: 1, type: 'number' },
		aux2: { length: 1, type: 'number' },
	};

	constructor(payload: Partial<SyncPacketPayload> = {}) {
		super(
			OP_CODE.SYNC,
			Object.assign(
				{
					protoVersion: PROTOCOL_VERSION,
					aux1: 0,
					aux2: 0,
				},
				{ ...payload },
			),
			SyncPacket.schema,
		);
	}

	static is(data: Buffer): boolean {
		return super.is(data) && ArtNetPacket.readPacketOpCode(data) === OP_CODE.SYNC;
	}
}
