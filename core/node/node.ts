import {NodeParameters, INode, IDevice} from "../types";
import {ArtNetLibError} from "../lib-error";
import {ARTNET_ERROR_CODE} from "../../constants";
import {NetworkCommunicator} from "../network-communicator";

export class Node implements INode {
    private networkCommunicator: NetworkCommunicator
    public accessor nodeName: string;
    public accessor ipAddress: string;
    public accessor macAddress: string;
    public accessor lastPollingTime: Date;
    public accessor device: IDevice | undefined;

    constructor(options: NodeParameters, device?: IDevice) {
        this.nodeName = options.nodeName
        this.ipAddress = options.ipAddress
        this.macAddress = options.macAddress
        this.lastPollingTime = options.lastPollingTime
        this.device = device;
        this.networkCommunicator = NetworkCommunicator.getInstance();
    }

    public async sendDeviceControlPacket(): Promise<number> {
        if (!this.device) {
            throw new ArtNetLibError(ARTNET_ERROR_CODE.NODE_NOT_SUBSCRIBED,
                'No device assigned for this node.')
        }
        return this.networkCommunicator.send(this.device.controlPacket.encode(), this.ipAddress)
    }
}