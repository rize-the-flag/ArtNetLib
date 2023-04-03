import {SUPPORTED_ACTIONS} from "./constants";

export type MixPanel150Api = keyof typeof SUPPORTED_ACTIONS;

export type API<TApi extends MixPanel150Api = MixPanel150Api> = {
    [TKey in TApi]: TKey extends 'setBrightness' ? {
        percent: number
    } : TKey extends 'setColorTemperature' ? {
        kelvins: number
    } : TKey extends 'setGreenMagentaBias' ? {
        bias: number
    } : TKey extends 'setHUE' ? {
        degrees: number
    } : TKey extends 'setLightDiffuser' ? {
        diffuserMode: LightDiffuserMode,
    } : TKey extends 'setSaturation' ? {
        percent: number
    } : TKey extends 'setLightMode' ? {
        lightMode: LightMode,
    } : TKey extends 'runCCTLoop' ? {
        fromCCT: number,
        toCCT: number,
        speed: number,
        direction: LoopDirection
    } : never
}

export type LightMode = 'SILENT' | 'BOOST' | 'NORMAL'

export type LightDiffuserMode = 'HARD' | 'SOFT'

export type LoopDirection = 'ONE_WAY' | 'BACK_AND_FORCE'