import { IControlFmod } from '../ports/i-control-fmod';
import * as zmq from 'zeromq';
import { TypedEmitter } from 'tiny-typed-emitter';
import { SmallStateMachine } from 'small-state-machine';
import Semaphore from 'semaphore-promise';
import { ILogger } from './i-logger';
import { ConnectionEvents, IConnect, IConnectEvents } from '../ports/i-connect';
import { IConfigureLogging } from '../ports/i-configure-logging';


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

interface EventInstanceData {
    uniqueEventId: string;
    /** Used for cleanup */
    tAdded: number;
}

export interface FmodZeromqApiArgs {
    logger?: ILogger;
    heartbeatIntervalMillis?: number;
    socketStatusIntervalMillis?: number;
}

export class FmodZeromqApi extends TypedEmitter<ConnectionEvents> implements IControlFmod, IConnect, IConnectEvents, IConfigureLogging {

    static getEventIdFromResponse( response: string ): string | undefined {
        const spacePos = response.indexOf( ' ' );
        if ( spacePos === -1 ) {
            return undefined;
        }
        return response.substring( spacePos + 1 );
    }

    private static toEventMapId = ( eventId: string, key: string ): string => `${eventId};;${key}`;

    private readonly _socketStatusInterval: number;
    private _socketStatusPoll: NodeJS.Timeout | undefined;

    private readonly _heartbeatInterval: number;
    private _heartbeatPoll: NodeJS.Timeout | undefined;
    private _lastId: string | undefined;

    private _socket: zmq.Request | undefined;
    private readonly _zmqAddress: string;

    private readonly _logger: ILogger | undefined;
    private readonly _sm: SmallStateMachine<ConnectionState, Events>;
    private readonly _socketSempahore: Semaphore;

    private readonly _singleShotEventIds = new Map<string, EventInstanceData[]>();

    private _verboseLogging = false;

    constructor( address: string, args?: FmodZeromqApiArgs ) {
        super();

        this._logger = args?.logger;
        this._verboseLogging = args?.logger !== undefined;

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
            .permit( Events.disconnect, ConnectionState.Disconnecting )
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

    get verboseLogging(): boolean {
        return this._verboseLogging;
    }

    set verboseLogging( verbose: boolean ) {
        this._verboseLogging = verbose;
    }

    connect(): void {
        this._sm.fire( Events.connect );
    }

    disconnect(): void {
        this._sm.fire( Events.disconnect );
    }

    /**
     * Start an event; it can be stopped again
     * @param event
     */
    async start( event: string ): Promise<void> {
        const command = `start-event:${event}`;
        await this.sendCommand( command );
    }

    /**
     * Stop a running event
     * @param event
     */
    async stop( event: string ): Promise<number> {
        const command = `stop-event:${event}`;
        let stoppedEvents = 0;
        stoppedEvents += await this.stopSingleShotEvents( event );
        try {
            await this.sendCommand( command );
            stoppedEvents++;
        } catch ( err: any ) {
            if ( stoppedEvents === 0 ) {
                this._logger?.warn( `Failed stopping event ${event}: ${err?.message ?? err}` );
            }
        }
        return stoppedEvents;
    }

    async stopStartedEvents(): Promise<void> {
        const command = 'stop-started-events';
        await this.sendCommand( command );
    }

    /**
     * Play an event (fire-and-forget)
     * @param event
     */
    async play( event: string ): Promise<void> {
        const command = `play-event:${event}`;
        const result = await this.sendCommand( command );
        this.addSingleShotId( event, command, result );
    }

    async loadBank( bankName: string ): Promise<void> {
        const command = `load-bank:${bankName}`;
        await this.sendCommand( command );
    }

    async unloadBank( bankName: string ): Promise<void> {
        const command = `unload-bank:${bankName}`;
        await this.sendCommand( command );
    }

    async setParameter( eventId: string, name: string, value: number ): Promise<void> {
        const command = `set-parameter:${eventId};${name};${value}`;
        await this.sendCommand( command );
    }

    async playVoice( eventId: string, key: string ): Promise<void> {
        const command = `play-voice:${eventId};${key}`;
        const result = await this.sendCommand( command );
        const mapId = FmodZeromqApi.toEventMapId( eventId, key );
        this.addSingleShotId( mapId, command, result );
    }

    async stopVoice( eventId: string, key: string ): Promise<number> {
        const mapId = FmodZeromqApi.toEventMapId( eventId, key );
        return this.stopSingleShotEvents( mapId );
    }

    isPlaying( eventId: string ): Promise<boolean> {
        throw new Error( 'Method not implemented.' );
    }

    async listLoadedBankPaths(): Promise<string[]> {
        const command = 'list-bank-paths';
        const list = await this.sendCommand( command );
        return list
            .split( ';' )
            .map( el => el.replace( /^bank:\//, '' ) )
            .filter( el => el.length > 0 );
    }


    private async stopSingleShotEvents( eventIdentifier: string ): Promise<number> {
        const entries = this._singleShotEventIds.get( eventIdentifier );
        if ( entries === undefined ) {
            return 0;
        }
        let stoppedCount = 0;
        for ( const entry of entries ) {
            const command = `stop-event:${entry.uniqueEventId}`;
            const result = await this.sendCommand( command );
            if ( result.startsWith( 'OK' ) ) {
                stoppedCount++;
            }
        }
        entries.length = 0;
        this.printSingleShotLength();
        return stoppedCount;
    }

    private addSingleShotId( eventIdentifier: string, fmodAction: string, fmodResponse: string ): void {
        const uniqueEventId = FmodZeromqApi.getEventIdFromResponse( fmodResponse );
        this._verboseLogging && this._logger?.trace( `Answer from ${fmodAction}: ${fmodResponse}; extracted ID: ${uniqueEventId}` );
        if ( uniqueEventId !== undefined ) {
            this._verboseLogging && this._logger?.trace( `Event ID received: ${uniqueEventId}` );
            const eventList = this._singleShotEventIds.get( eventIdentifier ) ?? [];
            eventList.push( {
                tAdded: Date.now(),
                uniqueEventId,
            } );
            this._singleShotEventIds.set( eventIdentifier, eventList );
        }

        this.cleanupOldEventIds();
    }

    private cleanupOldEventIds(): void {
        const now = Date.now();
        const minutes = 60 * 1000;
        for ( const [ key, val ] of this._singleShotEventIds.entries() ) {
            const cleaned = val.filter( el => ( now - el.tAdded ) < 10 * minutes );
            const delta = val.length - cleaned.length;
            if ( delta > 0 ) {
                this._singleShotEventIds.set( key, cleaned );
                this._verboseLogging && this._logger?.debug( `Old event IDs cleaned up: ${delta} removed` );
            }
        }
        this.printSingleShotLength();
    }

    private printSingleShotLength(): void {
        const totalIds = Array.from( this._singleShotEventIds.values() )
            .map( el => el.length )
            .reduce( ( acc, cur ) => acc + cur, 0 );
        this._verboseLogging && this._logger?.debug( `Single-shot event list contains ${totalIds} unique IDs` );
    }

    private doConnect(): void {
        if ( this._socket !== undefined ) throw new Error( 'Socket already exists!' );

        this._socket = new zmq.Request();

        /*
        // Connection timeouts may be helpful against calls piling up
        this._socket.connectTimeout = 2000;
        this._socket.sendTimeout = 200;
        this._socket.receiveTimeout = 2000;
         */

        this._logger?.debug( `ZMQ socket connecting to ${this._zmqAddress}` );
        this._socket.connect( this._zmqAddress );

        this._verboseLogging && this._logger?.debug( `Setting up heartbeat and status polling` );

        // Regularly send message to the API to check if it is still online
        if ( this._heartbeatPoll === undefined ) {
            this._heartbeatPoll = setInterval( () => this.checkHeartbeat(), this._heartbeatInterval );
        }

        // Check if socket is writable; changes to false when it goes offline
        if ( this._socketStatusPoll === undefined ) {

            let lastWritableStatus = false;
            // TODO When the socket is not available, the calls pile up and are sent all at once when the socket becomes available.
            // Is there a better way? Not sending calls at all does not update socket.writable status …
            const checkConnection = async (): Promise<void> => {
                if ( this._socket === undefined ) return;

                const release = await this._socketSempahore.acquire();
                try {
                    // Socket can be …
                    // closed → no connection
                    // writable → all fine. This is how it should be after sending and receiving a message.
                    // readable → only when we did not read the response, but the API should always read after writing
                    // undefined (because disconnected) → no connection
                    const writableStatus = this._socket?.writable ?? false;
                    if ( writableStatus !== lastWritableStatus ) {
                        lastWritableStatus = writableStatus;
                        this._sm.fire( writableStatus ? Events.connected : Events.disconnected );
                    }
                } finally {
                    release();
                }
            };

            this._socketStatusPoll = setInterval( checkConnection, this._socketStatusInterval );
            setImmediate( checkConnection );
        }
    }

    private doDisconnect(): void {
        this._logger?.debug( 'Disconnecting …' );
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
        const fireDisconnect = (): void => this._sm.fire( Events.disconnected );
        setImmediate( fireDisconnect );
    }

    private async sendCommand( command: string ): Promise<string> {
        if ( this._socket === undefined ) throw new Error( `Socket not initialised; did you call init()?` );

        let msg = '';

        const release = await this._socketSempahore.acquire();
        this._verboseLogging && this._logger?.trace( `Sending: ${command}` );
        try {
            /*
            // Setting the sending timeout may be helpful. Needs further examination.
            this._logger?.info( `Send timeout is ${this._socket.sendTimeout}` );
            this._socket.sendTimeout = 200;
            this._logger?.info( `Send timeout set to ${this._socket.sendTimeout}` );
             */

            // After sending a message to the socket, it is not writable anymore (and hopefully not closed)
            const sendPromise = this._socket.send( command );

            const [ response ] = await this._socket.receive();
            this._verboseLogging && this._logger?.trace( `Received: ${response}` );

            msg = response.toString( 'utf-8' );
            if ( msg.startsWith( 'Error:' ) ) {
                throw new Error( msg );
            }
        } finally {
            release();
        }
        this._verboseLogging && this._logger?.trace( `Done sending ${command}` );

        return msg;
    }

    private async checkHeartbeat(): Promise<void> {
        try {
            const id = await this.sendCommand( 'get:id' );

            if ( this._lastId !== id ) {
                if ( this._lastId !== undefined ) {
                    process.nextTick( () => this.emit( 'reconnect' ) );
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
        process.nextTick( () => this.emit( 'connect' ) );
    }

    private onDisconnecting(): void {
        this.doDisconnect();
    }

    private onDisconnected(): void {
        process.nextTick( () => this.emit( 'disconnect' ) );
    }

}
