import { FmodZeromqApi } from '../api/fmod-zeromq-api';
import * as os from 'os';
import { FmodSampleProject } from './fmod-sample-project';
import pino from 'pino';

const logger = pino( { level: 'trace' } );
const api = new FmodZeromqApi( 'tcp://127.0.0.1:3030' );

const parentDir = `${os.homedir()}/Documents/FMOD Studio/examples/Build/Desktop/`;

const dp = new FmodSampleProject( api, parentDir, logger );

const onInit = async (): Promise<void> => {
    await dp.musicLevel01.start();
    await dp.uiCancel.play();

    let banks = await api.listLoadedBankPaths();
    console.log( `Loaded banks: ${banks.join( ', ' )}` );

    await dp.musicLevel01.progression.setValue( 1 );

    await dp.characterDialogue.playVoice( 'welcome' );
    banks = await api.listLoadedBankPaths();
    console.log( `Loaded banks after playing voice: ${banks.join( ', ' )}` );
    await new Promise( resolve => setTimeout( resolve, 4500 ) );
    await dp.setLanguage( 'JP' );
    await dp.characterDialogue.playVoice( 'welcome' );
    banks = await api.listLoadedBankPaths();
    console.log( `Loaded banks after switching language: ${banks.join( ', ' )}` );

    await new Promise( resolve => setTimeout( resolve, 6000 ) );
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
    await dp.musicLevel02.area.setValue( 62 );

    await new Promise( resolve => setTimeout( resolve, 4000 ) );
    await dp.pause.start();
    await new Promise( resolve => setTimeout( resolve, 4000 ) );
    await dp.pause.stop();

    await new Promise( resolve => setTimeout( resolve, 5000 ) );
    await dp.musicLevel02.stop();

    dp.close();
};

dp.on( 'init', () => onInit()
    .catch( err => logger.warn( `${err?.message ?? err}` ) ) );

dp.on( 'reconnect', async () => {
    await dp.musicLevel02.start();

    await dp.setLanguage( 'CN' );
    await new Promise( resolve => setTimeout( resolve, 2000 ) );
    await dp.characterDialogue.playVoice( 'welcome' );
} );

const run = async (): Promise<void> => {
    await dp.init();
};

run().catch( err => console.error( err ) );

