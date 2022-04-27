import { FmodZeromqApi } from '../src';
import * as zmq from 'zeromq';
import pino from 'pino';
import async_hooks from 'async_hooks';

const logger = pino( { level: 'trace' } );

describe( 'FMOD ZeroMQ API', () => {
    describe( 'Connection', () => {

        it( 'can be closed when connected', ( done ) => {

            const address = 'tcp://127.0.0.1:2999';
            const socket = new zmq.Reply();

            socket.bind( address )
                .then( () => {

                    const fza = new FmodZeromqApi( address, {
                        socketStatusIntervalMillis: 500,
                        heartbeatIntervalMillis: 500,
                        logger: logger.child( { test: 'T1' } ),
                    } );
                    fza.on( 'connect', () => {
                        fza.on( 'disconnect', () => {
                            done();
                        } );
                        fza.disconnect();
                    } );
                    fza.connect();

                    socket.receive().then( ( messages ) => {
                        logger.info( 'Message received: ', messages.map( el => el.toString( 'utf-8' ) ).join( '; ' ) );
                        if ( messages.length > 0 && messages[ 0 ].toString( 'utf-8' ) === 'get:id' ) {
                            socket.send( '1234' );
                        }
                    } );
                } );
        } );

        xit( 'can be closed when no socket exists', ( done ) => {


            const hooks: Map<number, string> = new Map();

            const printDetails = (): void => {
                const details = [ `${hooks.size} Active hooks:` ];
                for ( const [ id, desc ] of hooks ) {
                    details.push( `- ${id}: ${desc ?? ''}` );
                }
                console.log( details.join( '\n' ) );
            };

            async_hooks.createHook( {
                init( asyncId, type, triggerAsyncId, resource ) {
                    console.log( `HOOK INIT ID ${asyncId} TYPE ${type} TRIGGER ${triggerAsyncId} RESOURCE`, resource );
                    let description = `${type} by ${triggerAsyncId}; `;
                    if ( type === 'TickObject' ) {
                        // @ts-ignore
                        description += resource.callback.toString();
                    }
                    hooks.set( asyncId, description );
                    printDetails();
                },
                destroy( asyncId ) {
                    console.log( `HOOK DESTROY ID ${asyncId}` );
                    hooks.delete( asyncId );
                    printDetails();
                },
                before( asyncId ) {
                    console.log( `BEFORE ${asyncId}` );
                },
                after( asyncId ) {
                    console.log( `AFTER ${asyncId}` );
                }
            } ).enable();

            const address = 'tcp://127.0.0.1:2999';
            const fza = new FmodZeromqApi( address, {
                socketStatusIntervalMillis: 500,
                heartbeatIntervalMillis: 500,
                logger: logger.child( { test: 'T2' } ),
            } );

            fza.on( 'disconnect', () => {


                expect( hooks.size ).toBe( 0 );
                console.log( `${hooks.size} active hooks.` );
                for ( const hook of hooks ) {
                    console.log( `Hook still here: ${hook}` );
                }

                done();
            } );

            fza.connect();
            setTimeout( () => {
                fza.disconnect();
            }, 200 );
        } );

    } );
} );
