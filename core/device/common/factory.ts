import {DeviceControlPacket, GDeviceConstructor, IDevice, ThrowsException} from "../../types";
import {ArtNetLibError} from "../../lib-error";
import {ARTNET_ERROR_CODE} from "../../../constants";

//DMX devices repository
export class DeviceFactory {
    private constructor() {
    }

    private static deviceRegistry: Map<string, GDeviceConstructor<IDevice>> = new Map()

    public static createDevice(
        deviceName: string,
        controlPacket?: DeviceControlPacket,
        ...args: unknown[]
    ): ThrowsException<IDevice> {
        const deviceType = DeviceFactory.deviceRegistry.get(deviceName)
        if (!deviceType) {
            throw new ArtNetLibError(
                ARTNET_ERROR_CODE.DEVICE_DRIVER_NOT_FOUND,
                `Device ${deviceType} unsupported`
            )
        }
        return new deviceType(controlPacket, ...args)
    }

    public static registerDevice<
        TDevice extends GDeviceConstructor<IDevice>
    >
    (deviceName: string, deviceType: TDevice): void {
        DeviceFactory.deviceRegistry.set(deviceName, deviceType);
    }

    public static getRegisteredDevices(): string [] {
        return Array.from(this.deviceRegistry.keys())
    }
}