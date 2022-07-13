// begin-template
import { ContinuousParameter, FmodEvent, FmodEventType, FmodPlayer, LabeledParameter } from '../../index';
import { ILogger } from '../../api/i-logger';
import { IFmodApi } from '../../ports/i-fmod-api';
// end-template

// Import all used classes in order to satisfy TypeScript
const cp: ContinuousParameter | undefined = undefined;
const lp: LabeledParameter<any> | undefined = undefined;
const fe: FmodEvent | undefined = undefined;
// const fza: FmodZeromqApi | undefined = undefined;
const fpl: FmodPlayer | undefined = undefined;
const logger: ILogger | undefined = undefined;
const iApi: IFmodApi | undefined = undefined;
const x = FmodEventType.event;
