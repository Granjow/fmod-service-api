import { FmodZeromqApi, ContinuousParameter, FmodEvent, FmodPlayer, LabeledParameter } from '../index';


export class FmodExample extends FmodPlayer {

    events: FmodEvent[] = [];

    constructor( api: FmodZeromqApi, bankDir: string ) {
        super( api, bankDir );
        this.musicLevel01 = new MusicLevel01();
        this.musicUeberLevel02 = new MusicUeberLevel02();
        this.uiCancel = new UiCancel();
        this.events.push( ...[
            this.musicLevel01,
            this.musicUeberLevel02,
            this.uiCancel,
        ] );
    }

    musicLevel01: MusicLevel01;
    musicUeberLevel02: MusicUeberLevel02;
    uiCancel: UiCancel;
}


export class MusicLevel01UeberStinger extends ContinuousParameter {
    constructor() {
        super( 'ÜberStinger', 'event:/Music/Level 01' );
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
        this.ueberStinger = new MusicLevel01UeberStinger();
        this.progression = new MusicLevel01Progression();
        this.params.push( ...[
            this.ueberStinger,
            this.progression,
        ] );
    }

    ueberStinger: MusicLevel01UeberStinger;
    progression: MusicLevel01Progression;
}


// Parameter labels for MusicUeberLevel02Progression
const MusicUeberLevel02ProgressionLabels = {
    'Intro': 0,
    'Äxtra': 1,
};

class MusicUeberLevel02Progression extends LabeledParameter<keyof ( typeof MusicUeberLevel02ProgressionLabels )> {
    constructor() {
        super( 'Progression', 'event:/Music/ÜberLevel 02', MusicUeberLevel02ProgressionLabels );
    }
}


class MusicUeberLevel02 extends FmodEvent {

    constructor() {
        super( 'Music/ÜberLevel 02', 'Music' );
        this.progression = new MusicUeberLevel02Progression();
        this.params.push( ...[
            this.progression,
        ] );
    }

    progression: MusicUeberLevel02Progression;
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
