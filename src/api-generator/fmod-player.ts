import { FmodZeromqApi } from '../api/fmod-zeromq-api';
import { FmodBank } from './fmod-types';
import { TypedEmitter } from 'tiny-typed-emitter';
import { ILogger } from '../api/i-logger';
import { IRequireBank } from './ports/i-require-bank';
import { FmodEvent } from './fmod-event';


export interface FmodPlayerEvents {
    init: () => void;
}

export abstract class FmodPlayer extends TypedEmitter<FmodPlayerEvents> implements IRequireBank {
    protected readonly _banks: FmodBank;
    protected readonly _api: FmodZeromqApi;

    abstract readonly events: FmodEvent[];

    private _initCalled = false;
    private _language: string | undefined;
    private _defaultLanguage: string | undefined;
    private readonly _logger: ILogger | undefined;
    private readonly _loadedBanks: Set<string> = new Set();
    private readonly _localisedBanks: Set<string> = new Set();
    private readonly _languages: Set<string> = new Set();
    private readonly _eventsByName: Map<string, FmodEvent> = new Map();

    protected constructor( api: FmodZeromqApi, bankDir: string, logger?: ILogger ) {
        super();
        this._api = api;
        this._logger = logger;
        this._banks = new FmodBank( bankDir );
    }

    init(): void {
        if ( this._initCalled ) throw new Error( 'init() already called' );
        this._initCalled = true;

        this._logger?.info( 'Initialising FMOD Player' );
        for ( const event of this.events ) {
            event.init( this._api, this );
        }

        this._logger?.info( 'Connecting to FMOD and loading banks' );
        this._api.connect();

        this._api.once( 'connect', () => this.initBanks() );

        this._api.on( 'reconnect', () => this.handleReconnect() );
    }

    async ensureBankLoaded( bankName: string ): Promise<void> {
        if ( this._loadedBanks.has( bankName ) ) {
            return;
        }

        let bankToLoad = bankName;
        if ( this._localisedBanks.has( bankName ) && this._language !== undefined ) {
            bankToLoad = this._banks.localisedBankName( bankName, this._language );
        }

        this._logger?.info( `Bank ${bankName} not loaded, loading now` );
        try {
            await this._api.loadBank( this._banks.bankPath( bankToLoad ) );
        } catch ( err: any ) {
            if ( err?.message.indexOf( 'FMOD Exception 70' ) >= 0 ) {

                if ( this._localisedBanks.has( bankName ) && this._language !== undefined ) {

                    // When initialising, localised banks are loaded. If a localised bank is already loaded in the service,
                    // we don't know which language was loaded, so try to unload all languages and then load the desired one.
                    for ( const lang of Array.from( this._languages ) ) {
                        try {
                            await this._api.unloadBank( this._banks.localisedBankPath( bankName, lang ) );
                        } catch ( err ) {
                            this._logger?.warn( err );
                        }
                    }
                    await this._api.loadBank( this._banks.bankPath( bankToLoad ) );

                } else {

                    // No issue, bank is loaded already, nothing more to do.
                    this._logger?.debug( `Bank ${bankName} is already loaded.` );
                }
            }
        }
        this._loadedBanks.add( bankName );
    }

    /**
     * Returns the current language, if localisation is enabled, and undefined otherwise.
     */
    get currentLanguage(): string | undefined {
        return this._language;
    }

    async ensureBankUnloaded( bankName: string, force: boolean ): Promise<void> {
        if ( this._loadedBanks.has( bankName ) || force ) {


            let bankToUnload = bankName;
            if ( this._language !== undefined ) {
                bankToUnload = this._banks.localisedBankName( bankName, this._language );
            }

            await this._api.unloadBank( this._banks.bankPath( bankToUnload ) );
            this._loadedBanks.delete( bankName );
        }
    }

    configureLocalisation( bankNames: string[], languages: string[], currentLanguage: string ): void {
        if ( this._initCalled ) throw new Error( 'Localisation must be configured before initialisation.' );
        if ( currentLanguage === undefined ) throw new Error( 'Initial language must be provided.' );
        if ( languages.indexOf( currentLanguage ) < 0 ) throw new Error( 'Initial language must be a valid language.' );

        bankNames.forEach( ( bankName ) => this._localisedBanks.add( bankName ) );
        languages.forEach( language => this._languages.add( language ) );
        this._defaultLanguage = currentLanguage;
    }

    /**
     * Set a new language. The language must have been configured in the localisation setup.
     *
     * Loading a new language causes localised banks to be unloaded in the previous language
     * and reloaded in the new language.
     */
    async setLanguage( language: string ): Promise<void> {
        if ( !this._languages.has( language ) ) throw new Error( `Invalid language ${language}, not configured.` );

        if ( this._language !== language ) {

            const banksToReload: string[] = [];

            for ( const bank of this._loadedBanks ) {
                if ( this._localisedBanks.has( bank ) ) {
                    banksToReload.push( bank );
                    await this.ensureBankUnloaded( bank, true );
                }
            }

            this._language = language;
            for ( const bankToReload of banksToReload ) {
                await this.ensureBankLoaded( bankToReload );
            }
        }

    }

    getEvent( eventName: string ): FmodEvent {
        const event = this._eventsByName.get( eventName );
        if ( event === undefined ) {
            throw new Error( `Event ${eventName} is not registered.` );
        }
        return event;
    }

    protected registerEvent( event: FmodEvent ): void {
        if ( this._eventsByName.has( event.eventName ) ) throw new Error( `Event ${event.eventName} is already registered.` );

        this._eventsByName.set( event.eventName, event );
    }

    private async initBanks(): Promise<void> {
        await this.ensureBankLoaded( 'Master' );
        await this.ensureBankLoaded( 'Master.strings' );

        if ( this._defaultLanguage !== undefined ) {
            await this.setLanguage( this._defaultLanguage );
        }

        this.emit( 'init' );
    }

    private async handleReconnect(): Promise<void> {
        this._logger?.warn( `Reconnected. Resetting loaded banks and initialising banks again.` );
        this._loadedBanks.clear();
        await this.initBanks();
    }
}
