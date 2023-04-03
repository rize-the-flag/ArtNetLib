import {PollPacket} from "./packets/poll-packet";
import {NetworkCommunicator} from "./network-communicator";
import {
    NODE_DEATH_TIMEOUT_MS,
    DEFAULT_POLL_INTERVAL,
    OP_CODE,
    DEFAULT_NODE_WATCHER_INTERVAL_MS
} from "../constants";
import {RemoteInfo} from "dgram";
import {ArtNetPacket} from "./packets/common/art-net-packet";
import {PollReplyPacket} from "./packets/poll-reply-packet";
import {NodeList} from "./node/node-list";
import {EventEmitter} from "events";
import {DiscoveryEvent, DiscoveryStatus, IDiscovery, ListenerPayload} from "./types";
import {setTimeout} from "timers/promises";


export class Discovery implements IDiscovery {
    private status: DiscoveryStatus = 'SUSPENDED';
    private readonly pollPacket: PollPacket;
    private readonly pollReplyPacket: PollReplyPacket;
    private readonly networkCommunicator: NetworkCommunicator;
    private emitter: EventEmitter;
    public readonly nodes: NodeList;

    constructor(networkIp?: string, networkMask?: string) {
        this.networkCommunicator = NetworkCommunicator.getInstance(networkIp, networkMask);
        this.emitter = new EventEmitter()
        this.nodes = new NodeList()
        this.pollPacket = new PollPacket()
        this.pollReplyPacket = new PollReplyPacket()
        this.networkCommunicator.on('ART_NET_PACKET', this.handleArtNetDeviceReply)
        this.networkCommunicator.on('ART_NET_PACKET', this.handleArtPoll)
        this.run()
        this.watchNodes()
    }

    private async* runPolling(pollingInterval: number = DEFAULT_POLL_INTERVAL): AsyncGenerator<number> {
        try {
            do {
                yield await setTimeout(
                    pollingInterval,
                    await this.networkCommunicator.sendBroadcast(this.pollPacket.encode())
                );
            } while (this.status === 'RUNNING')
        } catch (error) {
            this.networkCommunicator.removeListener('ART_NET_PACKET', this.handleArtNetDeviceReply)
            console.error(`Discovery was suspended. Reason: ${error}`);
        }
    }

    private watchNodes(
        runInterval: number = DEFAULT_NODE_WATCHER_INTERVAL_MS,
        nodeDeathTimout: number = NODE_DEATH_TIMEOUT_MS
    ) {
        setInterval(() => {
            const now = new Date().getTime();

            const deadNodes = this.nodes.removeNodes(
                node => node.lastPollingTime.getTime() + nodeDeathTimout <= now
            )

            if (deadNodes.length > 0) {
                deadNodes.forEach(({nodeName, ipAddress, macAddress, lastPollingTime}) => {
                    this.emit('NODE_IS_DEAD', {nodeName, ipAddress, macAddress, lastPollingTime})
                    console.warn(`\x1b[33;34m Node  [${nodeName} : ${ipAddress}] is dead \x1b[0m`)
                })
            }
        }, runInterval)
    }

    public async run(pollingInterval: number = DEFAULT_POLL_INTERVAL): Promise<DiscoveryStatus> {
        if (this.status === 'RUNNING') return this.status
        this.status = 'RUNNING';
        for await (const bytes of this.runPolling(pollingInterval)) {
            console.info(`ArtPoll packet was sent. bytes count: ${bytes}`)
        }
        this.status = 'SUSPENDED';
        return this.status
    }

    private handleArtPoll = async (data: Buffer, {address}: RemoteInfo): Promise<void> => {
        console.warn('ArtPoll handling for debug purposes only, disable after debug completed')
        if (ArtNetPacket.getPacketOpCode(data) === OP_CODE.POLL) {
            console.info(`Received ArtPoll packet from ${address}`)
            await this.networkCommunicator.send(this.pollReplyPacket.encode(), address)
        }
    }

    private handleArtNetDeviceReply = (data: Buffer, remoteInfo: RemoteInfo): void => {
        if (ArtNetPacket.getPacketOpCode(data) === OP_CODE.POLL_REPLY) {
            console.info(`Received ArtPollReply packet from ${remoteInfo.address}`)
            const payload = this.pollReplyPacket.decode(data);
            let node = this.nodes.updateNode(payload);
            if (!node) {
                node = this.nodes.addNode(payload);
                const {nodeName, ipAddress, macAddress, lastPollingTime} = node;
                this.emit('NEW_NODE_REGISTERED', {nodeName, ipAddress, macAddress, lastPollingTime})
            } else {
                const {nodeName, ipAddress, macAddress, lastPollingTime} = node;
                this.emit('NODE_STATUS_UPDATE', {nodeName, ipAddress, macAddress, lastPollingTime})
            }
        }
    }

    private emit<TEvent extends DiscoveryEvent>(event: TEvent, payload: ListenerPayload<TEvent>): boolean {
        return this.emitter.emit(event, payload)
    }

    public on<TEvent extends DiscoveryEvent>(event: TEvent, listener: (payload: ListenerPayload<TEvent>) => void): this {
        this.emitter.on(event, listener)
        return this
    }

    public stop(): DiscoveryStatus {
        this.status = 'SUSPENDED';
        return this.status
    }

    public getStatus(): DiscoveryStatus {
        return this.status;
    }
}