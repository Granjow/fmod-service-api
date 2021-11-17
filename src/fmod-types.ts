import { IBank } from './ports/i-manage-events';
import { FmodZeromqApi } from './fmod-zeromq-api';

export interface IRequireBank {
    ensureBankLoaded( bankName: string ): Promise<void>;
}

export class FmodBank implements IBank {

    private readonly _bankDir: string;

    constructor( bankDir: string ) {
        this._bankDir = bankDir;
    }

    get masterBankPath(): string {
        return this.bankPath( 'Master' );
    }

    get masterStringsBankPath(): string {
        return this.bankPath( 'Master.strings' );
    }

    bankPath( bankName: string ): string {
        return `${this._bankDir}/${bankName}.bank`;
    }

}

export abstract class FmodPlayer implements IRequireBank {
    protected readonly _banks: FmodBank;
    protected readonly _api: FmodZeromqApi;

    abstract readonly events: FmodEvent[];

    private readonly _loadedBanks: Set<string> = new Set();

    protected constructor( api: FmodZeromqApi, bankDir: string ) {
        this._api = api;
        this._banks = new FmodBank( bankDir );
    }

    async init(): Promise<void> {
        console.log( 'Initialising FMOD Player' );
        for ( const event of this.events ) {
            event.init( this._api, this );
        }

        console.log( 'Connecting to FMOD and loading banks' );
        await this._api.connect();
        await this._api.loadBank( this._banks.masterBankPath );
        await this._api.loadBank( this._banks.masterStringsBankPath );
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

export class FmodEvent {
    public readonly id: string
    public readonly bankName: string;

    private _api: FmodZeromqApi | undefined;
    private _bankLoader: IRequireBank | undefined;

    // Add parameters which should be initialised here
    public readonly params: FmodParameter[] = [];

    constructor( name: string, bankName: string ) {
        this.id = `event:/${name}`;
        this.bankName = bankName;
    }

    init( api: FmodZeromqApi, bankLoader: IRequireBank ): void {
        console.log( `Initialising event ${this.id}` );
        this._api = api;
        this._bankLoader = bankLoader;
        for ( const param of this.params ) {
            console.log( `- Initialising parameter ${param.name}` );
            param.init( this.id, api );
        }
    }

    get api(): FmodZeromqApi {
        if ( this._api === undefined ) {
            throw new Error( 'API not initialised yet.' );
        }
        return this._api;
    }

    async play(): Promise<void> {
        await this.ensureBankLoaded();
        return this.api.play( this.id );
    }

    async start(): Promise<void> {
        await this.ensureBankLoaded();
        return this.api.start( this.id );
    }

    stop(): Promise<void> {
        return this.api.stop( this.id );
    }

    private ensureBankLoaded(): Promise<void> {
        if ( this._bankLoader === undefined ) throw new Error( `Bank loader not initialised on event ${this.id}` );

        return this._bankLoader.ensureBankLoaded( this.bankName );
    }
}

export class FmodParameter {
    private _api: FmodZeromqApi | undefined;

    constructor( public name: string, public readonly eventId: string ) {
    }

    init( eventId: string, api: FmodZeromqApi ): void {
        this._api = api;
    }

    setValue( value: number ): Promise<void> {
        if ( this._api === undefined || this.eventId === undefined ) throw new Error( 'Not initialised yet' );
        return this._api.setParameter( this.eventId, this.name, value );
    }
}

export interface Param {
    name: string;
    type: 'continuous' | 'labeled';
}

export interface ContinuousParam extends Param {
    type: 'continuous';
    min: number;
    max: number;
}

export interface ParamLabel {
    name: string;
    value: number;
}

export interface LabeledParam extends Param {
    type: 'labeled';
    labels: ParamLabel[];
}

export interface Event {
    name: string;
    params: ( ContinuousParam | LabeledParam )[];
}

export interface Bank {
    bankName: string;
    events: Event[];
}

export class ContinuousParameter extends FmodParameter {
    constructor( parameterName: string, eventId: string ) {
        super( parameterName, eventId );
    }
}

export class LabeledParameter<TLabel extends string> extends FmodParameter {
    constructor( parameterName: string, eventId: string ) {
        super( parameterName, eventId );
    }

    setLabel( label: TLabel ): Promise<void> {
        return this.setValue( 0 );
    }
}
