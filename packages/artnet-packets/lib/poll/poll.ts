import { ArtNetPacket } from '../common/art-net-packet';
import { PROTOCOL_VERSION } from '../constants';
import { SendArtPollReplyPolicy } from '../common/packet.interface';
import { OP_CODE } from '../constants';
import { decode, Schema } from '@rtf-dm/protocol';
import { DiagnosisPolicy, DiagPriority, PollPacketPayload } from './poll.interface';
import { DIAG_PRIORITY, NODE_BEHAVIOUR_MASK } from './constants';

export class Poll extends ArtNetPacket<PollPacketPayload> {
  private static readonly schemaDefault = new Schema<PollPacketPayload>([
    ['protoVersion', { size: 2, type: 'number', byteOrder: 'BE' }],
    ['flags', { size: 1, type: 'number' }],
    ['diagPriority', { size: 1, type: 'number' }],
    ['targetPortAddressTop', { size: 2, type: 'number', byteOrder: 'BE' }],
    ['targetPortAddressBottom', { size: 2, type: 'number', byteOrder: 'BE' }],
  ]);

  constructor(payload: Partial<PollPacketPayload> = {}) {
    const pollPacketPayload: PollPacketPayload = {
      protoVersion: PROTOCOL_VERSION,
      diagPriority: DIAG_PRIORITY.DpLow,
      flags: 0b00000110,
      targetPortAddressTop: 0,
      targetPortAddressBottom: 0,
      ...payload,
    };

    super(OP_CODE.POLL, pollPacketPayload, Poll.schemaDefault);
  }

  public setDiagPriority(priority: DiagPriority): this {
    this.payload.diagPriority = DIAG_PRIORITY[priority];
    return this;
  }

  public setTargetPort(port: number): this {
    this.payload.targetPortAddressTop = port & 0xff00;
    this.payload.targetPortAddressBottom = port & 0x00ff;
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

  public static create(data: Buffer): Poll | null {
    if (!Poll.is(data)) return null;

    const schemaWithHeader = new Schema([...Poll.headerSchema, ...Poll.schemaDefault]);

    return new Poll(decode(data, schemaWithHeader));
  }
}
