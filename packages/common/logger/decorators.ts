interface LoggerDecoratorOptions<TLogger> {
  severity: keyof TLogger;
  measurePerformance: boolean;
}

export function LogMethod<TLogger>(logger: TLogger, { severity, measurePerformance }: LoggerDecoratorOptions<typeof logger>) {
  return function <This, Args extends unknown[], Return>(
    value: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>
  ) {
    return function (this: This, ...args: Args): Return {
      const { name } = context;
      const logMethod = logger[severity];
      let measurement = '';

      if (typeof logMethod !== 'function') {
        throw new TypeError(`${String(logger)}[${String(severity)}] mast be callable`);
      }

      logMethod.call(logger, `${String(name)}(${String(args)})`);

      measurePerformance && performance.mark(`${String(name)}-start`);
      const RetVal = value.call(this, ...args);
      measurePerformance && performance.mark(`${String(name)}-end`);

      if (measurePerformance) {
        const { duration } = performance.measure(String(name), `${String(name)}-start`, `${String(name)}-end`);
        measurement = `Duration: ${String(duration)}ms`;
      }

      logMethod.call(logger, `${String(name)}(${String(args)}) => ${String(RetVal)} ${measurement}`);
      return RetVal;
    };
  };
}
