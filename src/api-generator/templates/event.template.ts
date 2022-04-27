import { FmodEvent, ILogger } from '../../index';

// begin-template
class CLASSNAME extends FmodEvent {

    constructor( logger?: ILogger ) {
        super( 'EVENT_NAME', 'BANK_NAME', [ 'ADDITIONAL_BANKS' ], logger );
        // CONSTRUCTOR
        this.params.push( ...[
            // PARAM_LIST
        ] );
    }

    // PARAM_DEF
}

// end-template
