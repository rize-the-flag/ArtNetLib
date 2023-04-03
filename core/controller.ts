import {DeviceFactory} from './device/common/factory'
import './device/common/register-devices'
import {
    IActions,
    IController,
    IAction,
    IDiscovery,
    INode,
    INodeToDeviceSubscription,
    ThrowsException,
} from './types'
import {ArtNetLibError} from "./lib-error";
import {Discovery} from "./discovery";

export class Controller implements IController {
    accessor discovery: IDiscovery

    constructor() {
        this.discovery = new Discovery()
    }

    public makeSubscription(nodeName: string, deviceName: string): ThrowsException<INodeToDeviceSubscription> {
        const node = this.discovery.nodes.getByName(nodeName)

        if (!node) {
            throw new ArtNetLibError(
                'NODE_NOT_FOUND',
                `Node ${nodeName} didn't find on given network`
            )
        }

        node.device = DeviceFactory.createDevice(deviceName)
        console.info(`${deviceName} attached to ${node.nodeName}`)
        return {node: nodeName, device: deviceName};
    }


    public async executeActions(actions: IActions[]): Promise<number[]> {
        const nodes = actions.map(({node, actions}) => this.prepareActions(node, actions))
        const promises = nodes.map(node => node.sendDeviceControlPacket())
        return Promise.all(promises)
    }

    private prepareActions(nodeName: string, actions: IAction[]): INode {
        const node = this.discovery.nodes.getByName(nodeName)

        if (!node) {
            throw new ArtNetLibError(
                'NODE_NOT_FOUND',
                `${nodeName} not found.`
            )
        }

        if (!node.device) {
            throw new ArtNetLibError(
                'NODE_NOT_SUBSCRIBED',
                `There is no any device subscribed to ${nodeName}. Assign device to bridge first.`
            )
        }

        actions.forEach((action) => node.device?.prepareAction(action))
        return node
    }
}
