import { valueOf } from '../types';
import { OP_CODE } from '../constants';
import { ARTPOLL_REPLY_SEND_POLICY } from '../poll/constants';

export type HeaderPayload = {
  ID: string;
  opCode: number;
};

export type OpCode = valueOf<typeof OP_CODE>;
export type SendArtPollReplyPolicy = valueOf<typeof ARTPOLL_REPLY_SEND_POLICY>;
