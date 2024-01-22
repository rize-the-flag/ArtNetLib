export const BRIGHTNESS_CHANNEL = 0;

export const MODE_CHANNEL = 1;
export const MODE_CCT = 50;
export const MODE_HSI = 100;
export const MODE_RGBW = 150;
export const MODE_GEL = 200;
export const MODE_EFFECT = 250;

export const FUNCTION_CHANNEL = 2;
export const FUNCTION_CCT_LOOP = 30;
export const FUNCTION_HSI_LOOP = 15;

export const LOOP_ONEWAY = 0;
export const LOOP_BACK_AND_FORCE = 255;

export const FUNCTION_DATA_SUB_CHANNEL_1 = 3;
export const FUNCTION_DATA_SUB_CHANNEL_2 = 4;
export const FUNCTION_DATA_SUB_CHANNEL_3 = 5;
export const FUNCTION_DATA_SUB_CHANNEL_4 = 6;

export const BRIGHTNESS_DMX_MAX = 200;
export const BRIGHTNESS_PERCENT_MAX = 100;
export const BRIGHTNESS_PERCENT_MIN = 0;
export const BRIGHTNESS_STEP = BRIGHTNESS_DMX_MAX / 100;

export const CCT_MAX = 7500;
export const CCT_MIN = 2700;
export const CCT_STEP = (CCT_MAX - CCT_MIN) / 250;

export const GREEN_MAGENTA_DMX_MAX = 226;
export const GREEN_MAGENTA_MAX = 50;
export const GREEN_MAGENTA_MIN = -50;
export const GREEN_MAGENTA_STEP = GREEN_MAGENTA_DMX_MAX / 100;

export const HARD_LIGHT = 0;
export const SOFT_LIGHT = 255;

export const SATURATION_MAX = 100;
export const SATURATION_MIN = 0;
export const SATURATION_DMX_MAX = 253;

export const HUE_MAX = 360;
export const HUE_MIN = 0;
export const HUE_DMX_MAX = 255;

export const LIGHTNING_MODE_CHANNEL = 11;
export const LIGHTNING_MODE_SILENT = 0;
export const LIGHTNING_MODE_NORMAL = 100;
export const LIGHTNING_MODE_BOOST = 200;

export const DMX_DATA_LENGTH = LIGHTNING_MODE_CHANNEL + 1;
