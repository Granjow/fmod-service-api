import { FmodZeromqApi } from './fmod-zeromq-api';
import { ContinuousParameter, FmodEvent, FmodPlayer, LabeledParameter } from './fmod-types';


export class FmodExample extends FmodPlayer {

    events: FmodEvent[] = [];

    constructor( api: FmodZeromqApi, bankDir: string ) {
        super( api, bankDir );
        this.musicLevel01 = new MusicLevel01();
        this.uiCancel = new UiCancel();
        this.events.push( ...[
            this.musicLevel01,
            this.uiCancel,
        ] );
    }

    musicLevel01: MusicLevel01;
    uiCancel: UiCancel;
}


export class Stinger extends ContinuousParameter {
    constructor() {
        super( 'Stinger', 'event:/Music/Level 01' );
    }
}


const ProgressionLabels = {
    'Intro': 0,
    'Main': 1,
};

class Progression extends LabeledParameter<keyof ( typeof ProgressionLabels )> {
    constructor() {
        super( 'Progression', 'event:/Music/Level 01' );
    }
}


class MusicLevel01 extends FmodEvent {

    constructor() {
        super( 'Music/Level 01', 'Music' );
        this.stinger = new Stinger();
        this.progression = new Progression();
        this.params.push( ...[
            this.stinger,
            this.progression,
        ] );
    }

    stinger: Stinger;
    progression: Progression;
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
