export interface IControlFmod {
    loadBank( bankName: string ): Promise<void>;

    unloadBank( bankName: string ): Promise<void>;

    play( eventId: string ): Promise<void>;

    start( eventId: string ): Promise<void>;

    stop( eventId: string ): Promise<void>;

    /**
     * Stop all events that have been started with start().
     * (Note that events started with play() are single-shot, they cannot be stopped anymore.)
     */
    stopStartedEvents(): Promise<void>;

    /**
     * Play a voice event. This is an event containing a programmer instrument which is called
     * with the voice key as argument (using a localised audio table in FMOD).
     */
    playVoice( eventId: string, key: string ): Promise<void>;

    setParameter( eventId: string, paramName: string, value: number ): Promise<void>;

    isPlaying( eventId: string ): Promise<boolean>;

    listLoadedBankPaths(): Promise<string[]>;
}
