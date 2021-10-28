export interface IControlFmod {
    loadBank( bankName: string ): Promise<void>;

    play( eventId: string ): Promise<void>;

    start( eventId: string ): Promise<void>;

    stop( eventId: string ): Promise<void>;

    isPlaying( eventId: string ): Promise<boolean>;
}
