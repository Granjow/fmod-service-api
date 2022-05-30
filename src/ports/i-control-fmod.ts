export interface IControlFmod {
    loadBank( bankName: string ): Promise<void>;

    unloadBank( bankName: string ): Promise<void>;

    play( eventId: string ): Promise<void>;

    start( eventId: string ): Promise<void>;

    stop( eventId: string ): Promise<void>;

    playVoice( eventId: string, key: string ): Promise<void>;

    setParameter( eventId: string, paramName: string, value: number ): Promise<void>;

    isPlaying( eventId: string ): Promise<boolean>;

    listLoadedBankPaths(): Promise<string[]>;
}
