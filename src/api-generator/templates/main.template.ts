import { FmodPlayer } from '../../index';
import { ILogger } from '../../api/i-logger';
import { IFmodApi } from '../../ports/i-fmod-api';
import { IFmodProject } from '../interfaces/fmod-interfaces';

// begin-template

export class CLASSNAME extends FmodPlayer {

    // RAW_PROJECT_DATA

    constructor( api: IFmodApi, bankDir: string, logger?: ILogger ) {
        super( api, bankDir, logger );
        // CONSTRUCTOR
        // LOCALISE
    }

    globalParameters = {
        // GLOBAL_PARAMS
    };

    // EVENT_DEF
}

// end-template
