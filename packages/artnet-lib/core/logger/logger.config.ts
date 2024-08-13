import * as process from 'process';

const LOG_LEVEL = {
  INFO: 3,
  WARN: 4,
  ERROR: 5,
  TRACE: 1,
};

const LEVEL = parseInt(process.env.LOG_LEVEL ?? '') || LOG_LEVEL.INFO;

export const loggerConfig = {
  name: 'ArtNet-Lib',
  logLevelId: LEVEL,
  type: process.env.DEV ? 'pretty' : 'hidden',
  hideLogPositionForProduction: true,
} as const;

export const LOG_FILE_NAME = 'artnet-lib-logs.json';
