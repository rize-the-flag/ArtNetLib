import { Logger as TSLogger } from 'tslog';
import { appendFileSync } from 'fs';
import { LOG_FILE_NAME, loggerConfig } from './logger.config';
import { LoggerInterface } from './logger.interface';
import { LogMethod, MakePropertyInjector } from '@rtf-dm/common';

const tsLogger = new TSLogger({
  name: loggerConfig.name,
  type: loggerConfig.type,
  hideLogPositionForProduction: loggerConfig.hideLogPositionForProduction,
  minLevel: loggerConfig.logLevelId,
});

tsLogger.getSubLogger().attachTransport((data) => {
  appendFileSync(LOG_FILE_NAME, JSON.stringify(data));
});

export const consoleLogger = MakePropertyInjector<LoggerInterface>(tsLogger);

export const Log = LogMethod(tsLogger, {
  severity: 'trace',
  measurePerformance: true,
});

export const InjectLogger = consoleLogger;
