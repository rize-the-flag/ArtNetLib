import {Device} from '../common/device';
import {ThrowsException} from '../../types';
import {API, setChannelApi, setChannelsApi} from './api-schema';
import {ArtNetDeviceAction} from '../device.interface';
import {z} from 'zod';
import {Log} from "../../logger";

export class Generic extends Device {
    constructor(dmxDataLength = 512) {
        super(dmxDataLength, API);
    }

    getSupportedApi(): string {
        //TODO: implement usefully api info
        return z.quotelessJson(this.api);
    }

    public setChannels({channels}: { channels: number[] }): ThrowsException<void> {
        channels.forEach((value, channel) => super.setChannel(channel, value));
    }

    @Log
    public override setChannel(channel: number, value: number): this {
        super.setChannel(channel, value);
        return this;
    }

    public setAction(action: ArtNetDeviceAction): ThrowsException<void> {
        this.validate(action);

        if (this.is(setChannelsApi, action)) this.setChannels(action.parameters);
        if (this.is(setChannelApi, action))  super.setChannel(action.parameters.channel, action.parameters.value);
    }

    public setActions(actions: ArtNetDeviceAction[]): ThrowsException<void> {
        actions.forEach(action => {
            this.setAction(action);
        })
    }
}

