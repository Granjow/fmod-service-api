import { FmodZeromqApi } from '../api/fmod-zeromq-api';
import { FmodBank, FmodEvent, IRequireBank } from './fmod-types';
import { TypedEmitter } from 'tiny-typed-emitter';
import { ILogger } from '../api/i-logger';


export interface FmodPlayerEvents {
    init: () => void;
}

export abstract class FmodPlayer extends TypedEmitter<FmodPlayerEvents> implements IRequireBank {
    protected readonly _banks: FmodBank;
    protected readonly _api: FmodZeromqApi;

    abstract readonly events: FmodEvent[];

    private _initCalled = false;
    private readonly _logger: ILogger | undefined;
    private readonly _loadedBanks: Set<string> = new Set();

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
        this._logger?.info( `Bank ${bankName} not loaded, loading now` );
        await this._api.loadBank( this._banks.bankPath( bankName ) );
        this._loadedBanks.add( bankName );
    }

    private async initBanks(): Promise<void> {
        await this._api.loadBank( this._banks.masterBankPath );
        await this._api.loadBank( this._banks.masterStringsBankPath );
        this.emit( 'init' );
    }

    private async handleReconnect(): Promise<void> {
        this._logger?.warn( `Reconnected. Resetting loaded banks and initialising banks again.` );
        this._loadedBanks.clear();
        await this.initBanks();
    }
}
