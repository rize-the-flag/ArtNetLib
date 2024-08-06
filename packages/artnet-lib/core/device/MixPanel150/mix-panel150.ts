import {ThrowsException} from '../../types';
import {Device} from '../common/device';
import {
  API,
  RunCCTLoopApi,
  SetBrightnessApi,
  SetColorTemperatureApi,
  SetGreenMagentaBiasApi,
  SetHUEApi,
  SetLightDiffuserApi,
  SetLightModeApi,
  SetSaturationApi,
} from './api-schema';
import * as Constants from './constants';
import {LightDiffuserMode, LightMode, LoopDirection} from './types';
import {DMX_DATA_LENGTH} from './constants';
import {z} from 'zod';

export class MixPanel150 extends Device {
  constructor(dmxDataSize: number = DMX_DATA_LENGTH) {
    super(dmxDataSize, API);
    this.initDefaultState();
  }

  public initDefaultState(): void {
    this.setBrightness({percent: 30});
    this.setColorTemperature({kelvins: 5000});
    this.setGreenMagentaBias({bias: 0});
    this.setLightDiffuser({mode: 'SOFT'});
    this.setLightMode({mode: 'SILENT'});
  }

  public setBrightness({percent}: { percent: number }): void {
    this.logger.info('USEFULL INFO DELETE PLEASE 2')
    const percentInRange = Math.max(Constants.BRIGHTNESS_PERCENT_MIN, Math.min(Constants.BRIGHTNESS_PERCENT_MAX, percent));
    const value = Math.ceil(Constants.BRIGHTNESS_STEP * percentInRange);
    this.logger.info(`setBrightness(${percent}) => ${value}`);
    this.setChannel(Constants.BRIGHTNESS_CHANNEL, parseInt(value.toFixed()));
  }

  public setColorTemperature({kelvins}: { kelvins: number }): void {
    const kelvinsInRange = Math.max(Constants.CCT_MIN, Math.min(Constants.CCT_MAX, kelvins));
    const value = Math.ceil((kelvinsInRange - Constants.CCT_MIN) / Constants.CCT_STEP);
    this.logger.info(`setColorTemperature(${kelvins}) => ${value}`);
    this.setChannel(Constants.MODE_CHANNEL, Constants.MODE_CCT).setChannel(Constants.FUNCTION_CHANNEL, value);
  }

  public setGreenMagentaBias({bias}: { bias: number }): void {
    const biasInRange = Math.max(Constants.GREEN_MAGENTA_MIN, Math.min(Constants.GREEN_MAGENTA_MAX, bias));
    const value = Math.ceil((Constants.GREEN_MAGENTA_MAX + biasInRange) * Constants.GREEN_MAGENTA_STEP);
    this.logger.info(`setGreenMagentaBias(${bias}) => ${value}`);
    this.setChannel(Constants.MODE_CHANNEL, Constants.MODE_CCT).setChannel(Constants.FUNCTION_DATA_SUB_CHANNEL_1, value);
  }

  public setHUE({degrees}: { degrees: number }): void {
    const degreesInRange = Math.max(Constants.HUE_MIN, Math.min(Constants.HUE_MAX, degrees));
    const value = Math.ceil((Constants.HUE_DMX_MAX / Constants.HUE_MAX) * degreesInRange);
    this.logger.info(`setHUE(${degrees}) => ${value}`);
    this.setChannel(Constants.MODE_CHANNEL, Constants.MODE_HSI).setChannel(Constants.FUNCTION_CHANNEL, value);
  }

  public setLightDiffuser({mode}: { mode: LightDiffuserMode }): void {
    this.logger.info(`setHUE(${mode}) => ${mode === 'HARD' ? Constants.HARD_LIGHT : Constants.SOFT_LIGHT}`);
    this.setChannel(Constants.MODE_CHANNEL, Constants.MODE_CCT).setChannel(Constants.FUNCTION_DATA_SUB_CHANNEL_2, mode === 'HARD' ? Constants.HARD_LIGHT : Constants.SOFT_LIGHT);
  }

  public setSaturation({percent}: { percent: number }): void {
    percent = Math.min(Constants.SATURATION_MAX, Math.max(Constants.SATURATION_MIN, percent));
    const value = Math.ceil((percent * Constants.SATURATION_DMX_MAX) / Constants.SATURATION_MAX);
    this.logger.info(`setHUE(${percent}) => ${value}`);
    this.setChannel(Constants.MODE_CHANNEL, Constants.MODE_HSI).setChannel(Constants.FUNCTION_DATA_SUB_CHANNEL_1, value);
  }

  public setLightMode({mode}: { mode: LightMode }): void {
    let value: number;
    switch (mode) {
      case 'BOOST':
        value = Constants.LIGHTNING_MODE_BOOST;
        break;
      case 'NORMAL':
        value = Constants.LIGHTNING_MODE_NORMAL;
        break;
      case 'SILENT':
      default:
        value = Constants.LIGHTNING_MODE_SILENT;
    }

    this.logger.info(`setLightMode(${mode}) => ${value}`);
    this.setChannel(Constants.LIGHTNING_MODE_CHANNEL, value);
  }

  public runCCTLoop({
    from, to, speed, direction,
  }: {
    from: number; to: number; speed: number; direction: LoopDirection;
  }): void {
    from = Math.min(Constants.CCT_MAX, Math.max(Constants.CCT_MIN, from));
    to = Math.min(Constants.CCT_MAX, Math.max(Constants.CCT_MIN, to));
    const valueFromCCT = (from - Constants.CCT_MIN) / Constants.CCT_STEP;
    const valueToCCT = (to - Constants.CCT_MIN) / Constants.CCT_STEP;

    this.logger.info(`setHUE(${from}, ${to}, ${speed}, ${direction}) => [${valueFromCCT}, ${valueToCCT}]`);
    this.setChannel(Constants.MODE_CHANNEL, Constants.MODE_EFFECT)
        .setChannel(Constants.FUNCTION_CHANNEL, Constants.FUNCTION_CCT_LOOP)
        .setChannel(Constants.FUNCTION_DATA_SUB_CHANNEL_1, valueFromCCT)
        .setChannel(Constants.FUNCTION_DATA_SUB_CHANNEL_2, valueToCCT)
        .setChannel(Constants.FUNCTION_DATA_SUB_CHANNEL_3, speed)
        .setChannel(Constants.FUNCTION_DATA_SUB_CHANNEL_4, direction === 'ONE_WAY' ? Constants.LOOP_ONEWAY : Constants.LOOP_BACK_AND_FORCE);
  }

  public setAction(action: unknown): ThrowsException<void> {
    this.validate(action);

    if (this.is(SetHUEApi, action)) return this.setHUE(action.parameters);
    if (this.is(RunCCTLoopApi, action)) return this.runCCTLoop(action.parameters);
    if (this.is(SetLightModeApi, action)) return this.setLightMode(action.parameters);
    if (this.is(SetBrightnessApi, action)) return this.setBrightness(action.parameters);
    if (this.is(SetLightDiffuserApi, action)) return this.setLightDiffuser(action.parameters);
    if (this.is(SetColorTemperatureApi, action)) return this.setColorTemperature(action.parameters);
    if (this.is(SetGreenMagentaBiasApi, action)) return this.setGreenMagentaBias(action.parameters);
    if (this.is(SetSaturationApi, action)) return this.setSaturation(action.parameters);
  }

  public setActions(actions: unknown[]): ThrowsException<void> {
    actions.forEach((action) => this.setAction(action));
  }

  getSupportedApi(): string {
    //TODO: implement usefully api info
    return z.quotelessJson(this.api);
  }
}
