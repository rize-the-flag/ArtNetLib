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
} as const;

export const DIAG_PRIORITY = {
  DpLow: 0x10, // Low priority message
  DpMed: 0x40, // Medium priority message
  DpHigh: 0x80, // High priority message
  DpCritical: 0xe0, // Critical priority message.
  DpVolatile: 0xf0 /* Volatile message. Messages of this type are displayed
						 on a single line in the DMX-Workshop diagnostics
						 display. All other types are displayed in a list box.
					  */,
} as const;

export const NODE_BEHAVIOUR_MASK = {
  TARGETED_MODE: 0b00100000 /* 0 = Disable Targeted Mode.
								  1 = Enable Targeted Mode */,
  VLC_TRANSMISSION: 0b00010000 /* 0 = Enable VLC transmission.
									 1 = Disable VLC transmission.*/,
  DIAGNOSTICS_MESSAGE_POLICY: 0b00001000 /* (if bit 2) 0 = Diagnostics messages are broadcast.
											   (if bit 2) 1 = Diagnostics messages are unicast.*/,
  SEND_DIAGNOSTICS: 0b00000100 /* 0 = Do not send me diagnostics messages.
									 1 = Send me diagnostics messages */,
  SEND_POLICY: 0b00000010 /* 0 = Only send ArtPollReply in response to an ArtPoll or ArtAddress.
								1 = Send ArtPollReply whenever Node conditions change.
								    This selection allows the Controller to be informed of changes
									without the need to continuously poll.*/,
} as const;

export const DIAGNOSTICS_MESSAGE_POLICY = {
  BROADCAST: 'BROADCAST',
  UNICAST: 'UNICAST',
} as const;

export const ARTPOLL_REPLY_SEND_POLICY = {
  ON_NODE_CONDITION_CHANGE: 'ON_NODE_CONDITION_CHANGE',
  ON_POLL_ADDRESS_ONLY: 'ON_POLL_ADDRESS_ONLY',
} as const;
