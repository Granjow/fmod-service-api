import { IConnect, IConnectEvents } from './i-connect';
import { IControlFmod } from './i-control-fmod';
import { IConfigureLogging } from './i-configure-logging';

export interface IFmodApi extends IControlFmod, IConnect, IConnectEvents, IConfigureLogging {
}
