import { FmodEvent, FmodPlayer } from '../../index';
import { ILogger } from '../../api/i-logger';
import { IFmodApi } from '../../ports/i-fmod-api';

// begin-template

export class CLASSNAME extends FmodPlayer {

    events: FmodEvent[] = [];

    constructor( api: IFmodApi, bankDir: string, logger?: ILogger ) {
        super( api, bankDir, logger );
        // CONSTRUCTOR
        this.events.push( ...[
            // EVENT_LIST
        ] );
        // LOCALISE
    }

    // EVENT_DEF
}

// end-template
