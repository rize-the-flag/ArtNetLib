import {ArtNetLibError} from '../lib-error';
import {Universe} from '../universe/universe';
import {Communicator} from '../communicator/communicator.interface';
import {NodeInfo} from './node.interface';
import {AddressPacket, AddressPacketPayload, PollReplyPacketPayload} from "@rtf-dm/artnet-packets";

export class Node {
    private networkCommunicator: Communicator;
    private pollReplyPayload: PollReplyPacketPayload;
    private _lastResponseTime: Date;
    private ports = new Map<number, Universe>();
    accessor isAlive = false;

    constructor(pollReplyPayload: PollReplyPacketPayload, communicator: Communicator) {
        this.update(pollReplyPayload);
        this.networkCommunicator = communicator;
    }

    get name() {
        return this.pollReplyPayload.longName;
    }

    get ipAddress() {
        return this.pollReplyPayload.ipAddress.join('.');
    }

    get macAddress() {
        return this.pollReplyPayload.macAddress.join('.');
    }

    get lastResponseTime() {
        return this._lastResponseTime;
    }

    get portInfo() {
        return this.getNodeInfo();
    }

    private updateUniverseAddressInfo(ports: number[]) {
        const {netSwitch, netSubSwitch, swOut} = this.pollReplyPayload;
        ports.forEach(port => {
            this.assertPortsCount(port);
            this.ports.get(port)?.update(netSwitch, netSubSwitch, swOut[port])
        });
    }

    // Node has 4 ports each port has one Universe each Universe has many Devices
    public update(polReplyPayload: PollReplyPacketPayload): this {
        this._lastResponseTime = new Date();
        this.pollReplyPayload = {...polReplyPayload};
        return this;
    }

    public getAttachedUniverses(): Universe[] {
        return [...this.ports.values()];
    }

    public attachUniverse(port: number, universe: Universe): Universe {
        this.assertPortsCount(port);

        const {netSwitch, netSubSwitch, swOut} = this.pollReplyPayload;
        universe.update(netSwitch, netSubSwitch, swOut[port]);
        this.ports.set(port, universe);
        return universe;
    }

    public detachUniverse(port: number): Universe | null {
        const universe = this.ports.get(port);
        if (!universe) return null;
        this.ports.delete(port);
        return universe;
    }

    private assertPortsCount(portNumber: number) {
        if (portNumber >= this.getNodeInfo().numPorts) {
            throw new ArtNetLibError(
                'NODE_PORTS_LIMIT',
                `Node ${this.name} supports ${String(this.getNodeInfo().numPorts)} port(s) only`,
            );
        }
    }

    public getNodeInfo(): NodeInfo {
        const {
            netSwitch,
            netSubSwitch,
            swOut,
            swIn,
            nodeReport,
            portTypes,
            numPorts
        } = this.pollReplyPayload;

        return {
            netSwitch,
            netSubSwitch,
            nodeReport,
            swOut,
            swIn,
            numPorts,
            portTypes,
        };
    }

    public async syncRemotePort(universeOrPort: Universe | number): Promise<number> {
        if (universeOrPort instanceof Universe) {
            return this.networkCommunicator.send(universeOrPort.buildDmxData(), this.ipAddress);
        }
        this.updateUniverseAddressInfo([universeOrPort]);
        const verse = this.ports.get(universeOrPort);
        if(!verse) return Promise.reject(new Error(`No universe on port ${String(universeOrPort)}`))
        return this.networkCommunicator.send(verse.buildDmxData(), this.ipAddress);
    }

    public async syncAll(): Promise<number[]> {
        this.updateUniverseAddressInfo(Array.from(this.ports.keys()));
        return Promise.all(
            Array.from(this.ports.values()).map((universe) =>
                this.networkCommunicator.send(universe.buildDmxData(), this.ipAddress)
            )
        );
    }

    public getUniverse(nameOrPort: string | number): Universe | undefined {
        if (typeof nameOrPort === 'string') {
            return Array.from(this.ports.values()).find((universe) => universe.name);
        }

        this.assertPortsCount(nameOrPort);
        return this.ports.get(nameOrPort);
    }

    public async configure(config: Partial<AddressPacketPayload>): Promise<number> {
        const data: Partial<AddressPacketPayload> = {
            shortName: this.pollReplyPayload.shortName,
            longName: this.pollReplyPayload.longName,
            netSwitch: this.pollReplyPayload.netSwitch,
            netSubSwitch: this.pollReplyPayload.netSubSwitch,
            swOut: this.pollReplyPayload.swOut,
            swIn: this.pollReplyPayload.swOut,
            bindIndex: this.pollReplyPayload.bindIndex,
            ...config
        }
        const artAddress = new AddressPacket(data).applyPortsConfig();
        return this.networkCommunicator.send(artAddress.encode(), this.ipAddress);
    }

    public async resetToPhysicalSwitch(): Promise<number> {
        const data: Partial<AddressPacketPayload> = {
            shortName: this.pollReplyPayload.shortName,
            longName: this.pollReplyPayload.longName,
            netSwitch: this.pollReplyPayload.netSwitch,
            netSubSwitch: this.pollReplyPayload.netSubSwitch,
            swOut: this.pollReplyPayload.swOut,
            swIn: this.pollReplyPayload.swOut,
            bindIndex: this.pollReplyPayload.bindIndex,
        }
        const artAddress = new AddressPacket(data).resetToPhysicalPortsConfig();
        return this.networkCommunicator.send(artAddress.encode(), this.ipAddress);
    }
}
