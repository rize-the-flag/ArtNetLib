import {ProtocolVersion, valueOf} from '../types';
import {
  ARTPOLL_REPLY_SEND_POLICY,
  DIAG_PRIORITY,
  DIAGNOSTICS_MESSAGE_POLICY,
  OP_CODE,
} from './constants';
import {GPacketSchema} from '@rtf-dm/protocol';

export type HeaderPayload = {
  ID: string;
  opCode: number;
};

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
};

export type DmxPacketPayload = {
  protoVersion: ProtocolVersion;
  sequence: number;
  physical: number;
  net: number;
  subNet: number;
  length: number;
  dmxData: number[];
};

export type SyncPacketPayload = {
  protoVersion: ProtocolVersion;
  aux1: number;
  aux2: number;
};

export type PollPacketPayload = {
  protoVersion: ProtocolVersion;
  flags: number;
  diagPriority: number;
  targetPortAddressTop: number;
  targetPortAddressBottom: number;
};

export type DiagDataPayload = {
  protoVersion: number;
  filler1: number;
  diagPriority: number;
  logicalPort: number;
  filler3: number;
  length: number;
  data: string;
};

export type AddressPacketPayload = {
  protoVersion: number;
  netSwitch: number;
  bindIndex: number;
  shortName: string;
  longName: string;
  swIn: number[];
  swOut: number[];
  netSubSwitch: number;
  swVideo: number; // deprecated
  command: number;
};


export type PollPacketSchema = GPacketSchema<PollPacketPayload>;
export type DmxPacketSchema = GPacketSchema<DmxPacketPayload>;
export type PollReplyPacketSchema = GPacketSchema<PollReplyPacketPayload>;
export type HeaderSchema = GPacketSchema<HeaderPayload>;
export type SyncPacketSchema = GPacketSchema<SyncPacketPayload>;
export type DiagDataPacketSchema = GPacketSchema<DiagDataPayload>;
export type AddressPacketSchema = GPacketSchema<AddressPacketPayload>;

export type OpCode = valueOf<typeof OP_CODE>;
export type DiagPriority = keyof typeof DIAG_PRIORITY;
export type DiagnosisPolicy = valueOf<typeof DIAGNOSTICS_MESSAGE_POLICY>;
export type SendArtPollReplyPolicy = valueOf<typeof ARTPOLL_REPLY_SEND_POLICY>;
