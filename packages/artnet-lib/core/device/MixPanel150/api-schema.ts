import { z } from 'zod';

export const SetBrightnessApi = z.object({
  actionName: z.literal('setBrightness'),
  parameters: z.object({
    percent: z.number().min(0).max(100),
  }),
});

export const SetColorTemperatureApi = z.object({
  actionName: z.literal('setColorTemperature'),
  parameters: z.object({
    kelvins: z.number().min(2700).max(7500),
  }),
});

export const SetGreenMagentaBiasApi = z.object({
  actionName: z.literal('setGreenMagentaBias'),
  parameters: z.object({
    bias: z.number().min(-50).max(50),
  }),
});

export const SetHUEApi = z.object({
  actionName: z.literal('setHUE'),
  parameters: z.object({
    degrees: z.number().min(0).max(360),
  }),
});

export const SetLightDiffuserApi = z.object({
  actionName: z.literal('setLightDiffuser'),
  parameters: z.object({
    mode: z.enum(['HARD', 'SOFT']),
  }),
});

export const SetLightModeApi = z.object({
  actionName: z.literal('setLightMode'),
  parameters: z.object({
    mode: z.enum(['BOOST', 'SILENT', 'NORMAL']),
  }),
});

export const SetSaturationApi = z.object({
  actionName: z.literal('setSaturation'),
  parameters: z.object({
    percent: z.number().min(0).max(100),
  }),
});

export const RunCCTLoopApi = z.object({
  actionName: z.literal('runCCTLoop'),
  parameters: z.object({
    from: z.number().min(2700).max(7500),
    to: z.number().min(2700).max(7500),
    speed: z.number().min(0).max(255),
    direction: z.enum(['ONE_WAY', 'BACK_AND_FORCE']),
  }),
});

export const API = z.discriminatedUnion('actionName', [
  SetBrightnessApi,
  SetColorTemperatureApi,
  SetGreenMagentaBiasApi,
  SetHUEApi,
  SetLightDiffuserApi,
  SetLightModeApi,
  SetSaturationApi,
  RunCCTLoopApi,
]);
