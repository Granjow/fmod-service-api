import { FmodZeromqApi } from '../api/fmod-zeromq-api';
import * as os from 'os';
import { FmodSampleProject } from './fmod-sample-project';

const api = new FmodZeromqApi( 'tcp://127.0.0.1:3030' );

const parentDir = `${os.homedir()}/Documents/FMOD Studio/examples/Build/Desktop/`;

const dp = new FmodSampleProject( api, parentDir );

dp.on( 'init', async () => {
    await dp.musicLevel01.start();
    await dp.uiCancel.play();


    await dp.musicLevel01.progression.setValue( 1 );

    await dp.characterDialogue.playVoice( 'welcome' );
    await new Promise( resolve => setTimeout( resolve, 5000 ) );
    await dp.setLanguage( 'JP' );
    await dp.characterDialogue.playVoice( 'welcome' );

    await new Promise( resolve => setTimeout( resolve, 10000 ) );
    await dp.uiCancel.play();
    await dp.musicLevel01.stinger.setValue( 1 );

    await new Promise( resolve => setTimeout( resolve, 4000 ) );
    await dp.uiCancel.play();
    await dp.musicLevel01.stinger.setValue( 1 );

    await new Promise( resolve => setTimeout( resolve, 2000 ) );
    await dp.getEvent( 'UI/Cancel' ).play();
    await dp.musicLevel01.stinger.setValue( 1 );

    await new Promise( resolve => setTimeout( resolve, 2000 ) );
    await dp.musicLevel01.stop();
    await dp.musicLevel02.start();

    await new Promise( resolve => setTimeout( resolve, 5000 ) );
    await dp.musicLevel02.stop();
} );

const run = async (): Promise<void> => {
    await dp.init();
};

run().catch( err => console.error( err ) );

