export const ARTNET_PORT = 6454;

export const DEFAULT_POLL_INTERVAL = 3000;
export const NODE_DEATH_TIMEOUT_MS = 10000;
export const DEFAULT_NODE_WATCHER_INTERVAL_MS = 2000;
export const DEFAULT_NETWORK = '0.0.0.0';
export const DEFAULT_NETMASK = '0.0.0.0';

export const MAX_UNIVERSE_SIZE = 512;

export const DISCOVERY_EVENT = {
  NODE_STATUS_UPDATED: 'NODE_STATUS_UPDATED',
  NEW_NODE_REGISTERED: 'NEW_NODE_REGISTERED',
  NODE_IS_DEAD: 'NODE_IS_DEAD',
} as const;

export const COMMUNICATOR_EVENTS = {
  UDP_PACKET: 'UDP_PACKET',
} as const;

export const DISCOVERY_STATUS = {
  RUNNING: 'RUNNING',
  SUSPENDED: 'SUSPENDED',
} as const;

export const ARTNET_ERROR_CODE = {
  ACTIONS_VALIDATION_ERROR: 'ACTIONS_VALIDATION_ERROR',
  SOCKET_ERROR: 'SOCKET_ERROR',
  DEVICE_DRIVER_NOT_FOUND: 'DEVICE_DRIVER_NOT_FOUND',
  NODE_NOT_FOUND: 'NODE_NOT_FOUND',
  PORT_NOT_SUBSCRIBED: 'PORT_NOT_SUBSCRIBED',
  NODE_PORTS_LIMIT: 'NODE_PORTS_LIMIT',
  CORRUPTER_PACKET: 'CORRUPTER_PACKET',
  UNIVERSE_MAX_SIZE_REACHED: 'UNIVERSE_MAX_SIZE_REACHED',
  CURRENT_PACKET_DATA_LIMIT: 'CURRENT_PACKET_DATA_LIMIT',
} as const;

export const NODE_STATUS = {
  DEAD: 'DEAD',
  ALIVE: 'ALIVE',
} as const;
