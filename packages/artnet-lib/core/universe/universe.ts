import { DeviceControlPacket } from '../device/device.interface';
import { MAX_UNIVERSE_SIZE } from '../constants';
import { ArtNetLibError } from '../lib-error';
import { ThrowsException, valueOf } from '../types';
import { Log } from '../logger';
import { SupportedDevices } from '../device/common/device-contracts';
import { Dmx } from '@rtf-dm/artnet-packets';

export class Universe {
  private readonly devices: InstanceType<valueOf<SupportedDevices>>[] = [];
  private readonly controlPacket: DeviceControlPacket;
  accessor name: string;

  constructor(name: string, controlPacket?: DeviceControlPacket, maxDMXLength = 512) {
    this.controlPacket =
      controlPacket ??
      new Dmx({
        length: maxDMXLength,
      });
    this.name = name;
  }

  private calcSize(device: InstanceType<valueOf<SupportedDevices>>, index?: number): number {
    const existedDeviceSize = (index && this.devices[index].getDmxDataSize()) ?? 0;
    return this.getSize() - existedDeviceSize + device.getDmxDataSize();
  }

  public add(device: InstanceType<valueOf<SupportedDevices>>): ThrowsException<number> {
    //could allocate more than 512 channels
    const dmxDataSize = this.calcSize(device);

    if (dmxDataSize >= MAX_UNIVERSE_SIZE) {
      throw new ArtNetLibError('UNIVERSE_MAX_SIZE_REACHED');
    }

    this.devices.push(device);
    return this.devices.length - 1;
  }

  public setDevice(device: InstanceType<valueOf<SupportedDevices>>, index: number): ThrowsException<void> {
    if (this.calcSize(device, index) >= MAX_UNIVERSE_SIZE) {
      throw new ArtNetLibError('UNIVERSE_MAX_SIZE_REACHED');
    }
    this.devices[index] = device;
  }

  public update(net: number, subnet: number, universe: number): void {
    this.controlPacket.setNet(net);
    this.controlPacket.setSubnet((subnet << 4) + universe);
  }

  public getPortAddressInfo(): {
    net: number;
    subNet: number;
    universe: number;
  } {
    return {
      net: this.controlPacket.getNet(),
      subNet: this.controlPacket.getSubnet() >> 4,
      universe: this.controlPacket.getSubnet() & 0xf,
    };
  }

  //Overall Universe size
  @Log
  public getSize(): number {
    return Array.from(this.devices.entries()).reduce((acc, [_, device]) => acc + device.getDmxDataSize(), 0);
  }

  @Log
  public buildDmxData(): Buffer {
    const data = Array.from(this.devices.entries()).reduce<number[]>(
      (acc, [_, device]) => acc.concat(device.getDmxData()),
      []
    );
    this.controlPacket.setChannels(data);
    this.controlPacket.incSequence();
    return this.controlPacket.encode();
  }

  public getRegisteredDevices() {
    return this.devices.map((device, index) => ({
      index,
      device: {
        name: device.getName(),
      },
    }));
  }

  public getDevice<TDeviceKey extends keyof SupportedDevices>(
    index: number
  ): InstanceType<SupportedDevices[TDeviceKey]> | null;
  public getDevice<TDeviceKey extends keyof SupportedDevices>(
    name: TDeviceKey
  ): InstanceType<SupportedDevices[TDeviceKey]>[];
  public getDevice<TDeviceKey extends keyof SupportedDevices>(
    indexOrName: number | TDeviceKey
  ): InstanceType<valueOf<SupportedDevices>> | InstanceType<valueOf<SupportedDevices>>[] | null {
    if (typeof indexOrName === 'number') return this.devices[indexOrName] || null;
    return this.devices.filter((device) => device.getName() === indexOrName);
  }
}
