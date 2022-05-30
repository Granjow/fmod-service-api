import { ContinuousParameter, FmodEvent, FmodPlayer, LabeledParameter } from '../index';
import { ILogger } from '../index';
import { IFmodApi } from '../index';


export class FmodSampleProject extends FmodPlayer {

    constructor( api: IFmodApi, bankDir: string, logger?: ILogger ) {
        super( api, bankDir, logger );
        this.musicLevel01 = new MusicLevel01( logger );
        this['Music/Level 01'] = this.musicLevel01;
        this.musicLevel02 = new MusicLevel02( logger );
        this['Music/Level 02'] = this.musicLevel02;
        this.uiCancel = new UiCancel( logger );
        this['UI/Cancel'] = this.uiCancel;
        this.characterDialogue = new CharacterDialogue( logger );
        this['Character/Dialogue'] = this.characterDialogue;
        this.registerEvent( this.musicLevel01 );
        this.registerEvent( this.musicLevel02 );
        this.registerEvent( this.uiCancel );
        this.registerEvent( this.characterDialogue );
        this.configureLocalisation( [ 'Dialogue' ], [ 'EN', 'JP', 'CN' ], 'EN' );
    }

    musicLevel01: MusicLevel01;
    'Music/Level 01': MusicLevel01;
    musicLevel02: MusicLevel02;
    'Music/Level 02': MusicLevel02;
    uiCancel: UiCancel;
    'UI/Cancel': UiCancel;
    characterDialogue: CharacterDialogue;
    'Character/Dialogue': CharacterDialogue;
}


export class MusicLevel01Stinger extends ContinuousParameter {
    constructor() {
        super( 'Stinger', 'event:/Music/Level 01', 0 );
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
        super( 'Area', 'event:/Music/Level 02', 0 );
    }
}


class MusicLevel02 extends FmodEvent {

    constructor( logger?: ILogger ) {
        super( 'Music/Level 02', 'Music', [  ], logger );
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

    constructor( logger?: ILogger ) {
        super( 'UI/Cancel', 'SFX', [  ], logger );
        // Nothing to construct
        this.params.push( ...[
            // No Parameters
        ] );
    }

    // No definitions
}


class CharacterDialogue extends FmodEvent {

    constructor( logger?: ILogger ) {
        super( 'Character/Dialogue', 'SFX', [ 'Dialogue' ], logger );
        // Nothing to construct
        this.params.push( ...[
            // No Parameters
        ] );
    }

    // No definitions
}
