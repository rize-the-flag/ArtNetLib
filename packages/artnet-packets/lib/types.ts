export type valueOf<T> = T[keyof T];
export type ThrowsException<TReturn> = TReturn | never;
