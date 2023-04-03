import {DmxPacket} from '../../packets/dmx-packet'
import {DeviceControlPacket, IAction} from '../../types'
import {Device} from '../common/device'
import apiSchema from "./api-schema"
import * as Constants from './constants'
import {API, LightDiffuserMode, LightMode, LoopDirection} from './types'
import {ArtNetLibError} from "../../lib-error";

export class MixPanel150 extends Device<API> {
    constructor(controlPacket?: DeviceControlPacket) {
        super(controlPacket || new DmxPacket(), apiSchema)
        this.initDefaultState()
    }

    protected initDefaultState() {
        this.setBrightness(30)
        this.setColorTemperature(5000)
        this.setGreenMagentaBias(0)
        this.setLightDiffuser('SOFT')
        this.setLightMode('SILENT')
    }

    private setBrightness(percent: number = 30): void {
        const percentInRange = Math.max(
            Constants.BRIGHTNESS_PERCENT_MIN, Math.min(Constants.BRIGHTNESS_PERCENT_MAX, percent)
        )
        const value = Constants.BRIGHTNESS_STEP * percentInRange
        this.controlPacket.setChannel(Constants.BRIGHTNESS_CHANNEL, parseInt(value.toFixed()))
    }

    private setColorTemperature(kelvins: number = 5000): void {
        const kelvinsInRange = Math.max(Constants.CCT_MIN, Math.min(Constants.CCT_MAX, kelvins))
        const value = (kelvinsInRange - Constants.CCT_MIN) / Constants.CCT_STEP
        this.controlPacket
            .setChannel(Constants.MODE_CHANNEL, Constants.MODE_CCT)
            .setChannel(Constants.FUNCTION_CHANNEL, value)
    }

    private setGreenMagentaBias(bias: number = 0): void {
        const biasInRange = Math.max(Constants.GREEN_MAGENTA_MIN, Math.min(Constants.GREEN_MAGENTA_MAX, bias))
        const value = Math.ceil(
            parseFloat(((Constants.GREEN_MAGENTA_MAX + biasInRange) * Constants.GREEN_MAGENTA_STEP).toFixed(1))
        )
        this.controlPacket
            .setChannel(Constants.MODE_CHANNEL, Constants.MODE_CCT)
            .setChannel(Constants.FUNCTION_DATA_SUB_CHANNEL_1, value)
    }

    private setHUE(degrees: number): void {
        const degreesInRange = Math.max(Constants.HUE_MIN, Math.min(Constants.HUE_MAX, degrees))
        const value = Math.ceil(Constants.HUE_DMX_MAX / Constants.HUE_MAX * degreesInRange)
        this.controlPacket
            .setChannel(Constants.MODE_CHANNEL, Constants.MODE_HSI)
            .setChannel(Constants.FUNCTION_CHANNEL, value)
    }

    private setLightDiffuser(mode: LightDiffuserMode = 'SOFT'): void {
        this.controlPacket
            .setChannel(Constants.MODE_CHANNEL, Constants.MODE_CCT)
            .setChannel(Constants.FUNCTION_DATA_SUB_CHANNEL_2, mode === 'HARD'
                ? Constants.HARD_LIGHT
                : Constants.SOFT_LIGHT
            )
    }

    private setSaturation(percent: number): void {
        percent = Math.min(Constants.SATURATION_MAX, Math.max(Constants.SATURATION_MIN, percent))
        const value = Math.ceil(percent * Constants.SATURATION_DMX_MAX / Constants.SATURATION_MAX)
        this.controlPacket
            .setChannel(Constants.MODE_CHANNEL, Constants.MODE_HSI)
            .setChannel(Constants.FUNCTION_DATA_SUB_CHANNEL_1, value)
    }

    private setLightMode(mode: LightMode = 'SILENT'): void {
        let value = Constants.LIGHTNING_MODE_NORMAL
        switch (mode) {
            case 'BOOST':
                value = Constants.LIGHTNING_MODE_BOOST
                break
            case 'NORMAL':
                value = Constants.LIGHTNING_MODE_NORMAL
                break
            case 'SILENT':
                value = Constants.LIGHTNING_MODE_SILENT
                break
        }
        this.controlPacket
            .setChannel(Constants.LIGHTNING_MODE_CHANNEL, value)
    }

    private runCCTLoop(
        fromCCT: number = 2700,
        toCCT: number = 7500,
        speed: number = 255,
        direction: LoopDirection = 'BACK_AND_FORCE'
    ): void {
        fromCCT = Math.min(Constants.CCT_MAX, Math.max(Constants.CCT_MIN, fromCCT))
        toCCT = Math.min(Constants.CCT_MAX, Math.max(Constants.CCT_MIN, toCCT))
        const valueFromCCT = (fromCCT - Constants.CCT_MIN) / Constants.CCT_STEP
        const valueToCCT = (toCCT - Constants.CCT_MIN) / Constants.CCT_STEP
        this.controlPacket
            .setChannel(Constants.MODE_CHANNEL, Constants.MODE_EFFECT)
            .setChannel(Constants.FUNCTION_CHANNEL, Constants.FUNCTION_CCT_LOOP)
            .setChannel(Constants.FUNCTION_DATA_SUB_CHANNEL_1, valueFromCCT)
            .setChannel(Constants.FUNCTION_DATA_SUB_CHANNEL_2, valueToCCT)
            .setChannel(Constants.FUNCTION_DATA_SUB_CHANNEL_3, speed)
            .setChannel(Constants.FUNCTION_DATA_SUB_CHANNEL_4, direction === 'ONE_WAY'
                ? Constants.LOOP_ONEWAY
                : Constants.LOOP_BACK_AND_FORCE
            )
    }

    public prepareAction(action: IAction): void | never {
        const isValid = this.validateApi(action)

        if (!isValid) {
            throw new ArtNetLibError(
                'WRONG_ACTION',
                `Check actions names or parameters. ${this.validateApi.errors?.map(error => error.message)}`
            )
        }

        const [actionName] = Object.keys(action)
        switch (actionName) {
            case 'setBrightness': {
                this.setBrightness(action[actionName]['percent'])
                break
            }
            case 'setColorTemperature': {
                this.setColorTemperature(action[actionName]['kelvins'])
                break
            }
            case 'setGreenMagentaBias': {
                this.setGreenMagentaBias(action[actionName]['bias'])
                break
            }
            case 'setHUE': {
                this.setHUE(action[actionName]['degrees'])
                break
            }
            case 'setLightDiffuser': {
                this.setLightDiffuser(action[actionName]['diffuserMode'])
                break
            }
            case 'setSaturation': {
                this.setSaturation(action[actionName]['percent'])
                break
            }
            case 'setLightMode': {
                this.setLightMode(action[actionName]['lightMode'])
                break
            }
            case 'runCCTLoop': {
                const {fromCCT, toCCT, speed, direction} = action[actionName];
                this.runCCTLoop(fromCCT, toCCT, speed, direction);
                break;
            }
        }
    }
}