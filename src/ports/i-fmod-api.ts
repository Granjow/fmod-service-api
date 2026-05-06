import { IConnect, IConnectEvents } from './i-connect';
import { IControlFmod } from './i-control-fmod';
import { IConfigureLogging } from './i-configure-logging';
import { MarkerData } from '../api/marker-data';

export interface IFmodApi extends IControlFmod, IConnect, IConnectEvents, IConfigureLogging {
    onMarker( cb: ( data: MarkerData ) => void ): void;
    offMarker( cb: ( data: MarkerData ) => void ): void;
}
