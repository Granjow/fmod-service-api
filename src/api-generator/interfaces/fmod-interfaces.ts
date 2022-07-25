import { FmodEventType } from './fmod-event-type';

export interface IFmodParam {
    name: string;
    type: 'continuous' | 'labeled';
    defaultValue?: number;
}

export interface ContinuousParam extends IFmodParam {
    type: 'continuous';
    min: number;
    max: number;
}

export interface ParamLabel {
    name: string;
    value: number;
}

export interface LabeledParam extends IFmodParam {
    type: 'labeled';
    labels: ParamLabel[];
}

export type FmodParamType = ContinuousParam | LabeledParam;

export interface IFmodEvent {
    name: string;
    eventType?: FmodEventType;
    params: FmodParamType[];
    requiresOtherBanks?: string[];
}

export interface IFmodBank {
    bankName: string;
    localised?: boolean;
    events: IFmodEvent[];
}

export interface ILocalisationData {
    languages: string[];
    defaultLanguage: string;
}

export interface IFmodProject {
    localisation?: ILocalisationData;
    banks: IFmodBank[];
    globalParameters?: IFmodParam[]
}
