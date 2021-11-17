import { LabeledParameter } from '../fmod-types';

// begin-template
const CLASSNAMELabels = {
    // LABELS
};

class CLASSNAME extends LabeledParameter<keyof ( typeof CLASSNAMELabels )> {
    constructor() {
        super( 'PARAM_NAME', 'EVENT_ID' );
    }
}

// end-template
