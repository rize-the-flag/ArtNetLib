import { MixPanel150 } from '../MixPanel150/mix-panel150';
import { Generic } from '../generic/generic';

export const DEVICE_TYPE = {
  MixPanel150,
  MixPanel60: MixPanel150,
  Generic,
};

export type SupportedDevices = typeof DEVICE_TYPE;
