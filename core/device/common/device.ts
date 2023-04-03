import {DeviceControlPacket, IDevice, IAction} from '../../types'
import Ajv, {Options, ValidateFunction} from "ajv";

export abstract class Device<TApi> implements IDevice {
    accessor controlPacket: DeviceControlPacket;
    protected readonly validateApi: ValidateFunction<TApi>;
    protected apiSchema: object;

    protected constructor(controlPacket: DeviceControlPacket, apiSchema: object ,ajvOpts?: Options) {
        this.apiSchema = apiSchema;
        this.validateApi = new Ajv(ajvOpts).compile<TApi>(apiSchema);
        this.controlPacket = controlPacket;
    }

    public getSupportedApi(): object {
        return this.apiSchema;
    }
    public abstract prepareAction(action: IAction): void
}