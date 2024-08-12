import {ArtNetPacket} from './common/art-net-packet';
import {PROTOCOL_VERSION} from './constants';
import {
    DiagnosisPolicy,
    DiagPriority,
    PollPacketPayload,
    SendArtPollReplyPolicy,
} from './common/packet.interface';
import {DIAG_PRIORITY, NODE_BEHAVIOUR_MASK, OP_CODE} from './constants';
import {decode, Schema} from "@rtf-dm/protocol";


export class PollPacket extends ArtNetPacket<PollPacketPayload> {

    constructor(payload: Partial<PollPacketPayload> = {}) {

        const pollPacketPayload: PollPacketPayload = {
            protoVersion: PROTOCOL_VERSION,
            diagPriority: DIAG_PRIORITY.DpLow,
            flags: 0b00000000,
            targetPortAddressTop: 0,
            targetPortAddressBottom: 0,
            ...payload
        }

        //order of schema fields make sense do not change it!!!
        const pollPacketSchema = new Schema<PollPacketPayload>([
            ['protoVersion', {length: 2, type: 'number', byteOrder: 'BE'}],
            ['flags', {length: 1, type: 'number'}],
            ['diagPriority', {length: 1, type: 'number'}],
            ['targetPortAddressTop', {length: 2, type: 'number', byteOrder: 'BE'}],
            ['targetPortAddressBottom', {length: 2, type: 'number', byteOrder: 'BE'}],
        ])

        super(
            OP_CODE.POLL,
            pollPacketPayload,
            pollPacketSchema,
        );

        this.sendMeDiagnostics(true)
            .setDiagnosticsPolicy('BROADCAST')
            .setArtPollReplyPolicy('ON_NODE_CONDITION_CHANGE');
    }

    public setDiagPriority(priority: DiagPriority): this {
        this.payload.diagPriority = DIAG_PRIORITY[priority];
        return this;
    }

    public setTargetPort(top = 0, bottom = 0): this {
        this.payload.targetPortAddressTop = top;
        this.payload.targetPortAddressBottom = bottom;
        return this;
    }

    public setTargetedMode(enable: boolean): this {
        this.payload.flags = enable
            ? (this.payload.flags |= NODE_BEHAVIOUR_MASK.TARGETED_MODE)
            : (this.payload.flags &= ~NODE_BEHAVIOUR_MASK.TARGETED_MODE);
        return this;
    }

    public setVlcTransmission(enable: boolean): this {
        enable
            ? (this.payload.flags &= ~NODE_BEHAVIOUR_MASK.VLC_TRANSMISSION) // For the GOD... WHY?
            : (this.payload.flags |= NODE_BEHAVIOUR_MASK.VLC_TRANSMISSION);
        return this;
    }

    public setDiagnosticsPolicy(policy: DiagnosisPolicy): this {
        policy === 'UNICAST'
            ? (this.payload.flags |= NODE_BEHAVIOUR_MASK.DIAGNOSTICS_MESSAGE_POLICY)
            : (this.payload.flags &= ~NODE_BEHAVIOUR_MASK.DIAGNOSTICS_MESSAGE_POLICY);
        return this;
    }

    public sendMeDiagnostics(shouldSend: boolean): this {
        shouldSend
            ? (this.payload.flags |= NODE_BEHAVIOUR_MASK.SEND_DIAGNOSTICS) // For the GOD... WHY?
            : (this.payload.flags &= ~NODE_BEHAVIOUR_MASK.SEND_DIAGNOSTICS);
        return this;
    }

    public setArtPollReplyPolicy(policy: SendArtPollReplyPolicy): this {
        policy === 'ON_NODE_CONDITION_CHANGE'
            ? (this.payload.flags |= NODE_BEHAVIOUR_MASK.SEND_POLICY)
            : (this.payload.flags &= ~NODE_BEHAVIOUR_MASK.SEND_POLICY);
        return this;
    }

    static is(data: Buffer): boolean {
        return super.is(data) && ArtNetPacket.readPacketOpCode(data) === OP_CODE.POLL;
    }

    public static create(data: Buffer, schema: Schema<PollPacketPayload>): PollPacket | null {
        if (!PollPacket.is(data)) return null
        return  new PollPacket(decode(data, schema));
    }

}
