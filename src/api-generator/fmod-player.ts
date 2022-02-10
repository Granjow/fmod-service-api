import { FmodZeromqApi } from '../api/fmod-zeromq-api';
import { FmodBank, FmodEvent, IRequireBank } from './fmod-types';
import { TypedEmitter } from 'tiny-typed-emitter';


export interface FmodPlayerEvents {
    init: () => void;
}

export abstract class FmodPlayer extends TypedEmitter<FmodPlayerEvents> implements IRequireBank {
    protected readonly _banks: FmodBank;
    protected readonly _api: FmodZeromqApi;

    abstract readonly events: FmodEvent[];

    private _initCalled = false;
    private readonly _loadedBanks: Set<string> = new Set();

    protected constructor( api: FmodZeromqApi, bankDir: string ) {
        super();
        this._api = api;
        this._banks = new FmodBank( bankDir );
    }

    init(): void {
        if ( this._initCalled ) throw new Error( 'init() already called' );
        this._initCalled = true;

        console.log( 'Initialising FMOD Player' );
        for ( const event of this.events ) {
            event.init( this._api, this );
        }

        console.log( 'Connecting to FMOD and loading banks' );
        this._api.connect();

        this._api.once( 'connect', async () => {
            await this._api.loadBank( this._banks.masterBankPath );
            await this._api.loadBank( this._banks.masterStringsBankPath );
            this.emit( 'init' );
        } );
    }

    async ensureBankLoaded( bankName: string ): Promise<void> {
        if ( this._loadedBanks.has( bankName ) ) {
            return;
        }
        console.log( `Bank ${bankName} not loaded, loading now` );
        await this._api.loadBank( this._banks.bankPath( bankName ) );
        this._loadedBanks.add( bankName );
    }
}
