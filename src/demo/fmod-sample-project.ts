import { ContinuousParameter, FmodEvent, FmodEventType, FmodPlayer, LabeledParameter, IFmodProject } from '../index';
import type { ILogger } from '../index';
import { IFmodApi } from '../index';


export class FmodSampleProject extends FmodPlayer {

    public readonly rawProjectData: IFmodProject = {"banks":[{"bankName":"Music","events":[{"name":"Music/Level 01","params":[{"name":"Stinger","type":"continuous","min":0,"max":1},{"name":"Progression","type":"labeled","labels":[{"value":0,"name":"Intro"},{"value":1,"name":"Main"}]}]},{"name":"Pause","eventType":"snapshot","params":[]},{"name":"Music/Level 02","params":[{"name":"Area","type":"continuous","min":0,"max":80}]}]},{"bankName":"SFX","events":[{"name":"UI/Cancel","params":[]},{"name":"Character/Dialogue","params":[],"requiresOtherBanks":["Dialogue"]}]},{"bankName":"Dialogue","localised":true,"events":[]}],"localisation":{"languages":["EN","JP","CN"],"defaultLanguage":"EN"},"globalParameters":[{"name":"Test","type":"continuous","defaultValue":0}]} as IFmodProject; // eslint-disable-line quotes, object-curly-spacing

    constructor( api: IFmodApi, bankDir: string, logger?: ILogger ) {
        super( api, bankDir, logger );
        this.musicLevel01 = new MusicLevel01( logger );
        this['Music/Level 01'] = this.musicLevel01;
        this.pause = new Pause( logger );
        this['Pause'] = this.pause;
        this.musicLevel02 = new MusicLevel02( logger );
        this['Music/Level 02'] = this.musicLevel02;
        this.uiCancel = new UiCancel( logger );
        this['UI/Cancel'] = this.uiCancel;
        this.characterDialogue = new CharacterDialogue( logger );
        this['Character/Dialogue'] = this.characterDialogue;
        this.registerEvent( this.musicLevel01 );
        this.registerEvent( this.pause );
        this.registerEvent( this.musicLevel02 );
        this.registerEvent( this.uiCancel );
        this.registerEvent( this.characterDialogue );
        this.registerGlobalParam( this.globalParameters.test );
        this.configureLocalisation( [ 'Dialogue' ], [ 'EN', 'JP', 'CN' ], 'EN' );
    }

    globalParameters = {
        test: new GlobalTest(),
    };

    musicLevel01: MusicLevel01;
    'Music/Level 01': MusicLevel01;
    pause: Pause;
    'Pause': Pause;
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
        super( 'Music/Level 01', 'Music', [  ], FmodEventType.event, logger );
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


class Pause extends FmodEvent {

    constructor( logger?: ILogger ) {
        super( 'Pause', 'Music', [  ], FmodEventType.snapshot, logger );
        // Nothing to construct
        this.params.push( ...[
            // No Parameters
        ] );
    }

    // No definitions
}


export class MusicLevel02Area extends ContinuousParameter {
    constructor() {
        super( 'Area', 'event:/Music/Level 02', 0 );
    }
}


class MusicLevel02 extends FmodEvent {

    constructor( logger?: ILogger ) {
        super( 'Music/Level 02', 'Music', [  ], FmodEventType.event, logger );
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
        super( 'UI/Cancel', 'SFX', [  ], FmodEventType.event, logger );
        // Nothing to construct
        this.params.push( ...[
            // No Parameters
        ] );
    }

    // No definitions
}


class CharacterDialogue extends FmodEvent {

    constructor( logger?: ILogger ) {
        super( 'Character/Dialogue', 'SFX', [ 'Dialogue' ], FmodEventType.event, logger );
        // Nothing to construct
        this.params.push( ...[
            // No Parameters
        ] );
    }

    // No definitions
}


export class GlobalTest extends ContinuousParameter {
    constructor() {
        super( 'Test', 'global', 0 );
    }
}
