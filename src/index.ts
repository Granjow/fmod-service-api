import { FmodZeromqApi } from './fmod-zeromq-api';


const run = async (): Promise<void> => {
    const api = new FmodZeromqApi( 'tcp://127.0.0.1:3030' );

    await api.connect()
    await api.loadBank( '/home/simon/Documents/FMOD Studio/examples/Build/Desktop/Master.bank' );
    await api.loadBank( '/home/simon/Documents/FMOD Studio/examples/Build/Desktop/Master.strings.bank' );
    await api.loadBank( '/home/simon/Documents/FMOD Studio/examples/Build/Desktop/Music.bank' );

    await api.play( 'event:/Music/Level 01' );
};

run().catch( err => console.error( err ) );
