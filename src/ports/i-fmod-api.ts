import { IConnect, IConnectEvents } from './i-connect';
import { IControlFmod } from './i-control-fmod';

export interface IFmodApi extends IControlFmod, IConnect, IConnectEvents {
}
