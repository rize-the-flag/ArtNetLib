import { DEFAULT_POLL_INTERVAL } from '../constants';
import { RemoteInfo } from 'dgram';
import { InjectLogger } from '../logger';
import { clearInterval } from 'timers';
import { DiscoveryStatus } from './discovery.interface';
import { Communicator } from '../communicator/communicator.interface';
import { NodeManager } from '../node/node-manager';
import { LoggerInterface } from '../logger/logger.interface';
import { PollPacket, PollReplyPacket, PollReplyPacketPayload } from '@rtf-dm/artnet-packets';

export class Discovery {
  @InjectLogger private logger: LoggerInterface;

  accessor sendArtPollReply: boolean;

  private isActive = false;
  private pollTimer: NodeJS.Timer;
  private pollingInterval: number = DEFAULT_POLL_INTERVAL;

  private pollReplyPacket: PollReplyPacket;
  private readonly communicator: Communicator;
  private readonly nodeManager: NodeManager;

  constructor(nodeManager: NodeManager, communicator: Communicator, sendArtPollReply = false) {
    this.communicator = communicator;
    this.nodeManager = nodeManager;
    this.sendArtPollReply = sendArtPollReply;
    this.communicator.addListener('UDP_PACKET', this.handleArtNetDeviceReply);
    this.communicator.addListener('UDP_PACKET', this.handleArtPoll); // for testing purposes
    this.setReplyInfo();
  }

  public setReplyInfo(payload?: Partial<Omit<PollReplyPacketPayload, 'macAddress'>>) {
    const communicatorBoundIp = this.communicator.boundNetworkInfo.networkIp.split('.').map((n) => parseInt(n));

    this.pollReplyPacket = new PollReplyPacket({
      ...payload,
      macAddress: this.communicator.selfMacAddress.split(':').map((v) => parseInt(v, 16)),
      port: payload?.port ?? this.communicator.boundNetworkInfo.port,
      ipAddress: payload?.ipAddress ?? communicatorBoundIp,
    });
  }

  public updateReplyInfo(): void {
    this.setReplyInfo();
  }

  private discoveryLoop = () => {
    if (this.isActive) {
      const packet = new PollPacket().encode();
      void this.communicator.sendBroadcast(packet);
      this.pollTimer = setTimeout(this.discoveryLoop, this.pollingInterval);
    }
  };

  public run(): void {
    this.stop();
    this.isActive = true;
    this.nodeManager.watch();
    this.discoveryLoop();
  }

  public stop(): void {
    this.isActive = false;
    this.nodeManager.dispose();
    clearInterval(this.pollTimer);
  }

  public updatePollingInterval(pollingInterval: number = DEFAULT_POLL_INTERVAL): number {
    this.pollingInterval = pollingInterval;
    return this.pollingInterval;
  }

  public getStatus(): DiscoveryStatus {
    return this.isActive ? 'RUNNING' : 'SUSPENDED';
  }

  private handleArtPoll = (data: Buffer, { address, port }: RemoteInfo): void => {
    if (!PollPacket.is(data) || !this.sendArtPollReply) return;

    this.logger.warn('ArtPoll handling for debug purposes only, disable after debug completed');
    this.logger.info(`Received ArtPoll packet from ${address}`);
    this.logger.info(`Response with ArtPollReply packet to ${address}:${String(port)}`);

    void this.communicator.send(this.pollReplyPacket.encode(), address);
  };

  private handleArtNetDeviceReply = (data: Buffer, remoteInfo: RemoteInfo): void => {
    if (!PollReplyPacket.is(data)) return;

    this.logger.info(`Received ArtPollReply packet from ${remoteInfo.address}`);

    this.nodeManager.addOrUpdateNode(this.pollReplyPacket.decode(data));
  };
}
