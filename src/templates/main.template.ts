import { FmodZeromqApi } from '../fmod-zeromq-api';
import { FmodEvent, FmodPlayer } from '../fmod-types';

// begin-template

export class CLASSNAME extends FmodPlayer {

    events: FmodEvent[] = [];

    constructor( api: FmodZeromqApi, bankDir: string ) {
        super( api, bankDir );
        // CONSTRUCTOR
        this.events.push( ...[
            // EVENT_LIST
        ] );
    }

    // EVENT_DEF
}

// end-template
