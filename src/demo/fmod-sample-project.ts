import { FmodZeromqApi, ContinuousParameter, FmodEvent, FmodPlayer, LabeledParameter } from '../index';
import { ILogger } from '../index';


export class FmodSampleProject extends FmodPlayer {

    events: FmodEvent[] = [];

    constructor( api: FmodZeromqApi, bankDir: string, logger?: ILogger ) {
        super( api, bankDir, logger );
        this.musicLevel01 = new MusicLevel01();
        this['Music/Level 01'] = this.musicLevel01;
        this.musicLevel02 = new MusicLevel02();
        this['Music/Level 02'] = this.musicLevel02;
        this.uiCancel = new UiCancel();
        this['UI/Cancel'] = this.uiCancel;
        this.events.push( ...[
            this.musicLevel01,
            this.musicLevel02,
            this.uiCancel,
        ] );
        // (no localisation)
    }

    musicLevel01: MusicLevel01;
    'Music/Level 01': MusicLevel01;
    musicLevel02: MusicLevel02;
    'Music/Level 02': MusicLevel02;
    uiCancel: UiCancel;
    'UI/Cancel': UiCancel;
}


export class MusicLevel01Stinger extends ContinuousParameter {
    constructor() {
        super( 'Stinger', 'event:/Music/Level 01' );
    }
}


// Parameter labels for MusicLevel01Progression
const MusicLevel01ProgressionLabels = {
    'Intro': 0,
    'Main': 1,
};

class MusicLevel01Progression extends LabeledParameter<keyof ( typeof MusicLevel01ProgressionLabels )> {
    constructor() {
        super( 'Progression', 'event:/Music/Level 01', MusicLevel01ProgressionLabels );
    }
}


class MusicLevel01 extends FmodEvent {

    constructor() {
        super( 'Music/Level 01', 'Music' );
        this.stinger = new MusicLevel01Stinger();
        this['Stinger'] = this.stinger;
        this.progression = new MusicLevel01Progression();
        this['Progression'] = this.progression;
        this.params.push( ...[
            this.stinger,
            this.progression,
        ] );
    }

    stinger: MusicLevel01Stinger;
    'Stinger': MusicLevel01Stinger;
    progression: MusicLevel01Progression;
    'Progression': MusicLevel01Progression;
}


export class MusicLevel02Area extends ContinuousParameter {
    constructor() {
        super( 'Area', 'event:/Music/Level 02' );
    }
}


class MusicLevel02 extends FmodEvent {

    constructor() {
        super( 'Music/Level 02', 'Music' );
        this.area = new MusicLevel02Area();
        this['Area'] = this.area;
        this.params.push( ...[
            this.area,
        ] );
    }

    area: MusicLevel02Area;
    'Area': MusicLevel02Area;
}


class UiCancel extends FmodEvent {

    constructor() {
        super( 'UI/Cancel', 'SFX' );
        // Nothing to construct
        this.params.push( ...[
            // No Parameters
        ] );
    }

    // No definitions
}
