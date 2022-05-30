import { ContinuousParameter, FmodEvent, FmodPlayer, LabeledParameter } from '../index';
import { ILogger } from '../index';
import { IFmodApi } from '../index';


export class TestProject extends FmodPlayer {

    constructor( api: IFmodApi, bankDir: string, logger?: ILogger ) {
        super( api, bankDir, logger );
        this.musicLevel01 = new MusicLevel01( logger );
        this['Music/Level 01'] = this.musicLevel01;
        this.musicUeberLevel02 = new MusicUeberLevel02( logger );
        this['Music/ÜberLevel 02'] = this.musicUeberLevel02;
        this.uiCancel = new UiCancel( logger );
        this['UI/Cancel'] = this.uiCancel;
        this.registerEvent( this.musicLevel01 );
        this.registerEvent( this.musicUeberLevel02 );
        this.registerEvent( this.uiCancel );
        this.configureLocalisation( [ 'SFX' ], [ 'en', 'de' ], 'de' );
    }

    musicLevel01: MusicLevel01;
    'Music/Level 01': MusicLevel01;
    musicUeberLevel02: MusicUeberLevel02;
    'Music/ÜberLevel 02': MusicUeberLevel02;
    uiCancel: UiCancel;
    'UI/Cancel': UiCancel;
}


export class MusicLevel01UeberStinger extends ContinuousParameter {
    constructor() {
        super( 'ÜberStinger', 'event:/Music/Level 01', 0 );
    }
}


// Parameter labels for MusicLevel01Progression
const MusicLevel01ProgressionLabels = {
    'Intro': 0,
    'Main': 1,
};

class MusicLevel01Progression extends LabeledParameter<keyof ( typeof MusicLevel01ProgressionLabels )> {
    constructor() {
        super( 'Progression', 'event:/Music/Level 01', MusicLevel01ProgressionLabels, 0 );
    }
}


class MusicLevel01 extends FmodEvent {

    constructor( logger?: ILogger ) {
        super( 'Music/Level 01', 'Music', [  ], logger );
        this.ueberStinger = new MusicLevel01UeberStinger();
        this['ÜberStinger'] = this.ueberStinger;
        this.progression = new MusicLevel01Progression();
        this['Progression'] = this.progression;
        this.params.push( ...[
            this.ueberStinger,
            this.progression,
        ] );
    }

    ueberStinger: MusicLevel01UeberStinger;
    'ÜberStinger': MusicLevel01UeberStinger;
    progression: MusicLevel01Progression;
    'Progression': MusicLevel01Progression;
}


// Parameter labels for MusicUeberLevel02Progression
const MusicUeberLevel02ProgressionLabels = {
    'Intro': 0,
    'Äxtra': 1,
};

class MusicUeberLevel02Progression extends LabeledParameter<keyof ( typeof MusicUeberLevel02ProgressionLabels )> {
    constructor() {
        super( 'Progression', 'event:/Music/ÜberLevel 02', MusicUeberLevel02ProgressionLabels, 0 );
    }
}


class MusicUeberLevel02 extends FmodEvent {

    constructor( logger?: ILogger ) {
        super( 'Music/ÜberLevel 02', 'Music', [  ], logger );
        this.progression = new MusicUeberLevel02Progression();
        this['Progression'] = this.progression;
        this.params.push( ...[
            this.progression,
        ] );
    }

    progression: MusicUeberLevel02Progression;
    'Progression': MusicUeberLevel02Progression;
}


class UiCancel extends FmodEvent {

    constructor( logger?: ILogger ) {
        super( 'UI/Cancel', 'SFX', [  ], logger );
        // Nothing to construct
        this.params.push( ...[
            // No Parameters
        ] );
    }

    // No definitions
}
