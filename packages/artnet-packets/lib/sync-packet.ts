import {ArtNetPacket} from './common/art-net-packet';
import {OP_CODE, PROTOCOL_VERSION} from './constants';
import {SyncPacketPayload} from './common/packet.interface';
import {Schema} from "@rtf-dm/protocol";

export class SyncPacket extends ArtNetPacket<SyncPacketPayload> {

	constructor(payload: Partial<SyncPacketPayload> = {}) {
		const syncPacketPayload: SyncPacketPayload = {
			protoVersion: PROTOCOL_VERSION,
			aux1: 0,
			aux2: 0,
			...payload
		}

		//order of schema fields make sense do not change it!!!
		const schema = new Schema([
			['protoVersion', {length: 2, type: 'number', byteOrder: 'BE'}],
			['aux1', {length: 1, type: 'number'}],
			['aux2', {length: 1, type: 'number'}],
		]);

		super(
			OP_CODE.SYNC,
			syncPacketPayload,
			schema,
		);
	}

	static is(data: Buffer): boolean {
		return super.is(data) && ArtNetPacket.readPacketOpCode(data) === OP_CODE.SYNC;
	}
}
