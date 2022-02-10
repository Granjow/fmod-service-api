export interface IFmodParam {
    name: string;
    type: 'continuous' | 'labeled';
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
    params: FmodParamType[];
}

export interface IFmodBank {
    bankName: string;
    events: IFmodEvent[];
}
