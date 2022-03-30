import { IBank } from '../ports/i-manage-events';
import { FmodZeromqApi } from '../api/fmod-zeromq-api';
import { IRequireBank } from './ports/i-require-bank';


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

    localisedBankName( bankName: string, languageCode: string ): string {
        return `${bankName}_${languageCode}`;
    }

    localisedBankPath( bankName: string, languageCode: string ): string {
        return `${this._bankDir}/${this.localisedBankName( bankName, languageCode )}.bank`;
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

export class ContinuousParameter extends FmodParameter {
    constructor( parameterName: string, eventId: string ) {
        super( parameterName, eventId );
    }
}

export class LabeledParameter<TLabel extends string> extends FmodParameter {

    private readonly _labels: Record<TLabel, number>;

    constructor( parameterName: string, eventId: string, labels: Record<TLabel, number> ) {
        super( parameterName, eventId );
        this._labels = labels;
    }

    setLabel( label: TLabel ): Promise<void> {
        return this.setValue( this._labels[ label ] );
    }
}
