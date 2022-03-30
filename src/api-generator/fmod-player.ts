import { FmodZeromqApi } from '../api/fmod-zeromq-api';
import { FmodBank } from './fmod-types';
import { TypedEmitter } from 'tiny-typed-emitter';
import { ILogger } from '../api/i-logger';
import { IRequireBank } from './ports/i-require-bank';
import { FmodEvent } from './fmod-event';


export interface FmodPlayerEvents {
    init: () => void;
    reconnect: () => void;
}

interface LoadedBankInfo {
    bankName: string;
    isLocalised: boolean;
    loadedLanguage: undefined | string;
}

export abstract class FmodPlayer extends TypedEmitter<FmodPlayerEvents> implements IRequireBank {
    protected readonly _banks: FmodBank;
    protected readonly _api: FmodZeromqApi;

    abstract readonly events: FmodEvent[];

    private _initCalled = false;
    private _firstConnection = true;
    private _currentLanguage: string | undefined;
    private _defaultLanguage: string | undefined;
    private readonly _logger: ILogger | undefined;

    private readonly _loadedBanksByName: Map<string, LoadedBankInfo> = new Map();

    private readonly _localisedBanks: Set<string> = new Set();
    private readonly _languages: Set<string> = new Set();
    private readonly _eventsByName: Map<string, FmodEvent> = new Map();

    protected constructor( api: FmodZeromqApi, bankDir: string, logger?: ILogger ) {
        super();
        this._api = api;
        this._logger = logger;
        this._banks = new FmodBank( bankDir );
    }

    /**
     * Returns the current language, if localisation is enabled, and undefined otherwise.
     */
    get currentLanguage(): string | undefined {
        return this._currentLanguage;
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
        if ( this._loadedBanksByName.has( bankName ) ) {
            return;
        }

        let bankToLoad = bankName;
        const isLocalised = this.isLocalisedBank( bankName );
        if ( isLocalised ) {
            if ( this._currentLanguage === undefined ) {
                throw new Error( `Language not initialised!` );
            }
            bankToLoad = this._banks.localisedBankName( bankName, this._currentLanguage );
        }

        this._logger?.info( `Bank ${bankName} not loaded, loading ${isLocalised ? 'localised ' : ''}bank ${bankToLoad} now` );
        try {
            await this._api.loadBank( this._banks.bankPath( bankToLoad ) );
        } catch ( err: any ) {
            if ( err?.message.indexOf( 'FMOD Exception 70' ) >= 0 ) {
                // No issue, bank is loaded already, nothing more to do.
                this._logger?.debug( `Bank ${bankName} is already loaded.` );
            } else {
                throw err;
            }
        }

        this._loadedBanksByName.set( bankName, { bankName, isLocalised, loadedLanguage: this._currentLanguage } );
    }

    async ensureBankUnloaded( bankName: string, force: boolean ): Promise<void> {
        if ( !this._loadedBanksByName.has( bankName ) && !force ) {
            return;
        }

        const isLocalisedBank = this.isLocalisedBank( bankName );
        if ( this.isLocalisedBank( bankName ) ) {
            const bankInfo = this._loadedBanksByName.get( bankName );

            // If we know what language is loaded, unload it.
            // If not, any could be loaded, so unload all.
            if ( bankInfo?.loadedLanguage !== undefined ) {
                this._logger?.debug( `Unloading localised bank ${bankName} in language ${bankInfo.loadedLanguage}` );
                await this._api.unloadBank( this._banks.localisedBankPath( bankName, bankInfo.loadedLanguage ) );
            } else {
                this._logger?.debug( `Unloading all localised banks for ${bankName} because currently loaded language is unknown` );
                for ( const lang of this._languages ) {
                    this._logger?.debug( `Unloading localised bank ${bankName} in language ${lang}` );
                    await this._api.unloadBank( this._banks.localisedBankPath( bankName, lang ) );
                }
            }
        } else {
            this._logger?.debug( `Unloading non-localised bank ${bankName}` );
            await this._api.unloadBank( this._banks.bankPath( bankName ) );
        }

        this._loadedBanksByName.delete( bankName );
    }

    configureLocalisation( bankNames: string[], languages: string[], initialLanguage: string ): void {
        if ( this._initCalled ) throw new Error( 'Localisation must be configured before initialisation.' );
        if ( initialLanguage === undefined ) throw new Error( 'Initial language must be provided.' );
        if ( languages.indexOf( initialLanguage ) < 0 ) throw new Error( 'Initial language must be a valid language.' );

        bankNames.forEach( ( bankName ) => this._localisedBanks.add( bankName ) );
        languages.forEach( language => this._languages.add( language ) );
        this._defaultLanguage = initialLanguage;
    }

    /**
     * Set a new language. The language must have been configured in the localisation setup.
     *
     * Loading a new language causes localised banks to be unloaded in the previous language
     * and reloaded in the new language.
     */
    async setLanguage( language: string ): Promise<void> {
        if ( !this._languages.has( language ) ) throw new Error( `Invalid language ${language}, not configured.` );

        this._currentLanguage = language;

        for ( const [ bankName, bankInfo ] of this._loadedBanksByName.entries() ) {
            if ( bankInfo.isLocalised ) {
                if ( bankInfo.loadedLanguage !== language ) {
                    this._logger?.debug( `Unloading bank ${bankName} because its language is ${bankInfo.loadedLanguage ?? 'unknown'}` );
                    await this.ensureBankUnloaded( bankName, true );

                    await this.ensureBankLoaded( bankName );
                }
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
        this._loadedBanksByName.clear();
        const loadedBanks = await this._api.listLoadedBankPaths();

        for ( const bankName of loadedBanks ) {
            // If a bank is localised, we don't know which one is currently loaded
            // as they all have the same path.
            this._loadedBanksByName.set( bankName, {
                bankName,
                isLocalised: this.isLocalisedBank( bankName ),
                loadedLanguage: undefined,
            } );
        }

        // Master banks always have to be loaded.
        await this.ensureBankLoaded( 'Master' );
        await this.ensureBankLoaded( 'Master.strings' );

        if ( this._defaultLanguage !== undefined ) {
            await this.setLanguage( this._defaultLanguage );
        }

        if ( this._firstConnection ) {
            this._firstConnection = false;
            setImmediate( () => this.emit( 'init' ) );
        } else {
            setImmediate( () => this.emit( 'reconnect' ) );
        }
    }

    private async handleReconnect(): Promise<void> {
        this._logger?.warn( `Reconnected. Resetting loaded banks and initialising banks again.` );
        this._currentLanguage = undefined;
        await this.initBanks();
    }

    private isLocalisedBank( bankName: string ): boolean {
        return this._localisedBanks.has( bankName );
    }
}
