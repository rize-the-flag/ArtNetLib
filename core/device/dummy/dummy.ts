import {Device} from "../common/device";
import {DmxPacket} from "../../packets/dmx-packet";
import {IAction, ThrowsException} from "../../types";
import {DummyDeviceApi} from "./types";
import {api} from "./api-schema";
import {ArtNetLibError} from "../../lib-error";

export class DummyDevice extends Device<DummyDeviceApi> {
    constructor() {
        super(new DmxPacket(), api)
    }
    prepareAction(action: IAction): ThrowsException<void> {
        const isValid = this.validateApi(action);
        if (!isValid) {
            throw new ArtNetLibError('WRONG_ACTION','Unsupported action. Check action name and params')
        }
        const channelsValues = action['setChannels']['channels'];
        channelsValues.forEach((values, channel) => this.controlPacket.setChannel(channel, values))
    }
}