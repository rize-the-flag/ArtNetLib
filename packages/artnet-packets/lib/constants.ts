export const PROTOCOL_VERSION = 14;
export const ARTNET_PACKET_ID = 'Art-Net';
export const ARTNET_PORT = 6454;

export const OP_CODE = {
  POLL: 0x2000,
  POLL_REPLY: 0x2100,
  DIAG_DATA: 0x2300,
  DMX: 0x5000,
  SYNC: 0x5200,
  ADDRESS: 0x6000,
  IP_PROG: 0xf800,
} as const;
