import dgram, {RemoteInfo, Socket} from 'dgram';
import os, {NetworkInterfaceInfo} from 'os';
import {ARTNET_ERROR_CODE, ARTNET_PORT, DEFAULT_NETMASK, DEFAULT_NETWORK} from '../constants';
import {ArtNetLibError} from '../lib-error';
import {InjectLogger, Log} from '../logger';
import {AddressInfo} from 'net';
import {NetworkConfig} from '../types';
import {TypedEmitter} from '@rtf-dm/typed-emitter';
import {Communicator, CommunicatorEvents} from './communicator.interface';
import {LoggerInterface} from '../logger/logger.interface';


//TODO: I'am not sure that i need to do this however Network communicator


export class NetworkCommunicator extends TypedEmitter<CommunicatorEvents> implements Communicator {
  @InjectLogger private logger: LoggerInterface;
  private socket: Socket;
  private _selfMacAddress: string;
  private broadcastIpAddress: string;

  constructor(
    private networkConfig: NetworkConfig = {
      networkIp: DEFAULT_NETWORK,
      networkMask: DEFAULT_NETMASK,
      port: ARTNET_PORT,
    },
  ) {
    super();
    const {networkIp, networkMask} = this.networkConfig;
    this.socket = dgram.createSocket({type: 'udp4', reuseAddr: true});
    this.broadcastIpAddress = NetworkCommunicator.getBroadcastAddress(networkIp, networkMask);

    this.updateSelfMac(networkIp);
    this.logger.info(`Broadcast ip is: ${this.broadcastIpAddress} `);
  }

  get selfMacAddress(): string {
    return this._selfMacAddress;
  }

  get boundNetworkInfo(): NetworkConfig {
    return {...this.networkConfig};
  }

  get broadcastAddressInfo(): AddressInfo {
    return {...this.socket.address()};
  }

  public updateSelfMac(ipAddress: string): void {
    let selfMacAddress = NetworkCommunicator
      .enumerateNetworkConnections()
      .find(interfaceInfo => interfaceInfo.address === ipAddress)?.mac;
    selfMacAddress ??= NetworkCommunicator.enumerateNetworkConnections().pop()?.mac;
    this._selfMacAddress = selfMacAddress ?? '00:00:00:00:00:00';
  }

  @Log
  public async init(): Promise<void> {
    this.socket = dgram.createSocket({type: 'udp4', reuseAddr: true});
    this.socket.removeAllListeners();
    this.socket.on('error', this.errorHandler);
    this.socket.on('message', this.udpPacketHandler);

    const listenEvent = new Promise<void>((resolve) =>
      this.socket.on('listening', () => {
        this.logger.info(
          `Starting listen ArtNet packages on ${this.broadcastIpAddress}:${String(this.networkConfig.port)}`,
        );
        resolve();
      }),
    );

    this.socket.bind(
      {
        address: this.networkConfig.networkIp,
        port: this.networkConfig.port,
      },
      () => {
        this.socket.setBroadcast(true);
      },
    );

    this.socket.unref();

    await listenEvent;
  }

  @Log
  public sendBroadcast(data: Buffer | Buffer[]): Promise<number> {
    return this.send(data, this.broadcastIpAddress);
  }

  @Log
  public async send(data: Buffer | Buffer[], ipAddress: string): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.socket.send(data, this.networkConfig.port, ipAddress, (error, bytes) => {
        error ? reject(error) : resolve(bytes);
      });
    });
  }

  @Log
  public async dispose(): Promise<void> {
    return new Promise(resolve => this.socket.close(() => {
      this.logger.warn('Socket was closed');
      resolve();
    }));
  }

  @Log
  public async changeNetwork({networkIp, networkMask, port}: NetworkConfig): Promise<string> {
    this.networkConfig = {networkIp, networkMask, port};
    this.broadcastIpAddress = NetworkCommunicator.getBroadcastAddress(networkIp, networkMask);
    this.updateSelfMac(networkIp);

    await this.dispose();
    await this.init();

    this.logger.warn(`Network changed to ${networkIp}:${String(port)}/${networkMask}/`);

    return this.broadcastIpAddress;
  }

  public static enumerateNetworkConnections(): NetworkInterfaceInfo[] {
    const connectionInfo: NetworkInterfaceInfo[] = [];
    const interfaces = os.networkInterfaces();

    for (const [_, connections] of Object.entries(interfaces)) {
      if (connections && Array.isArray(connections)) {
        connections.forEach((connection) => {
          connectionInfo.push(connection);
        });
      }
    }
    return connectionInfo;
  }

  @Log
  public static getBroadcastAddress(ipAddress: string, netMask: string): string {
    const netmaskArray = netMask.split('.');
    return ipAddress
      .split('.')
      .map((e, i) => (~netmaskArray[i] & 0xff) | parseInt(e))
      .join('.');
  }

  private udpPacketHandler = (data: Buffer, remoteInfo: RemoteInfo): void => {
    this.emit('UDP_PACKET', data, remoteInfo);
  };

  private errorHandler = (error: Error): void => {
    this.socket.close();
    throw new ArtNetLibError(
      ARTNET_ERROR_CODE.SOCKET_ERROR,
      `ArtNetLib Fatal Error ${error.message}`,
    );
  };
}


