import { FmodEvent, FmodPlayer, FmodZeromqApi } from '../../index';
import { ILogger } from '../../api/i-logger';

// begin-template

export class CLASSNAME extends FmodPlayer {

    events: FmodEvent[] = [];

    constructor( api: FmodZeromqApi, bankDir: string, logger?: ILogger ) {
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
