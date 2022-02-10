import { NamingTools } from '../src/api-generator/naming-tools';

describe( 'Naming Tools', () => {

    describe( 'Names', () => {

        it.each( [
            [ 'foo(', 'foo_' ],
            [ '500Times', 'xx00Times' ],
        ] )( 'replaces invalid characters', ( original, expected ) => {
            expect( NamingTools.toValidMemberName( original ) ).toBe( expected );
        } );

        it.each( [
            [ 'zöpfli', 'zoepfli' ],
            [ 'Äxtra', 'Aextra' ],
        ] )( 'replaces special characters', ( original, expected ) => {
            expect( NamingTools.toValidMemberName( original ) ).toBe( expected );
        } );
    } );

    describe( 'Code names', () => {

        it.each( [
            [ 'foo', 'foo', 'Foo' ],
            [ 'fooBar', 'fooBar', 'FooBar' ],
            [ '50FooBars!', 'xx0FooBars', 'Xx0FooBars' ],
            [ 'with a space', 'withASpace', 'WithASpace' ],
        ] )( 'generates valid member/class names', ( original, expectedMember, expectedClass ) => {
            const result = NamingTools.generateClassNames( original );
            expect( result.memberName ).toBe( expectedMember );
            expect( result.className ).toBe( expectedClass );
        } );
        it.each( [
            [ 'foo', 'my', 'foo', 'MyFoo' ],
            [ 'foo', 'My', 'foo', 'MyFoo' ],
            [ 'foo', '7My', 'foo', 'XxMyFoo' ],
        ] )( 'generates valid member/class names with given prefix', ( original, prefix, expectedMember, expectedClass ) => {
            const result = NamingTools.generateClassNames( original, prefix );
            expect( result.memberName ).toBe( expectedMember );
            expect( result.className ).toBe( expectedClass );
        } );

    } );

} );
