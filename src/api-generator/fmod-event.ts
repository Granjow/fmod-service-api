import { IRequireBank } from './ports/i-require-bank';
import { FmodParameter } from './fmod-types';
import { IFmodApi } from '../ports/i-fmod-api';
import { ILogger } from '../api/i-logger';
import { FmodEventType } from './interfaces/fmod-event-type';

export class FmodEvent {
    public readonly id: string;
    public readonly eventName: string;
    public readonly bankName: string;
    public readonly additionalBankRequirements: string[];

    private readonly _logger: ILogger | undefined;

    private _api: IFmodApi | undefined;
    private _bankLoader: IRequireBank | undefined;
    private readonly _eventType: FmodEventType;

    // Add parameters which should be initialised here
    public readonly params: FmodParameter[] = [];

    constructor( name: string, bankName: string, additionalBankRequirements: string[], eventType: FmodEventType, logger?: ILogger ) {
        this.id = `${eventType}:/${name}`;
        this._logger = logger;
        this._eventType = eventType;
        this.eventName = name;
        this.bankName = bankName;
        this.additionalBankRequirements = additionalBankRequirements;
    }

    init( api: IFmodApi, bankLoader: IRequireBank ): void {
        this._logger?.debug( `Initialising event ${this.id}` );
        this._api = api;
        this._bankLoader = bankLoader;
        for ( const param of this.params ) {
            this._logger?.debug( `- Initialising parameter ${param.name}` );
            param.init( this.id, api );
        }
    }

    get api(): IFmodApi {
        if ( this._api === undefined ) {
            throw new Error( 'API not initialised yet.' );
        }
        return this._api;
    }

    get eventType(): FmodEventType {
        return this._eventType;
    }

    async play(): Promise<void> {
        if ( this._eventType === FmodEventType.snapshot ) {
            throw new Error( `${this.id} is a snapshot and should be start()ed/stop()ped.` );
        }
        await this.ensureBankLoaded();
        return this.api.play( this.id );
    }

    async playVoice( voiceKey: string ): Promise<void> {
        await this.ensureBankLoaded();
        return this.api.playVoice( this.id, voiceKey );
    }

    async start(): Promise<void> {
        // TODO Support restart from beginning
        await this.ensureBankLoaded();
        return this.api.start( this.id );
    }

    stop(): Promise<void> {
        return this.api.stop( this.id );
    }

    private async ensureBankLoaded(): Promise<void> {
        if ( this._bankLoader === undefined ) throw new Error( `Bank loader not initialised on event ${this.id}` );

        await this._bankLoader.ensureBankLoaded( this.bankName );
        for ( const additionalBank of this.additionalBankRequirements ) {
            await this._bankLoader.ensureBankLoaded( additionalBank );
        }
    }
}
