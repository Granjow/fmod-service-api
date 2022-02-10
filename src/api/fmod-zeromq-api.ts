import Timer = NodeJS.Timer;
import { IControlFmod } from '../ports/i-control-fmod';

const zmq = require( 'zeromq' );

export class FmodZeromqApi implements IControlFmod {

    constructor( address: string ) {
        this._zmqAddress = address;
    }

    pollForRestart(): void {
        if ( !this._poll ) {
            this._poll = setInterval( () => this.checkFmodStatus().catch( console.error.bind( console ) ), 5000 );
            this.checkFmodStatus()
                .catch( console.error.bind( console ) );
        }
    }

    get alive(): boolean {
        return this._alive;
    }

    async connect(): Promise<void> {
        this._socket = new zmq.Request();
        this._socket.connect( this._zmqAddress );
        // this.pollForRestart();
    }

    disconnect(): void {
        this._socket.disconnect( this._zmqAddress );
        if ( this._poll !== undefined ) clearInterval( this._poll );
        this._poll = undefined;
    }

    /**
     * Start an event; it can be stopped again
     * @param event
     */
    async start( event: string ): Promise<void> {
        const command = `start-event:${event}`;
        this._runningEvents.add( event );
        await this.sendCommand( command );
    }

    /**
     * Stop a running event
     * @param event
     */
    async stop( event: string ): Promise<void> {
        const command = `stop-event:${event}`;
        this._runningEvents.delete( event );
        await this.sendCommand( command );
    }

    /**
     * Play an event (fire-and-forget)
     * @param event
     */
    async play( event: string ): Promise<void> {
        const command = `play-event:${event}`;
        await this.sendCommand( command );
    }

    async loadBank( bankName: string ): Promise<void> {
        const command = `load-bank:${bankName}`;
        await this.sendCommand( command );
    }

    isPlaying( eventId: string ): Promise<boolean> {
        throw new Error( 'Method not implemented.' );
    }

    async setParameter( eventId: string, name: string, value: number ): Promise<void> {
        const command = `set-parameter:${eventId};${name};${value}`;
        await this.sendCommand( command );
    }


    async onReconnect(): Promise<void> {
        console.log( `FMOD server was (re)started, restoring events` );
        for ( const runningEvent of this._runningEvents ) {
            await this.start( runningEvent );
        }
    }

    private async sendCommand( command: string ): Promise<string> {
        if ( this._socket === undefined ) throw new Error( `Socket not initialised; did you call init()?` );

        console.log( `Sending: ${command}` );
        await this._socket.send( command );

        const [ msg ] = await this._socket.receive();
        console.log( `Received: ${msg}` );

        return msg;
    }

    private async checkFmodStatus(): Promise<void> {
        try {
            const id = await this.sendCommand( 'get:id' );

            if ( this._lastId !== id ) {
                await this.onReconnect();
            }
            this._lastId = id;
            if ( !this._alive ) {
                this._alive = true;
                console.log( 'FMOD is online.' );
            }

        } catch ( err ) {
            if ( this._alive ) {
                console.error( 'FMOD has gone:', err );
                this._alive = false;
            }
        }
    }

    private _alive: boolean = false;

    private _poll: Timer | undefined;
    private _lastId: string | undefined;

    private _socket: any | undefined;
    private readonly _zmqAddress: string;

    private readonly _runningEvents: Set<string> = new Set();

}
