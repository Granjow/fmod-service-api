import camelcase from 'camelcase';

export interface CodeNames {
    className: string;
    memberName: string;
}

export class NamingTools {

    public static toValidMemberName( input: string ): string {
        return this.replaceUmlauts( input )
            .replaceAll( /[^a-zA-Z0-9]/g, '_' )
            .replace( /^[^a-zA-Z]/, 'xx' );
    }

    public static replaceUmlauts( input: string ): string {
        const replacements = [
            [ 'ä', 'ae' ],
            [ 'ö', 'oe' ],
            [ 'ü', 'ue' ],
            [ 'Ä', 'Ae' ],
            [ 'Ö', 'Oe' ],
            [ 'Ü', 'Ue' ],
        ];

        return replacements.reduce( ( prev, cur ) => prev.replaceAll( cur[ 0 ], cur[ 1 ] ), input );
    }

    public static generateClassNames( name: string, classPrefix?: string ): CodeNames {
        const dashedName = NamingTools.toValidMemberName( name );
        const dashedNameWithPrefix = NamingTools.toValidMemberName( ( classPrefix ? classPrefix + '_' : '' ) + name );

        const memberName = camelcase( dashedName, { pascalCase: false } );
        const className = camelcase( dashedNameWithPrefix, { pascalCase: true } );

        return {
            className,
            memberName,
        };
    }
}
