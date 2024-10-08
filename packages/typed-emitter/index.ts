import { Emitter, EventHandlers } from './types';
import { MAX_LISTENERS_PER_EVENT } from './constants';

export class TypedEmitter<TEvents extends EventHandlers> implements Emitter<TEvents> {
  private listeners = new Map<keyof TEvents, Set<TEvents[keyof TEvents]>>();
  private asyncListeners = new Map<keyof EventHandlers, ((value: Parameters<TEvents[keyof TEvents]>) => void)[]>();

  constructor(private maxListenerPerEvent: number = MAX_LISTENERS_PER_EVENT) {}

  public addListener<TEventName extends keyof TEvents>(event: TEventName, cb: TEvents[TEventName]): void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    const handlers = this.listeners.get(event);

    if (handlers && handlers.size >= this.maxListenerPerEvent)
      throw new Error(
        `Listener count for event [${String(event)}] exceeds threshold ${String(this.maxListenerPerEvent)} possible memory leak detected`
      );

    handlers?.add(cb);
  }

  public removeListener<TEventName extends keyof TEvents>(event: TEventName, cb: TEvents[TEventName]) {
    this.listeners.get(event)?.delete(cb);
  }

  public emit<TEventName extends keyof TEvents>(event: TEventName, ...payload: [...Parameters<TEvents[TEventName]>]) {
    const currentListeners = this.listeners.get(event);
    if (currentListeners) {
      currentListeners.forEach((listener) => {
        void listener(...payload);
        return;
      });
    }

    const asyncListeners = this.asyncListeners.get(event);
    if (asyncListeners) {
      asyncListeners.forEach((resolve) => {
        resolve(payload);
      });
      asyncListeners.length = 0;
    }
  }

  public once<TEventName extends keyof TEvents>(event: TEventName, cb: TEvents[TEventName]): void {
    const wrap = (...payload: Parameters<TEvents[TEventName]>): void | Promise<void> => {
      void cb(...payload);
      this.removeListener(event, wrap as TEvents[TEventName]);
    };

    this.addListener(event, wrap as TEvents[TEventName]);
  }

  public async waitFor<TEventName extends keyof TEvents>(
    event: TEventName,
    signal?: AbortSignal
  ): Promise<Parameters<TEvents[TEventName]>> {
    return new Promise((resolve, reject) => {
      if (!this.asyncListeners.has(event)) this.asyncListeners.set(event, []);
      this.asyncListeners.get(event)?.push(resolve);
      if (signal) {
        signal.onabort = () => reject(new Error(String(signal.reason)));
      }
    });
  }

  public waitForAll<TEventName extends keyof TEvents>(
    events: TEventName[]
  ): Promise<Parameters<TEvents[TEventName]>>[] {
    return events.map((event) => this.waitFor<TEventName>(event));
  }

  public removeAllListeners(): void {
    this.listeners = new Map();
    this.asyncListeners = new Map();
  }

  public getListenersCount<TEventName extends keyof TEvents>(event: TEventName): number {
    return this.listeners.get(event)?.size ?? 0;
  }
}

export * from './types';
