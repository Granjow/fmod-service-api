import { FmodCodegen } from '../src';
import { testBankData, testBankProject } from '../src/demo/test-data';
import * as ts from 'typescript';

describe( 'Codegen', () => {

    it( 'generates API from test data', () => {
        expect( () => new FmodCodegen( testBankProject )
            .importFrom( '../index' )
            .generate( 'TestProject' ) ).not.toThrow();
    } );

    it( 'compiles generated API code', () => {
        const code = new FmodCodegen( testBankProject, {
            projectDataType: {
                name: 'IExtendedFmodProject',
                importInstruction: 'import type { IExtendedFmodProject } from \'./test-data\';',
            },
        } )
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
