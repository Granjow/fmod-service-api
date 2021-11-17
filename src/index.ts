import { FmodZeromqApi } from './fmod-zeromq-api';
import { FmodBank, FmodEvent, FmodParameter } from './fmod-types';

interface Parameter {
    name: string;
}

interface Event {
    name: string;
    params: Record<string, Parameter>;
}

interface Bank {
    name: string;
    events: Record<string, Event>;
}



const banks = {
    music: {
        name: 'Music',
        events: {
            level01: {
                name: 'Music/Level 01',
                params: { stinger: { name: 'Stinger' }, progression: { name: 'Progression' } },
            }
        }
    }
};

const run = async (): Promise<void> => {
    const api = new FmodZeromqApi( 'tcp://127.0.0.1:3030' );

    const parentDir = '/home/simon/Documents/FMOD Studio/examples/Build/Desktop/';

    const myBank: any = {
        music: new FmodBank( parentDir ),
        level01: {
            event: new FmodEvent( 'Music/Level 01', 'Music' ),
            stinger: new FmodParameter( 'Stinger', 'Music/Level 01' ),
            progression: new FmodParameter( 'Progression', 'Music/Level 01' ),
        },
    };
    myBank.level01.event.init( api, [
        myBank.level01.stinger,
        myBank.level01.progression,
    ] );

    await api.connect();
    await api.loadBank( myBank.music.masterBankPath );
    await api.loadBank( myBank.music.masterStringsBankPath );
    await api.loadBank( myBank.music.bankPath( banks.music ) );

    await myBank.level01.event.start();

    await new Promise( resolve => setTimeout( resolve, 3000 ) );

    await myBank.level01.stinger.setValue( .8 );

    await new Promise( resolve => setTimeout( resolve, 3000 ) );

    await myBank.level01.progression.setValue( 1 );

    await new Promise( resolve => setTimeout( resolve, 10000 ) );

    await myBank.level01.progression.setValue( 0 );
};

run().catch( err => console.error( err ) );
