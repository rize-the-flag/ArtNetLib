import { PROTOCOL_VERSION } from '../constants';
import { valueOf } from '../types';
import { DIAG_PRIORITY, DIAGNOSTICS_MESSAGE_POLICY } from './constants';

export type PollPacketPayload = {
  protoVersion: typeof PROTOCOL_VERSION;
  flags: number;
  diagPriority: number;
  targetPortAddressTop: number;
  targetPortAddressBottom: number;
};

export type DiagPriority = keyof typeof DIAG_PRIORITY;
export type DiagnosisPolicy = valueOf<typeof DIAGNOSTICS_MESSAGE_POLICY>;
