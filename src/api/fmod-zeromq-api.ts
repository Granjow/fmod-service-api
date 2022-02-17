import Timer = NodeJS.Timer;
import { IControlFmod } from '../ports/i-control-fmod';
import * as zmq from 'zeromq';
import { TypedEmitter } from 'tiny-typed-emitter';
import { SmallStateMachine } from 'small-state-machine';
import Semaphore from 'semaphore-promise';
import { ILogger } from './i-logger';

export interface FmodZeromqApiEvents {
    'connect': () => void;
    'disconnect': () => void;
    'reconnect': () => void;
}

export enum ConnectionState {
    Disconnected = 'Disconnected',
    Connecting = 'Connecting',
    Connected = 'Connected',
    Disconnecting = 'Disconnecting',
}

enum Events {
    connect = 'connect',
    connected = 'connected',
    disconnect = 'disconnect',
    disconnected = 'disconnected',
}

export interface FmodZeromqApiArgs {
    logger?: ILogger;
    heartbeatIntervalMillis?: number;
    socketStatusIntervalMillis?: number;
}

export class FmodZeromqApi extends TypedEmitter<FmodZeromqApiEvents> implements IControlFmod {

    private readonly _socketStatusInterval: number;
    private _socketStatusPoll: Timer | undefined;

    private readonly _heartbeatInterval: number;
    private _heartbeatPoll: Timer | undefined;
    private _lastId: string | undefined;

    private _socket: zmq.Request | undefined;
    private readonly _zmqAddress: string;

    private readonly _logger: ILogger | undefined;
    private readonly _sm: SmallStateMachine<ConnectionState, Events>;
    private readonly _runningEvents: Set<string> = new Set();
    private readonly _socketSempahore: Semaphore;

    constructor( address: string, args?: FmodZeromqApiArgs ) {
        super();

        this._logger = args?.logger;
        this._zmqAddress = address;
        this._heartbeatInterval = args?.heartbeatIntervalMillis ?? 4000;
        this._socketStatusInterval = args?.socketStatusIntervalMillis ?? 4000;
        this._socketSempahore = new Semaphore( 1 );

        this._sm = new SmallStateMachine<ConnectionState, Events>( ConnectionState.Disconnected );
        this._sm.configure( ConnectionState.Disconnected )
            .onEntry( () => this.onDisconnected() )
            .permit( Events.connect, ConnectionState.Connecting ) // Manually calling connect()
            .permit( Events.connected, ConnectionState.Connected ) // Socket became available again
            .ignore( Events.disconnected );
        this._sm.configure( ConnectionState.Connecting )
            .onEntry( () => this.onConnecting() )
            .permit( Events.connected, ConnectionState.Connected )
            .permit( Events.disconnected, ConnectionState.Disconnected )
            .ignore( Events.connect );
        this._sm.configure( ConnectionState.Connected )
            .onEntry( () => this.onConnected() )
            .permit( Events.disconnected, ConnectionState.Disconnected )
            .ignore( Events.connect )
            .ignore( Events.connected );
        this._sm.configure( ConnectionState.Disconnecting )
            .onEntry( () => this.onDisconnecting() )
            .permit( Events.disconnected, ConnectionState.Disconnected )
            .ignore( Events.disconnect );

        this._sm.onStateChange( newState => this._logger?.debug( `Now in state ${newState}` ) );
    }

    get connectionState(): ConnectionState {
        return this._sm.currentState;
    }

    connect(): void {
        this._sm.fire( Events.connect );
    }

    disconnect(): void {
        this._sm.fire( Events.disconnected );
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


    private doConnect(): void {
        if ( this._socket !== undefined ) throw new Error( 'Socket already exists!' );

        this._socket = new zmq.Request();
        this._socket.connect( this._zmqAddress );

        // Regularly send message to the API to check if it is still online
        if ( this._heartbeatPoll === undefined ) {
            this._heartbeatPoll = setInterval( () => this.checkHeartbeat(), this._heartbeatInterval );
        }

        // Check if socket is writable; changes to false when it goes offline
        if ( this._socketStatusPoll === undefined ) {

            let lastWritableStatus = false;
            // TODO When the socket is not available, the calls pile up and are sent all at once when the socket becomes available.
            // Is there a better way? Not sending calls at all does not update socket.writable status …
            this._socketStatusPoll = setInterval( async () => {
                if ( this._socket === undefined ) return;

                const release = await this._socketSempahore.acquire();
                try {
                    this._logger?.debug( `Closed: ${this._socket?.closed}, readable: ${this._socket?.readable}, writable: ${this._socket?.writable}` );
                    const writableStatus = this._socket.writable;
                    if ( writableStatus !== lastWritableStatus ) {
                        lastWritableStatus = writableStatus;
                        this._sm.fire( writableStatus ? Events.connected : Events.disconnected );
                    }
                } finally {
                    release();
                }

            }, this._socketStatusInterval );
        }
    }

    private doDisconnect(): void {
        if ( this._socket !== undefined ) {
            this._socket.disconnect( this._zmqAddress );
            this._socket = undefined;
        }
        if ( this._heartbeatPoll !== undefined ) {
            clearInterval( this._heartbeatPoll );
            this._heartbeatPoll = undefined;
        }
        if ( this._socketStatusPoll !== undefined ) {
            clearInterval( this._socketStatusPoll );
            this._socketStatusPoll = undefined;
        }
        this._sm.fire( Events.disconnected );
    }

    private async sendCommand( command: string, logCommands: boolean = true ): Promise<string> {
        if ( this._socket === undefined ) throw new Error( `Socket not initialised; did you call init()?` );

        let msg = '';

        const release = await this._socketSempahore.acquire();
        try {
            logCommands && this._logger?.debug( `Sending: ${command}` );
            await this._socket.send( command );

            // TODO properly handle error responses
            const [ response ] = await this._socket.receive();
            logCommands && this._logger?.debug( `Received: ${response}` );
            msg = response.toString( 'utf-8' );
        } finally {
            release();
        }

        return msg;
    }

    private async checkHeartbeat(): Promise<void> {
        try {
            const id = await this.sendCommand( 'get:id', true );

            if ( this._lastId !== id ) {
                if ( this._lastId !== undefined ) {
                    this.emit( 'reconnect' );
                }
                this._lastId = id;
            }

            this._sm.fire( Events.connected );

        } catch ( err ) {
            if ( this._sm.currentState !== ConnectionState.Disconnected ) {
                this._sm.fire( Events.disconnected );
                this._logger?.warn( 'FMOD has gone:', err );
            }
        }
    }

    private onConnecting(): void {
        this.doConnect();
    }

    private onConnected(): void {
        this.emit( 'connect' );
    }

    private onDisconnecting(): void {
        this.doDisconnect();
    }

    private onDisconnected(): void {
        this.emit( 'disconnect' );
    }

}
