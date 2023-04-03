import {RemoteInfo, Socket} from "dgram";
import os, {NetworkInterfaceInfo} from "os";
import {ARTNET_ERROR_CODE, ARTNET_PORT, DEFAULT_NETMASK, DEFAULT_NETWORK} from "../constants";
import dgram from "dgram";
import {ArtNetLibError} from "./lib-error";
import {EventEmitter} from "events";
import {ArtNetPacket} from "./packets/common/art-net-packet";
import {NetworkCommunicatorEvents} from "./types";

export class NetworkCommunicator {
    private static instance: NetworkCommunicator
    private socket: Socket
    private broadcastIpAddress: string
    private emitter: EventEmitter
    accessor socketController: AbortController = new AbortController()

    private constructor(broadcastIpAddress: string) {
        this.broadcastIpAddress = broadcastIpAddress
        this.emitter = new EventEmitter()
        console.warn(`Network changed to \x1b[32m${this.broadcastIpAddress} \x1b[0m`)
        this.init()
    }

    public init() {
        const {signal} = this.socketController;
        this.socket = dgram.createSocket({type: 'udp4', signal})
        this.socket.removeAllListeners()
        this.socket.on('error', this.errorHandler)
        this.socket.on('message', this.artNetMessageHandler)
        this.socket.bind(ARTNET_PORT, () => {
            this.socket.setBroadcast(true)
        })
    }
    private artNetMessageHandler = (data: Buffer, remoteInfo: RemoteInfo) => {
        if (ArtNetPacket.isArtNetPacket(data)) {
            this.emit('ART_NET_PACKET', data, remoteInfo);
        }
    }

    private errorHandler = (error: Error) => {
        this.socket.close()
        throw new ArtNetLibError(ARTNET_ERROR_CODE.SOCKET_ERROR, `ArtNetLib Fatal Error ${error.message}`);
    }

    public on<
        TEvent extends NetworkCommunicatorEvents
    > (event: TEvent, listener: (data: Buffer, remoteInfo: RemoteInfo) => void) {
        this.emitter.on(event, listener)
    }

    private emit<TEvent extends NetworkCommunicatorEvents>(event: TEvent, data: Buffer, remoteInfo: RemoteInfo) {
        this.emitter.emit(event, data, remoteInfo)
    }

    public removeListener<
        TEvent extends NetworkCommunicatorEvents
    >(event: TEvent, listener: (data: Buffer, remoteInfo: RemoteInfo) => void) {
        this.emitter.removeListener(event, listener)
    }

    public static getInstance(ipAddress: string = DEFAULT_NETWORK, netMask: string = DEFAULT_NETMASK): NetworkCommunicator {
        if (!NetworkCommunicator.instance) {
            const broadcastIp = this.getBroadcastAddress(ipAddress, netMask)
            NetworkCommunicator.instance = new NetworkCommunicator(broadcastIp);
        }
        return NetworkCommunicator.instance
    }

    public async sendBroadcast(data: Buffer): Promise<number>  {
        return await this.send(data, this.broadcastIpAddress)
    }

    public async send(data: Buffer, ipAddress: string): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this.socket.send(data, ARTNET_PORT, ipAddress, (error, bytes) => {
                error ? reject(error) : resolve(bytes)
            })
        })
    }

    public changeNetwork(networkIp: string, networkMask: string) {
        this.broadcastIpAddress = NetworkCommunicator.getBroadcastAddress(networkIp, networkMask)
        console.warn(`Network changed to \x1b[32m${this.broadcastIpAddress}\x1b[0m`)
    }

    public static enumerateNetworkConnections() {
        const connectionInfo: NetworkInterfaceInfo [] = []
        const interfaces = os.networkInterfaces()

        for (const [_, connections] of Object.entries(interfaces)) {
            if (connections && Array.isArray(connections)) {
                connections.forEach(connection => {
                    connectionInfo.push(connection)
                })
            }
        }
        return connectionInfo
    }

    public static getBroadcastAddress(ipAddress: string, netMask: string): string {
        const netmaskArray = netMask.split('.')
        return ipAddress
            .split('.')
            .map((e, i) => (~netmaskArray[i] & 0xFF) | parseInt(e)).join('.')
    }
}