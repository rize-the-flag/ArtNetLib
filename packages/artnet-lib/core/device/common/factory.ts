import { DEVICE_TYPE, SupportedDevices } from './device-contracts';

//DMX Devices repository
export class DeviceFactory {
  private static instance: DeviceFactory;

  public createDevice<TDevice extends keyof SupportedDevices>(
    device: TDevice,
    dmxDataSize?: number
  ): InstanceType<SupportedDevices[TDevice]> {
    return new DEVICE_TYPE[device](dmxDataSize) as InstanceType<SupportedDevices[TDevice]>;
  }

  public getRegisteredDevices(): string[] {
    return Array.from(Object.keys(DEVICE_TYPE));
  }

  public static getInstance() {
    if (!DeviceFactory.instance) {
      DeviceFactory.instance = new DeviceFactory();
    }
    return DeviceFactory.instance;
  }
}
