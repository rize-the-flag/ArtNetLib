import {valueOf} from '../types';
import {
  ARTPOLL_REPLY_SEND_POLICY,
  DIAG_PRIORITY,
  DIAGNOSTICS_MESSAGE_POLICY,
  OP_CODE, PROTOCOL_VERSION,
} from '../constants';
import {PacketPayload, PacketSchemaPublic} from '@rtf-dm/protocol';

export type HeaderPayload = {
  ID: string;
  opCode: number;
}

export type PollReplyPacketPayload = {
  ipAddress: number[];
  port: number;
  firmwareVersion: number;
  netSwitch: number;
  netSubSwitch: number;
  oem: number;
  ubeaVersion: number;
  status1: number;
  estaManufactorerCode: number;
  shortName: string;
  longName: string;
  nodeReport: string;
  numPorts: number;
  portTypes: number[];
  goodInput: number[];
  goodOutputA: number[];
  swIn: number[];
  swOut: number[];
  acnPriority: number;
  swMacro: number;
  swRemote: number;
  spare: number[];
  style: number;
  macAddress: number[];
  bindIp: number[];
  bindIndex: number;
  status2: number;
  goodOutputB: number;
  status3: number;
  defaultRespUID: number[];
  filler: number[];
}

export type DmxPacketPayload = {
  protoVersion: typeof PROTOCOL_VERSION;
  sequence: number;
  physical: number;
  net: number;
  subNet: number;
  length: number;
  dmxData: number[];
}

export type SyncPacketPayload = {
  protoVersion: typeof PROTOCOL_VERSION;
  aux1: number;
  aux2: number;
}

export type PollPacketPayload = {
  protoVersion: typeof PROTOCOL_VERSION;
  flags: number;
  diagPriority: number;
  targetPortAddressTop: number;
  targetPortAddressBottom: number;
}

export type DiagDataPayload = {
  protoVersion: typeof PROTOCOL_VERSION;
  filler1: number;
  diagPriority: number;
  logicalPort: number;
  filler3: number;
  length: number;
  data: string;
}

export type AddressPacketPayload = {
  protoVersion: typeof PROTOCOL_VERSION;
  netSwitch: number;
  bindIndex: number;
  shortName: string;
  longName: string;
  swIn: number[];
  swOut: number[];
  netSubSwitch: number;
  swVideo: number; // deprecated
  command: number;
}

export type PollPacketSchema = PacketSchemaPublic<PollPacketPayload>;
export type DmxPacketSchema = PacketSchemaPublic<DmxPacketPayload>;
export type PollReplyPacketSchema = PacketSchemaPublic<PollReplyPacketPayload>;
export type HeaderSchema = PacketSchemaPublic<HeaderPayload>;
export type SyncPacketSchema = PacketSchemaPublic<SyncPacketPayload>;
export type DiagDataPacketSchema = PacketSchemaPublic<DiagDataPayload>;
export type AddressPacketSchema = PacketSchemaPublic<AddressPacketPayload>;

export type OpCode = valueOf<typeof OP_CODE>;
export type DiagPriority = keyof typeof DIAG_PRIORITY;
export type DiagnosisPolicy = valueOf<typeof DIAGNOSTICS_MESSAGE_POLICY>;
export type SendArtPollReplyPolicy = valueOf<typeof ARTPOLL_REPLY_SEND_POLICY>;
