import { FmodEvent, ILogger } from '../../index';
import { FmodEventType } from '../interfaces/fmod-event-type';

const EVENT_TYPE = FmodEventType.event;

// begin-template
class CLASSNAME extends FmodEvent {

    constructor( logger?: ILogger ) {
        super( 'EVENT_NAME', 'BANK_NAME', [ 'ADDITIONAL_BANKS' ], EVENT_TYPE, logger );
        // CONSTRUCTOR
        this.params.push( ...[
            // PARAM_LIST
        ] );
    }

    // PARAM_DEF
}

// end-template
