import { LabeledParameter } from '../../index';

// begin-template
// Parameter labels for CLASSNAME
const CLASSNAMELabels = {
    // LABELS
};

class CLASSNAME extends LabeledParameter<keyof ( typeof CLASSNAMELabels )> {
    constructor() {
        super( 'PARAM_NAME', 'EVENT_ID', CLASSNAMELabels );
    }
}

// end-template
