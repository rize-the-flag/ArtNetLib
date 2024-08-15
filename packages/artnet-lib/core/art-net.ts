import { NodeManager } from './node/node-manager';
import { Discovery } from './discovery/discovery';
import { SupportedDevices } from './device/common/device-contracts';
import { LibConfig, NetworkConfig, ThrowsException } from './types';
import { Universe } from './universe/universe';
import { DeviceFactory } from './device/common/factory';
import { NetworkCommunicator } from './communicator/network-communicator';
import { ArtNetDeviceAction, DeviceConstructorArgs } from './device/device.interface';
import { UniverseAction, UniverseActionGroup } from './art-net.interface';
import { Node } from './node/node';

export class ArtNetImpl {
  private readonly deviceRegistry = DeviceFactory.getInstance();
  private readonly universes: Universe[] = [];
  private readonly _nodeManager: NodeManager;
  private readonly _communicator: NetworkCommunicator;
  private readonly _discovery: Discovery;

  constructor(opts?: LibConfig) {
    this._communicator = new NetworkCommunicator(opts?.network);
    this._nodeManager = new NodeManager(this._communicator);
    this._discovery = new Discovery(this._nodeManager, this._communicator, opts?.discovery?.sendReply);
  }

  get nodeManager() {
    return this._nodeManager;
  }

  get discovery() {
    return this._discovery;
  }

  get communicator() {
    return this._communicator;
  }

  private isGroupAction(payload: UniverseAction): payload is UniverseActionGroup {
    return payload.type === 'Group';
  }

  /**
   * @description Initialize a library, creating a socket and running discovery
   * @return {Promise<string>} Discovery status
   */
  public async init(): Promise<string> {
    await this._communicator.init();
    this._discovery.run();
    return this._discovery.getStatus();
  }

  /**
   * @description Check if Universe with given name already exists
   * @param {string} name
   * @return {boolean}
   */
  public isUniverseExist(name: string): boolean {
    return !!~this.universes.findIndex((u) => u.name === name);
  }

  /**
   * @description Get instance of Universe by given name return either instance of Universe
   * or null if nothing was found
   * @param {string} name
   * @return {Universe | null}
   */
  public getUniverseByName(name: string): Universe | null {
    return this.universes.find((u) => u.name === name) ?? null;
  }

  /**
   * @description Changes the network where lib looking for ArtNet nodes
   * @param {NetworkConfig} config
   * @return {void}
   */
  public async changeNetwork(config: NetworkConfig): Promise<void> {
    await this._communicator.changeNetwork(config);
    this.discovery.updateReplyInfo();
  }

  /**
   * @description Create instance of specific device.
   * @param {TDevice} deviceType
   * @param {number} dmxDataSize
   * @return {InstanceType<SupportedDevices[TDevice]>}
   */
  public createDevice<TDevice extends keyof SupportedDevices>(
    deviceType: TDevice,
    dmxDataSize?: number
  ): InstanceType<SupportedDevices[TDevice]> {
    return this.deviceRegistry.createDevice(deviceType, dmxDataSize);
  }

  /**
   * Return current network where library looking for ArtNet nodes
   * @return {NetworkConfig}
   */
  public getBoundNetworkInfo(): NetworkConfig {
    return this._communicator.boundNetworkInfo;
  }

  /**
   * Remove node by mac address.
   * If removed node is detected, it will appear in NodeManager again.
   * @param {string} macAddress
   * @return {Node | null}
   */
  public removeNode(macAddress: string): Node | null {
    return this._nodeManager.removeNodes((node) => node.macAddress === macAddress).pop() ?? null;
  }

  /**
   * @description Broadcast Universe Devices state to entire network
   * All node that has the same port address as Universe port address get DmxData package
   * @param {Universe} universe
   * @return {Promise<number>}
   */
  public sendBroadcast(universe: Universe): Promise<number> {
    return this._communicator.sendBroadcast(universe.buildDmxData());
  }

  /**
   * @description Create several Devices, usefull when you want to create dmx chain device1 -> device2 -> ... deviceN
   * @param {DeviceConstructorArgs[]} devices
   * @return {(Generic | MixPanel150)[]}
   */
  public createDevices(devices: DeviceConstructorArgs[]) {
    return devices.map(({ deviceDriver, numChannels }) => this.deviceRegistry.createDevice(deviceDriver, numChannels));
  }

  /**
   * Create Universe with a given name, and optionally create and assign Devices
   * @param {string} name
   * @param {DeviceConstructorArgs[]} devices
   * @return {Universe | null}
   */
  public createUniverse(name: string, devices?: DeviceConstructorArgs[]): Universe | null {
    if (this.isUniverseExist(name)) return null;

    const universe = new Universe(name);

    if (devices) {
      this.createDevices(devices).forEach((device) => universe.add(device));
    }

    this.universes.push(universe);
    return universe;
  }

  /**
   * Add a device to an existing Universe
   * Return device index in a Universe or null if a Universe doesn't exist
   * Method throw's exception when max Universe size reached
   * @param {string} universeName
   * @param {DeviceConstructorArgs} device
   * @return {number | null}
   */
  public addDevice(universeName: string, device: DeviceConstructorArgs): ThrowsException<number | null> {
    if (this.isUniverseExist(universeName)) return null;

    const deviceInstance = this.createDevices([device]).pop();
    const universe = this.getUniverseByName(universeName);
    if (deviceInstance && universe) {
      return universe.add(deviceInstance);
    }
    return null;
  }

  /**
   * @description Replace an existing device in a Universe by index with a new device passed
   * @param {string} universeName
   * @param {number} deviceIndex
   * @param {DeviceConstructorArgs} device
   * @return {{deviceInstance: Generic | MixPanel150, Universe: Universe} | null}
   */
  public setDevice(
    universeName: string,
    deviceIndex: number,
    device: DeviceConstructorArgs
  ): ThrowsException<undefined | null> {
    const universe = this.getUniverseByName(universeName);
    const deviceInstance = this.createDevices([device]).pop();
    if (!universe || !deviceInstance) return null;
    universe.setDevice(deviceInstance, deviceIndex);
  }

  /**
   * @description Remove a Universe by given name and return and it. Return null if a Universe doesn't exist
   * @param {string} name
   * @return {Universe | null}
   */
  public removeUniverse(name: string): Universe | null {
    if (this.isUniverseExist(name)) return null;

    const universeIdx = this.universes.findIndex((uni) => uni.name === name);
    const universe = this.universes[universeIdx];
    this.universes.splice(universeIdx, 1);
    return universe;
  }

  /**
   * @description Attach an existing Universe to node ports. Return null if a Universe or node doesn't exist.
   * @param {string} nodeMac
   * @param {number} nodePort
   * @param {string} universeName
   * @return {{node: Node, Universe: Universe} | null}
   */
  public attachUniverse(
    nodeMac: string,
    nodePort: number,
    universeName: string
  ): {
    universe: Universe;
    node: Node;
  } | null {
    const universe = this.getUniverseByName(universeName);
    const node = this.nodeManager.getByMac(nodeMac);
    if (!universe || !node) return null;
    node.attachUniverse(nodePort, universe);

    return {
      universe,
      node,
    };
  }

  /**
   * TODO: Description
   * @param nodeMac
   * @param nodePort
   */
  public detachUniverse(nodeMac: string, nodePort: number): Universe | null {
    const node = this.nodeManager.getByMac(nodeMac);
    if (!node) return null;
    return node.detachUniverse(nodePort);
  }

  /**
   * @description Set action for a specific device group in an existing Universe
   * @param {string} universeName
   * @param {keyof SupportedDevices} deviceGroup
   * @param {ArtNetDeviceAction} action
   * @return {Universe | null}
   */
  public setDeviceGroupAction(
    universeName: string,
    deviceGroup: keyof SupportedDevices,
    action: ArtNetDeviceAction
  ): ThrowsException<Universe | null> {
    const universe = this.getUniverseByName(universeName);
    if (!universe) return null;

    universe.getDevice(deviceGroup).forEach((device) => {
      device.setAction(action);
    });

    return universe;
  }

  /**
   * @description Set action for a specific device in a Universe by index
   * @param {string} universeName
   * @param {number} deviceIndex
   * @param {ArtNetDeviceAction} action
   * @return {Universe | null}
   */
  public setDeviceAction(
    universeName: string,
    deviceIndex: number,
    action: ArtNetDeviceAction
  ): ThrowsException<Universe | null> {
    const universe = this.getUniverseByName(universeName);
    if (!universe) return null;
    universe.getDevice(deviceIndex)?.setAction(action);
    return universe;
  }

  /**
   * @description Set action for a device group or exact device in a Universe
   * @param {UniverseAction} payload
   * @return {Universe | null}
   */
  public setUniverseAction(payload: UniverseAction): Universe | null {
    if (this.isGroupAction(payload)) {
      return this.setDeviceGroupAction(payload.universeName, payload.deviceGroup, payload.action);
    }

    return this.setDeviceAction(payload.universeName, payload.deviceIndex, payload.action);
  }

  /**
   * Set action for a device group or exact device in a Universe, and broadcast a Universe to entire network.
   * Do not broadcast a Universe that was attached to some node port, since it doesn't make sense
   * @param {UniverseAction} payload
   * @return {Promise<number | null>}
   */
  async broadcastUniverse(payload: UniverseAction): Promise<number | null> {
    const universe = this.setUniverseAction(payload);
    return universe ? await this.sendBroadcast(universe) : null;
  }

  /**
   * @description Multicast Universe to all subscribed node.
   * @param {UniverseAction} payload
   * @return {Promise<number[][]>}
   */
  async multicastUniverse(payload: UniverseAction): Promise<number[][] | null> {
    if (!this.setUniverseAction(payload)) return null;
    return await this.nodeManager.syncAllNodes();
  }

  /**
   * Unicast Universe to a single node
   * @param {string} nodeMac - Mac Address of target node
   * @param {UniverseAction} universeAction - Instance of a universe
   * @return {Promise<number | null>} - Promise<Sent Bytes>
   */
  async unicastUniverse(nodeMac: string, universeAction: UniverseAction): Promise<number | null> {
    const node = this.nodeManager.getByMac(nodeMac);
    const universe = this.setUniverseAction(universeAction);
    if (!node || !universe) return null;
    return await node.syncRemotePort(universe);
  }

  /**
   * @description Return and array of supported Devices
   * @return {string[]}
   */
  public getSupportedDevices(): string[] {
    return this.deviceRegistry.getRegisteredDevices();
  }

  public enumerateInterfacesInfo(): {
    address: string;
    netmask: string;
    mac: string;
  }[] {
    return NetworkCommunicator.enumerateNetworkConnections()
      .filter(({ family }) => family === 'IPv4')
      .map(({ address, netmask, mac }) => ({
        address,
        netmask,
        mac,
      }));
  }

  dispose(): Promise<void> {
    this._discovery.stop();
    return this._communicator.dispose();
  }
}
