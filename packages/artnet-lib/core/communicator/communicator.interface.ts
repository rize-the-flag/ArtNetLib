import {Emitter, GEventHandler} from '@rtf-dm/typed-emitter';
import {RemoteInfo} from 'dgram';
import {AddressInfo} from 'net';
import {NetworkConfig} from '../types';


export type CommunicatorEvents = {
  UDP_PACKET: GEventHandler<[Buffer, RemoteInfo]>;
};


export interface Communicator extends Emitter<CommunicatorEvents> {
  get selfMacAddress(): string;

  get boundNetworkInfo(): NetworkConfig;

  get broadcastAddressInfo(): AddressInfo;

  updateSelfMac(ipAddress: string): void;

  sendBroadcast(data: Buffer | Buffer[]): Promise<number>;

  send(data: Buffer | Buffer[], ipAddress: string): Promise<number>;
}
