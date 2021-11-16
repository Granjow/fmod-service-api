import { FmodZeromqApi } from './fmod-zeromq-api';


const run = async (): Promise<void> => {
    const api = new FmodZeromqApi( 'tcp://127.0.0.1:3030' );

    await api.connect();
    await api.loadBank( '/home/simon/Documents/FMOD Studio/examples/Build/Desktop/Master.bank' );
    await api.loadBank( '/home/simon/Documents/FMOD Studio/examples/Build/Desktop/Master.strings.bank' );
    await api.loadBank( '/home/simon/Documents/FMOD Studio/examples/Build/Desktop/Music.bank' );

    await api.start( 'event:/Music/Level 01' );

    await new Promise( resolve => setTimeout( resolve, 3000 ) );

    await api.setParameter( 'event:/Music/Level 01', 'Stinger', .8 );

    await new Promise( resolve => setTimeout( resolve, 3000 ) );

    await api.setParameter( 'event:/Music/Level 01', 'Progression', 1 );
};

run().catch( err => console.error( err ) );
