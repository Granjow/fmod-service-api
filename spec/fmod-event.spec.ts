import { FmodEvent } from '../src/api-generator/fmod-event';
import { FmodZeromqApi } from '../src';
import { IRequireBank } from '../src/api-generator/ports/i-require-bank';
import { FmodEventType } from '../src/api-generator/interfaces/fmod-event-type';

describe( 'FMOD Event', () => {
    describe( 'Additional banks', () => {
        it( 'are loaded', async () => {

            // @ts-ignore
            const api: FmodZeromqApi = {
                play: jest.fn().mockResolvedValue( undefined ),
            };
            const bankLoader: IRequireBank = {
                ensureBankLoaded: jest.fn(),
            };

            const event = new FmodEvent( '', 'A', [ 'B' ], FmodEventType.event );
            event.init( api, bankLoader );

            await event.play();

            expect( bankLoader.ensureBankLoaded ).toHaveBeenCalledWith( 'A' );
            expect( bankLoader.ensureBankLoaded ).toHaveBeenCalledWith( 'B' );
        } );
    } );
} );
