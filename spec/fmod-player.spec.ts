import { FmodEvent, FmodPlayer, FmodZeromqApi } from '../src';

class TestFmodPlayer extends FmodPlayer {
    constructor( api: FmodZeromqApi ) {
        super( api, 'BANKDIR' );
    }

    readonly events: FmodEvent[] = [];
}

describe( 'FMOD Player', () => {
    describe( 'Initialisation', () => {
        it( 'loads banks', ( done ) => {

            let connected = false;

            // @ts-ignore
            const api: FmodZeromqApi = {
                loadBank: jest.fn().mockResolvedValue( undefined ),
                unloadBank: jest.fn().mockResolvedValue( undefined ),
                // @ts-ignore
                once: ( event: string, cb: () => void ) => {
                    if ( event === 'connect' && connected ) {
                        setImmediate( cb );
                    }
                },
                on: jest.fn(),
                connect: () => connected = true,
            };

            const player = new TestFmodPlayer( api );

            player.init();
            player.on( 'init', () => {
                expect( api.loadBank ).toHaveBeenCalledWith( 'BANKDIR/Master.bank' );
                expect( api.loadBank ).toHaveBeenCalledWith( 'BANKDIR/Master.strings.bank' );
                done();
            } );
        } );
    } );

    describe( 'Localisation', () => {
        it( 'loads localised bank ', async () => {

            // @ts-ignore
            const api: FmodZeromqApi = {
                loadBank: jest.fn().mockResolvedValue( undefined ),
                unloadBank: jest.fn().mockResolvedValue( undefined ),
            };

            const player = new TestFmodPlayer( api );

            player.configureLocalisation( [ 'L1', 'L2' ], [ 'en', 'de' ], 'en' );
            expect( player.currentLanguage ).toBe( 'en' );

            await player.ensureBankLoaded( 'L1' );

            expect( api.loadBank ).toHaveBeenCalledWith( 'BANKDIR/L1_en.bank' );

            ( api.loadBank as jest.Mock ).mockClear();

            await player.setLanguage( 'de' );
            expect( player.currentLanguage ).toBe( 'de' );

            expect( api.unloadBank ).toHaveBeenCalledWith( 'BANKDIR/L1_en.bank' );
            expect( api.loadBank ).toHaveBeenCalledWith( 'BANKDIR/L1_de.bank' );

            ( api.loadBank as jest.Mock ).mockClear();

            await player.ensureBankLoaded( 'L3' );

            expect( api.loadBank ).toHaveBeenCalledWith( 'BANKDIR/L3.bank' );
        } );

    } );
} );
