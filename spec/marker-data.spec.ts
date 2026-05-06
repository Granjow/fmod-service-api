import { MarkerData, parseMarkerMessage } from '../src/api/marker-data';

describe( 'Marker Data Parser', () => {

    it( 'parses a valid marker message', () => {
        const msg = 'marker:event:/Music/Erinnerungsarchiv;Low;t=1777581122145';
        const result = parseMarkerMessage( msg );
        expect( result ).toEqual( {
            event: 'event:/Music/Erinnerungsarchiv',
            marker: 'Low',
            timestamp: 1777581122145,
        } as MarkerData );
    } );

    it( 'parses a marker name containing semicolons', () => {
        const msg = 'marker:event:/Music/Track;Part;A;Final;t=9999';
        const result = parseMarkerMessage( msg );
        expect( result ).toEqual( {
            event: 'event:/Music/Track',
            marker: 'Part;A;Final',
            timestamp: 9999,
        } as MarkerData );
    } );

    it( 'returns undefined for messages without marker prefix', () => {
        const msg = 'other:event:/Music/Track;Intro;t=123';
        expect( parseMarkerMessage( msg ) ).toBeUndefined();
    } );

    it( 'returns undefined for messages without timestamp', () => {
        const msg = 'marker:event:/Music/Track;Intro';
        expect( parseMarkerMessage( msg ) ).toBeUndefined();
    } );

    it( 'returns undefined for messages without event path', () => {
        const msg = 'marker:something;Intro;t=123';
        expect( parseMarkerMessage( msg ) ).toBeUndefined();
    } );

    it( 'returns undefined for messages without marker name', () => {
        const msg = 'marker:event:/Music/Track;t=123';
        // This would parse as marker="" which should be undefined
        expect( parseMarkerMessage( msg ) ).toBeUndefined();
    } );

    it( 'handles complex event paths', () => {
        const msg = 'marker:event:/SFX/Ambient/Forest/Wind;Gust;t=42';
        const result = parseMarkerMessage( msg );
        expect( result ).toEqual( {
            event: 'event:/SFX/Ambient/Forest/Wind',
            marker: 'Gust',
            timestamp: 42,
        } );
    } );

} );
