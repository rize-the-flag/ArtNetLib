import { LogMethod } from './decorators';

const LogMethodDefault = LogMethod(console, {
  severity: 'log',
  measurePerformance: true,
});

class Test {
  @LogMethodDefault
  method1(arg1: string) {
    return arg1;
  }
}

new Test().method1('1');
