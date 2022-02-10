import { FmodCodegen } from '../src';
import { testBankData } from '../src/demo/test-data';
import * as ts from 'typescript';

describe( 'Codegen', () => {

    it( 'generates API from test data', () => {
        expect( () => new FmodCodegen( testBankData )
            .importFrom( '../index' )
            .generate( 'TestProject' ) ).not.toThrow();
    } );

    it( 'compiles generated API code', () => {
        const code = new FmodCodegen( testBankData )
            .importFrom( '../index' )
            .generate( 'TestProject' );

        const compiled = ts.transpileModule( code, {
            reportDiagnostics: true,
            compilerOptions: {
                module: ts.ModuleKind.CommonJS,
            }
        } );

        expect( compiled.diagnostics?.length ).toBe( 0 );
    } );
} );
