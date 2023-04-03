import {DmxPacket} from "./packets/dmx-packet";
import {ARTNET_ERROR_CODE, DISCOVERY_EVENT, DISCOVERY_STATUS, NETWORK_COMMUNICATOR_EVENTS} from "../constants";

export type ProtocolVersion = 14

export interface IPollReplyPacketPayload extends IPacketPayload {
    ipAddress: number[];
    port: number;
    firmwareVersion: number;
    netSwitch: number;
    oem: number;
    ubeaVersion: number;
    status1: number;
    estaManufactorerCode: number;
    shortName: string;
    longName: string;
    nodeReport: string;
    numPorts: number;
    portTypes: number[];
    goodInput: number[];
    goodOutputA: number[];
    swIn: number[];
    swOut: number[];
    acnPriority: number;
    swMacro: number;
    swRemote: number;
    spare: number[];
    style: number;
    macAddress: number[];
    bindIp: number[];
    bindIndex: number;
    status2: number;
    goodOutputB: number;
    status3: number;
    defaultRespUID: number[];
    filler: number[];
}
export interface IDmxPacketPayload extends IPacketPayload {
    protoVersion: ProtocolVersion;
    sequence: number;
    physical: number;
    net: number;
    subUniverse: number;
    length: number;
    dmxData: number[];
}
export interface ISyncPacketPayload extends IPacketPayload {
    protoVersion: ProtocolVersion;
    aux1: number;
    aux2: number;
}
export interface IPollPacketPayload extends IPacketPayload {
    protoVersion: ProtocolVersion;
    flags: number;
    diagPriority: number;
    targetPortAddress: number;
}
export interface IHeaderPayload extends IPacketPayload {
    ID: string;
    opCode: number;
}
export interface IDiagDataPayload extends IPacketPayload {
    protoVersion: number;
    filler1: number;
    diagPriority: number;
    logicalPort: number;
    filler3: number;
    length: number;
    data: string;
}
export interface IPacketSchemaRecord {
    length: number;
    byteOrder?: 'LE' | 'BE';
    type: 'string' | 'number' | 'array';
    default?: number | string | number [];
}

export interface INode {
    ipAddress: string;
    macAddress: string;
    nodeName: string;
    lastPollingTime: Date;
    device?: IDevice;
    sendDeviceControlPacket: () => Promise<number>;
}

export interface INodeList {
    addNode: (nodeParams: Pick<IPollReplyPacketPayload, 'ipAddress' | 'shortName' | 'macAddress'>) => ThrowsException<INode>;
    updateNode: (nodeParams: IPollReplyPacketPayload) =>  INode | null;
    getByName: (nodeName: string) => INode | null;
    get: (conditionCb?: (node: INode) => boolean) => INode[];
    removeNodes: (conditionCb: (node: INode) => boolean) => INode[];
    [Symbol.iterator]: () => Generator<INode>
}

export type NodeParameters = Omit<INode, 'sendDeviceControlPacket'>;

export interface IAction {
    [action: string]: {
        [param: string]: string | number | number[],
    }
}

export interface IActions {
    node: string;
    actions: IAction[]
}

export type ThrowsException<TReturn> = TReturn | never

export interface IDevice {
    readonly controlPacket: DeviceControlPacket;
    prepareAction(action: IAction): ThrowsException<void>;
    getSupportedApi(): object;
}

export interface IPacketPayload {
    [index: string]: PacketPayloadType;
}

export interface INodeToDeviceSubscription {
    node: string;
    device: string;
}

export type ArtNetErrorCode = keyof typeof ARTNET_ERROR_CODE;

export type NetworkCommunicatorEvents = keyof typeof NETWORK_COMMUNICATOR_EVENTS

export type DiscoveryPayload = Pick<INode, 'nodeName' | 'ipAddress' | 'macAddress' | 'lastPollingTime'>
export type DiscoveryEvent = keyof typeof DISCOVERY_EVENT
export type DiscoveryStatus = keyof typeof DISCOVERY_STATUS;

export type ListenerPayload<
    TEvent extends DiscoveryEvent = DiscoveryEvent,
    TPayload extends DiscoveryPayload = DiscoveryPayload
> = TEvent extends DiscoveryEvent ? DiscoveryPayload : never

export interface IDiscovery {
    on<TEvent extends DiscoveryEvent>(eventName: TEvent, listener: (payload: ListenerPayload<TEvent>) => void): void;
    readonly nodes: INodeList;
    run: (pollingInterval: number) => Promise<DiscoveryStatus>
    stop: () => DiscoveryStatus;
    getStatus: () => DiscoveryStatus;
}

export interface IController {
    discovery: IDiscovery
    makeSubscription: (nodeName: string, deviceName: string) => ThrowsException<INodeToDeviceSubscription>;
    executeActions: (actions: IActions[]) =>  Promise<number[]>;
}

export type PacketPayloadType = string | number | number[];

export type GPacketSchema<TPayload> = Record<keyof TPayload, IPacketSchemaRecord>

export type PollPacketSchema = GPacketSchema<IPollPacketPayload>
export type DmxPacketSchema = GPacketSchema<IDmxPacketPayload>
export type PollReplyPacketSchema =GPacketSchema<IPollReplyPacketPayload>
export type HeaderSchema = GPacketSchema<IHeaderPayload>
export type SyncPacketSchema = GPacketSchema<ISyncPacketPayload>
export type DiagDataPacketSchema = GPacketSchema<IDiagDataPayload>

export type DeviceControlPacket = DmxPacket;

export type GDeviceConstructor<
    TDevice extends IDevice,
    TControlPacket extends DeviceControlPacket = DmxPacket
> = new (controlPacket?: DeviceControlPacket, ...args: unknown[]) => TDevice