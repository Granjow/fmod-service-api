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
        it( 'loads localised bank ', ( done ) => {

            // @ts-ignore
            const api: FmodZeromqApi = {
                loadBank: jest.fn().mockResolvedValue( undefined ),
                unloadBank: jest.fn().mockResolvedValue( undefined ),
                connect: jest.fn().mockResolvedValue( undefined ),
                // @ts-ignore
                once: ( event, cb ) => {
                    if ( event === 'connect' ) setImmediate( cb );
                },
                on:jest.fn(),
            };

            const player = new TestFmodPlayer( api );

            player.configureLocalisation( [ 'L1', 'L2' ], [ 'en', 'de' ], 'en' );
            expect( player.currentLanguage ).not.toBeDefined();

            player.init();
            player.on( 'init', () => {

                expect( player.currentLanguage ).toBe( 'en' );

                player.ensureBankLoaded( 'L1' )
                    .then( () => {
                        expect( api.loadBank ).toHaveBeenCalledWith( 'BANKDIR/L1_en.bank' );
                        ( api.loadBank as jest.Mock ).mockClear();
                    } )
                    .then( () => player.setLanguage( 'de' ) )
                    .then( () => {
                        expect( player.currentLanguage ).toBe( 'de' );

                        expect( api.unloadBank ).toHaveBeenCalledWith( 'BANKDIR/L1_en.bank' );
                        expect( api.loadBank ).toHaveBeenCalledWith( 'BANKDIR/L1_de.bank' );

                        ( api.loadBank as jest.Mock ).mockClear();
                    } )
                    .then( () => player.ensureBankLoaded( 'L3' ) )
                    .then( () => {
                        expect( api.loadBank ).toHaveBeenCalledWith( 'BANKDIR/L3.bank' );
                    } )
                    .finally( done );

            } );
        } );

    } );
} );
