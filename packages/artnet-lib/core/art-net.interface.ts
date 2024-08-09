import {SupportedDevices} from './device/common/device-contracts';
import {ArtNetDeviceAction, DeviceConstructorArgs} from './device/device.interface';
import {NodeManager} from './node/node-manager';
import {Discovery} from './discovery/discovery';
import {Universe} from './universe/universe';
import {NetworkConfig, valueOf} from './types';
import {Node} from './node/node';

export interface UniverseActionGroup {
  type: 'Group';
  universeName: string;
  deviceGroup: keyof SupportedDevices;
  action: ArtNetDeviceAction;
}

export interface UniverseActionExact {
  type: 'Exact';
  universeName: string;
  deviceIndex: number;
  action: ArtNetDeviceAction;
}

export type UniverseAction = UniverseActionExact | UniverseActionGroup;

export interface ArtNet {
  readonly nodeManager: NodeManager;
  readonly discovery: Discovery;

  isUniverseExist(name: string): boolean;

  getUniverseByName(name: string): Universe | undefined;

  init(): Promise<string>;

  changeNetwork(config: NetworkConfig): string;

  createDevice<TDevice extends keyof SupportedDevices>(deviceType: TDevice, dmxDataSize?: number): InstanceType<SupportedDevices[TDevice]>;

  getBoundNetworkInfo(): NetworkConfig;

  removeNode(macAddress: string): Node | undefined;

  sendBroadcast(universe: Universe): Promise<number>;

  createUniverse(name: string, devices?: DeviceConstructorArgs[]): Universe | null;

  getSupportedDevices(): string[];

  addDevice(universeName: string, device: DeviceConstructorArgs): {
    universe: Universe, deviceInstance: InstanceType<valueOf<SupportedDevices>>
  } | null;

  setDevice(universeName: string, deviceIndex: number, device: DeviceConstructorArgs):  {
    universe: Universe, deviceInstance: InstanceType<valueOf<SupportedDevices>>
  } | null;

  removeUniverse(name: string): Universe | null;

  attachUniverse(nodeMac: string, nodePort: number, universeName: string): {
    universe: Universe,
    node: Node
  } | null;

  setGroupAction(payload: UniverseAction): Universe | null;

  broadcastUniverse(universeAction: UniverseAction): Promise<number>;

  multicastUniverse(universeAction: UniverseAction): Promise<number[][]>;

  unicastUniverse(nodeMac: string, universeAction: UniverseAction): Promise<number | null>;

  dispose(): Promise<void>;
}
