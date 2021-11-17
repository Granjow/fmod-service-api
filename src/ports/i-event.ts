export interface IEvent {
    play(): Promise<void>;

    start(): Promise<void>;

    stop(): Promise<void>;
}
