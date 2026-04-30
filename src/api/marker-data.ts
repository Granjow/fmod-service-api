export interface MarkerData {
    /** FMOD event path, e.g. "event:/Music/Erinnerungsarchiv" */
    event: string;
    /** Marker name (may contain semicolons) */
    marker: string;
    /** Timestamp in milliseconds when the marker was triggered in FMOD */
    timestamp: number;
}

/**
 * Parse a marker message from the fmod-service pub/sub socket.
 * Format: `marker:event:/Path/To/Event;MarkerName;t=1777581122145`
 * The marker name may contain semicolons; the timestamp is always the last `;t=<digits>` segment.
 */
export function parseMarkerMessage( message: string ): MarkerData | undefined {
    const prefix = 'marker:';
    if ( !message.startsWith( prefix ) ) {
        return undefined;
    }

    const body = message.substring( prefix.length );

    // Timestamp is always at the end: ;t=<digits>
    const timestampMatch = body.match( /;t=(\d+)$/ );
    if ( !timestampMatch ) {
        return undefined;
    }

    const timestamp = parseInt( timestampMatch[1], 10 );
    const beforeTimestamp = body.substring( 0, timestampMatch.index! );

    // The event path starts with "event:/" and ends at the first semicolon
    const firstSemicolon = beforeTimestamp.indexOf( ';' );
    if ( firstSemicolon === -1 ) {
        return undefined;
    }

    const event = beforeTimestamp.substring( 0, firstSemicolon );
    const marker = beforeTimestamp.substring( firstSemicolon + 1 );

    if ( !event.startsWith( 'event:/' ) || marker.length === 0 ) {
        return undefined;
    }

    return { event, marker, timestamp };
}
