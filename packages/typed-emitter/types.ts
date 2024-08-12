type ObjectKeys = string | symbol | number;


export type EventHandlers = Record<ObjectKeys, (...args: unknown[]) => void | Promise<void>>;

export type EventHandler<TArg> = TArg extends Array<unknown>
	? (...arg: [...TArg]) => void | Promise<void>
	: (arg: TArg) => void | Promise<void>;

export interface Emitter<TEvents extends EventHandlers> {
	addListener<TEventName extends keyof TEvents>(event: TEventName, cb: TEvents[TEventName]): void;

	removeListener<TEventName extends keyof TEvents>(
		event: TEventName,
		cb: TEvents[TEventName],
	): void;

	waitFor<TEventName extends keyof TEvents>(
		event: TEventName,
	): Promise<Parameters<TEvents[TEventName]>>;

	listenersCount<TEventName extends keyof TEvents>(event: TEventName): number;

	removeAllListeners(): void;
}
