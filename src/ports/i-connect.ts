import { ITypedEmitter } from './i-typed-emitter';

export interface ConnectionEvents {
    'connect': () => void;
    'disconnect': () => void;
    'reconnect': () => void;
}

export interface IConnect {
    connect(): void;

    disconnect(): void;
}

export interface IConnectEvents extends ITypedEmitter<ConnectionEvents> {
}
