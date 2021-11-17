import { FmodExample } from './generated-demo-code';
import { FmodZeromqApi } from './fmod-zeromq-api';

const api = new FmodZeromqApi( 'tcp://127.0.0.1:3030' );

const parentDir = '/home/simon/Documents/FMOD Studio/examples/Build/Desktop/';

const dp = new FmodExample( api, parentDir );

const run = async (): Promise<void> => {
    await dp.init();
    await dp.musicLevel01.start();
    await dp.uiCancel.play();

    await dp.musicLevel01.progression.setValue( 1 );

    await new Promise( resolve => setTimeout( resolve, 15000 ) );
    await dp.uiCancel.play();
    await dp.musicLevel01.stinger.setValue( 1 );

    await new Promise( resolve => setTimeout( resolve, 4000 ) );
    await dp.uiCancel.play();
    await dp.musicLevel01.stinger.setValue( 1 );

    await new Promise( resolve => setTimeout( resolve, 2000 ) );
    await dp.uiCancel.play();
    await dp.musicLevel01.stinger.setValue( 1 );

    await new Promise( resolve => setTimeout( resolve, 2000 ) );
    await dp.musicLevel01.stop();
    await dp.musicLevel02.start();
};

run().catch( err => console.error( err ) );

