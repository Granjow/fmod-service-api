import { FmodEvent, FmodPlayer } from '../../index';
import { ILogger } from '../../api/i-logger';
import { IFmodApi } from '../../ports/i-fmod-api';

// begin-template

export class CLASSNAME extends FmodPlayer {

    constructor( api: IFmodApi, bankDir: string, logger?: ILogger ) {
        super( api, bankDir, logger );
        // CONSTRUCTOR
        // LOCALISE
    }

    // EVENT_DEF
}

// end-template
