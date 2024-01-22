import {DmxPacket} from '../packets/dmx-packet';
import {ThrowsException} from '../types';
import {SupportedDevices} from "./common/device-contracts";

export interface ArtNetDeviceAction {
    actionName: string;
    parameters: {
        [param: string]: string | number | number[];
    };
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

export type DeviceConstructorArgs = {
    deviceDriver: keyof SupportedDevices,
    numChannels?: number
}
