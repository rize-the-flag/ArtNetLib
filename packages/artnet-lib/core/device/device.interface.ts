import { ThrowsException } from '../types';
import { SupportedDevices } from './common/device-contracts';
import { DmxPacket } from '@rtf-dm/artnet-packets';

export interface ArtNetDeviceAction {
  actionName: string;
  parameters: Record<string, string | number | number[]>;
}

export interface ArtNetDevice {
  getName(): string;

  getDmxData(): number[];

  getDmxDataSize(): number;

  setAction(action: ArtNetDeviceAction): ThrowsException<void>;

  setActions(actions: ArtNetDeviceAction[]): ThrowsException<void>;

  getSupportedApi(): string;
}

export type DeviceControlPacket = DmxPacket; // or Nzsc packet ?

export interface DeviceApiValidationError {
  message?: string;
  api?: string;
  instance: string;
}

export interface DeviceConstructorArgs {
  deviceDriver: keyof SupportedDevices;
  numChannels?: number;
}
