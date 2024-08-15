import { PROTOCOL_VERSION } from '../constants';

export type CommandPayload = {
  protocolVersion: typeof PROTOCOL_VERSION;
  estaManufactorer: number;
  length: number;
  data: string;
};
