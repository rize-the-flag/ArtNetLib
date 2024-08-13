export type valueOf<T> = T[keyof T];

export interface NetworkConfig {
  networkIp: string;
  networkMask: string;
  port: number;
}

export interface DiscoveryConfig {
  sendReply: boolean;
}

export interface LibConfig {
  network?: NetworkConfig;
  discovery?: DiscoveryConfig;
  enableLogs?: boolean;
}

export type ThrowsException<TReturn> = TReturn | never;
