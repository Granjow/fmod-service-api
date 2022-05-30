import { LabeledParameter } from '../../index';

declare const DEFAULT_VALUE: number;

// begin-template
// Parameter labels for CLASSNAME
const CLASSNAMELabels = {
    // LABELS
};

class CLASSNAME extends LabeledParameter<keyof ( typeof CLASSNAMELabels )> {
    constructor() {
        super( 'PARAM_NAME', 'EVENT_ID', CLASSNAMELabels, DEFAULT_VALUE );
    }
}

// end-template
